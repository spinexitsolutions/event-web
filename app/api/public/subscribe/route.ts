import { NextResponse } from "next/server";
import { getDb, mutate, uid } from "@/lib/db";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const email = String(b?.email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  if (getDb().subscribers.some((s) => s.email === email)) return NextResponse.json({ ok: true, existing: true });
  mutate((db) => db.subscribers.unshift({ id: uid("sub"), email, createdAt: new Date().toISOString() }), {
    type: "subscriber",
    text: `${email} subscribed to the newsletter`,
  });
  return NextResponse.json({ ok: true });
}
