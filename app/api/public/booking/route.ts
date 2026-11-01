import { NextResponse } from "next/server";
import { getDb, mutate } from "@/lib/db";
import type { Booking } from "@/lib/types";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.eventId || !b?.ticket || !b?.name || !b?.email)
    return NextResponse.json({ error: "Missing booking details" }, { status: 400 });
  const ev = getDb().events.find((e) => e.id === b.eventId);
  if (!ev || ev.status !== "upcoming") return NextResponse.json({ error: "Event not available" }, { status: 404 });
  const tier = ev.tickets.find((t) => t.name === b.ticket);
  const qty = Math.max(1, Math.min(10, Number(b.qty) || 1));
  if (!tier) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  if (tier.capacity - tier.sold < qty) return NextResponse.json({ error: "Not enough tickets left" }, { status: 409 });
  const booking: Booking = {
    id: `LM-${Date.now().toString(36).slice(-5).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`,
    eventId: ev.id,
    eventTitle: ev.title,
    ticket: tier.name,
    qty,
    total: Math.round(tier.price * qty * 1.03),
    name: String(b.name).slice(0, 120),
    email: String(b.email).slice(0, 160),
    phone: String(b.phone || "").slice(0, 40),
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  mutate(
    (db) => {
      const e = db.events.find((x) => x.id === ev.id)!;
      const t = e.tickets.find((x) => x.name === tier.name)!;
      t.sold += qty;
      db.bookings.unshift(booking);
    },
    { type: "booking", text: `${booking.name} booked ${qty} × ${tier.name} for ${ev.title}` }
  );
  return NextResponse.json({ ok: true, id: booking.id });
}
