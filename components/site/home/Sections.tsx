"use client";

import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Faq, GalleryItem, Package, Post, TeamMember, Testimonial } from "@/lib/types";
import { useSite } from "../SiteProvider";
import { Counter, EASE } from "../motion";
import { CursorPreview, SectionHead, Words } from "../Editorial";
import { cn, fmtDate, inr } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Ticker — one quiet line of disciplines
   ───────────────────────────────────────────── */
export function MarqueeStrip() {
  const { settings } = useSite();
  const list = [...settings.marquee, ...settings.marquee];
  return (
    <section className="mt-24 overflow-hidden border-y hairline py-5 md:mt-32" aria-label="Disciplines">
      <div className="flex w-max whitespace-nowrap" style={{ animation: "marquee 60s linear infinite" }}>
        {[0, 1].map((r) => (
          <div key={r} className="flex shrink-0" aria-hidden={r === 1}>
            {list.map((m, i) => (
              <span key={i} className="px-6 text-[clamp(1.5rem,3vw,2.5rem)] font-light tracking-[-0.04em] text-muted">
                {m} <span className="pl-6 text-ink">/</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   (01) Studio — statement + figures
   ───────────────────────────────────────────── */
export function Statement() {
  const { settings } = useSite();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = settings.statement.text.split(" ");
  return (
    <section className="container-x py-24 md:py-36">
      <SectionHead index="01" title={settings.statement.label} note="Est. 2014" />
      <div className="grid-12 mt-10 md:mt-16">
        <p ref={ref} className="col-span-12 text-[clamp(1.6rem,3.3vw,3rem)] leading-[1.12] tracking-[-0.035em] md:col-span-10 md:col-start-2">
          {words.map((w, i) => (
            <Lit key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
              {w}
            </Lit>
          ))}
        </p>
      </div>
      <dl className="mt-20 grid grid-cols-2 border-t hairline md:mt-28 md:grid-cols-4">
        {settings.stats.map((s, i) => (
          <div key={s.label} className={cn("border-b hairline py-6 pr-4 md:border-b-0 md:py-8", i % 2 === 1 && "border-l pl-4", i > 0 && "md:border-l md:pl-5")}>
            <dt className="meta text-muted">{s.label}</dt>
            <dd className="mt-6 text-[clamp(2.75rem,5.5vw,5rem)] font-light leading-none tracking-[-0.06em] tabular-nums">
              <Counter value={s.value} />
              <span className="text-muted">{s.suffix}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
function Lit({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

/* ─────────────────────────────────────────────
   (05) Process — four columns on a rule
   ───────────────────────────────────────────── */
export function Process({}: { images?: string[] }) {
  const { settings } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.3"] });
  const w = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <section className="container-x py-24 md:py-36">
      <SectionHead index="05" title="Process" note={`${settings.process.length} stages, one producer`} />
      <h2 className="mt-10 max-w-[18ch] text-[clamp(2rem,4.4vw,4rem)] leading-[1] tracking-[-0.045em] md:mt-16">
        <Words text="Calm on the day is something you design months before it." />
      </h2>
      <div ref={ref} className="relative mt-16 md:mt-24">
        <div className="absolute inset-x-0 top-0 h-px bg-line">
          <motion.div style={{ width: w }} className="h-px bg-ink" />
        </div>
        <ol className="grid gap-10 pt-6 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
          {settings.process.map((p, i) => (
            <motion.li
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
            >
              <span className="meta text-muted">Stage {String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-8 text-[clamp(1.6rem,2.4vw,2.2rem)] tracking-[-0.04em]">{p.title}</h3>
              <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted">{p.text}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   (04) Selected work — asymmetric editorial grid
   ───────────────────────────────────────────── */
const LAYOUT = [
  "md:col-span-7 aspect-[4/5]",
  "md:col-span-4 md:col-start-9 md:mt-48 aspect-[3/4]",
  "md:col-span-4 md:col-start-2 md:mt-28 aspect-square",
  "md:col-span-6 md:col-start-7 md:mt-56 aspect-[4/3]",
  "md:col-span-5 md:col-start-1 md:mt-28 aspect-[3/4]",
  "md:col-span-4 md:col-start-8 md:mt-56 aspect-[4/5]",
];
export function GalleryParallax({ items }: { items: GalleryItem[] }) {
  const pick = items.slice(0, LAYOUT.length);
  return (
    <section className="container-x py-24 md:py-36">
      <SectionHead index="04" title="Selected work" note={<Link href="/portfolio" className="link-underline text-ink">Full portfolio →</Link>} />
      <div className="grid-12 mt-10 gap-y-12 md:mt-16 md:gap-y-0">
        {pick.map((g, i) => (
          <Work key={g.id} g={g} i={i} className={cn("col-span-12", LAYOUT[i])} />
        ))}
      </div>
    </section>
  );
}
function Work({ g, i, className }: { g: GalleryItem; i: number; className: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [i % 2 ? 60 : 20, i % 2 ? -60 : -20]);
  const ar = className.match(/aspect-\[[^\]]+\]|aspect-square/)?.[0] || "";
  return (
    <motion.div style={{ y }} className={className.replace(ar, "")}>
      <Link ref={ref} href="/portfolio" className="group block" data-cursor="View">
        <motion.div className={cn("relative overflow-hidden bg-ink", ar)} initial="h" whileInView="s" viewport={{ once: true, amount: 0.1 }}>
          <motion.img
            src={g.image}
            alt={g.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
            variants={{ h: { clipPath: "inset(100% 0 0 0)" }, s: { clipPath: "inset(0% 0 0 0)" } }}
            transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
          />
        </motion.div>
        <div className="meta mt-3 flex justify-between text-muted">
          <span className="text-ink">{g.title}</span>
          <span>{g.category}</span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   (06) Clients — one quote at a time
   ───────────────────────────────────────────── */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const id = setTimeout(() => setI((v) => (v + 1) % items.length), 8000);
    return () => clearTimeout(id);
  }, [i, items.length]);
  if (!items.length) return null;
  const t = items[i];
  return (
    <section className="bg-ink py-24 text-bg md:py-36">
      <div className="container-x">
        <SectionHead dark index="06" title="Clients" note="4.9 average · 380+ reviews" />
        <div className="grid-12 mt-12 md:mt-20">
          <div className="col-span-12 min-h-[340px] md:col-span-9 md:col-start-2 md:min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.figure key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                <blockquote className="text-[clamp(1.6rem,3.2vw,2.9rem)] font-light leading-[1.15] tracking-[-0.035em]">
                  <Words text={`“${t.quote}”`} play />
                </blockquote>
                <figcaption className="meta mt-10 flex items-center gap-3 text-white/60">
                  <img src={t.avatar} alt="" className="h-9 w-9 rounded-full object-cover grayscale" />
                  <span>
                    <span className="text-white">{t.name}</span> — {t.role}
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </div>
        <div className="grid-12 meta mt-12 border-t border-white/15 pt-4 text-white/60">
          <span className="col-span-4 tabular-nums md:col-span-1">
            {String(i + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
          </span>
          <div className="col-span-8 flex justify-end gap-6 md:col-span-11">
            <button onClick={() => setI((i - 1 + items.length) % items.length)} className="hover:text-white">
              ← Previous
            </button>
            <button onClick={() => setI((i + 1) % items.length)} className="text-white">
              Next →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   (07) Engagements — comparison table
   ───────────────────────────────────────────── */
export function Packages({ items }: { items: Package[] }) {
  return (
    <section className="container-x py-24 md:py-36">
      <SectionHead index="07" title="Engagements" note="Starting points · every quote is line-item" />
      <div className="mt-10 grid border-t hairline md:mt-16 md:grid-cols-3">
        {items.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: i * 0.12 }}
            className={cn("flex flex-col border-b hairline py-8 md:border-b-0 md:px-6 md:py-10", i > 0 && "md:border-l", i === 0 && "md:pl-0", p.highlighted && "md:bg-white/50")}
          >
            <div className="meta flex justify-between text-muted">
              <span className="text-ink">{p.name}</span>
              {p.highlighted && <span className="text-accent">Most chosen</span>}
            </div>
            <p className="mt-10 text-[clamp(2.75rem,4.5vw,4.25rem)] font-light leading-none tracking-[-0.06em]">{inr(p.price, true)}</p>
            <p className="meta mt-2 text-muted">{p.unit}</p>
            <p className="mt-6 max-w-xs text-[15px] text-muted">{p.tagline}</p>
            <ul className="mt-8 flex-1 border-t hairline">
              {p.features.map((f) => (
                <li key={f} className="border-b hairline py-2.5 text-[15px]">
                  {f}
                </li>
              ))}
            </ul>
            <Link href={`/contact?package=${encodeURIComponent(p.name)}`} className="group mt-8 inline-flex items-baseline gap-2 text-[15px]">
              <span className="link-underline">Enquire about {p.name}</span>
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Team — portraits with captions
   ───────────────────────────────────────────── */
export function Team({ items }: { items: TeamMember[] }) {
  return (
    <section className="container-x py-24 md:py-36">
      <SectionHead index="—" title="People" note={`${items.length} of 48`} />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-16 md:grid-cols-4 md:gap-x-5">
        {items.map((m, i) => (
          <motion.figure key={m.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }} className="group">
            <div className="aspect-[3/4] overflow-hidden bg-ink">
              <img src={m.photo} alt={m.name} loading="lazy" className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0" />
            </div>
            <figcaption className="meta mt-3">
              <span className="block text-ink">{m.name}</span>
              <span className="text-muted">{m.role}</span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   (08) Journal — index rows with cursor preview
   ───────────────────────────────────────────── */
export function JournalTeaser({ posts }: { posts: Post[] }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <section className="container-x py-24 md:py-36">
      <CursorPreview src={hover} w={320} h={220} />
      <SectionHead index="08" title="Journal" note={<Link href="/journal" className="link-underline text-ink">All entries →</Link>} />
      <ul className="mt-10 md:mt-16" onMouseLeave={() => setHover(null)}>
        {posts.map((p) => (
          <li key={p.id} onMouseEnter={() => setHover(p.cover)}>
            <Link href={`/journal/${p.slug}`} className="group grid-12 items-baseline gap-y-2 border-b hairline py-6 md:py-8">
              <span className="meta col-span-6 text-muted md:col-span-2">{fmtDate(p.date)}</span>
              <span className="meta col-span-6 text-right text-muted md:order-last md:col-span-2">{p.tags[0]}</span>
              <h3 className="col-span-12 text-[clamp(1.5rem,2.8vw,2.6rem)] leading-[1.05] tracking-[-0.04em] transition-transform duration-500 group-hover:translate-x-3 md:col-span-8">{p.title}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PostCard({ p }: { p: Post }) {
  return (
    <Link href={`/journal/${p.slug}`} className="group block" data-cursor="Read">
      <div className="aspect-[4/3] overflow-hidden bg-ink">
        <img src={p.cover} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-1000 group-hover:scale-[1.03]" />
      </div>
      <p className="meta mt-3 flex justify-between text-muted">
        <span>{fmtDate(p.date)}</span>
        <span>{p.tags[0]}</span>
      </p>
      <h3 className="mt-2 text-[22px] leading-tight tracking-[-0.03em]">{p.title}</h3>
      <p className="mt-2 line-clamp-2 text-[15px] text-muted">{p.excerpt}</p>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   (09) Questions
   ───────────────────────────────────────────── */
export function FaqList({ items }: { items: Faq[]; label?: boolean }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <section className="container-x py-24 md:py-36">
      <SectionHead index="09" title="Questions" note={`${items.length} answered`} />
      <div className="grid-12 mt-10 md:mt-16">
        <div className="col-span-12 md:col-span-9 md:col-start-4">
          {items.map((f, i) => {
            const isOpen = open === f.id;
            return (
              <div key={f.id} className="border-b hairline">
                <button onClick={() => setOpen(isOpen ? null : f.id)} className="grid w-full grid-cols-[2.5rem_1fr_1.5rem] items-baseline py-5 text-left md:py-6" aria-expanded={isOpen}>
                  <span className="meta text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[clamp(1.15rem,1.8vw,1.5rem)] tracking-[-0.025em]">{f.q}</span>
                  <span className="relative h-3 w-3 justify-self-end">
                    <span className="absolute left-0 top-1/2 h-px w-3 bg-ink" />
                    <span className={cn("absolute left-1/2 top-0 h-3 w-px bg-ink transition-transform duration-500", isOpen && "scale-y-0")} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
                      <p className="max-w-2xl pb-7 pl-10 text-[15px] leading-relaxed text-muted">{f.a}</p>
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

/* ─────────────────────────────────────────────
   (10) Contact
   ───────────────────────────────────────────── */
export function Cta() {
  const { settings } = useSite();
  const c = settings.cta;
  const b = settings.brand;
  return (
    <section className="container-x pb-24 pt-12 md:pb-36">
      <SectionHead index="10" title="Contact" note={b.hours} />
      <div className="mt-12 md:mt-20">
        <h2 className="max-w-[16ch] text-[clamp(2.6rem,7vw,7rem)] leading-[0.98] tracking-[-0.055em]">
          <Words text={`${c.heading} ${c.accent}.`} />
        </h2>
        <div className="grid-12 mt-12 gap-y-8 md:mt-16">
          <p className="col-span-12 max-w-sm text-[15px] leading-relaxed text-muted md:col-span-4">{c.text}</p>
          <div className="col-span-12 md:col-span-7 md:col-start-6">
            <a href={`mailto:${b.email}`} className="group block border-b border-ink pb-3 text-[clamp(1.6rem,4vw,3.5rem)] tracking-[-0.045em]">
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-2">{b.email}</span>
              <span className="float-right transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
            </a>
            <div className="meta mt-4 flex flex-wrap justify-between gap-4 text-muted">
              <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="link-reveal">
                {b.phone}
              </a>
              <Link href="/contact" className="link-underline text-ink">
                {c.button} — use the planner →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
