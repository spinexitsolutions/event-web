import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@lume.events";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "lume2026";
const SECRET = process.env.AUTH_SECRET || "lume-demo-secret-change-me";
export const COOKIE = "lume_admin";

export function sessionToken() {
  return crypto.createHmac("sha256", SECRET).update(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`).digest("hex");
}

export async function isAuthed() {
  const store = await cookies();
  const v = store.get(COOKIE)?.value;
  if (!v) return false;
  const expected = sessionToken();
  return v.length === expected.length && crypto.timingSafeEqual(Buffer.from(v), Buffer.from(expected));
}
