import { getDb } from "@/lib/db";
import { ContactsTable, type Contact } from "@/components/admin/CrmTables";

export const dynamic = "force-dynamic";

export default function ContactsPage() {
  const db = getDb();
  const map = new Map<string, Contact>();
  const get = (email: string, name: string, phone: string) => {
    const k = email.toLowerCase();
    if (!map.has(k)) map.set(k, { email: k, name, phone, leads: [], bookings: [], spend: 0, pipeline: 0, last: "1970-01-01", type: "Prospect" });
    return map.get(k)!;
  };
  for (const l of db.leads) {
    const c = get(l.email, l.name, l.phone);
    c.leads.push(l);
    if (!["won", "lost"].includes(l.stage)) c.pipeline += l.value;
    if (l.createdAt > c.last) c.last = l.createdAt;
  }
  for (const b of db.bookings) {
    const c = get(b.email, b.name, b.phone);
    c.bookings.push(b);
    if (b.status !== "cancelled") c.spend += b.total;
    if (b.createdAt > c.last) c.last = b.createdAt;
  }
  const contacts = [...map.values()].map((c) => ({
    ...c,
    type: (c.leads.some((l) => l.stage === "won") ? "Client" : c.bookings.length ? "Customer" : "Prospect") as Contact["type"],
  }));
  contacts.sort((a, b) => b.last.localeCompare(a.last));
  return <ContactsTable contacts={contacts} />;
}
