import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDb } from "@/lib/db";
import { CollectionManager } from "@/components/admin/CollectionManager";

export const dynamic = "force-dynamic";
const ALLOWED = ["events", "services", "gallery", "posts", "testimonials", "team", "packages", "faqs"] as const;

export default async function ContentPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!ALLOWED.includes(collection as (typeof ALLOWED)[number])) notFound();
  const items = getDb()[collection as (typeof ALLOWED)[number]] as unknown as (Record<string, unknown> & { id: string })[];
  return (
    <Suspense>
      <CollectionManager key={collection} name={collection} initial={items} />
    </Suspense>
  );
}
