"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Download, Mail, MessageCircle, Phone, ScanLine, Search, Trash2 } from "lucide-react";
import type { Booking, BookingStatus, Lead, Subscriber } from "@/lib/types";
import { api, Badge, Button, Card, Drawer, Empty, PageTitle, Select, downloadCsv, useToast } from "./ui";
import { Avatar, STAGE_META } from "./Dashboard";
import { cn, fmtDate, inr, timeAgo } from "@/lib/utils";

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] md:max-w-xs">
      <Search className="h-4 w-4 text-[#8e8e93]" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-[14px] outline-none" />
    </label>
  );
}

/* ---------------- Contacts ---------------- */
export type Contact = { email: string; name: string; phone: string; leads: Lead[]; bookings: Booking[]; spend: number; pipeline: number; last: string; type: "Customer" | "Prospect" | "Client" };

export function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [open, setOpen] = useState<Contact | null>(null);
  const list = contacts.filter((c) => (type === "All" || c.type === type) && (!q || `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <PageTitle title="Contacts" subtitle={`${contacts.length} people · unified from leads and ticket bookings`}>
        <Button variant="secondary" onClick={() => downloadCsv("contacts.csv", contacts.map((c) => ({ name: c.name, email: c.email, phone: c.phone, type: c.type, bookings: c.bookings.length, spend: c.spend, pipeline: c.pipeline, last: c.last })))}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </PageTitle>
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <SearchBox value={q} onChange={setQ} placeholder="Search name, email, phone" />
        <Select value={type} onChange={(e) => setType(e.target.value)} options={["All", "Client", "Customer", "Prospect"]} className="h-10 bg-white md:w-44" />
      </div>
      <div className="grid grid-cols-3 gap-3 md:mb-4">
        {(["Client", "Customer", "Prospect"] as const).map((t) => (
          <div key={t} className="rounded-[18px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] text-[#8e8e93]">{t}s</p>
            <p className="text-[24px] font-semibold tracking-tight">{contacts.filter((c) => c.type === t).length}</p>
          </div>
        ))}
      </div>
      <Card pad={false} className="mt-3 md:mt-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[14px]">
            <thead className="border-b border-black/5 text-[12px] text-[#8e8e93]">
              <tr>
                {["Contact", "Type", "Bookings", "Lifetime spend", "Pipeline", "Last activity"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {list.map((c) => (
                <tr key={c.email} onClick={() => setOpen(c)} className="cursor-pointer hover:bg-[#f9f9fb]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} size={32} />
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-[12px] text-[#8e8e93]">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={c.type === "Client" ? "green" : c.type === "Customer" ? "blue" : "gray"}>{c.type}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{c.bookings.length}</td>
                  <td className="px-4 py-3 font-medium tabular-nums">{c.spend ? inr(c.spend) : "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{c.pipeline ? inr(c.pipeline, true) : "—"}</td>
                  <td className="px-4 py-3 text-[#8e8e93]">{timeAgo(c.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!list.length && <div className="p-5"><Empty>No contacts found.</Empty></div>}
      </Card>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.name || ""}>
        {open && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
              <Avatar name={open.name} size={52} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{open.name}</p>
                <p className="truncate text-[13px] text-[#8e8e93]">{open.email}</p>
                <p className="text-[13px] text-[#8e8e93]">{open.phone}</p>
              </div>
              <div className="flex gap-1.5">
                <a href={`mailto:${open.email}`} className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f0f2]">
                  <Mail className="h-4 w-4" />
                </a>
                <a href={`tel:${open.phone}`} className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f0f2]">
                  <Phone className="h-4 w-4" />
                </a>
                <a href={`https://wa.me/${open.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-[#e8f8ee] text-[#1a7f3c]">
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Spend", inr(open.spend, true)],
                ["Bookings", open.bookings.length],
                ["Pipeline", inr(open.pipeline, true)],
              ].map(([l, v]) => (
                <div key={l as string} className="rounded-2xl bg-white p-3">
                  <p className="text-[12px] text-[#8e8e93]">{l}</p>
                  <p className="text-[18px] font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="mb-3 text-[14px] font-semibold">Timeline</p>
              <ul className="space-y-3">
                {[...open.leads.map((l) => ({ at: l.createdAt, node: <>Enquiry · {l.eventType} · <Badge tone={STAGE_META[l.stage].tone}>{STAGE_META[l.stage].label}</Badge></> })), ...open.bookings.map((b) => ({ at: b.createdAt, node: <>Booked {b.qty} × {b.ticket} — {b.eventTitle} · <b>{inr(b.total)}</b></> }))]
                  .sort((a, b) => b.at.localeCompare(a.at))
                  .map((t, i) => (
                    <li key={i} className="flex gap-3 text-[14px]">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      <div>
                        <p>{t.node}</p>
                        <p className="text-[12px] text-[#8e8e93]">{fmtDate(t.at, { dateStyle: "medium" })}</p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}

/* ---------------- Bookings ---------------- */
const STATUS_TONE: Record<BookingStatus, "green" | "blue" | "gray" | "red"> = { confirmed: "blue", "checked-in": "green", pending: "gray", cancelled: "red" };

export function BookingsTable({ initial, events }: { initial: Booking[]; events: { id: string; title: string }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [ev, setEv] = useState("all");
  const [st, setSt] = useState("all");
  const [scan, setScan] = useState("");
  const list = useMemo(
    () => rows.filter((b) => (ev === "all" || b.eventId === ev) && (st === "all" || b.status === st) && (!q || `${b.id} ${b.name} ${b.email}`.toLowerCase().includes(q.toLowerCase()))),
    [rows, q, ev, st]
  );
  const live = list.filter((b) => b.status !== "cancelled");
  const checked = list.filter((b) => b.status === "checked-in").reduce((a, b) => a + b.qty, 0);
  const total = live.reduce((a, b) => a + b.qty, 0);

  async function setStatus(b: Booking, status: BookingStatus) {
    setRows((r) => r.map((x) => (x.id === b.id ? { ...x, status } : x)));
    await api("/api/admin/collection/bookings", "PUT", { ...b, status });
    toast(status === "checked-in" ? `${b.name} checked in` : `Marked ${status}`);
    router.refresh();
  }

  return (
    <>
      <PageTitle title="Bookings" subtitle="Ticket orders, payments and on-the-day check-in">
        <Button variant="secondary" onClick={() => downloadCsv("bookings.csv", list as unknown as Record<string, unknown>[])}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </PageTitle>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Revenue" value={inr(live.reduce((a, b) => a + b.total, 0), true)} />
        <Stat label="Orders" value={String(live.length)} />
        <Stat label="Tickets" value={String(total)} />
        <Stat label="Checked in" value={`${checked}/${total}`} progress={total ? checked / total : 0} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const code = scan.trim().toUpperCase().split("|").find((p) => p.startsWith("LM-")) || scan.trim().toUpperCase();
          const b = rows.find((x) => x.id === code);
          if (!b) toast(`No booking ${code}`, "err");
          else if (b.status === "checked-in") toast(`${b.name} already checked in`, "err");
          else setStatus(b, "checked-in");
          setScan("");
        }}
        className="mb-4 flex items-center gap-2 rounded-[18px] bg-[#1d1d1f] p-2 pl-4 text-white"
      >
        <ScanLine className="h-5 w-5 shrink-0 text-accent" />
        <input value={scan} onChange={(e) => setScan(e.target.value)} placeholder="Quick check-in: type or scan booking code (e.g. LM-…)" className="h-10 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-white/40" />
        <Button variant="accent" type="submit">
          Check in
        </Button>
      </form>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <SearchBox value={q} onChange={setQ} placeholder="Search code, name, email" />
        <Select value={ev} onChange={(e) => setEv(e.target.value)} options={[{ value: "all", label: "All events" }, ...events.map((e) => ({ value: e.id, label: e.title }))]} className="h-10 bg-white md:w-64" />
        <Select value={st} onChange={(e) => setSt(e.target.value)} options={[{ value: "all", label: "All statuses" }, "confirmed", "checked-in", "pending", "cancelled"]} className="h-10 bg-white md:w-44" />
      </div>

      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[14px]">
            <thead className="border-b border-black/5 text-[12px] text-[#8e8e93]">
              <tr>
                {["Code", "Guest", "Event", "Tickets", "Amount", "Status", "Booked", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {list.map((b) => (
                <tr key={b.id} className={cn(b.status === "cancelled" && "opacity-50")}>
                  <td className="px-4 py-3 font-mono text-[12px]">{b.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.name}</p>
                    <p className="text-[12px] text-[#8e8e93]">{b.email}</p>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-[#3a3a3c]">{b.eventTitle}</td>
                  <td className="px-4 py-3">
                    {b.qty} × {b.ticket}
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums">{inr(b.total)}</td>
                  <td className="px-4 py-3">
                    <select value={b.status} onChange={(e) => setStatus(b, e.target.value as BookingStatus)} className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[12px] font-medium outline-none">
                      {["confirmed", "checked-in", "pending", "cancelled"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#8e8e93]">{fmtDate(b.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {b.status === "confirmed" ? (
                      <Button variant="secondary" className="h-8 px-3 text-[12px]" onClick={() => setStatus(b, "checked-in")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Check in
                      </Button>
                    ) : (
                      <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!list.length && <div className="p-5"><Empty>No bookings match.</Empty></div>}
      </Card>
    </>
  );
}

function Stat({ label, value, progress }: { label: string; value: string; progress?: number }) {
  return (
    <div className="rounded-[18px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
      <p className="text-[12px] text-[#8e8e93]">{label}</p>
      <p className="text-[24px] font-semibold tracking-tight tabular-nums">{value}</p>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f0f0f2]">
          <div className="h-full rounded-full bg-[#30d158]" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </div>
  );
}

/* ---------------- Subscribers ---------------- */
export function SubscribersTable({ initial }: { initial: Subscriber[] }) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const list = rows.filter((s) => !q || s.email.includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Subscribers" subtitle={`${rows.length} people on the newsletter`}>
        <Button variant="secondary" onClick={() => navigator.clipboard.writeText(rows.map((r) => r.email).join(", ")).then(() => toast("Emails copied"))}>
          Copy all emails
        </Button>
        <Button variant="secondary" onClick={() => downloadCsv("subscribers.csv", rows as unknown as Record<string, unknown>[])}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </PageTitle>
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} placeholder="Search email" />
      </div>
      <Card pad={false}>
        <ul className="divide-y divide-black/5">
          {list.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={s.email} size={32} />
              <div className="flex-1">
                <p className="text-[14px] font-medium">{s.email}</p>
                <p className="text-[12px] text-[#8e8e93]">Joined {timeAgo(s.createdAt)}</p>
              </div>
              <button
                onClick={async () => {
                  await api(`/api/admin/collection/subscribers?id=${s.id}`, "DELETE");
                  setRows((r) => r.filter((x) => x.id !== s.id));
                  toast("Subscriber removed");
                  router.refresh();
                }}
                className="grid h-8 w-8 place-items-center rounded-full text-[#8e8e93] hover:bg-red-50 hover:text-red-600"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        {!list.length && <div className="p-5"><Empty>No subscribers yet.</Empty></div>}
      </Card>
    </>
  );
}
