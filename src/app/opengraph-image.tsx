import { ImageResponse } from "next/og";

export const alt = "Nico Mastakas — AI-native product engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share card. On-brand: dark, sober, one accent. Prerendered at build.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0E0F11",
        color: "#E6E6E6",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 14, height: 14, borderRadius: 9999, background: "#4F8CFF" }} />
        <div style={{ fontSize: 28, color: "#9BA1A8" }}>nicomastakas.com</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 100, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
          Nico Mastakas
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#9BA1A8",
            marginTop: 24,
            maxWidth: 920,
            lineHeight: 1.3,
          }}
        >
          AI-native product engineer — I ship LLM features 0-to-1.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontSize: 26,
          color: "#9BA1A8",
          borderTop: "1px solid #26282E",
          paddingTop: 28,
        }}
      >
        <div>Input Output (IOHK)</div>
        <div style={{ color: "#3a3d44" }}>·</div>
        <div>Bolster — 100K+ users</div>
        <div style={{ color: "#3a3d44" }}>·</div>
        <div>Globant</div>
      </div>
    </div>,
    { ...size },
  );
}
