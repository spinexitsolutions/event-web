"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Minus, Plus, ShieldCheck } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { cn, inr } from "@/lib/utils";
import { EASE } from "./motion";

export function BookingWidget({ event }: { event: EventItem }) {
  const router = useRouter();
  const firstAvail = event.tickets.findIndex((t) => t.sold < t.capacity);
  const [tier, setTier] = useState(Math.max(0, firstAvail));
  const [qty, setQty] = useState(1);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const t = event.tickets[tier];
  const left = t ? t.capacity - t.sold : 0;
  const fee = Math.round((t?.price || 0) * qty * 0.03);
  const closed = event.status !== "upcoming" || firstAvail < 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/public/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id, ticket: t.name, qty, ...form }),
    });
    const j = await r.json();
    if (!r.ok) {
      setErr(j.error || "Something went wrong");
      setBusy(false);
      return;
    }
    router.push(`/booking/${j.id}`);
  }

  if (closed)
    return (
      <div className="rounded-[var(--radius)] bg-white p-6 ring-1 ring-line">
        <p className="text-xl font-medium tracking-tight">{event.status === "past" ? "This event has ended" : "Sold out"}</p>
        <p className="mt-2 text-muted">Join the newsletter to get first access to the next one.</p>
      </div>
    );

  return (
    <div id="tickets" className="overflow-hidden rounded-[var(--radius)] bg-white ring-1 ring-line">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <p className="font-medium tracking-tight">{step === 1 ? "Select tickets" : "Your details"}</p>
        <span className="eyebrow text-muted">Step {step}/2</span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: EASE }} className="p-4 md:p-5">
            <div className="space-y-2">
              {event.tickets.map((tk, i) => {
                const soldOut = tk.sold >= tk.capacity;
                const active = i === tier;
                return (
                  <button
                    key={tk.name}
                    disabled={soldOut}
                    onClick={() => {
                      setTier(i);
                      setQty(1);
                    }}
                    className={cn("relative w-full rounded-2xl p-4 text-left ring-1 transition", active ? "bg-accent-soft/60 ring-accent" : "ring-line hover:ring-ink/30", soldOut && "cursor-not-allowed opacity-45")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{tk.name}</p>
                        <p className="mt-0.5 text-sm text-muted">{tk.perks}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums">{inr(tk.price)}</p>
                        <p className={cn("text-xs", soldOut ? "text-muted" : tk.capacity - tk.sold < 50 ? "text-accent" : "text-muted")}>
                          {soldOut ? "Sold out" : `${tk.capacity - tk.sold} left`}
                        </p>
                      </div>
                    </div>
                    {active && (
                      <motion.span layoutId="tick" className="absolute -left-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-accent text-white">
                        <Check className="h-3.5 w-3.5" />
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm text-muted">Quantity</span>
              <div className="flex items-center gap-1 rounded-full bg-ink/5 p-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm" aria-label="Decrease">
                  <Minus className="h-4 w-4" />
                </button>
                <motion.span key={qty} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-10 text-center font-semibold tabular-nums">
                  {qty}
                </motion.span>
                <button onClick={() => setQty((q) => Math.min(10, left, q + 1))} className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm" aria-label="Increase">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-5 space-y-1.5 border-t border-dashed border-line pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>
                  {qty} × {t.name}
                </span>
                <span className="tabular-nums">{inr(t.price * qty)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Booking fee (3%)</span>
                <span className="tabular-nums">{inr(fee)}</span>
              </div>
              <div className="flex justify-between pt-2 text-lg font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{inr(t.price * qty + fee)}</span>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink font-medium text-bg transition hover:bg-accent">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <motion.form key="s2" onSubmit={submit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4, ease: EASE }} className="space-y-3 p-4 md:p-5">
            {(
              [
                ["name", "Full name", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone (WhatsApp)", "tel"],
              ] as const
            ).map(([k, l, type]) => (
              <label key={k} className="block">
                <span className="mb-1.5 block text-sm text-muted">{l}</span>
                <input
                  required={k !== "phone"}
                  type={type}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="h-12 w-full rounded-xl bg-bg px-4 outline-none ring-1 ring-line transition focus:ring-2 focus:ring-accent"
                />
              </label>
            ))}
            <div className="flex items-center justify-between rounded-xl bg-bg p-3 text-sm">
              <span>
                {qty} × {t.name}
              </span>
              <b className="tabular-nums">{inr(t.price * qty + fee)}</b>
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button disabled={busy} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent font-medium text-white transition hover:brightness-110 disabled:opacity-70">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {busy ? "Confirming…" : "Confirm booking"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <p className="text-center text-xs text-muted">Demo checkout — no payment is taken. Plug in Razorpay / Stripe in production.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
