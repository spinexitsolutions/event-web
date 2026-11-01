import { getDb } from "@/lib/db";
import { Dashboard } from "@/components/admin/Dashboard";
import { soldPct } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminHome() {
  const db = getDb();
  const live = db.bookings.filter((b) => b.status !== "cancelled");
  const revenue = live.reduce((a, b) => a + b.total, 0);
  const tickets = live.reduce((a, b) => a + b.qty, 0);
  const open = db.leads.filter((l) => !["won", "lost"].includes(l.stage));
  const won = db.leads.filter((l) => l.stage === "won");
  const lost = db.leads.filter((l) => l.stage === "lost");

  const now = new Date();
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const inMonth = live.filter((b) => {
      const c = new Date(b.createdAt);
      return `${c.getFullYear()}-${c.getMonth()}` === key;
    });
    return {
      label: d.toLocaleString("en-US", { month: "short" }),
      revenue: inMonth.reduce((a, b) => a + b.total, 0),
      tickets: inMonth.reduce((a, b) => a + b.qty, 0),
    };
  });

  const stages = (["new", "contacted", "proposal", "negotiation", "won", "lost"] as const).map((s) => ({
    stage: s,
    count: db.leads.filter((l) => l.stage === s).length,
    value: db.leads.filter((l) => l.stage === s).reduce((a, l) => a + l.value, 0),
  }));
  const sources = ["planner", "contact", "event", "manual"].map((s) => ({ source: s, count: db.leads.filter((l) => l.source === s).length }));

  return (
    <Dashboard
      kpis={{
        revenue,
        tickets,
        pipeline: open.reduce((a, l) => a + l.value, 0),
        openLeads: open.length,
        winRate: won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0,
        wonValue: won.reduce((a, l) => a + l.value, 0),
        subscribers: db.subscribers.length,
        upcoming: db.events.filter((e) => e.status === "upcoming").length,
      }}
      months={months}
      stages={stages}
      sources={sources}
      events={db.events
        .filter((e) => e.status === "upcoming")
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5)
        .map((e) => ({ id: e.id, title: e.title, date: e.date, city: e.city, image: e.image, pct: soldPct(e.tickets), sold: e.tickets.reduce((a, t) => a + t.sold, 0), cap: e.tickets.reduce((a, t) => a + t.capacity, 0) }))}
      recentLeads={db.leads.slice(0, 5)}
      recentBookings={db.bookings.slice(0, 6)}
      activity={db.activity.slice(0, 8)}
    />
  );
}
