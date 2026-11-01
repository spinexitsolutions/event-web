import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { PortfolioGrid } from "@/components/site/PortfolioGrid";
import { Testimonials } from "@/components/site/home/Sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  const db = getDb();
  return (
    <>
      <PageHeader label="Portfolio" title="Moments" accent="we made." text="A small selection from 1,200+ events across 40 cities. Tap any frame to open it." />
      <PortfolioGrid items={db.gallery} />
      <Testimonials items={db.testimonials} />
    </>
  );
}
