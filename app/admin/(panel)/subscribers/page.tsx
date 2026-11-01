import { getDb } from "@/lib/db";
import { SubscribersTable } from "@/components/admin/CrmTables";

export const dynamic = "force-dynamic";

export default function SubscribersPage() {
  return <SubscribersTable initial={getDb().subscribers} />;
}
