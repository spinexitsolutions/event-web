import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthed())) redirect("/admin/login");
  const db = getDb();
  return (
    <AdminShell brand={db.settings.brand.name} accent={db.settings.theme.accent} newLeads={db.leads.filter((l) => l.stage === "new").length}>
      {children}
    </AdminShell>
  );
}
