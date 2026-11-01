"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight, CalendarDays, IndianRupee, Kanban, Mail, Plus, Ticket, TrendingUp, Trophy } from "lucide-react";
import type { Activity, Booking, Lead } from "@/lib/types";
import { Badge, Card, PageTitle } from "./ui";
import { cn, fmtDate, inr, timeAgo } from "@/lib/utils";

type Props = {
  kpis: { revenue: number; tickets: number; pipeline: number; openLeads: number; winRate: number; wonValue: number; subscribers: number; upcoming: number };
  months: { label: string; revenue: number; tickets: number }[];
  stages: { stage: string; count: number; value: number }[];
  sources: { source: string; count: number }[];
  events: { id: string; title: string; date: string; city: string; image: string; pct: number; sold: number; cap: number }[];
  recentLeads: Lead[];
  recentBookings: Booking[];
  activity: Activity[];
};

export const STAGE_META: Record<string, { label: string; tone: "gray" | "blue" | "purple" | "yellow" | "green" | "red"; color: string }> = {
  new: { label: "New", tone: "blue", color: "var(--accent)" },
  contacted: { label: "Contacted", tone: "purple", color: "#4b4b4b" },
  proposal: { label: "Proposal", tone: "yellow", color: "#8a8a8a" },
  negotiation: { label: "Negotiation", tone: "gray", color: "#b5b5b5" },
  won: { label: "Won", tone: "green", color: "#1a7f3c" },
  lost: { label: "Lost", tone: "red", color: "#b42318" },
};

