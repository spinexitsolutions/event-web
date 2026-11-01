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
  new: { label: "New", tone: "blue", color: "#0a84ff" },
  contacted: { label: "Contacted", tone: "purple", color: "#8e5cf7" },
  proposal: { label: "Proposal", tone: "yellow", color: "#ff9f0a" },
  negotiation: { label: "Negotiation", tone: "gray", color: "#5e5ce6" },
  won: { label: "Won", tone: "green", color: "#30d158" },
  lost: { label: "Lost", tone: "red", color: "#ff453a" },
};

export function Dashboard(p: Props) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const k = p.kpis;
  return (
    <>
      <PageTitle title={`${greet} 👋`} subtitle={`Here's what's happening across your events — ${fmtDate(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long" })}`}>
        <Link href="/admin/content/events?new=1" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1d1d1f] px-4 text-[14px] font-medium text-white">
          <Plus className="h-4 w-4" /> New event
        </Link>
        <Link href="/admin/leads?new=1" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-medium shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
          <Plus className="h-4 w-4" /> Add lead
        </Link>
      </PageTitle>

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
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
                    <span className="text-[#8e8e93]">
                      {s.count} · {inr(s.value, true)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#f0f0f2]">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(s.count / max) * 100}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full" style={{ background: STAGE_META[s.stage].color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border-t border-black/5 pt-4">
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
              <li key={e.id} className="flex items-center gap-3 rounded-xl p-3">
                <img src={e.image.replace("w=1600", "w=200")} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{e.title}</p>
                  <p className="text-[12px] text-[#8e8e93]">
                    {fmtDate(e.date)} · {e.city}
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f0f0f2]">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${e.pct}%` }} />
                  </div>
                </div>
                <span className="text-[13px] font-semibold tabular-nums">{e.pct}%</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Latest leads" action={<Link href="/admin/leads" className="text-[13px] text-accent">View all</Link>} pad={false}>
          <ul className="divide-y divide-black/5 px-2 pb-2">
            {p.recentLeads.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads?open=${l.id}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#f5f5f7]">
                  <Avatar name={l.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{l.name}</p>
                    <p className="truncate text-[12px] text-[#8e8e93]">
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
              <li key={a.id} className="relative flex gap-3 py-2 pl-5 before:absolute before:left-[3px] before:top-4 before:h-full before:w-px before:bg-black/5 last:before:hidden">
                <span className={cn("absolute left-0 top-[14px] h-[7px] w-[7px] rounded-full", a.type === "booking" ? "bg-[#30d158]" : a.type === "lead" ? "bg-[#0a84ff]" : a.type === "subscriber" ? "bg-[#ff9f0a]" : "bg-[#8e8e93]")} />
                <div>
                  <p className="text-[13px] leading-snug">{a.text}</p>
                  <p className="text-[12px] text-[#8e8e93]">{timeAgo(a.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-4" title="Recent bookings" action={<Link href="/admin/bookings" className="text-[13px] text-accent">All bookings</Link>} pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="text-[12px] text-[#8e8e93]">
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
                  <td className="px-5 py-3 text-[#6e6e73]">{b.eventTitle}</td>
                  <td className="px-5 py-3">
                    <Ticket className="mr-1 inline h-3.5 w-3.5 text-[#8e8e93]" />
                    {b.qty} × {b.ticket}
                  </td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">{inr(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between rounded-[20px] bg-[#1d1d1f] p-5 text-white">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-accent" />
          <p className="text-[14px]">Everything on the public website — intro animation, navbar, homepage sections, theme — is editable in Site settings.</p>
        </div>
        <Link href="/admin/settings" className="hidden shrink-0 items-center gap-1 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#1d1d1f] sm:flex">
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
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span className="grid shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white" style={{ width: size, height: size, background: `linear-gradient(135deg, hsl(${hue} 70% 60%), hsl(${(hue + 40) % 360} 70% 48%))` }}>
      {initials}
    </span>
  );
}

function Kpi({ icon: I, label, value, sub, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-[20px] p-4 md:p-5", accent ? "bg-[#1d1d1f] text-white" : "bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]")}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-[13px]", accent ? "text-white/60" : "text-[#6e6e73]")}>{label}</span>
        <span className={cn("grid h-8 w-8 place-items-center rounded-full", accent ? "bg-accent text-white" : "bg-[#f5f5f7] text-[#3a3a3c]")}>
          <I className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-[26px] font-semibold tracking-[-0.03em] md:text-[32px]">{value}</p>
      <p className={cn("mt-0.5 text-[12px] md:text-[13px]", accent ? "text-white/55" : "text-[#8e8e93]")}>{sub}</p>
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
          <p className="text-[12px] text-[#8e8e93]">{hover === null ? "6-month total" : data[h].label}</p>
          <p className="text-[28px] font-semibold tracking-[-0.03em] tabular-nums">{inr(hover === null ? total : data[h].revenue)}</p>
        </div>
        <p className="pb-1.5 text-[13px] text-[#8e8e93]">{hover === null ? data.reduce((a, d) => a + d.tickets, 0) : data[h].tickets} tickets</p>
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
