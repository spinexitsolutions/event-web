import { getDb } from "@/lib/db";
import { BookingsTable } from "@/components/admin/CrmTables";

export const dynamic = "force-dynamic";

export default function BookingsPage() {
  const db = getDb();
  return <BookingsTable initial={db.bookings} events={db.events.map((e) => ({ id: e.id, title: e.title }))} />;
}
