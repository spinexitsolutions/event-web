"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
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
      <div className="pointer-events-none fixed bottom-5 right-5 z-[300] flex flex-col items-end gap-2">
        <AnimatePresence>
          {list.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("meta flex items-center gap-3 rounded-[3px] px-4 py-3 text-bg", t.tone === "ok" ? "bg-ink" : "bg-[#b42318]")}
            >
              <span className={cn("h-1.5 w-1.5", t.tone === "ok" ? "bg-[#4ade80]" : "bg-white")} />
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
    <section className={cn("rounded-[4px] border border-line bg-white/70", className)}>
      {(title || action) && (
        <header className="meta flex items-baseline justify-between gap-3 border-b border-line px-5 py-3">
          <h3 className="text-[13px] font-medium tracking-[-0.01em] text-ink">{title}</h3>
          <span className="text-muted">{action}</span>
        </header>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 md:mb-10">
      <div className="meta flex justify-between border-b border-line pb-3 text-muted">
        <span className="text-ink">Studio admin</span>
        <span>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[clamp(2.2rem,4vw,3.6rem)] leading-[0.95] tracking-[-0.05em]">{title}</h1>
          {subtitle && <p className="mt-3 max-w-xl text-[14px] text-muted">{subtitle}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
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
        "inline-flex h-10 items-center justify-center gap-2 rounded-[3px] px-4 text-[13px] font-medium tracking-[-0.005em] transition-colors disabled:opacity-40",
        variant === "primary" && "bg-ink text-bg hover:bg-ink/85",
        variant === "accent" && "bg-accent text-white hover:brightness-110",
        variant === "secondary" && "border border-line bg-transparent text-ink hover:border-ink",
        variant === "ghost" && "text-ink hover:bg-ink/[0.05]",
        variant === "danger" && "border border-[#b42318]/30 text-[#b42318] hover:bg-[#b42318] hover:text-white",
        className
      )}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

const DOT: Record<string, string> = {
  gray: "bg-ink/30",
  green: "bg-[#1a7f3c]",
  blue: "bg-accent",
  orange: "bg-[#c2410c]",
  red: "bg-[#b42318]",
  purple: "bg-ink/60",
  yellow: "bg-[#b45309]",
};
export function Badge({ children, tone = "gray", className }: { children: ReactNode; tone?: "gray" | "green" | "blue" | "orange" | "red" | "purple" | "yellow"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-[3px] border border-line px-2 py-0.5 text-[12px] text-ink", className)}>
      <span className={cn("h-1.5 w-1.5 shrink-0", DOT[tone])} />
      {children}
    </span>
  );
}

const field = "w-full rounded-[3px] border border-line bg-white/80 px-3 text-[14px] outline-none transition-colors placeholder:text-muted focus:border-ink";

export function Label({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="meta mb-1.5 flex items-baseline justify-between text-muted">
        <span className="text-ink">{label}</span>
        {hint && <span>{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn(field, "h-10", p.className)} />;
}
export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cn(field, "py-2.5 leading-relaxed", p.className)} />;
}
export function Select({ options, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: (string | { value: string; label: string })[] }) {
  return (
    <select {...p} className={cn(field, "h-10 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23121212%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:10px] bg-[right_12px_center] bg-no-repeat pr-8", p.className)}>
      {options.map((o) => (typeof o === "string" ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 text-left" aria-pressed={checked}>
      {(label || description) && (
        <span>
          {label && <span className="block text-[14px]">{label}</span>}
          {description && <span className="meta block text-muted">{description}</span>}
        </span>
      )}
      <span className="flex shrink-0 items-center gap-2">
        <span className="meta w-6 text-right text-muted">{checked ? "On" : "Off"}</span>
        <span className={cn("relative h-5 w-9 rounded-[3px] border transition-colors", checked ? "border-ink bg-ink" : "border-line bg-transparent")}>
          <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 38 }} className={cn("absolute top-[2px] h-3.5 w-3.5 rounded-[2px]", checked ? "right-[2px] bg-bg" : "left-[2px] bg-ink/40")} />
        </span>
      </span>
    </button>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex border-b border-line">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className={cn("relative px-3 pb-2 pt-1 text-[13px] transition-colors", value === o.value ? "text-ink" : "text-muted hover:text-ink")}>
          {o.label}
          {value === o.value && <motion.span layoutId={`seg-${options.map((x) => x.value).join("")}`} className="absolute inset-x-0 -bottom-px h-px bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
        </button>
      ))}
    </div>
  );
}

/* ---------- Drawer ---------- */
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
          <motion.div className="absolute inset-0 bg-ink/25" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className={cn("absolute bottom-0 right-0 top-0 flex w-full flex-col border-l border-line bg-bg", wide ? "md:w-[760px]" : "md:w-[560px]")}
          >
            <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="truncate text-[20px] tracking-[-0.03em]">{title}</h2>
              <button onClick={onClose} className="meta shrink-0 text-muted hover:text-ink" aria-label="Close">
                Close ✕
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <footer className="flex items-center justify-between gap-2 border-t border-line px-5 py-3">{footer}</footer>}
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
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[3px] border border-line bg-ink/[0.04]">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="meta absolute inset-0 grid place-items-center text-muted">No image</span>}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Input value={value.startsWith("data:") ? "(uploaded image)" : value} onChange={(e) => onChange(e.target.value)} placeholder="https://images.unsplash.com/…" readOnly={value.startsWith("data:")} />
          <div className="meta flex gap-4">
            <button type="button" className="link-underline" onClick={() => fileRef.current?.click()}>
              Upload
            </button>
            <button type="button" className="link-underline" onClick={() => setLib((v) => !v)}>
              {lib ? "Close library" : "Library"}
            </button>
            {value && (
              <button type="button" className="text-muted hover:text-ink" onClick={() => onChange("")}>
                Clear
              </button>
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
            <div className="grid max-h-56 grid-cols-5 gap-1 overflow-y-auto border border-line p-1" data-lenis-prevent>
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
                    className={cn("aspect-square overflow-hidden outline outline-2 -outline-offset-2", value === u ? "outline-ink" : "outline-transparent")}
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
  return <div className="meta border border-dashed border-line p-10 text-center text-muted">{children}</div>;
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
