"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ImagePlus, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- API ---------- */
export async function api<T = unknown>(url: string, method: "GET" | "PUT" | "POST" | "DELETE" = "GET", body?: unknown): Promise<T> {
  const r = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `Request failed (${r.status})`);
  return j as T;
}

/* ---------- Toast ---------- */
type Toast = { id: number; text: string; tone: "ok" | "err" };
const ToastCtx = createContext<(text: string, tone?: "ok" | "err") => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, text, tone }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[300] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {list.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn("flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-white shadow-xl", t.tone === "ok" ? "bg-[#1d1d1f]" : "bg-red-600")}
            >
              {t.tone === "ok" ? <Check className="h-4 w-4 text-[#34c759]" /> : <X className="h-4 w-4" />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Primitives ---------- */
export function Card({ children, className, title, action, pad = true }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode; pad?: boolean }) {
  return (
    <section className={cn("rounded-[20px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.04)]", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-5 pb-1 pt-4">
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          {action}
        </header>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.03em] md:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-[#6e6e73]">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  loading,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" | "accent"; loading?: boolean }) {
  return (
    <button
      {...p}
      disabled={p.disabled || loading}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[14px] font-medium transition active:scale-[0.97] disabled:opacity-50",
        variant === "primary" && "bg-[#1d1d1f] text-white hover:bg-black",
        variant === "accent" && "bg-accent text-white hover:brightness-110",
        variant === "secondary" && "bg-[#f0f0f2] text-[#1d1d1f] hover:bg-[#e6e6e9]",
        variant === "ghost" && "text-[#1d1d1f] hover:bg-black/5",
        variant === "danger" && "bg-red-50 text-red-600 hover:bg-red-100",
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Badge({ children, tone = "gray", className }: { children: ReactNode; tone?: "gray" | "green" | "blue" | "orange" | "red" | "purple" | "yellow"; className?: string }) {
  const tones = {
    gray: "bg-[#f0f0f2] text-[#3a3a3c]",
    green: "bg-[#e8f8ee] text-[#1a7f3c]",
    blue: "bg-[#e8f1ff] text-[#0a5bd6]",
    orange: "bg-accent-soft text-accent",
    red: "bg-red-50 text-red-600",
    purple: "bg-[#f1ecff] text-[#6b3fd6]",
    yellow: "bg-[#fff6db] text-[#8a6100]",
  };
  return <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium", tones[tone], className)}>{children}</span>;
}

const field = "w-full rounded-xl bg-[#f5f5f7] px-3.5 text-[15px] outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-2 focus:ring-accent/60";

export function Label({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-[#3a3a3c]">
        {label}
        {hint && <span className="text-[12px] font-normal text-[#8e8e93]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn(field, "h-11", p.className)} />;
}
export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cn(field, "py-3 leading-relaxed", p.className)} />;
}
export function Select({ options, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: (string | { value: string; label: string })[] }) {
  return (
    <select {...p} className={cn(field, "h-11 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23888%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:14px] bg-[right_12px_center] bg-no-repeat pr-9", p.className)}>
      {options.map((o) => (typeof o === "string" ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 text-left">
      {(label || description) && (
        <span>
          {label && <span className="block text-[15px] font-medium">{label}</span>}
          {description && <span className="block text-[13px] text-[#8e8e93]">{description}</span>}
        </span>
      )}
      <span className={cn("relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors", checked ? "bg-[#34c759]" : "bg-[#e9e9eb]")}>
        <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 34 }} className={cn("absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)]", checked ? "right-[2px]" : "left-[2px]")} />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-[10px] bg-[#f0f0f2] p-0.5">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className="relative rounded-[8px] px-3 py-1.5 text-[13px] font-medium">
          {value === o.value && <motion.span layoutId={`seg-${options.map((x) => x.value).join("")}`} className="absolute inset-0 rounded-[8px] bg-white shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Drawer / Modal ---------- */
export function Drawer({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]">
          <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className={cn("absolute bottom-0 right-0 top-0 flex w-full flex-col bg-[#f5f5f7] shadow-2xl md:rounded-l-[24px]", wide ? "md:w-[760px]" : "md:w-[560px]")}
          >
            <header className="flex items-center justify-between gap-3 border-b border-black/5 bg-white/80 px-5 py-4 backdrop-blur md:rounded-tl-[24px]">
              <h2 className="truncate text-[17px] font-semibold tracking-tight">{title}</h2>
              <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f0f0f2] hover:bg-[#e6e6e9]" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <footer className="flex items-center justify-between gap-2 border-t border-black/5 bg-white px-5 py-3 md:rounded-bl-[24px]">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Image field ---------- */
const LIB = [
  "1514525253161-7a46d19cd819", "1540575467063-178a50c2df87", "1519225421980-715cb0215aed", "1508997449629-303059a039c0", "1524368535928-5b5e00ddc76b",
  "1492684223066-81342ee5ff30", "1556125574-d7f27ec36a06", "1583939003579-730e3918a45a", "1561489396-888724a1543d", "1459749411175-04bf5292ceea",
  "1505236858219-8359eb29e329", "1527529482837-4698179dc6ce", "1469371670807-013ccf25f16a", "1516450360452-9312f5e86fc7", "1511578314322-379afb476865",
  "1511795409834-ef04bbd61622", "1496337589254-7e19d01cec44", "1519167758481-83f550bb49b3", "1559223607-a43c990c692c", "1530023367847-a683933f4172",
  "1530103862676-de8c9debad1d", "1587825140708-dfaf72ae4b04", "1506157786151-b8491531f063", "1532712938310-34cb3982ef74", "1517457373958-b7bdd4587205",
  "1414235077428-338989a2e8c0", "1563841930606-67e2bce48b78", "1533174072545-7a4b6ad7a6c3", "1542038784456-1ea8e935640e", "1467810563316-b5476525c0f9",
];

async function downscale(file: File, max = 1600): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();
  const s = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.82);
}

export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [lib, setLib] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[#f0f0f2]">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="absolute inset-0 m-auto h-5 w-5 text-[#8e8e93]" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Input value={value.startsWith("data:") ? "(uploaded image)" : value} onChange={(e) => onChange(e.target.value)} placeholder="https://images.unsplash.com/…" readOnly={value.startsWith("data:")} />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="h-8 px-3 text-[13px]" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
            <Button type="button" variant="secondary" className="h-8 px-3 text-[13px]" onClick={() => setLib((v) => !v)}>
              <ImagePlus className="h-3.5 w-3.5" /> Library
            </Button>
            {value && (
              <Button type="button" variant="ghost" className="h-8 px-3 text-[13px]" onClick={() => onChange("")}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) onChange(await downscale(f));
          e.target.value = "";
        }}
      />
      <AnimatePresence>
        {lib && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="grid max-h-56 grid-cols-5 gap-1.5 overflow-y-auto rounded-xl bg-[#f0f0f2] p-1.5">
              {LIB.map((id) => {
                const u = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => {
                      onChange(u);
                      setLib(false);
                    }}
                    className={cn("aspect-square overflow-hidden rounded-lg ring-2", value === u ? "ring-accent" : "ring-transparent")}
                  >
                    <img src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=200&q=60`} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-black/10 p-10 text-center text-[15px] text-[#8e8e93]">{children}</div>;
}

export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = name;
  a.click();
}
