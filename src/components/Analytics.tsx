"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { Metric } from "web-vitals";

const ENDPOINT = "/api/collect";

type Beacon = {
  type: "pageview" | "event" | "vital" | "engagement";
  path?: string;
  referrer?: string;
  locale?: string;
  event?: string;
  props?: Record<string, unknown>;
  vital?: string;
  value?: number;
  engagementMs?: number;
};

/** Only report referrers from other sites; internal navigation is "direct". */
function externalReferrer(): string | undefined {
  const ref = document.referrer;
  if (!ref) return undefined;
  try {
    return new URL(ref).host === window.location.host ? undefined : ref;
  } catch {
    return undefined;
  }
}

/** Owner opt-out: set localStorage nm_no_track via ?nm-track=off so your own visits aren't counted. */
function isExcluded(): boolean {
  try {
    return localStorage.getItem("nm_no_track") === "1";
  } catch {
    return false;
  }
}

function send(body: Beacon): void {
  if (isExcluded()) return;
  try {
    const json = JSON.stringify(body);
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(ENDPOINT, new Blob([json], { type: "application/json" }));
      return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      body: json,
      keepalive: true,
      headers: { "content-type": "application/json" },
    });
  } catch {
    // Analytics must never break the page; a dropped beacon is acceptable.
  }
}

/** First-party, cookieless analytics collector. Mounted once in the locale layout. */
export function Analytics() {
  const pathname = usePathname();
  const visibleSince = useRef<number | null>(null);
  const accumulated = useRef(0);
  const currentPath = useRef("");

  const flushEngagement = useCallback(() => {
    let ms = accumulated.current;
    if (visibleSince.current != null) {
      ms += Date.now() - visibleSince.current;
      visibleSince.current = document.visibilityState === "visible" ? Date.now() : null;
    }
    accumulated.current = 0;
    const path = currentPath.current;
    if (ms > 0 && path) send({ type: "engagement", path, engagementMs: Math.round(ms) });
  }, []);

  // Owner opt-out toggle: ?nm-track=off excludes this browser (localStorage + a
  // year-long nm_owner cookie the server also honors); ?nm-track=on re-enables.
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("nm-track");
      if (p === "off") {
        localStorage.setItem("nm_no_track", "1");
        document.cookie = "nm_owner=1; path=/; max-age=31536000; samesite=lax";
      } else if (p === "on") {
        localStorage.removeItem("nm_no_track");
        document.cookie = "nm_owner=; path=/; max-age=0";
      }
    } catch {
      // localStorage may be unavailable (private mode); ignore.
    }
  }, []);

  // Pageview + engagement bookkeeping on every route change.
  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    currentPath.current = path;
    accumulated.current = 0;
    visibleSince.current = document.visibilityState === "visible" ? Date.now() : null;
    send({
      type: "pageview",
      path,
      referrer: externalReferrer(),
      locale: document.documentElement.lang || undefined,
    });
    return () => flushEngagement();
  }, [pathname, flushEngagement]);

  // Visibility + unload: accumulate real visible time and flush on exit.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (visibleSince.current != null) {
          accumulated.current += Date.now() - visibleSince.current;
          visibleSince.current = null;
        }
      } else {
        visibleSince.current = Date.now();
      }
    };
    const onPageHide = () => flushEngagement();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [flushEngagement]);

  // Core Web Vitals (dynamically imported so it stays off the critical path).
  useEffect(() => {
    let cancelled = false;
    void import("web-vitals")
      .then(({ onLCP, onCLS, onINP, onFCP, onTTFB }) => {
        if (cancelled) return;
        const report = (m: Metric) =>
          send({ type: "vital", vital: m.name, value: m.value, path: window.location.pathname });
        onLCP(report);
        onCLS(report);
        onINP(report);
        onFCP(report);
        onTTFB(report);
      })
      .catch(() => {
        // web-vitals is best-effort; ignore load failures.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // High-value clicks: CV download, outbound, contact, and explicit data-analytics hooks.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const start = e.target instanceof Element ? e.target : null;
      const anchor = start?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      const here = window.location.pathname;

      const explicit = anchor.getAttribute("data-analytics");
      if (explicit) {
        const sep = explicit.indexOf(":");
        const category = sep === -1 ? explicit : explicit.slice(0, sep);
        const label = sep === -1 ? undefined : explicit.slice(sep + 1);
        send({ type: "event", event: category, path: here, props: { label, href } });
        return;
      }
      if (href.startsWith("mailto:")) {
        send({ type: "event", event: "contact", path: here });
        return;
      }
      if (/\.pdf($|\?)/i.test(href)) {
        send({ type: "event", event: "cv_download", path: here });
        return;
      }
      if (/^https?:\/\//i.test(href)) {
        try {
          const url = new URL(href);
          if (url.host !== window.location.host) {
            send({
              type: "event",
              event: "outbound",
              path: here,
              props: { host: url.host.replace(/^www\./, "") },
            });
          }
        } catch {
          // Unparseable href; nothing to record.
        }
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // Scroll depth on case studies (25/50/75/100%, once each per page).
  useEffect(() => {
    if (!window.location.pathname.includes("/work/")) return;
    const fired = new Set<number>();
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      const pct = Math.min(100, Math.round((el.scrollTop / max) * 100));
      for (const m of [25, 50, 75, 100]) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          send({
            type: "event",
            event: "scroll",
            path: window.location.pathname,
            props: { depth: m },
          });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
