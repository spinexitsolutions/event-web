"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "./motion";

const TYPES = ["Wedding", "Corporate", "Concert", "Conference", "Product Launch", "Birthday", "Destination Wedding", "Something else"];
const BUDGETS = ["₹2L – ₹5L", "₹5L – ₹10L", "₹10L – ₹25L", "₹25L – ₹50L", "₹50L+", "Not sure yet"];
const GUESTS = [50, 150, 300, 500, 1000, 5000];
const VALUE: Record<string, number> = { "₹2L – ₹5L": 350000, "₹5L – ₹10L": 750000, "₹10L – ₹25L": 1750000, "₹25L – ₹50L": 3750000, "₹50L+": 6000000 };

export function Planner({ services }: { services: string[] }) {
  const sp = useSearchParams();
  const pre = sp.get("type") || "";
  const pkg = sp.get("package") || "";
  const types = Array.from(new Set([...services, ...TYPES]));
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState({
    eventType: types.includes(pre) ? pre : "",
    eventDate: "",
    guests: 150,
    budget: "",
    name: "",
    email: "",
    phone: "",
    message: pkg ? `Interested in the ${pkg} package. ` : "",
  });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState("");
  const steps = ["Occasion", "Date & guests", "Budget", "About you"];
  const canNext = [!!data.eventType, true, !!data.budget, !!data.name && /\S+@\S+/.test(data.email)][step];

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  async function submit() {
    setState("busy");
    const r = await fetch("/api/public/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, source: "planner", value: VALUE[data.budget] || 0 }),
    });
    if (r.ok) setState("done");
    else {
      setErr((await r.json()).error);
      setState("idle");
    }
  }

  if (state === "done")
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[460px] flex-col items-center justify-center rounded-[var(--radius)] bg-dark p-10 text-center text-white">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="grid h-16 w-16 place-items-center rounded-full bg-accent">
          <Check className="h-8 w-8" />
        </motion.span>
        <h3 className="mt-6 text-4xl font-medium tracking-[-0.04em]">
          Thank you, <span className="serif-accent text-accent">{data.name.split(" ")[0]}</span>.
        </h3>
        <p className="mt-3 max-w-sm text-white/60">A producer will reach out within 24 hours with first ideas for your {data.eventType.toLowerCase()}.</p>
      </motion.div>
    );

  return (
    <div className="overflow-hidden rounded-[var(--radius)] bg-white ring-1 ring-line">
      <div className="border-b border-line p-5 md:p-7">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-muted">
            Step {step + 1} of {steps.length} — {steps[step]}
          </p>
          <p className="eyebrow text-accent">{Math.round(((step + 1) / steps.length) * 100)}%</p>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {steps.map((s, i) => (
            <div key={s} className="h-1 overflow-hidden rounded-full bg-ink/10">
              <motion.div className="h-full bg-accent" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.6, ease: EASE }} />
            </div>
          ))}
        </div>
      </div>

      <div className="relative min-h-[380px] p-5 md:p-7">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {step === 0 && (
              <>
                <h3 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">What are we celebrating?</h3>
                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {types.map((t) => (
                    <Choice key={t} active={data.eventType === t} onClick={() => setData({ ...data, eventType: t })}>
                      {t}
                    </Choice>
                  ))}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h3 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">When, and how many?</h3>
                <label className="mt-6 block">
                  <span className="mb-2 block text-sm text-muted">Preferred date (approx. is fine)</span>
                  <input type="date" value={data.eventDate} onChange={(e) => setData({ ...data, eventDate: e.target.value })} className="h-12 w-full rounded-xl bg-bg px-4 outline-none ring-1 ring-line focus:ring-2 focus:ring-accent" />
                </label>
                <div className="mt-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted">Guests</span>
                    <span className="text-3xl font-medium tabular-nums tracking-tight">{data.guests.toLocaleString("en-IN")}</span>
                  </div>
                  <input type="range" min={10} max={5000} step={10} value={data.guests} onChange={(e) => setData({ ...data, guests: +e.target.value })} className="mt-3 w-full accent-[var(--accent)]" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {GUESTS.map((g) => (
                      <button key={g} onClick={() => setData({ ...data, guests: g })} className={cn("rounded-full px-3 py-1.5 text-xs ring-1", data.guests === g ? "bg-ink text-bg ring-ink" : "ring-line")}>
                        {g.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h3 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">What budget feels right?</h3>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {BUDGETS.map((b) => (
                    <Choice key={b} active={data.budget === b} onClick={() => setData({ ...data, budget: b })}>
                      {b}
                    </Choice>
                  ))}
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h3 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">How do we reach you?</h3>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Field label="Full name" value={data.name} onChange={(v) => setData({ ...data, name: v })} />
                  <Field label="Email" type="email" value={data.email} onChange={(v) => setData({ ...data, email: v })} />
                  <Field label="Phone / WhatsApp" type="tel" value={data.phone} onChange={(v) => setData({ ...data, phone: v })} />
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-sm text-muted">Tell us the vision</span>
                    <textarea rows={3} value={data.message} onChange={(e) => setData({ ...data, message: e.target.value })} className="w-full rounded-xl bg-bg p-4 outline-none ring-1 ring-line focus:ring-2 focus:ring-accent" />
                  </label>
                </div>
                {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-line p-4 md:p-5">
        <button onClick={() => go(step - 1)} disabled={step === 0} className="flex h-12 items-center gap-2 rounded-full px-5 text-sm text-muted transition hover:text-ink disabled:opacity-0">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {step < 3 ? (
          <button onClick={() => go(step + 1)} disabled={!canNext} className="flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-bg transition hover:bg-accent disabled:opacity-30">
            Next <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={submit} disabled={!canNext || state === "busy"} className="flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-40">
            {state === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Send enquiry
          </button>
        )}
      </div>
    </div>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("relative flex min-h-16 items-center justify-between rounded-2xl px-4 py-3 text-left text-[15px] ring-1 transition", active ? "bg-ink text-bg ring-ink" : "ring-line hover:ring-ink/40")}>
      {children}
      {active && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-white">
          <Check className="h-3 w-3" />
        </motion.span>
      )}
    </button>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full rounded-xl bg-bg px-4 outline-none ring-1 ring-line focus:ring-2 focus:ring-accent" />
    </label>
  );
}
