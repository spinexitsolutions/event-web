import { Suspense } from "react";
import { getDb } from "@/lib/db";
import { LeadsBoard } from "@/components/admin/LeadsBoard";

export const dynamic = "force-dynamic";

export default function LeadsPage() {
  return (
    <Suspense>
      <LeadsBoard initial={getDb().leads} />
    </Suspense>
  );
}