export function Dashboard(p: Props) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const k = p.kpis;
  return (
    <>
      <PageTitle title={`${greet}.`} subtitle={`Here's what's happening across your events — ${fmtDate(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long" })}`}>
        <Link href="/admin/content/events?new=1" className="inline-flex h-10 items-center gap-2 rounded-[3px] bg-ink px-4 text-[14px] font-medium text-white">
          <Plus className="h-4 w-4" /> New event
        </Link>
        <Link href="/admin/leads?new=1" className="inline-flex h-10 items-center gap-2 rounded-[3px] bg-white/70 px-4 text-[14px] font-medium border border-line">
          <Plus className="h-4 w-4" /> Add lead
        </Link>
      </PageTitle>

      <div className="grid grid-cols-2 gap-x-5 gap-y-8 xl:grid-cols-4">
        <Kpi icon={IndianRupee} label="Ticket revenue" value={inr(k.revenue, true)} sub={`${k.tickets.toLocaleString("en-IN")} tickets sold`} accent />
        <Kpi icon={Kanban} label="Open pipeline" value={inr(k.pipeline, true)} sub={`${k.openLeads} active leads`} />
        <Kpi icon={Trophy} label="Win rate" value={`${k.winRate}%`} sub={`${inr(k.wonValue, true)} won`} />
        <Kpi icon={CalendarDays} label="Upcoming events" value={String(k.upcoming)} sub={`${k.subscribers} newsletter subscribers`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Revenue" action={<Badge tone="green"><TrendingUp className="h-3 w-3" /> Last 6 months</Badge>}>
          <RevenueChart data={p.months} />
        </Card>
        <Card title="Pipeline by stage" action={<Link href="/admin/leads" className="text-[13px] text-accent">Open board</Link>}>
          <div className="space-y-3">
            {p.stages.map((s) => {
              const max = Math.max(...p.stages.map((x) => x.count), 1);
              return (
                <div key={s.stage}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="font-medium">{STAGE_META[s.stage].label}</span>
                    <span className="text-muted">
                      {s.count} · {inr(s.value, true)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-[3px] bg-ink/[0.05]">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(s.count / max) * 100}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-[3px]" style={{ background: STAGE_META[s.stage].color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border-t border-line pt-4">
            <p className="mb-3 text-[13px] font-medium">Lead sources</p>
            <div className="flex flex-wrap gap-2">
              {p.sources.map((s) => (
                <Badge key={s.source} tone="gray" className="capitalize">
                  {s.source} · {s.count}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card title="Upcoming events" action={<Link href="/admin/content/events" className="text-[13px] text-accent">Manage</Link>} pad={false}>
          <ul className="divide-y divide-black/5 px-2 pb-2">
            {p.events.map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-[3px] p-3">
                <img src={e.image.replace("w=1600", "w=200")} alt="" className="h-12 w-12 rounded-[3px] object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{e.title}</p>
                  <p className="text-[12px] text-muted">
                    {fmtDate(e.date)} · {e.city}
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-[3px] bg-ink/[0.05]">
                    <div className="h-full rounded-[3px] bg-accent" style={{ width: `${e.pct}%` }} />
                  </div>
                </div>
                <span className="text-[13px] font-medium tabular-nums">{e.pct}%</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Latest leads" action={<Link href="/admin/leads" className="text-[13px] text-accent">View all</Link>} pad={false}>
          <ul className="divide-y divide-black/5 px-2 pb-2">
            {p.recentLeads.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads?open=${l.id}`} className="flex items-center gap-3 rounded-[3px] p-3 hover:bg-ink/[0.03]">
                  <Avatar name={l.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{l.name}</p>
                    <p className="truncate text-[12px] text-muted">
                      {l.eventType} · {l.budget || "—"}
                    </p>
                  </div>
                  <Badge tone={STAGE_META[l.stage].tone}>{STAGE_META[l.stage].label}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Activity" pad={false}>
          <ul className="space-y-0.5 px-5 pb-4 pt-2">
            {p.activity.map((a) => (
              <li key={a.id} className="relative flex gap-3 py-2 pl-5 before:absolute before:left-[3px] before:top-4 before:h-full before:w-px before:bg-ink/[0.05] last:before:hidden">
                <span className={cn("absolute left-0 top-[14px] h-[7px] w-[7px] rounded-full", a.type === "booking" ? "bg-[#1a7f3c]" : a.type === "lead" ? "bg-accent" : a.type === "subscriber" ? "bg-[#b45309]" : "bg-ink/30")} />
                <div>
                  <p className="text-[13px] leading-snug">{a.text}</p>
                  <p className="text-[12px] text-muted">{timeAgo(a.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-4" title="Recent bookings" action={<Link href="/admin/bookings" className="text-[13px] text-accent">All bookings</Link>} pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="text-[12px] text-muted">
              <tr>
                <th className="px-5 py-2 font-medium">Booking</th>
                <th className="px-5 py-2 font-medium">Guest</th>
                <th className="px-5 py-2 font-medium">Event</th>
                <th className="px-5 py-2 font-medium">Tickets</th>
                <th className="px-5 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {p.recentBookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-5 py-3 font-mono text-[12px]">{b.id}</td>
                  <td className="px-5 py-3">{b.name}</td>
                  <td className="px-5 py-3 text-muted">{b.eventTitle}</td>
                  <td className="px-5 py-3">
                    <Ticket className="mr-1 inline h-3.5 w-3.5 text-muted" />
                    {b.qty} × {b.ticket}
                  </td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">{inr(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between rounded-[4px] bg-ink p-5 text-white">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-accent" />
          <p className="text-[14px]">Everything on the public website — intro animation, navbar, homepage sections, theme — is editable in Site settings.</p>
        </div>
        <Link href="/admin/settings" className="hidden shrink-0 items-center gap-1 rounded-[3px] bg-white/70 px-4 py-2 text-[13px] font-medium text-ink sm:flex">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return (
    <span className="grid shrink-0 place-items-center rounded-[3px] border border-line bg-ink/[0.04] text-[11px] font-medium tracking-normal text-ink" style={{ width: size, height: size }}>
      {initials}
    </span>
  );
}

function Kpi({ label, value, sub, accent }: { icon?: unknown; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className={cn("border-t pt-3", accent ? "border-ink" : "border-line")}>
      <p className="meta flex justify-between text-muted">
        <span className="text-ink">{label}</span>
        {accent && <span className="h-1.5 w-1.5 self-center bg-accent" />}
      </p>
      <p className="mt-6 text-[clamp(2.2rem,3.6vw,3.4rem)] font-light leading-none tracking-[-0.06em] tabular-nums">{value}</p>
      <p className="meta mt-2 text-muted">{sub}</p>
    </motion.div>
  );
}

function RevenueChart({ data }: { data: { label: string; revenue: number; tickets: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640,
    H = 220,
    P = 8;
  const max = Math.max(...data.map((d) => d.revenue), 1) * 1.15;
  const step = (W - P * 2) / (data.length - 1);
  const pts = data.map((d, i) => [P + i * step, H - (d.revenue / max) * (H - 20)] as const);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  const total = data.reduce((a, d) => a + d.revenue, 0);
  const h = hover ?? data.length - 1;
  return (
    <div>
      <div className="flex items-end gap-6">
        <div>
          <p className="text-[12px] text-muted">{hover === null ? "6-month total" : data[h].label}</p>
          <p className="text-[28px] font-light tracking-[-0.05em] tabular-nums">{inr(hover === null ? total : data[h].revenue)}</p>
        </div>
        <p className="pb-1.5 text-[13px] text-muted">{hover === null ? data.reduce((a, d) => a + d.tickets, 0) : data[h].tickets} tickets</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="mt-4 w-full" onMouseLeave={() => setHover(null)} role="img" aria-label="Monthly ticket revenue">
        <defs>
          <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={0} x2={W} y1={H - g * (H - 20)} y2={H - g * (H - 20)} stroke="rgba(0,0,0,0.05)" />
        ))}
        <motion.path d={area} fill="url(#rev)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
        <motion.path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)}>
            <rect x={p[0] - step / 2} y={0} width={step} height={H} fill="transparent" />
            {h === i && <line x1={p[0]} x2={p[0]} y1={p[1]} y2={H} stroke="var(--accent)" strokeDasharray="3 3" strokeOpacity="0.5" />}
            <circle cx={p[0]} cy={p[1]} r={h === i ? 6 : 3.5} fill="white" stroke="var(--accent)" strokeWidth="2.5" />
            <text x={p[0]} y={H + 18} textAnchor="middle" className="fill-[#8e8e93] text-[12px]">
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
