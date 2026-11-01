import type { Metadata, Viewport } from "next";
import { Host_Grotesk } from "next/font/google";
import { getDb } from "@/lib/db";
import "./globals.css";

// One typeface for everything — hierarchy comes from size, weight and space.
const sans = Host_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { seo, brand } = getDb().settings;
  return {
    title: { default: seo.title, template: `%s — ${brand.name}` },
    description: seo.description,
    openGraph: { title: seo.title, description: seo.description, type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#f1efea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
