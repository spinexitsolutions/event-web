import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed, ADMIN_EMAIL, ADMIN_PASSWORD } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function Login() {
  if (await isAuthed()) redirect("/admin");
  const s = getDb().settings;
  const demo = !process.env.ADMIN_PASSWORD;
  return <LoginForm brand={s.brand.name} image={s.hero.image} demo={demo ? { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } : undefined} />;
}
