import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

// Second root layout (the public site lives under [locale]). Next 16 allows
// multiple root layouts when there is no app/layout.tsx. Navigating between the
// site and /dashboard is a full page load, which is exactly what we want here.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
