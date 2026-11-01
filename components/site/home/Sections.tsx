"use client";

import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Plus, Quote, Star } from "lucide-react";
import type { Faq, GalleryItem, Package, Post, TeamMember, Testimonial } from "@/lib/types";
import { useSite } from "../SiteProvider";
import { ClipImage, Counter, EASE, Magnetic, Marquee, Reveal, ScrollWords, SectionLabel, SplitLines } from "../motion";
import { cn, fmtDate, inr } from "@/lib/utils";

/* ---------------- Marquee ---------------- */
export function MarqueeStrip() {
  const { settings } = useSite();
  return (
    <section className="relative z-10 -mt-[1px] overflow-hidden py-6 md:py-10">
      <div className="-rotate-2 bg-pop py-4 text-dark md:py-6">
        <Marquee speed={38}>
          {settings.marquee.map((m, i) => (
            <span key={i} className="flex items-center gap-8 pr-8 text-[clamp(2rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.04em]">
              <span className={i % 2 ? "accent-word" : ""}>{m}</span>
              <svg viewBox="0 0 24 24" className="h-[0.55em] w-[0.55em] animate-spin-slow" fill="currentColor">
                <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" />
              </svg>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

/* ---------------- Statement + stats ---------------- */
export function Statement() {
  const { settings } = useSite();
  return (
    <section className="container-x py-24 md:py-40">
      <SectionLabel index="01">{settings.statement.label}</SectionLabel>
      <ScrollWords
        text={settings.statement.text}
        className="mt-8 max-w-[22ch] text-[clamp(1.85rem,4.6vw,4.4rem)] font-medium leading-[1.06] tracking-[-0.04em] md:max-w-[26ch]"
      />
      <div className="mt-16 grid grid-cols-2 border-t border-line md:mt-28 md:grid-cols-4">
        {settings.stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className={cn("py-8 md:py-10 md:pr-8", i % 2 === 1 && "border-l border-line pl-5 md:pl-8", i >= 2 && "border-t border-line md:border-t-0", i === 2 && "md:border-l md:pl-8")}>
            <div className="text-[clamp(3rem,6.5vw,6rem)] font-medium leading-none tracking-[-0.05em]">
              <Counter value={s.value} />
              <span className="accent-word text-accent">{s.suffix}</span>
            </div>
            <p className="mt-3 text-sm text-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Process ---------------- */
export function Process() {
  const { settings } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const h = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <section className="container-x py-24 md:py-40">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <SectionLabel index="04">How we work</SectionLabel>
            <h2 className="mt-5 text-[clamp(2.5rem,6vw,5.5rem)]">
              <SplitLines lineClassName="display" lines={["Calm is", <span key="d" className="accent-word text-accent">designed.</span>]} />
            </h2>
            <p className="mt-6 max-w-sm text-muted">Four clear stages, one dedicated producer, and a live dashboard where you can see every decision, vendor and rupee.</p>
            <ClipImage src={settings.about.image} alt="Our team at work" className="mt-10 hidden aspect-[4/3] w-full max-w-sm rounded-[var(--radius)] md:block" />
          </div>
        </div>
        <div ref={ref} className="relative md:col-span-6 md:col-start-7">
          <div className="absolute bottom-6 left-[23px] top-6 w-px bg-line md:left-[27px]">
            <motion.div style={{ height: h }} className="w-px bg-accent" />
          </div>
          {settings.process.map((p, i) => (
            <Step key={p.title} i={i} title={p.title} text={p.text} />
          ))}
        </div>
      </div>
    </section>
  );
}
function Step({ i, title, text }: { i: number; title: string; text: string }) {
  return (
    <motion.div className="relative flex gap-6 pb-14 last:pb-0 md:gap-8 md:pb-24" initial="off" whileInView="on" viewport={{ margin: "-45% 0px -45% 0px" }}>
      <motion.span
        variants={{ off: { backgroundColor: "var(--bg)", color: "var(--ink)", scale: 1 }, on: { backgroundColor: "var(--accent)", color: "#fff", scale: 1.08 } }}
        transition={{ duration: 0.5 }}
        className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-medium ring-1 ring-line md:h-14 md:w-14"
      >
        0{i + 1}
      </motion.span>
      <motion.div variants={{ off: { opacity: 0.35 }, on: { opacity: 1 } }} transition={{ duration: 0.5 }} className="pt-1">
        <h3 className="text-[clamp(1.75rem,3.4vw,3rem)] font-medium leading-none tracking-[-0.04em]">{title}</h3>
        <p className="mt-4 max-w-md text-[17px] leading-relaxed text-muted">{text}</p>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Parallax gallery ---------------- */
export function GalleryParallax({ items }: { items: GalleryItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -260]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-60, -520]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const cols = [items.filter((_, i) => i % 3 === 0), items.filter((_, i) => i % 3 === 1), items.filter((_, i) => i % 3 === 2)];
  const ys = [y1, y2, y3];
  return (
    <section ref={ref} className="relative overflow-hidden bg-dark pt-24 text-white md:pt-36">
      <div className="container-x relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel index="05" className="text-white/50">
            Portfolio
          </SectionLabel>
          <h2 className="mt-5 text-[clamp(2.75rem,7vw,6.5rem)]">
            <SplitLines lineClassName="display" lines={["Moments", <span key="m">we <span className="accent-word text-pop">made.</span></span>]} />
          </h2>
        </div>
        <Link href="/portfolio" className="group flex w-fit items-center gap-3">
          <span className="link-underline">See the full portfolio</span>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-dark transition group-hover:rotate-45 group-hover:bg-accent group-hover:text-white">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </Link>
      </div>
      <div className="container-x mt-14 grid h-[120vh] grid-cols-2 gap-3 overflow-hidden md:mt-20 md:h-[150vh] md:grid-cols-3 md:gap-5">
        {cols.map((c, ci) => (
          <motion.div key={ci} style={{ y: ys[ci] }} className={cn("flex flex-col gap-3 md:gap-5", ci === 2 && "hidden md:flex")}>
            {[...c, ...c].map((g, i) => (
              <Link href="/portfolio" key={g.id + i} className="group relative block overflow-hidden rounded-[calc(var(--radius)-6px)]" data-cursor="View">
                <img
                  src={g.image}
                  alt={g.title}
                  loading="lazy"
                  className={cn("w-full object-cover transition duration-1000 group-hover:scale-105", g.shape === "tall" ? "aspect-[3/4]" : g.shape === "wide" ? "aspect-[4/3]" : "aspect-square")}
                />
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-full bg-black/40 px-4 py-2 text-xs opacity-0 backdrop-blur-md transition duration-500 group-hover:opacity-100">
                  <span>{g.title}</span>
                  <span className="text-white/60">{g.category}</span>
                </div>
              </Link>
            ))}
          </motion.div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-dark to-transparent" />
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const DURATION = 7000;
  useEffect(() => {
    const id = setTimeout(() => setI((v) => (v + 1) % items.length), DURATION);
    return () => clearTimeout(id);
  }, [i, items.length]);
  if (!items.length) return null;
  const t = items[i];
  return (
    <section className="container-x py-24 md:py-40">
      <div className="flex items-center justify-between">
        <SectionLabel index="06">Kind words</SectionLabel>
        <div className="flex items-center gap-1 text-accent">
          {Array.from({ length: 5 }).map((_, k) => (
            <Star key={k} className="h-4 w-4 fill-current" />
          ))}
          <span className="ml-2 text-sm text-muted">4.9 · 380+ reviews</span>
        </div>
      </div>
      <div className="relative mt-10 min-h-[340px] md:mt-16 md:min-h-[300px]">
        <Quote className="absolute -left-1 -top-4 h-14 w-14 text-accent/20 md:-left-4 md:h-24 md:w-24" />
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={t.id}
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative max-w-5xl text-[clamp(1.6rem,3.6vw,3.25rem)] font-medium leading-[1.12] tracking-[-0.035em]"
          >
            “{t.quote}”
          </motion.blockquote>
        </AnimatePresence>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        {items.map((it, k) => (
          <button
            key={it.id}
            onClick={() => setI(k)}
            className={cn("relative flex items-center gap-3 overflow-hidden rounded-full p-1.5 pr-5 text-left ring-1 transition", k === i ? "bg-white ring-transparent shadow-sm" : "ring-line hover:bg-white/60")}
          >
            <img src={it.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            <span>
              <span className="block text-sm font-medium leading-tight">{it.name}</span>
              <span className="block text-xs text-muted">{it.role}</span>
            </span>
            {k === i && (
              <motion.span
                key={`bar-${i}`}
                className="absolute bottom-0 left-0 h-[2px] bg-accent"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: DURATION / 1000, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Packages ---------------- */
export function Packages({ items }: { items: Package[] }) {
  return (
    <section className="container-x py-24 md:py-36">
      <div className="text-center">
        <SectionLabel index="07" className="justify-center">
          Packages
        </SectionLabel>
        <h2 className="mx-auto mt-5 max-w-4xl text-[clamp(2.5rem,6vw,5.5rem)]">
          <SplitLines lineClassName="display" lines={[<span key="p">Clear pricing.</span>, <span key="q" className="accent-word text-accent">No surprises.</span>]} />
        </h2>
      </div>
      <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3 md:gap-5">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.1}>
            <SpotlightCard dark={p.highlighted}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-medium tracking-tight">{p.name}</h3>
                {p.highlighted && <span className="rounded-full bg-pop px-3 py-1 text-xs font-bold text-dark">Most loved</span>}
              </div>
              <p className={cn("mt-2 text-sm", p.highlighted ? "text-white/60" : "text-muted")}>{p.tagline}</p>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-[clamp(2.5rem,4vw,3.5rem)] font-medium tracking-[-0.05em]">{inr(p.price, true)}</span>
                <span className={cn("text-sm", p.highlighted ? "text-white/50" : "text-muted")}>{p.unit}</span>
              </div>
              <ul className={cn("mt-8 space-y-3 border-t pt-8 text-[15px]", p.highlighted ? "border-white/10" : "border-line")}>
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full", p.highlighted ? "bg-accent text-white" : "bg-accent-soft text-accent")}>
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/contact?package=${encodeURIComponent(p.name)}`}
                className={cn("mt-10 flex h-13 items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-medium transition", p.highlighted ? "bg-accent text-white hover:brightness-110" : "bg-ink text-bg hover:bg-accent")}
              >
                Choose {p.name} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SpotlightCard({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--x", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={cn(
        "group relative h-full overflow-hidden rounded-[var(--radius)] p-7 transition duration-500 hover:-translate-y-1 md:p-9",
        dark ? "bg-dark text-white" : "bg-white text-ink ring-1 ring-line"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(420px circle at var(--x) var(--y), color-mix(in oklab, var(--accent) ${dark ? 28 : 14}%, transparent), transparent 60%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ---------------- Team ---------------- */
export function Team({ items }: { items: TeamMember[] }) {
  return (
    <section className="container-x py-24 md:py-36">
      <SectionLabel index="08">The people</SectionLabel>
      <h2 className="mt-5 text-[clamp(2.5rem,6vw,5.5rem)]">
        <SplitLines lineClassName="display" lines={["Small team.", <span key="b" className="accent-word text-accent">Big rooms.</span>]} />
      </h2>
      <div className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:grid-cols-4 md:gap-5">
        {items.map((m, i) => (
          <Reveal key={m.id} delay={i * 0.08} className="group">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[calc(var(--radius)-6px)] bg-dark">
              <img src={m.photo} alt={m.name} loading="lazy" className="h-full w-full object-cover grayscale transition duration-1000 group-hover:scale-105 group-hover:grayscale-0" />
              <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 text-sm text-white transition duration-500 group-hover:translate-y-0">{m.bio}</div>
            </div>
            <p className="mt-3 font-medium tracking-tight">{m.name}</p>
            <p className="text-sm text-muted">{m.role}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Journal teaser ---------------- */
export function JournalTeaser({ posts }: { posts: Post[] }) {
  return (
    <section className="container-x py-24 md:py-36">
      <div className="flex items-end justify-between gap-6">
        <div>
          <SectionLabel index="09">Journal</SectionLabel>
          <h2 className="mt-5 text-[clamp(2.5rem,6vw,5.5rem)]">
            <SplitLines lineClassName="display" lines={[<span key="n">Notes from</span>, <span key="o" className="accent-word text-accent">backstage.</span>]} />
          </h2>
        </div>
        <Link href="/journal" className="hidden items-center gap-2 md:flex">
          <span className="link-underline">All stories</span> <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-3 md:gap-5">
        {posts.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.1}>
            <PostCard p={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function PostCard({ p }: { p: Post }) {
  return (
    <Link href={`/journal/${p.slug}`} className="group block" data-cursor="Read">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(var(--radius)-6px)]">
        <img src={p.cover} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
        <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs">{p.tags[0]}</span>
      </div>
      <p className="mt-4 text-sm text-muted">
        {fmtDate(p.date)} · {p.author}
      </p>
      <h3 className="mt-2 text-[22px] font-medium leading-tight tracking-[-0.03em] transition group-hover:text-accent">{p.title}</h3>
      <p className="mt-2 line-clamp-2 text-muted">{p.excerpt}</p>
    </Link>
  );
}

/* ---------------- FAQ ---------------- */
export function FaqList({ items, label = true }: { items: Faq[]; label?: boolean }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <section className="container-x py-24 md:py-36">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          {label && <SectionLabel index="10">FAQ</SectionLabel>}
          <h2 className="mt-5 text-[clamp(2.25rem,4.6vw,4rem)]">
            <SplitLines lineClassName="display" lines={["Questions,", <span key="a" className="accent-word text-accent">answered.</span>]} />
          </h2>
        </div>
        <div className="md:col-span-8">
          {items.map((f) => {
            const isOpen = open === f.id;
            return (
              <div key={f.id} className="border-b border-line">
                <button onClick={() => setOpen(isOpen ? null : f.id)} className="flex w-full items-center justify-between gap-6 py-6 text-left md:py-7" aria-expanded={isOpen}>
                  <span className="text-[clamp(1.15rem,1.8vw,1.5rem)] font-medium tracking-[-0.02em]">{f.q}</span>
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full transition duration-500", isOpen ? "rotate-45 bg-accent text-white" : "ring-1 ring-line")}>
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
                      <p className="max-w-2xl pb-7 text-[17px] leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
export function Cta() {
  const { settings } = useSite();
  const c = settings.cta;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [80, 36]);
  return (
    <section ref={ref} className="px-3 pb-6 md:px-5">
      <motion.div style={{ scale, borderRadius: radius }} className="grain relative overflow-hidden bg-accent px-6 py-20 text-white md:px-16 md:py-32">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-white/20 blur-[100px]" />
        <div className="relative grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <h2 className="text-[clamp(2.9rem,8.5vw,8.5rem)]">
              <SplitLines lineClassName="display" lines={[c.heading, <span key="u" className="accent-word text-pop">{c.accent}.</span>]} />
            </h2>
            <p className="mt-8 max-w-md text-lg text-white/80">{c.text}</p>
          </div>
          <div className="flex md:col-span-4 md:justify-end">
            <Magnetic strength={0.4}>
              <Link href="/contact" className="group relative grid h-44 w-44 place-items-center rounded-full bg-dark text-white md:h-52 md:w-52" data-cursor="Let's go">
                <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow">
                  <defs>
                    <path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                  </defs>
                  <text className="fill-white/60 text-[13px] uppercase tracking-[0.3em]" style={{ fontFamily: "var(--font-mono)" }}>
                    <textPath href="#circ">{c.button} · {c.button} · {c.button} · </textPath>
                  </text>
                </svg>
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-dark transition duration-500 group-hover:scale-110 group-hover:rotate-45">
                  <ArrowUpRight className="h-7 w-7" />
                </span>
              </Link>
            </Magnetic>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
