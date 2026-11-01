"use client";

import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Star } from "lucide-react";
import type { Faq, GalleryItem, Package, Post, TeamMember, Testimonial } from "@/lib/types";
import { useSite } from "../SiteProvider";
import { Counter, EASE, EASE_IO, Magnetic, Marquee, Reveal } from "../motion";
import { cn, fmtDate, inr } from "@/lib/utils";

const Star4 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" />
  </svg>
);

/* =====================================================================
   1. CROSSED TAPES — two event-barricade strips crossing in an X
   ===================================================================== */
export function MarqueeStrip() {
  const { settings } = useSite();
  const words = settings.marquee;
  return (
    <section className="relative z-10 -my-4 h-[190px] overflow-hidden md:h-[260px]" aria-label="What we produce">
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[4deg] bg-dark py-3 text-white md:py-4">
        <Marquee speed={46}>
          {words.map((m, i) => (
            <span key={i} className="flex items-center gap-6 pr-6 text-[clamp(1.4rem,3vw,2.4rem)] font-bold uppercase tracking-tight">
              <span className="text-outline [--stroke:white]">{m}</span>
              <Star4 className="h-4 w-4 text-pop" />
            </span>
          ))}
        </Marquee>
      </div>
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 -rotate-[3deg] bg-pop py-4 text-dark shadow-[0_20px_40px_-20px_rgba(0,0,0,0.4)] md:py-5">
        <Marquee speed={34}>
          {words.map((m, i) => (
            <span key={i} className="flex items-center gap-6 pr-6 font-wide text-[clamp(1.6rem,3.6vw,3rem)] font-bold uppercase">
              {m}
              <span className="grid h-[1.1em] w-[1.1em] place-items-center rounded-full bg-dark text-pop">
                <Star4 className="h-1/2 w-1/2" />
              </span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

/* =====================================================================
   2. MANIFESTO — scroll-lit words with photo chips + bento stats
   ===================================================================== */
export function Statement() {
  const { settings } = useSite();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const words = settings.statement.text.split(" ");
  const chips = settings.nav.items.map((n) => n.image).filter(Boolean) as string[];
  const chipAt = new Map<number, string>([
    [Math.floor(words.length * 0.12), chips[1] || settings.hero.image],
    [Math.floor(words.length * 0.42), chips[2] || settings.hero.image],
    [Math.floor(words.length * 0.72), chips[5] || settings.hero.image],
  ]);
  const tones = [
    "bg-pop text-dark md:col-span-3 md:row-span-2",
    "bg-accent text-white md:col-span-3",
    "bg-dark text-white md:col-span-2",
    "bg-white text-ink ring-1 ring-line md:col-span-1",
  ];
  return (
    <section className="container-x py-24 md:py-40">
      <div className="mx-auto max-w-6xl text-center">
        <p className="font-wide text-[11px] uppercase tracking-[0.2em] text-muted">
          {settings.statement.label} · since 2014
        </p>
        <p ref={ref} className="mt-8 flex flex-wrap items-center justify-center text-[clamp(1.8rem,4.4vw,4.2rem)] font-semibold leading-[1.08] tracking-[-0.035em]">
          {words.map((w, i) => (
            <span key={i} className="contents">
              <ScrollWord progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                {w}
              </ScrollWord>
              {chipAt.has(i) && <Chip progress={scrollYProgress} at={i / words.length} src={chipAt.get(i)!} />}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-20 grid grid-cols-2 gap-3 md:mt-28 md:grid-cols-6 md:grid-rows-2 md:gap-4">
        {settings.stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className={cn("group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-[var(--radius)] p-5 transition-transform duration-500 hover:-rotate-1 md:p-7", tones[i % tones.length], i === 0 && "col-span-2 min-h-[240px]")}>
            <span className="text-[13px] font-semibold opacity-70">{s.label}</span>
            <div className={cn("font-wide font-bold leading-none", i === 0 ? "text-[clamp(4rem,9vw,8.5rem)]" : "text-[clamp(2.4rem,4.4vw,4rem)]")}>
              <Counter value={s.value} />
              <span className="text-[0.45em] align-top">{s.suffix}</span>
            </div>
            {i === 0 && <Star4 className="absolute -right-6 -top-6 h-32 w-32 rotate-12 opacity-15 transition-transform duration-1000 group-hover:rotate-90" />}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
function ScrollWord({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="mx-[0.13em]">
      {children}
    </motion.span>
  );
}
function Chip({ progress, at, src }: { progress: MotionValue<number>; at: number; src: string }) {
  const width = useTransform(progress, [at, at + 0.08], ["0em", "1.9em"]);
  return (
    <motion.span style={{ width }} className="mx-[0.13em] inline-block h-[0.82em] overflow-hidden rounded-full align-middle">
      <img src={src.replace("w=800", "w=300")} alt="" className="h-full w-[1.9em] max-w-none object-cover" />
    </motion.span>
  );
}

/* =====================================================================
   3. PROCESS — pinned scrollytelling (desktop) / numbered list (mobile)
   ===================================================================== */
export function Process({ images }: { images?: string[] }) {
  const { settings } = useSite();
  const steps = settings.process;
  const n = steps.length;
  const imgs = images?.length ? images : [settings.about.image, ...settings.nav.items.map((i) => i.image || "")].filter(Boolean);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [i, setI] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setI(Math.min(n - 1, Math.max(0, Math.floor(v * n)))));
  const step = steps[i];

  return (
    <>
      <section ref={ref} className="relative hidden md:block" style={{ height: `${n * 85 + 30}vh` }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="container-x grid grid-cols-12 items-center gap-10">
            <div className="col-span-6">
              <div className="flex items-center gap-3 text-[13px] font-semibold text-muted">
                <span className="rounded-full bg-ink px-3 py-1 text-bg">How we work</span>
                {n} stages · 1 producer · 0 surprises
              </div>
              <div className="mt-8 flex items-start gap-6">
                <div className="relative h-[clamp(7rem,13vw,12rem)] overflow-hidden font-wide text-[clamp(7rem,13vw,12rem)] font-bold leading-none tracking-[-0.06em]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={i} className="block text-accent" initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }} transition={{ duration: 0.7, ease: EASE_IO }}>
                      0{i + 1}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="mt-4 font-wide text-xl font-bold text-muted">/0{n}</span>
              </div>
              <div className="relative mt-6 min-h-[190px]">
                <AnimatePresence mode="wait">
                  <motion.div key={i} initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -16, filter: "blur(8px)" }} transition={{ duration: 0.5, ease: EASE }}>
                    <h3 className="text-[clamp(2.6rem,5vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.045em]">{step.title}</h3>
                    <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{step.text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-8 flex max-w-md gap-2">
                {steps.map((s, k) => (
                  <Seg key={s.title} progress={scrollYProgress} k={k} n={n} label={s.title} active={k === i} />
                ))}
              </div>
            </div>
            <div className="relative col-span-5 col-start-8 aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)+8px)] bg-dark">
              <AnimatePresence initial={false}>
                <motion.img
                  key={i}
                  src={imgs[i % imgs.length]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.25 }}
                  animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                  exit={{ opacity: 0.6 }}
                  transition={{ duration: 1, ease: EASE_IO }}
                />
              </AnimatePresence>
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full bg-white/85 py-2 pl-4 pr-2 text-sm font-semibold backdrop-blur">
                Stage {i + 1} — {step.title}
                <span className="grid h-8 w-8 place-items-center rounded-full bg-pop">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-20 md:hidden">
        <span className="rounded-full bg-ink px-3 py-1 text-[13px] font-semibold text-bg">How we work</span>
        <ol className="mt-8 space-y-3">
          {steps.map((s, k) => (
            <Reveal as="li" key={s.title} delay={k * 0.05} className={cn("rounded-[22px] p-5", k % 2 ? "bg-dark text-white" : "bg-white ring-1 ring-line")}>
              <span className="font-wide text-4xl font-bold text-accent">0{k + 1}</span>
              <h3 className="mt-3 text-3xl font-bold tracking-[-0.04em]">{s.title}</h3>
              <p className={cn("mt-2", k % 2 ? "text-white/65" : "text-muted")}>{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}
function Seg({ progress, k, n, label, active }: { progress: MotionValue<number>; k: number; n: number; label: string; active: boolean }) {
  const w = useTransform(progress, [k / n, (k + 1) / n], ["0%", "100%"]);
  return (
    <div className="flex-1">
      <div className="h-1 overflow-hidden rounded-full bg-ink/10">
        <motion.div style={{ width: w }} className="h-full bg-accent" />
      </div>
      <p className={cn("mt-2 text-[12px] font-semibold transition", active ? "text-ink" : "text-muted")}>{label}</p>
    </div>
  );
}

/* =====================================================================
   4. GALLERY — parallax columns under a blend-mode giant counter
   ===================================================================== */
export function GalleryParallax({ items }: { items: GalleryItem[] }) {
  const { settings } = useSite();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -260]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-60, -560]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const ys = [y1, y2, y3];
  const cols = [0, 1, 2].map((c) => items.filter((_, i) => i % 3 === c));
  const big = settings.stats[0];
  return (
    <section ref={ref} className="relative overflow-clip bg-dark text-white">
      <div className="pointer-events-none sticky top-0 z-20 -mb-[100vh] flex h-screen flex-col items-center justify-center text-center mix-blend-difference">
        <p className="font-wide text-[clamp(4rem,15vw,15rem)] font-bold leading-[0.85] tracking-[-0.06em]">
          {big ? big.value.toLocaleString("en-IN") : "1,200"}
          {big?.suffix}
        </p>
        <p className="condensed mt-2 text-[clamp(2.4rem,7vw,6.5rem)]">moments, made</p>
      </div>
      <div className="container-x grid h-[150vh] grid-cols-2 gap-3 overflow-hidden pt-16 md:h-[190vh] md:grid-cols-3 md:gap-5">
        {cols.map((c, ci) => (
          <motion.div key={ci} style={{ y: ys[ci] }} className={cn("flex flex-col gap-3 md:gap-5", ci === 2 && "hidden md:flex")}>
            {[...c, ...c].map((g, i) => (
              <Link href="/portfolio" key={g.id + i} className="group relative block overflow-hidden rounded-[calc(var(--radius)-6px)]" data-cursor="View">
                <img src={g.image} alt={g.title} loading="lazy" className={cn("w-full object-cover transition duration-1000 group-hover:scale-105", g.shape === "tall" ? "aspect-[3/4]" : g.shape === "wide" ? "aspect-[4/3]" : "aspect-square")} />
              </Link>
            ))}
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center bg-gradient-to-t from-dark via-dark/80 to-transparent pb-14 pt-40">
        <Link href="/portfolio" className="group flex h-14 items-center gap-3 rounded-full bg-pop pl-6 pr-2 font-bold text-dark">
          Open the full portfolio
          <span className="grid h-10 w-10 place-items-center rounded-full bg-dark text-pop transition group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </section>
  );
}

/* =====================================================================
   5. TESTIMONIALS — swipeable card deck on an indigo panel
   ===================================================================== */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [order, setOrder] = useState(items.map((_, i) => i));
  const [hover, setHover] = useState(false);
  const next = () => setOrder((o) => [...o.slice(1), o[0]]);
  const prev = () => setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
  useEffect(() => {
    if (hover || items.length < 2) return;
    const id = setTimeout(next, 6000);
    return () => clearTimeout(id);
  }, [order, hover, items.length]);
  if (!items.length) return null;
  const tilt = [-2, 5, -7];
  return (
    <section className="px-3 py-6 md:px-5 md:py-10">
      <div className="grain relative overflow-hidden rounded-[clamp(28px,4vw,48px)] bg-accent px-5 py-14 text-white md:px-14 md:py-20">
        <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-pop/25 blur-[100px]" />
        <div className="relative grid items-center gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-[13px] font-semibold text-white/70">Kind words from 380+ hosts</p>
            <div className="mt-6 flex items-end gap-4">
              <span className="font-wide text-[clamp(5rem,10vw,9rem)] font-bold leading-[0.8]">4.9</span>
              <div className="pb-2">
                <div className="flex text-pop">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="mt-1 text-sm text-white/70">Google · WedMeGood · Clutch</p>
              </div>
            </div>
            <p className="mt-8 max-w-sm text-lg text-white/80">Drag the card away — every one of these is a real event we lost sleep over (happily).</p>
            <div className="mt-8 flex items-center gap-3">
              <button onClick={prev} className="grid h-12 w-12 place-items-center rounded-full ring-1 ring-white/30 transition hover:bg-white hover:text-accent" aria-label="Previous">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button onClick={next} className="grid h-12 w-12 place-items-center rounded-full bg-pop text-dark transition hover:scale-105" aria-label="Next">
                <ArrowRight className="h-5 w-5" />
              </button>
              <span className="ml-2 font-wide text-sm font-bold tabular-nums">
                {String(order[0] + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
            </div>
          </div>
          <div className="relative h-[440px] md:col-span-6 md:col-start-7 md:h-[470px]" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {order
              .slice(0, 3)
              .map((idx, k) => ({ t: items[idx], k }))
              .reverse()
              .map(({ t, k }) => (
                <motion.article
                  key={t.id}
                  drag={k === 0 ? "x" : false}
                  dragSnapToOrigin
                  dragElastic={0.8}
                  onDragEnd={(_, info) => Math.abs(info.offset.x) > 110 && next()}
                  animate={{ rotate: tilt[k], y: k * 18, scale: 1 - k * 0.05, opacity: 1 - k * 0.15 }}
                  whileDrag={{ scale: 1.03, cursor: "grabbing" }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className={cn("absolute inset-x-0 top-0 mx-auto flex h-[400px] max-w-[460px] flex-col justify-between rounded-[28px] bg-white p-7 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] md:h-[420px] md:p-9", k === 0 && "cursor-grab")}
                  data-cursor={k === 0 ? "Drag" : undefined}
                >
                  <span className="font-wide text-6xl font-bold leading-none text-accent">“</span>
                  <blockquote className="text-[clamp(1.15rem,1.7vw,1.45rem)] font-semibold leading-snug tracking-[-0.02em]">{t.quote}</blockquote>
                  <div className="flex items-center gap-3 border-t border-line pt-5">
                    <img src={t.avatar} alt="" className="h-12 w-12 rounded-full object-cover" draggable={false} />
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-sm text-muted">{t.role}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   6. PACKAGES — Apple-style switcher with an animated price
   ===================================================================== */
export function Packages({ items }: { items: Package[] }) {
  const start = Math.max(0, items.findIndex((p) => p.highlighted));
  const [i, setI] = useState(start);
  const p = items[i];
  const [shown, setShown] = useState(p?.price || 0);
  const last = useRef(p?.price || 0);
  useEffect(() => {
    if (!p) return;
    const c = animate(last.current, p.price, { duration: 0.9, ease: EASE, onUpdate: (v) => setShown(v) });
    last.current = p.price;
    return () => c.stop();
  }, [p]);
  if (!p) return null;
  return (
    <section className="container-x py-24 md:py-36">
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h2 className="text-[clamp(2rem,4vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.035em] md:col-span-7">
          Pricing that reads like a receipt <span className="text-muted">— not a riddle.</span>
        </h2>
        <p className="max-w-sm text-muted md:col-span-4 md:col-start-9">Starting points for our three ways of working. Every quote comes with a live, line-item budget.</p>
      </div>

      <div className="mt-12 overflow-hidden rounded-[calc(var(--radius)+8px)] bg-white ring-1 ring-line md:mt-16">
        <div className="flex justify-center border-b border-line p-3">
          <div className="inline-flex rounded-full bg-bg p-1">
            {items.map((it, k) => (
              <button key={it.id} onClick={() => setI(k)} className="relative rounded-full px-5 py-2.5 text-[15px] font-semibold md:px-8">
                {k === i && <motion.span layoutId="pkg" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className={cn("relative transition", k === i ? "text-bg" : "text-muted")}>{it.name}</span>
                {it.highlighted && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-pop ring-2 ring-white" />}
              </button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-between gap-10 p-7 md:p-12">
            <div>
              {p.highlighted && <span className="rounded-full bg-pop px-3 py-1 text-xs font-bold text-dark">Most loved</span>}
              <div className="mt-6 font-wide text-[clamp(3.6rem,8vw,7rem)] font-bold leading-none tracking-[-0.06em] tabular-nums">{inr(Math.round(shown / 10000) * 10000, true)}</div>
              <p className="mt-3 text-muted">{p.unit} · {p.tagline}</p>
            </div>
            <Link href={`/contact?package=${encodeURIComponent(p.name)}`} className="group flex h-14 w-fit items-center gap-3 rounded-full bg-accent pl-6 pr-2 font-bold text-white">
              Start with {p.name}
              <span className="grid h-10 w-10 place-items-center rounded-full bg-pop text-dark transition group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
          <div className="relative bg-bg p-7 md:p-12">
            <div className="absolute inset-x-0 top-0 h-3 bg-[radial-gradient(circle,white_6px,transparent_6.5px)] bg-[length:18px_18px] bg-[position:0_-9px] md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-3 md:bg-[position:-9px_0]" />
            <div className="flex items-center justify-between text-[13px] font-semibold uppercase tracking-wider text-muted">
              <span>Included</span>
              <span>{p.features.length} items</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.ul key={p.id} className="mt-6 space-y-1" initial="h" animate="s" exit="h" variants={{ s: { transition: { staggerChildren: 0.05 } } }}>
                {p.features.map((f) => (
                  <motion.li key={f} variants={{ h: { opacity: 0, x: 16 }, s: { opacity: 1, x: 0 } }} className="flex items-center justify-between gap-3 border-b border-dashed border-line py-3 text-[15px] font-medium">
                    {f}
                    <Check className="h-4 w-4 shrink-0 text-accent" />
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   7. TEAM — hover-expanding panels
   ===================================================================== */
export function Team({ items }: { items: TeamMember[] }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="container-x py-24 md:py-36">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h2 className="condensed text-[clamp(3.5rem,10vw,9rem)]">The crew</h2>
        <p className="max-w-xs text-muted">48 designers, producers and technicians. These four answer your calls.</p>
      </div>
      <div className="no-scrollbar mt-10 flex gap-2 overflow-x-auto md:h-[64vh] md:overflow-visible">
        {items.map((m, k) => (
          <motion.div
            key={m.id}
            onMouseEnter={() => setOpen(k)}
            onClick={() => setOpen(k)}
            animate={{ flexGrow: open === k ? 4 : 1 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative h-[420px] min-w-[72vw] shrink-0 basis-0 overflow-hidden rounded-[var(--radius)] bg-dark md:h-full md:min-w-0 md:shrink"
          >
            <img src={m.photo} alt={m.name} className={cn("absolute inset-0 h-full w-full object-cover transition duration-700", open === k ? "grayscale-0" : "md:grayscale")} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
            <div className="absolute inset-x-5 bottom-5 text-white">
              <p className={cn("font-bold tracking-tight transition-all duration-500", open === k ? "text-3xl" : "md:text-lg")}>{m.name}</p>
              <AnimatePresence>
                {open === k && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.2 }}>
                    <p className="text-sm font-semibold text-pop">{m.role}</p>
                    <p className="mt-1 max-w-xs text-sm text-white/75">{m.bio}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* =====================================================================
   8. JOURNAL — magazine spread
   ===================================================================== */
export function JournalTeaser({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;
  return (
    <section className="container-x py-24 md:py-36">
      <div className="flex items-end justify-between gap-6 border-b-2 border-ink pb-4">
        <h2 className="condensed text-[clamp(3.5rem,11vw,10rem)]">Journal</h2>
        <div className="pb-2 text-right">
          <p className="font-wide text-sm font-bold">Issue 09</p>
          <p className="text-sm text-muted">{fmtDate(new Date().toISOString(), { month: "long", year: "numeric" })}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-12">
        <Link href={`/journal/${lead.slug}`} className="group md:col-span-7" data-cursor="Read">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
            <img src={lead.cover} alt={lead.title} className="h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
            <span className="absolute left-4 top-4 rounded-full bg-pop px-3 py-1 text-xs font-bold text-dark">Cover story</span>
          </div>
          <h3 className="mt-5 text-[clamp(1.8rem,3vw,2.8rem)] font-bold leading-[1.02] tracking-[-0.04em] transition group-hover:text-accent">{lead.title}</h3>
          <p className="mt-3 max-w-xl text-muted">{lead.excerpt}</p>
        </Link>
        <ol className="md:col-span-5">
          {rest.map((p, k) => (
            <li key={p.id}>
              <Link href={`/journal/${p.slug}`} className="group grid grid-cols-[auto_1fr_auto] items-start gap-4 border-b border-line py-6 first:pt-0">
                <span className="font-wide text-2xl font-bold text-accent">{String(k + 2).padStart(2, "0")}</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {p.tags[0]} · {fmtDate(p.date)}
                  </p>
                  <h3 className="mt-2 text-xl font-bold leading-tight tracking-[-0.025em] transition group-hover:text-accent">{p.title}</h3>
                </div>
                <img src={p.cover.replace("w=1600", "w=300")} alt="" className="h-20 w-20 rounded-2xl object-cover transition duration-500 group-hover:rotate-3 group-hover:scale-105" />
              </Link>
            </li>
          ))}
          <li className="pt-6">
            <Link href="/journal" className="inline-flex items-center gap-2 font-semibold">
              <span className="link-underline">Read every story</span> <ArrowUpRight className="h-4 w-4" />
            </Link>
          </li>
        </ol>
      </div>
    </section>
  );
}

export function PostCard({ p }: { p: Post }) {
  return (
    <Link href={`/journal/${p.slug}`} className="group block" data-cursor="Read">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(var(--radius)-6px)]">
        <img src={p.cover} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-pop px-3 py-1 text-xs font-bold text-dark">{p.tags[0]}</span>
      </div>
      <p className="mt-4 text-sm text-muted">
        {fmtDate(p.date)} · {p.author}
      </p>
      <h3 className="mt-2 text-[22px] font-bold leading-tight tracking-[-0.03em] transition group-hover:text-accent">{p.title}</h3>
      <p className="mt-2 line-clamp-2 text-muted">{p.excerpt}</p>
    </Link>
  );
}

/* =====================================================================
   9. FAQ — a chat with the studio
   ===================================================================== */
export function FaqList({ items }: { items: Faq[]; label?: boolean }) {
  const { settings } = useSite();
  const [asked, setAsked] = useState<string[]>(items[0] ? [items[0].id] : []);
  const [typing, setTyping] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const inView = useInView(end, { margin: "200px" });
  const ask = (id: string) => {
    setAsked((a) => [...a, id]);
    setTyping(id);
    setTimeout(() => setTyping(null), 900);
  };
  useEffect(() => {
    if (inView) end.current?.parentElement?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [asked, typing, inView]);
  const remaining = items.filter((f) => !asked.includes(f.id));
  return (
    <section className="container-x py-24 md:py-36">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex -space-x-3">
            {["N", "K", "M"].map((c, k) => (
              <span key={c} className={cn("grid h-12 w-12 place-items-center rounded-full font-bold ring-4 ring-bg", ["bg-accent text-white", "bg-pop text-dark", "bg-dark text-white"][k])}>
                {c}
              </span>
            ))}
          </div>
          <h2 className="mt-6 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em]">Ask us anything.</h2>
          <p className="mt-3 flex items-center gap-2 text-muted">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Producers online · replies in ~2 min
          </p>
          <a href={`https://wa.me/${settings.brand.whatsapp}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 font-semibold text-bg transition hover:bg-accent">
            Continue on WhatsApp <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <div className="md:col-span-8">
          <div className="overflow-hidden rounded-[calc(var(--radius)+4px)] bg-white ring-1 ring-line">
            <div className="flex items-center gap-3 border-b border-line px-5 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-bold text-white">{settings.brand.name[0]}</span>
              <div className="leading-tight">
                <p className="text-sm font-bold">{settings.brand.name} Studio</p>
                <p className="text-xs text-muted">typically replies instantly</p>
              </div>
            </div>
            <div className="no-scrollbar max-h-[460px] space-y-3 overflow-y-auto p-5" data-lenis-prevent>
              {asked.map((id) => {
                const f = items.find((x) => x.id === id)!;
                return (
                  <div key={id} className="space-y-3">
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="ml-auto w-fit max-w-[80%] rounded-[20px] rounded-br-md bg-ink px-4 py-3 font-medium text-bg">
                      {f.q}
                    </motion.div>
                    {typing === id ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-fit gap-1 rounded-[20px] rounded-bl-md bg-bg px-4 py-4">
                        {[0, 1, 2].map((d) => (
                          <motion.span key={d} className="h-2 w-2 rounded-full bg-muted" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }} />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: EASE }} className="w-fit max-w-[85%] rounded-[20px] rounded-bl-md bg-bg px-4 py-3 leading-relaxed">
                        {f.a}
                      </motion.div>
                    )}
                  </div>
                );
              })}
              <div ref={end} />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-line p-4">
              {remaining.length ? (
                remaining.map((f) => (
                  <button key={f.id} onClick={() => ask(f.id)} disabled={!!typing} className="rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-50">
                    {f.q}
                  </button>
                ))
              ) : (
                <Link href="/contact" className="rounded-full bg-pop px-4 py-2 text-sm font-bold text-dark">
                  Something else? Plan your event →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   10. CTA — lime panel with giant counter-scrolling type
   ===================================================================== */
export function Cta() {
  const { settings } = useSite();
  const c = settings.cta;
  const b = settings.brand;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [90, 36]);
  return (
    <section ref={ref} className="px-3 pb-6 md:px-5">
      <motion.div style={{ scale, borderRadius: radius }} className="grain relative overflow-hidden bg-pop py-16 text-dark md:py-24">
        <div className="space-y-2 md:space-y-4">
          <Marquee speed={30}>
            <span className="flex items-center gap-8 pr-8 font-wide text-[clamp(3rem,9vw,8.5rem)] font-bold leading-none tracking-[-0.06em]">
              {c.heading} <Star4 className="h-[0.5em] w-[0.5em] text-accent" />
            </span>
          </Marquee>
          <div>
            <Marquee speed={30} reverse>
              <span className="flex items-center gap-8 pr-8 font-wide text-[clamp(3rem,9vw,8.5rem)] font-bold leading-none tracking-[-0.06em]">
                <span className="text-outline [--stroke:var(--dark)]">{c.accent}</span> <Star4 className="h-[0.5em] w-[0.5em] text-accent" />
              </span>
            </Marquee>
          </div>
        </div>
        <div className="container-x relative mt-12 grid items-center gap-10 md:mt-16 md:grid-cols-3">
          <p className="max-w-sm text-lg font-medium">{c.text}</p>
          <div className="flex justify-center">
            <Magnetic strength={0.4}>
              <Link href="/contact" className="group relative grid h-44 w-44 place-items-center rounded-full bg-dark text-white md:h-52 md:w-52" data-cursor="Let's go">
                <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow">
                  <defs>
                    <path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                  </defs>
                  <text className="fill-white/70 text-[13px] font-bold uppercase tracking-[0.3em]">
                    <textPath href="#circ">{c.button} · {c.button} · {c.button} · </textPath>
                  </text>
                </svg>
                <span className="grid h-16 w-16 place-items-center rounded-full bg-pop text-dark transition duration-500 group-hover:scale-110 group-hover:rotate-45">
                  <ArrowUpRight className="h-7 w-7" />
                </span>
              </Link>
            </Magnetic>
          </div>
          <div className="space-y-1 md:text-right">
            <a href={`mailto:${b.email}`} className="block text-2xl font-bold tracking-tight underline decoration-2 underline-offset-4 hover:text-accent">
              {b.email}
            </a>
            <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="block font-semibold opacity-70 hover:opacity-100">
              {b.phone}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
