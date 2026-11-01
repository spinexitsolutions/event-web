import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { resetDb } from "@/lib/db";

export async function POST() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  resetDb();
  return NextResponse.json({ ok: true });
}
