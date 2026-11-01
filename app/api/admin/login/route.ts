import { NextResponse } from "next/server";
import { ADMIN_EMAIL, ADMIN_PASSWORD, COOKIE, sessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (String(b.email).toLowerCase() !== ADMIN_EMAIL.toLowerCase() || b.password !== ADMIN_PASSWORD)
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, sessionToken(), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7, secure: process.env.NODE_ENV === "production" });
  return res;
}
