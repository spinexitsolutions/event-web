"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ExternalLink, GripVertical, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { Settings } from "@/lib/types";
import { api, Button, Card, ImageInput, Input, Label, PageTitle, Segmented, Textarea, Toggle, useToast } from "./ui";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "General" },
  { id: "appearance", label: "Appearance" },
  { id: "intro", label: "Intro animation" },
  { id: "navigation", label: "Navbar" },
  { id: "homepage", label: "Homepage" },
  { id: "content", label: "Page content" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const TAB_KEYS: Record<Tab, (keyof Settings)[]> = {
  general: ["brand", "announcement", "seo"],
  appearance: ["theme"],
  intro: ["intro"],
  navigation: ["nav"],
  homepage: ["sections", "hero", "marquee", "stats", "statement"],
  content: ["about", "process", "cta"],
};

const PRESETS = [
  { name: "Lumé Vermilion", accent: "#FF5B2E", accentSoft: "#FFE3D8", background: "#F4F1EB" },
  { name: "Electric Violet", accent: "#6C4BFF", accentSoft: "#E9E4FF", background: "#F4F3F8" },
  { name: "Emerald", accent: "#0F9D6B", accentSoft: "#D9F3E8", background: "#F2F4F0" },
  { name: "Champagne", accent: "#B98A3E", accentSoft: "#F3E7D2", background: "#F6F2EA" },
  { name: "Hot Pink", accent: "#FF2E7E", accentSoft: "#FFDDE9", background: "#F7F2F3" },
  { name: "Ocean", accent: "#0A84FF", accentSoft: "#DCEBFF", background: "#F1F4F7" },
];

export function SettingsEditor({ initial }: { initial: Settings }) {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState<Settings>(initial);
  const [saved, setSaved] = useState<Settings>(initial);
  const [tab, setTab] = useState<Tab>("general");
  const [busy, setBusy] = useState(false);
  const dirty = TAB_KEYS[tab].some((k) => JSON.stringify(s[k]) !== JSON.stringify(saved[k]));
  const anyDirty = JSON.stringify(s) !== JSON.stringify(saved);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    if (t && TAB_KEYS[t]) setTab(t);
  }, []);

  const up = <K extends keyof Settings>(k: K, v: Partial<Settings[K]> | Settings[K]) =>
    setS((p) => ({ ...p, [k]: Array.isArray(v) ? v : { ...(p[k] as object), ...(v as object) } }));

  async function save() {
    setBusy(true);
    const patch: Partial<Settings> = {};
    for (const k of Object.keys(s) as (keyof Settings)[]) if (JSON.stringify(s[k]) !== JSON.stringify(saved[k])) (patch as Record<string, unknown>)[k] = s[k];
    try {
      await api("/api/admin/settings", "PUT", patch);
      setSaved(s);
      toast("Saved — the website is updated");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "err");
    }
    setBusy(false);
  }

  return (
    <>
      <PageTitle title="Site settings" subtitle="Control every part of the public website — no code needed.">
        <a href="/" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium hover:bg-black/5">
          <ExternalLink className="h-4 w-4" /> Preview site
        </a>
        <Button onClick={save} loading={busy} disabled={!anyDirty} variant={anyDirty ? "accent" : "primary"}>
          {anyDirty ? "Save changes" : "All saved"}
        </Button>
      </PageTitle>

      <div className="no-scrollbar -mx-4 mb-6 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="inline-flex gap-1 rounded-full bg-white p-1 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="relative whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-medium">
              {tab === t.id && <motion.span layoutId="settings-tab" className="absolute inset-0 rounded-full bg-[#1d1d1f]" transition={{ type: "spring", stiffness: 450, damping: 36 }} />}
              <span className={cn("relative", tab === t.id ? "text-white" : "text-[#3a3a3c]")}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-4">
          {tab === "general" && <General s={s} up={up} />}
          {tab === "appearance" && <Appearance s={s} up={up} />}
          {tab === "intro" && <IntroTab s={s} up={up} />}
          {tab === "navigation" && <NavTab s={s} up={up} />}
          {tab === "homepage" && <HomeTab s={s} up={up} setS={setS} />}
          {tab === "content" && <ContentTab s={s} up={up} setS={setS} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {anyDirty && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 lg:pl-[260px]">
            <div className="flex items-center gap-3 rounded-full bg-[#1d1d1f] p-1.5 pl-5 text-[14px] text-white shadow-2xl">
              <span>{dirty ? "Unsaved changes on this tab" : "Unsaved changes"}</span>
              <button onClick={() => setS(saved)} className="rounded-full px-3 py-2 text-white/70 hover:text-white">
                Discard
              </button>
              <Button variant="accent" onClick={save} loading={busy}>
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

type TabProps = { s: Settings; up: <K extends keyof Settings>(k: K, v: Partial<Settings[K]> | Settings[K]) => void; setS?: React.Dispatch<React.SetStateAction<Settings>> };

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function General({ s, up }: TabProps) {
  const router = useRouter();
  const toast = useToast();
  const b = s.brand;
  return (
    <>
      <Card title="Brand & contact">
        <Grid>
          <Label label="Brand name">
            <Input value={b.name} onChange={(e) => up("brand", { name: e.target.value })} />
          </Label>
          <Label label="Tagline">
            <Input value={b.tagline} onChange={(e) => up("brand", { tagline: e.target.value })} />
          </Label>
          <Label label="Email">
            <Input value={b.email} onChange={(e) => up("brand", { email: e.target.value })} />
          </Label>
          <Label label="Phone">
            <Input value={b.phone} onChange={(e) => up("brand", { phone: e.target.value })} />
          </Label>
          <Label label="WhatsApp number" hint="Country code, digits only">
            <Input value={b.whatsapp} onChange={(e) => up("brand", { whatsapp: e.target.value })} />
          </Label>
          <Label label="Office hours">
            <Input value={b.hours} onChange={(e) => up("brand", { hours: e.target.value })} />
          </Label>
          <Label label="Address">
            <Input value={b.address} onChange={(e) => up("brand", { address: e.target.value })} />
          </Label>
          <Label label="City">
            <Input value={b.city} onChange={(e) => up("brand", { city: e.target.value })} />
          </Label>
        </Grid>
      </Card>
      <Card title="Social links">
        <div className="space-y-2">
          {b.socials.map((so, i) => (
            <div key={i} className="flex gap-2">
              <Input value={so.label} onChange={(e) => up("brand", { socials: b.socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} className="max-w-[160px]" />
              <Input value={so.href} onChange={(e) => up("brand", { socials: b.socials.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)) })} />
              <Button variant="ghost" className="h-11 w-11 shrink-0 px-0" onClick={() => up("brand", { socials: b.socials.filter((_, j) => j !== i) })} aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="secondary" onClick={() => up("brand", { socials: [...b.socials, { label: "New", href: "https://" }] })}>
            <Plus className="h-4 w-4" /> Add link
          </Button>
        </div>
      </Card>
      <Card title="Announcement bar">
        <div className="space-y-4">
          <Toggle checked={s.announcement.enabled} onChange={(v) => up("announcement", { enabled: v })} label="Show announcement bar" description="Thin bar above the navbar on desktop" />
          <Grid>
            <Label label="Text">
              <Input value={s.announcement.text} onChange={(e) => up("announcement", { text: e.target.value })} />
            </Label>
            <Label label="Link">
              <Input value={s.announcement.href} onChange={(e) => up("announcement", { href: e.target.value })} />
            </Label>
          </Grid>
        </div>
      </Card>
      <Card title="SEO">
        <div className="space-y-4">
          <Label label="Site title" hint={`${s.seo.title.length}/60`}>
            <Input value={s.seo.title} onChange={(e) => up("seo", { title: e.target.value })} />
          </Label>
          <Label label="Meta description" hint={`${s.seo.description.length}/160`}>
            <Textarea rows={2} value={s.seo.description} onChange={(e) => up("seo", { description: e.target.value })} />
          </Label>
          <div className="rounded-xl bg-[#f5f5f7] p-4">
            <p className="text-[12px] text-[#8e8e93]">Google preview</p>
            <p className="mt-1 text-[18px] text-[#1a0dab]">{s.seo.title}</p>
            <p className="text-[13px] text-[#006621]">https://lume.events</p>
            <p className="text-[13px] text-[#545454]">{s.seo.description}</p>
          </div>
        </div>
      </Card>
      <Card title="Demo data">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] text-[#6e6e73]">Reset every event, lead, booking and setting back to the original demo content.</p>
          <Button
            variant="danger"
            onClick={async () => {
              if (!confirm("Reset ALL data to the demo defaults?")) return;
              await api("/api/admin/reset", "POST");
              toast("Demo data restored");
              router.refresh();
              setTimeout(() => window.location.reload(), 400);
            }}
          >
            <RotateCcw className="h-4 w-4" /> Reset demo
          </Button>
        </div>
      </Card>
    </>
  );
}

function Appearance({ s, up }: TabProps) {
  const t = s.theme;
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <Card title="Colour presets">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => up("theme", { accent: p.accent, accentSoft: p.accentSoft, background: p.background })} className={cn("flex items-center gap-3 rounded-2xl p-3 text-left ring-1 transition", t.accent.toLowerCase() === p.accent.toLowerCase() ? "ring-2 ring-[#1d1d1f]" : "ring-black/5 hover:ring-black/20")}>
                <span className="flex -space-x-1.5">
                  <span className="h-7 w-7 rounded-full ring-2 ring-white" style={{ background: p.accent }} />
                  <span className="h-7 w-7 rounded-full ring-2 ring-white" style={{ background: p.background }} />
                </span>
                <span className="text-[13px] font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card title="Custom colours">
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["accent", "Accent"],
                ["accentSoft", "Accent (soft)"],
                ["background", "Background"],
                ["ink", "Text"],
                ["dark", "Dark sections"],
              ] as const
            ).map(([k, l]) => (
              <Label key={k} label={l}>
                <div className="flex items-center gap-2">
                  <input type="color" value={t[k]} onChange={(e) => up("theme", { [k]: e.target.value })} className="h-11 w-14 cursor-pointer rounded-xl border-0 bg-transparent" />
                  <Input value={t[k]} onChange={(e) => up("theme", { [k]: e.target.value })} className="font-mono text-[13px]" />
                </div>
              </Label>
            ))}
            <Label label="Corner radius" hint={`${t.radius}px`}>
              <input type="range" min={0} max={48} value={t.radius} onChange={(e) => up("theme", { radius: +e.target.value })} className="mt-3 w-full accent-[var(--accent)]" />
            </Label>
          </div>
        </Card>
        <Card title="Motion">
          <div className="space-y-4">
            <Toggle checked={t.smoothScroll} onChange={(v) => up("theme", { smoothScroll: v })} label="Smooth scrolling" description="Inertia scrolling powered by Lenis" />
            <Toggle checked={t.cursor} onChange={(v) => up("theme", { cursor: v })} label="Custom cursor" description="Animated cursor with contextual labels (desktop only)" />
          </div>
        </Card>
      </div>
      <Card title="Live preview" className="h-fit xl:sticky xl:top-6">
        <div className="overflow-hidden rounded-2xl" style={{ background: t.background, color: t.ink, borderRadius: t.radius }}>
          <div className="p-6">
            <p className="text-[11px] uppercase tracking-[0.14em] opacity-60">Event studio</p>
            <p className="mt-3 text-[40px] font-medium leading-[0.95] tracking-[-0.045em]">
              We design <span className="serif-accent" style={{ color: t.accent }}>moments.</span>
            </p>
            <div className="mt-6 flex gap-2">
              <span className="rounded-full px-4 py-2.5 text-[13px] font-medium text-white" style={{ background: t.accent }}>
                Plan an event
              </span>
              <span className="rounded-full px-4 py-2.5 text-[13px]" style={{ boxShadow: `inset 0 0 0 1px ${t.ink}22` }}>
                Explore
              </span>
            </div>
          </div>
          <div className="m-3 p-5 text-white" style={{ background: t.dark, borderRadius: Math.max(0, t.radius - 8) }}>
            <span className="rounded-full px-2.5 py-1 text-[11px]" style={{ background: t.accentSoft, color: t.accent }}>
              Selling fast
            </span>
            <p className="mt-3 text-[20px] font-medium tracking-tight">Neon Tides Festival</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-3/4 rounded-full" style={{ background: t.accent }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function IntroTab({ s, up }: TabProps) {
  const it = s.intro;
  const [k, setK] = useState(0);
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <Card title="Intro / preloader">
        <div className="space-y-5">
          <Toggle checked={it.enabled} onChange={(v) => up("intro", { enabled: v })} label="Show intro animation" description="Plays when a visitor first opens the site" />
          <div>
            <p className="mb-2 text-[13px] font-medium text-[#3a3a3c]">Style</p>
            <Segmented
              value={it.style}
              onChange={(v) => up("intro", { style: v })}
              options={[
                { value: "counter", label: "Counter + words" },
                { value: "words", label: "Big words" },
                { value: "logo", label: "Logo reveal" },
              ]}
            />
          </div>
          <Label label="Words" hint="One per line — cycled during the intro">
            <Textarea rows={4} value={it.words.join("\n")} onChange={(e) => up("intro", { words: e.target.value.split("\n") })} onBlur={(e) => up("intro", { words: e.target.value.split("\n").map((w) => w.trim()).filter(Boolean) })} />
          </Label>
          <Label label="Duration" hint={`${(it.duration / 1000).toFixed(1)}s`}>
            <input type="range" min={1200} max={6000} step={100} value={it.duration} onChange={(e) => up("intro", { duration: +e.target.value })} className="w-full accent-[var(--accent)]" />
          </Label>
          <Toggle checked={it.oncePerSession} onChange={(v) => up("intro", { oncePerSession: v })} label="Only once per session" description="Skip the intro when the visitor navigates back to the site" />
        </div>
      </Card>
      <Card title="Preview" action={<Button variant="secondary" className="h-8 px-3 text-[12px]" onClick={() => setK((x) => x + 1)}><Play className="h-3.5 w-3.5" /> Replay</Button>} className="h-fit xl:sticky xl:top-6">
        <IntroPreview key={`${k}-${it.style}-${it.words.join()}-${it.duration}`} s={s} />
      </Card>
    </div>
  );
}

function IntroPreview({ s }: { s: Settings }) {
  const { intro, brand, theme } = s;
  const words = intro.words.length ? intro.words : [brand.name];
  const [n, setN] = useState(0);
  const [w, setW] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const p = Math.min(1, (t - start) / intro.duration);
      setN(Math.round(p * 100));
      setW(Math.min(words.length - 1, Math.floor(p * words.length)));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [intro.duration, words.length]);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl p-4 text-white" style={{ background: theme.dark }}>
      {!intro.enabled && <div className="absolute inset-0 z-10 grid place-items-center bg-black/60 text-[13px]">Intro is disabled</div>}
      {intro.style === "counter" && (
        <div className="flex h-full flex-col justify-between">
          <span className="text-[12px] font-semibold">
            {brand.name}
            <span style={{ color: theme.accent }}>.</span>
          </span>
          <AnimatePresence mode="popLayout">
            <motion.p key={w} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="serif-accent text-center text-[40px]">
              {words[w]}
            </motion.p>
          </AnimatePresence>
          <div>
            <p className="text-[64px] font-medium leading-none tracking-[-0.05em] tabular-nums">{String(n).padStart(3, "0")}</p>
            <div className="mt-2 h-px bg-white/15">
              <div className="h-px" style={{ width: `${n}%`, background: theme.accent }} />
            </div>
          </div>
        </div>
      )}
      {intro.style === "words" && (
        <div className="grid h-full place-items-center">
          <AnimatePresence mode="popLayout">
            <motion.p key={w} initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: -40, opacity: 0 }} className="text-[48px] font-medium tracking-[-0.05em]">
              {words[w]}
              <span style={{ color: theme.accent }}>.</span>
            </motion.p>
          </AnimatePresence>
        </div>
      )}
      {intro.style === "logo" && (
        <div className="grid h-full place-items-center">
          <div className="flex overflow-hidden text-[64px] font-semibold tracking-[-0.06em]">
            {brand.name.split("").map((c, i) => (
              <motion.span key={i} initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ delay: i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                {c}
              </motion.span>
            ))}
            <span style={{ color: theme.accent }}>.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function NavTab({ s, up }: TabProps) {
  const nav = s.nav;
  const [items, setItems] = useState(nav.items.map((it, i) => ({ ...it, _k: `${i}-${it.href}` })));
  useEffect(() => {
    up("nav", { items: items.map(({ _k, ...rest }) => rest) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <Card title="Menu items" action={<span className="text-[12px] text-[#8e8e93]">Drag to reorder</span>}>
        <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
          {items.map((it, i) => (
            <Reorder.Item key={it._k} value={it} className="list-none rounded-2xl bg-[#f5f5f7] p-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[#aeaeb2]" />
                <Input value={it.label} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className="bg-white" placeholder="Label" />
                <Input value={it.href} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} className="bg-white font-mono text-[13px]" placeholder="/path" />
                <Button variant="ghost" className="h-11 w-11 shrink-0 px-0" onClick={() => setItems(items.filter((_, j) => j !== i))} aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <details className="mt-2 pl-6">
                <summary className="cursor-pointer text-[12px] text-[#8e8e93]">Menu preview image</summary>
                <div className="mt-2">
                  <ImageInput value={it.image || ""} onChange={(v) => setItems(items.map((x, j) => (j === i ? { ...x, image: v } : x)))} />
                </div>
              </details>
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <Button variant="secondary" className="mt-3" onClick={() => setItems([...items, { label: "New page", href: "/", image: "", _k: `n-${Date.now()}` }])}>
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </Card>
      <div className="space-y-4">
        <Card title="Call-to-action button">
          <div className="space-y-3">
            <Label label="Label">
              <Input value={nav.ctaLabel} onChange={(e) => up("nav", { ctaLabel: e.target.value })} />
            </Label>
            <Label label="Link">
              <Input value={nav.ctaHref} onChange={(e) => up("nav", { ctaHref: e.target.value })} />
            </Label>
          </div>
        </Card>
        <Card title="Preview">
          <div className="rounded-2xl bg-[#e9e6df] p-4">
            <div className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-hidden rounded-full bg-[#111]/90 p-1.5 pl-3 text-[11px] text-white">
              <span className="mr-1 h-2 w-2 shrink-0 rounded-full" style={{ background: s.theme.accent }} />
              <b className="mr-1">{s.brand.name}</b>
              {items.slice(0, 4).map((i) => (
                <span key={i._k} className="hidden px-1.5 text-white/60 sm:inline">
                  {i.label}
                </span>
              ))}
              <span className="ml-1 shrink-0 rounded-full px-2.5 py-1" style={{ background: s.theme.accent }}>
                {nav.ctaLabel}
              </span>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#8e8e93]">Dynamic-island navbar · docks to the bottom on mobile</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HomeTab({ s, up, setS }: TabProps) {
  const h = s.hero;
  return (
    <>
      <Card title="Homepage sections" action={<span className="text-[12px] text-[#8e8e93]">Drag to reorder · toggle to show/hide</span>}>
        <Reorder.Group axis="y" values={s.sections} onReorder={(v) => setS!((p) => ({ ...p, sections: v }))} className="grid gap-2 md:grid-cols-2">
          {s.sections.map((sec) => (
            <Reorder.Item key={sec.id} value={sec} className={cn("flex list-none items-center gap-3 rounded-2xl p-3 transition", sec.enabled ? "bg-[#f5f5f7]" : "bg-[#f5f5f7]/50 opacity-60")}>
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[#aeaeb2]" />
              <div className="flex-1">
                <Toggle checked={sec.enabled} onChange={(v) => setS!((p) => ({ ...p, sections: p.sections.map((x) => (x.id === sec.id ? { ...x, enabled: v } : x)) }))} label={sec.label} />
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </Card>
      <Card title="Hero">
        <Grid>
          <Label label="Eyebrow">
            <Input value={h.eyebrow} onChange={(e) => up("hero", { eyebrow: e.target.value })} />
          </Label>
          <Label label="Headline — line 1">
            <Input value={h.line1} onChange={(e) => up("hero", { line1: e.target.value })} />
          </Label>
          <Label label="Headline — accent word (italic)">
            <Input value={h.accent} onChange={(e) => up("hero", { accent: e.target.value })} />
          </Label>
          <Label label="Headline — line 3">
            <Input value={h.line2} onChange={(e) => up("hero", { line2: e.target.value })} />
          </Label>
          <Label label="Subtitle" className="sm:col-span-2">
            <Textarea rows={2} value={h.subtitle} onChange={(e) => up("hero", { subtitle: e.target.value })} />
          </Label>
          <Label label="Primary button">
            <Input value={h.primaryCta} onChange={(e) => up("hero", { primaryCta: e.target.value })} />
          </Label>
          <Label label="Primary link">
            <Input value={h.primaryHref} onChange={(e) => up("hero", { primaryHref: e.target.value })} />
          </Label>
          <Label label="Secondary button">
            <Input value={h.secondaryCta} onChange={(e) => up("hero", { secondaryCta: e.target.value })} />
          </Label>
          <Label label="Secondary link">
            <Input value={h.secondaryHref} onChange={(e) => up("hero", { secondaryHref: e.target.value })} />
          </Label>
          <Label label="Hero image (expands on scroll)" className="sm:col-span-2">
            <ImageInput value={h.image} onChange={(v) => up("hero", { image: v })} />
          </Label>
        </Grid>
      </Card>
      <Card title="Studio statement & stats">
        <div className="space-y-4">
          <Grid>
            <Label label="Label">
              <Input value={s.statement.label} onChange={(e) => up("statement", { label: e.target.value })} />
            </Label>
          </Grid>
          <Label label="Statement (words light up on scroll)">
            <Textarea rows={3} value={s.statement.text} onChange={(e) => up("statement", { text: e.target.value })} />
          </Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {s.stats.map((st, i) => (
              <div key={i} className="grid grid-cols-[90px_70px_1fr] gap-2 rounded-2xl bg-[#f5f5f7] p-2">
                <Input type="number" value={st.value} onChange={(e) => up("stats", s.stats.map((x, j) => (j === i ? { ...x, value: +e.target.value } : x)))} className="bg-white" />
                <Input value={st.suffix} onChange={(e) => up("stats", s.stats.map((x, j) => (j === i ? { ...x, suffix: e.target.value } : x)))} className="bg-white" />
                <Input value={st.label} onChange={(e) => up("stats", s.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className="bg-white" />
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card title="Marquee strip">
        <Label label="Words" hint="One per line">
          <Textarea rows={4} value={s.marquee.join("\n")} onChange={(e) => up("marquee", e.target.value.split("\n"))} onBlur={(e) => up("marquee", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))} />
        </Label>
      </Card>
    </>
  );
}

function ContentTab({ s, up }: TabProps) {
  const a = s.about;
  return (
    <>
      <Card title="About page">
        <div className="space-y-4">
          <Label label="Heading">
            <Input value={a.heading} onChange={(e) => up("about", { heading: e.target.value })} />
          </Label>
          <Label label="Story (scroll-lit paragraph)">
            <Textarea rows={5} value={a.body} onChange={(e) => up("about", { body: e.target.value })} />
          </Label>
          <Label label="Image">
            <ImageInput value={a.image} onChange={(v) => up("about", { image: v })} />
          </Label>
          <div className="grid gap-2 md:grid-cols-3">
            {a.values.map((v, i) => (
              <div key={i} className="space-y-2 rounded-2xl bg-[#f5f5f7] p-3">
                <Input value={v.title} onChange={(e) => up("about", { values: a.values.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} className="bg-white" />
                <Textarea rows={3} value={v.text} onChange={(e) => up("about", { values: a.values.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} className="bg-white" />
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card title="Process steps">
        <div className="grid gap-2 md:grid-cols-2">
          {s.process.map((p, i) => (
            <div key={i} className="space-y-2 rounded-2xl bg-[#f5f5f7] p-3">
              <Input value={p.title} onChange={(e) => up("process", s.process.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} className="bg-white" />
              <Textarea rows={2} value={p.text} onChange={(e) => up("process", s.process.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} className="bg-white" />
            </div>
          ))}
        </div>
      </Card>
      <Card title="Call to action">
        <Grid>
          <Label label="Heading">
            <Input value={s.cta.heading} onChange={(e) => up("cta", { heading: e.target.value })} />
          </Label>
          <Label label="Accent word">
            <Input value={s.cta.accent} onChange={(e) => up("cta", { accent: e.target.value })} />
          </Label>
          <Label label="Text" className="sm:col-span-2">
            <Textarea rows={2} value={s.cta.text} onChange={(e) => up("cta", { text: e.target.value })} />
          </Label>
          <Label label="Rotating button text">
            <Input value={s.cta.button} onChange={(e) => up("cta", { button: e.target.value })} />
          </Label>
        </Grid>
      </Card>
    </>
  );
}
