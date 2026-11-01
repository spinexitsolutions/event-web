"use client";

import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSite } from "../SiteProvider";
import { EASE } from "../motion";
import { CursorPreview } from "../Editorial";
import type { EventItem } from "@/lib/types";
import { dateParts } from "@/lib/utils";

export type Slide = { image: string; title: string; tag: string };

const SLIDE_MS = 4800;

export function Hero({ next, slides }: { next?: EventItem; slides: Slide[]; upcoming?: EventItem[] }) {
  const { settings, introDone } = useSite();
  const h = settings.hero;
  const b = settings.brand;
  const words = h.rotating?.length ? h.rotating : [h.accent];
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frame, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setTimeout(() => setIdx((v) => (v + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [idx, slides.length]);

  // one image per hover-word, cycling through the slides
  const imgFor = (i: number) => slides[(i + 1) % slides.length]?.image || h.image;
  const show = introDone;

  // build the sentence: line1 + "a, b, c and d" + line2
  const parts: { t: string; w?: number }[] = [{ t: h.line1 + " " }];
  words.forEach((w, i) => {
    parts.push({ t: w, w: i });
    parts.push({ t: i === words.length - 1 ? " " : i === words.length - 2 ? " and " : ", " });
  });
  parts.push({ t: h.line2 });
  let wordCount = 0;

  const slide = slides[idx];

  return (
    <section className="relative pt-20 md:pt-24">
      <CursorPreview src={hover} />
      <div className="container-x">
        {/* meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.1 }}
          className="grid-12 meta border-b hairline pb-3 text-muted"
        >
          <span className="col-span-6 text-ink md:col-span-3">{h.eyebrow}</span>
          <span className="hidden md:col-span-3 md:block">
            {b.city}, India — est. 2014
          </span>
          <span className="hidden md:col-span-4 md:block">
            {settings.announcement.enabled ? (
              <Link href={settings.announcement.href} className="link-reveal text-ink">
                {settings.announcement.text}
              </Link>
            ) : (
              settings.marquee.slice(0, 4).join(", ")
            )}
          </span>
          <span className="col-span-6 text-right md:col-span-2">(Scroll)</span>
        </motion.div>

        {/* headline */}
        <h1 className="mt-10 max-w-[19ch] text-[clamp(2.5rem,6.6vw,7.25rem)] font-normal leading-[0.98] tracking-[-0.052em] md:mt-14">
          {parts.map((p, i) => {
            const tokens = p.t.split(/(\s+)/).filter(Boolean);
            return tokens.map((tok, k) => {
              if (/^\s+$/.test(tok)) return <span key={`${i}-${k}`}> </span>;
              const n = wordCount++;
              const isHover = p.w !== undefined;
              return (
                <span key={`${i}-${k}`} className="inline-block overflow-hidden pb-[0.08em] align-top">
                  <motion.span
                    className={isHover ? "inline-block cursor-default text-ink underline decoration-[0.04em] underline-offset-[0.12em] transition-colors hover:text-accent" : "inline-block"}
                    initial={{ y: "105%" }}
                    animate={show ? { y: "0%" } : {}}
                    transition={{ duration: 1, ease: EASE, delay: 0.15 + n * 0.035 }}
                    onMouseEnter={isHover ? () => setHover(imgFor(p.w!)) : undefined}
                    onMouseLeave={isHover ? () => setHover(null) : undefined}
                  >
                    {tok}
                  </motion.span>
                </span>
              );
            });
          })}
        </h1>

        {/* intro + links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE, delay: 0.7 }}
          className="grid-12 mt-10 gap-y-6 md:mt-16"
        >
          <p className="col-span-12 max-w-md text-[15px] leading-relaxed text-muted md:col-span-5 md:col-start-1">{h.subtitle}</p>
          <div className="col-span-12 flex flex-wrap gap-x-8 gap-y-3 text-[15px] md:col-span-4 md:col-start-9 md:justify-end md:self-end">
            <Link href={h.primaryHref} className="group inline-flex items-baseline gap-2">
              <span className="link-underline">{h.primaryCta}</span>
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
            <Link href={h.secondaryHref} className="group inline-flex items-baseline gap-2 text-muted hover:text-ink">
              <span className="link-underline">{h.secondaryCta}</span>
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* figure */}
      <motion.figure
        initial={{ clipPath: "inset(12% 0 0 0)", opacity: 0 }}
        animate={show ? { clipPath: "inset(0% 0 0 0)", opacity: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
        className="container-x mt-10 md:mt-14"
      >
        <div ref={frame} className="relative aspect-[4/5] overflow-hidden bg-ink sm:aspect-[16/10] md:aspect-[21/9]">
          <AnimatePresence initial={false}>
            <motion.div key={idx} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
              <motion.img src={slide.image} alt={slide.title} style={{ y, scale: 1.18 }} className="absolute inset-0 h-full w-full object-cover" />
            </motion.div>
          </AnimatePresence>
        </div>
        <figcaption className="grid-12 meta mt-3 text-muted">
          <span className="col-span-2 tabular-nums md:col-span-1">
            {String(idx + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
          </span>
          <span className="col-span-10 text-ink md:col-span-5">
            <AnimatePresence mode="wait">
              <motion.span key={idx} className="inline-block" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4 }}>
                {slide.title} — {slide.tag}
              </motion.span>
            </AnimatePresence>
          </span>
          {next && (
            <Link href={`/events/${next.slug}`} className="col-span-12 mt-1 md:col-span-6 md:mt-0 md:text-right">
              Next: <span className="link-reveal text-ink">{next.title}</span>, {next.city} · {dateParts(next.date).day} {dateParts(next.date).month}
            </Link>
          )}
        </figcaption>
        <div className="mt-2 flex gap-1">
          {slides.map((_, k) => (
            <button key={k} onClick={() => setIdx(k)} className="h-4 flex-1" aria-label={`Slide ${k + 1}`}>
              <span className="block h-px w-full bg-line">
                {k === idx && <motion.span key={`b${idx}`} className="block h-px bg-ink" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: SLIDE_MS / 1000, ease: "linear" }} />}
              </span>
            </button>
          ))}
        </div>
      </motion.figure>
    </section>
  );
}
