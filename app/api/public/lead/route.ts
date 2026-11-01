import { NextResponse } from "next/server";
import { mutate, uid } from "@/lib/db";
import type { Lead } from "@/lib/types";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || !b.name || !b.email) return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  const lead: Lead = {
    id: `L-${Math.floor(1100 + Math.random() * 8800)}`,
    name: String(b.name).slice(0, 120),
    email: String(b.email).slice(0, 160),
    phone: String(b.phone || "").slice(0, 40),
    eventType: String(b.eventType || "General enquiry"),
    eventDate: String(b.eventDate || ""),
    guests: Number(b.guests) || 0,
    budget: String(b.budget || ""),
    message: String(b.message || "").slice(0, 3000),
    source: b.source === "planner" ? "planner" : "contact",
    stage: "new",
    value: Number(b.value) || 0,
    owner: "Unassigned",
    notes: [],
    createdAt: new Date().toISOString(),
  };
  mutate((db) => db.leads.unshift(lead), {
    type: "lead",
    text: `New ${lead.source === "planner" ? "planner" : "contact"} enquiry from ${lead.name} (${lead.eventType})`,
  });
  return NextResponse.json({ ok: true, id: lead.id });
}
