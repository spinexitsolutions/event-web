"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, IndianRupee, Mail, MessageCircle, Phone, Plus, Search, Send, Trash2, Users } from "lucide-react";
import type { Lead, LeadStage } from "@/lib/types";
import { api, Badge, Button, Drawer, Input, Label, PageTitle, Segmented, Select, Textarea, downloadCsv, useToast } from "./ui";
import { Avatar, STAGE_META } from "./Dashboard";
import { cn, fmtDate, inr, timeAgo } from "@/lib/utils";

const STAGES: LeadStage[] = ["new", "contacted", "proposal", "negotiation", "won", "lost"];
const OWNERS = ["Unassigned", "Naina", "Kabir", "Arjun", "Meera"];
const blank = (): Lead => ({ id: "", name: "", email: "", phone: "", eventType: "Wedding", eventDate: "", guests: 100, budget: "", message: "", source: "manual", stage: "new", value: 0, owner: "Unassigned", notes: [], createdAt: new Date().toISOString() });

export function LeadsBoard({ initial }: { initial: Lead[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();
  const [leads, setLeads] = useState(initial);
  const [view, setView] = useState<"board" | "list">("board");
  const [q, setQ] = useState("");
  const [owner, setOwner] = useState("All");
  const [edit, setEdit] = useState<Lead | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<LeadStage | null>(null);

  useEffect(() => setLeads(initial), [initial]);
  useEffect(() => {
    const id = sp.get("open");
    if (id) setEdit(initial.find((l) => l.id === id) || null);
    if (sp.get("new")) setEdit(blank());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      leads.filter((l) => (owner === "All" || l.owner === owner) && (!q || `${l.name} ${l.email} ${l.eventType} ${l.id}`.toLowerCase().includes(q.toLowerCase()))),
    [leads, q, owner]
  );

  async function save(l: Lead, msg = "Lead saved") {
    const prev = leads;
    if (l.id) setLeads((ls) => ls.map((x) => (x.id === l.id ? l : x)));
    try {
      const r = await api<{ item: Lead }>("/api/admin/collection/leads", "PUT", l);
      if (!l.id) setLeads((ls) => [r.item, ...ls]);
      toast(msg);
      router.refresh();
      return r.item;
    } catch (e) {
      setLeads(prev);
      toast((e as Error).message, "err");
    }
  }

  async function move(id: string, stage: LeadStage) {
    const l = leads.find((x) => x.id === id);
    if (!l || l.stage === stage) return;
    await save({ ...l, stage, notes: [...l.notes, { text: `Stage changed: ${STAGE_META[l.stage].label} → ${STAGE_META[stage].label}`, at: new Date().toISOString() }] }, `Moved to ${STAGE_META[stage].label}`);
  }

  return (
    <>
      <PageTitle title="Leads pipeline" subtitle={`${leads.length} leads · ${inr(leads.filter((l) => !["won", "lost"].includes(l.stage)).reduce((a, l) => a + l.value, 0), true)} open pipeline`}>
        <Button variant="secondary" onClick={() => downloadCsv("leads.csv", leads.map(({ notes, ...l }) => ({ ...l, notes: notes.length })))}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button onClick={() => setEdit(blank())}>
          <Plus className="h-4 w-4" /> Add lead
        </Button>
      </PageTitle>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <Segmented value={view} onChange={setView} options={[{ value: "board", label: "Board" }, { value: "list", label: "List" }]} />
        <label className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] md:max-w-xs">
          <Search className="h-4 w-4 text-[#8e8e93]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads" className="w-full bg-transparent text-[14px] outline-none" />
        </label>
        <Select value={owner} onChange={(e) => setOwner(e.target.value)} options={["All", ...OWNERS]} className="h-10 bg-white md:w-44" />
      </div>

      {view === "board" ? (
        <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
          <div className="flex min-w-max gap-3">
            {STAGES.map((s) => {
              const col = filtered.filter((l) => l.stage === s);
              return (
                <div
                  key={s}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOver(s);
                  }}
                  onDragLeave={() => setOver(null)}
                  onDrop={() => {
                    if (drag) move(drag, s);
                    setDrag(null);
                    setOver(null);
                  }}
                  className={cn("w-[290px] shrink-0 rounded-[20px] bg-[#ebebed]/70 p-2 transition", over === s && "bg-accent-soft ring-2 ring-accent/40")}
                >
                  <div className="flex items-center justify-between px-2 py-2">
                    <span className="flex items-center gap-2 text-[14px] font-semibold">
                      <span className="h-2 w-2 rounded-full" style={{ background: STAGE_META[s].color }} />
                      {STAGE_META[s].label}
                      <span className="text-[#8e8e93]">{col.length}</span>
                    </span>
                    <span className="text-[12px] text-[#8e8e93]">{inr(col.reduce((a, l) => a + l.value, 0), true)}</span>
                  </div>
                  <div className="min-h-[120px] space-y-2">
                    <AnimatePresence>
                      {col.map((l) => (
                        <motion.button
                          layout
                          layoutId={l.id}
                          key={l.id}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: drag === l.id ? 0.4 : 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          draggable
                          onDragStart={() => setDrag(l.id)}
                          onDragEnd={() => setDrag(null)}
                          onClick={() => setEdit(l)}
                          className="block w-full cursor-grab rounded-2xl bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:shadow-md active:cursor-grabbing"
                        >
                          <div className="flex items-start gap-2.5">
                            <Avatar name={l.name} size={32} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[14px] font-semibold">{l.name}</p>
                              <p className="truncate text-[12px] text-[#8e8e93]">{l.eventType}</p>
                            </div>
                            {l.value > 0 && <span className="text-[13px] font-semibold tabular-nums">{inr(l.value, true)}</span>}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-[#6e6e73]">
                            {l.eventDate && (
                              <span className="flex items-center gap-1 rounded-full bg-[#f5f5f7] px-2 py-0.5">
                                <CalendarDays className="h-3 w-3" />
                                {fmtDate(l.eventDate, { day: "numeric", month: "short" })}
                              </span>
                            )}
                            {l.guests > 0 && (
                              <span className="flex items-center gap-1 rounded-full bg-[#f5f5f7] px-2 py-0.5">
                                <Users className="h-3 w-3" />
                                {l.guests}
                              </span>
                            )}
                            <span className="rounded-full bg-[#f5f5f7] px-2 py-0.5 capitalize">{l.source}</span>
                            <span className="ml-auto">{timeAgo(l.createdAt)}</span>
                          </div>
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[14px]">
              <thead className="border-b border-black/5 text-[12px] text-[#8e8e93]">
                <tr>
                  {["Lead", "Event", "Budget", "Value", "Stage", "Owner", "Created"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((l) => (
                  <tr key={l.id} onClick={() => setEdit(l)} className="cursor-pointer hover:bg-[#f9f9fb]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={l.name} size={32} />
                        <div>
                          <p className="font-medium">{l.name}</p>
                          <p className="text-[12px] text-[#8e8e93]">{l.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {l.eventType}
                      <p className="text-[12px] text-[#8e8e93]">{l.eventDate ? fmtDate(l.eventDate) : "Date TBC"}</p>
                    </td>
                    <td className="px-4 py-3 text-[#6e6e73]">{l.budget || "—"}</td>
                    <td className="px-4 py-3 font-medium tabular-nums">{l.value ? inr(l.value, true) : "—"}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select value={l.stage} onChange={(e) => move(l.id, e.target.value as LeadStage)} className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[12px] font-medium outline-none">
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {STAGE_META[s].label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">{l.owner}</td>
                    <td className="px-4 py-3 text-[#8e8e93]">{timeAgo(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <LeadDrawer
        lead={edit}
        onClose={() => setEdit(null)}
        onSave={async (l) => {
          const r = await save(l);
          if (r) setEdit(r);
        }}
        onDelete={async (l) => {
          if (!confirm(`Delete lead ${l.name}?`)) return;
          await api(`/api/admin/collection/leads?id=${l.id}`, "DELETE");
          setLeads((ls) => ls.filter((x) => x.id !== l.id));
          setEdit(null);
          toast("Lead deleted");
          router.refresh();
        }}
      />
    </>
  );
}

function LeadDrawer({ lead, onClose, onSave, onDelete }: { lead: Lead | null; onClose: () => void; onSave: (l: Lead) => Promise<void>; onDelete: (l: Lead) => void }) {
  const [l, setL] = useState<Lead | null>(lead);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => setL(lead), [lead]);
  if (!l) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;
  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => setL({ ...l, [k]: v });
  const isNew = !l.id;
  const wa = l.phone.replace(/\D/g, "");

  return (
    <Drawer
      open={!!lead}
      onClose={onClose}
      title={isNew ? "New lead" : l.name}
      footer={
        <>
          {!isNew ? (
            <Button variant="danger" onClick={() => onDelete(l)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          ) : (
            <span />
          )}
          <Button
            loading={busy}
            disabled={!l.name || !l.email}
            onClick={async () => {
              setBusy(true);
              await onSave(l);
              setBusy(false);
            }}
          >
            {isNew ? "Create lead" : "Save changes"}
          </Button>
        </>
      }
    >
      {!isNew && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white p-4">
          <Avatar name={l.name} size={48} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{l.name}</p>
            <p className="truncate text-[13px] text-[#8e8e93]">
              {l.id} · via {l.source} · {timeAgo(l.createdAt)}
            </p>
          </div>
          <div className="flex gap-1.5">
            <a href={`mailto:${l.email}`} className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f0f2]" title="Email">
              <Mail className="h-4 w-4" />
            </a>
            {l.phone && (
              <a href={`tel:${l.phone}`} className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f0f2]" title="Call">
                <Phone className="h-4 w-4" />
              </a>
            )}
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-[#e8f8ee] text-[#1a7f3c]" title="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}

      <p className="mb-2 text-[13px] font-medium text-[#3a3a3c]">Stage</p>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {STAGES.map((s) => (
          <button key={s} onClick={() => set("stage", s)} className={cn("rounded-full px-3 py-1.5 text-[13px] font-medium transition", l.stage === s ? "text-white" : "bg-white text-[#3a3a3c]")} style={l.stage === s ? { background: STAGE_META[s].color } : undefined}>
            {STAGE_META[s].label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-4 sm:grid-cols-2">
        <Label label="Name">
          <Input value={l.name} onChange={(e) => set("name", e.target.value)} />
        </Label>
        <Label label="Email">
          <Input type="email" value={l.email} onChange={(e) => set("email", e.target.value)} />
        </Label>
        <Label label="Phone">
          <Input value={l.phone} onChange={(e) => set("phone", e.target.value)} />
        </Label>
        <Label label="Event type">
          <Input value={l.eventType} onChange={(e) => set("eventType", e.target.value)} />
        </Label>
        <Label label="Event date">
          <Input type="date" value={l.eventDate} onChange={(e) => set("eventDate", e.target.value)} />
        </Label>
        <Label label="Guests">
          <Input type="number" value={l.guests} onChange={(e) => set("guests", +e.target.value)} />
        </Label>
        <Label label="Budget">
          <Input value={l.budget} onChange={(e) => set("budget", e.target.value)} />
        </Label>
        <Label label="Deal value (₹)" hint={l.value ? inr(l.value, true) : ""}>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" />
            <Input type="number" value={l.value} onChange={(e) => set("value", +e.target.value)} className="pl-9" />
          </div>
        </Label>
        <Label label="Owner">
          <Select value={l.owner} onChange={(e) => set("owner", e.target.value)} options={OWNERS} />
        </Label>
        <Label label="Source">
          <Select value={l.source} onChange={(e) => set("source", e.target.value as Lead["source"])} options={["manual", "contact", "planner", "event"]} />
        </Label>
        <Label label="Message / brief" className="sm:col-span-2">
          <Textarea rows={3} value={l.message} onChange={(e) => set("message", e.target.value)} />
        </Label>
      </div>

      {!isNew && (
        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="mb-3 text-[14px] font-semibold">Notes & timeline</p>
          <div className="flex gap-2">
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" onKeyDown={(e) => e.key === "Enter" && note && (setL({ ...l, notes: [...l.notes, { text: note, at: new Date().toISOString() }] }), setNote(""))} />
            <Button
              variant="secondary"
              className="h-11 w-11 shrink-0 px-0"
              onClick={() => {
                if (!note) return;
                const next = { ...l, notes: [...l.notes, { text: note, at: new Date().toISOString() }] };
                setL(next);
                setNote("");
                onSave(next);
              }}
              aria-label="Add note"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {[...l.notes].reverse().map((n, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <div>
                  <p className="text-[14px]">{n.text}</p>
                  <p className="text-[12px] text-[#8e8e93]">{timeAgo(n.at)}</p>
                </div>
              </li>
            ))}
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#c7c7cc]" />
              <div>
                <p className="text-[14px]">Lead created via {l.source}</p>
                <p className="text-[12px] text-[#8e8e93]">{fmtDate(l.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
            </li>
          </ul>
        </div>
      )}
      {!isNew && <Badge className="mt-4">Tip: drag cards between columns on the board</Badge>}
    </Drawer>
  );
}
