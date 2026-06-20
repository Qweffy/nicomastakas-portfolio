"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Soft-refreshes the dashboard Server Component on an interval so the "live"
// panels (feed, active-now, KPIs) update without a manual reload. Pauses while
// the tab is hidden so it never queries the DB when nobody is looking, and
// catches up immediately when the tab becomes visible again.
export function AutoRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer == null) timer = setInterval(() => router.refresh(), intervalMs);
    };
    const stop = () => {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router, intervalMs]);

  return null;
}
