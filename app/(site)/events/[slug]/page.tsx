import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { EventDetail } from "@/components/site/EventDetail";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const e = getDb().events.find((x) => x.slug === slug);
  return e ? { title: e.title, description: e.excerpt, openGraph: { images: [e.image] } } : {};
}

export default async function EventPage({ params }: P) {
  const { slug } = await params;
  const db = getDb();
  const e = db.events.find((x) => x.slug === slug && x.status !== "draft");
  if (!e) notFound();
  const related = db.events.filter((x) => x.id !== e.id && x.status === "upcoming").slice(0, 3);
  return <EventDetail e={e} related={related} />;
}
