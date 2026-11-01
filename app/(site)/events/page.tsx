import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { EventsBrowser } from "@/components/site/EventsBrowser";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  const events = getDb().events.filter((e) => e.status !== "draft");
  return (
    <>
      <PageHeader variant="wide" label="Tickets & experiences" title="What's" accent="happening." text="Festivals, dinners, summits and nights out — designed and hosted by our studio. Book in seconds, check in with a QR." />
      <EventsBrowser events={events} />
    </>
  );
}
