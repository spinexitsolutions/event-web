import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope, Unbounded } from "next/font/google";
import { getDb } from "@/lib/db";
import "./globals.css";

// Display: characterful grotesque with width + optical-size axes. Body: clean geometric sans.
const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz", "wdth"], variable: "--font-display", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// Wide display for numbers, prices and tickers
const wide = Unbounded({ subsets: ["latin"], variable: "--font-wide", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { seo, brand } = getDb().settings;
  return {
    title: { default: seo.title, template: `%s — ${brand.name}` },
    description: seo.description,
    openGraph: { title: seo.title, description: seo.description, type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0c0b14",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${wide.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
