import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getDb, mutate } from "@/lib/db";
import type { Settings } from "@/lib/types";

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getDb().settings);
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const patch = (await req.json()) as Partial<Settings>;
  const keys = Object.keys(patch).join(", ");
  mutate((db) => {
    db.settings = { ...db.settings, ...patch };
  }, { type: "settings", text: `Site settings updated (${keys})` });
  return NextResponse.json({ ok: true, settings: getDb().settings });
}
