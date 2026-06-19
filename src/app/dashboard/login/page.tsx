import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/dashboard/auth";

export const dynamic = "force-dynamic";

const screen: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
  padding: "var(--space-8)",
};
const card: CSSProperties = {
  width: "100%",
  maxWidth: "400px",
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-12)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-8)",
  boxSizing: "border-box",
};
const head: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-2)" };
const kicker: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};
const brand: CSSProperties = {
  fontSize: "var(--text-card-title)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.01em",
  color: "var(--text)",
};
const sub: CSSProperties = { fontSize: "var(--text-caption)", color: "var(--text-muted)" };
const form: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-6)" };
const field: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-2)" };
const labelStyle: CSSProperties = { ...kicker };
const errStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--danger)",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAuthed()) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main style={screen}>
      <form method="post" action="/api/dashboard-login" style={card}>
        <div style={head}>
          <span style={kicker}>Analytics</span>
          <span style={brand}>Nico Mastakas</span>
          <span style={sub}>Private dashboard. Password required.</span>
        </div>
        <div style={form}>
          <div style={field}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              id="password"
              className="nm-input nm-focusable"
              type="password"
              name="password"
              autoComplete="current-password"
              aria-invalid={error ? "true" : undefined}
              autoFocus
              required
            />
            {error ? <span style={errStyle}>Wrong password.</span> : null}
          </div>
          <button type="submit" className="nm-btn nm-btn--primary nm-focusable">
            Sign in
          </button>
        </div>
      </form>
    </main>
  );
}
