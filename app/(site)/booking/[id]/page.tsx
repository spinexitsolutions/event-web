import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getDb } from "@/lib/db";
import { TicketView } from "@/components/site/TicketView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your tickets", robots: { index: false } };

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const b = db.bookings.find((x) => x.id === id);
  if (!b) notFound();
  const ev = db.events.find((e) => e.id === b.eventId);
  const qr = await QRCode.toDataURL(`LUME|${b.id}|${b.eventId}|${b.qty}`, { margin: 1, width: 360, color: { dark: "#0b0b0c", light: "#ffffff" } });
  return <TicketView booking={b} event={ev} qr={qr} />;
}
