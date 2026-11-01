"use client";

import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MapPin, Play } from "lucide-react";
import { useSite } from "../SiteProvider";
import { EASE, EASE_IO, Magnetic } from "../motion";
import type { EventItem } from "@/lib/types";
import { dateParts, inr, minPrice } from "@/lib/utils";

export type Slide = { image: string; title: string; tag: string };

const SLIDE_MS = 5200;

function useCountdown(date: string) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const target = new Date(date + "T18:00:00").getTime();
    const f = () => {
      const diff = Math.max(0, target - Date.now());
      setLeft({ d: Math.floor(diff / 864e5), h: Math.floor((diff / 36e5) % 24), m: Math.floor((diff / 6e4) % 60), s: Math.floor((diff / 1e3) % 60) });
    };
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, [date]);
  return left;
}

/* Letter-by-letter rolling word */
function RollingWord({ words, run }: { words: string[]; run: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!run || words.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [run, words.length]);
  const word = words[i] || "";
  return (
    <motion.span layout transition={{ layout: { duration: 0.7, ease: EASE } }} className="relative inline-flex overflow-hidden pb-[0.06em] align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={word} className="accent-word inline-flex whitespace-nowrap text-pop">
          {word.split("").map((ch, k) => (
            <motion.span
              key={k}
              className="inline-block"
              initial={{ y: "105%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-105%", opacity: 0 }}
              transition={{ duration: 0.65, ease: EASE_IO, delay: k * 0.028 }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

/* Next-event ticket with 3D tilt + glare */
function TicketCard({ e }: { e: EventItem }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const rx = useSpring(0, { stiffness: 150, damping: 18 });
  const ry = useSpring(0, { stiffness: 150, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(260px circle at ${gx}% ${gy}%, rgba(255,255,255,0.25), transparent 60%)`;
  const cd = useCountdown(e.date);
  const d = dateParts(e.date);
  return (
    <motion.a
      ref={ref}
      href={`/events/${e.slug}`}
      data-cursor="Book"
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(ev) => {
        const r = ref.current!.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width;
        const py = (ev.clientY - r.top) / r.height;
        ry.set((px - 0.5) * 18);
        rx.set(-(py - 0.5) * 18);
        gx.set(px * 100);
        gy.set(py * 100);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      className="group relative block w-[290px] select-none"
    >
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative overflow-hidden rounded-[26px] bg-white text-dark shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
        <div className="relative h-36 overflow-hidden">
          <img src={e.image.replace("w=1600", "w=700")} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <span className="absolute left-3 top-3 rounded-full bg-pop px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-dark">Next up</span>
          <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{e.category}</span>
        </div>
        <div className="p-4 pb-3">
          <p className="font-display text-[22px] font-bold leading-[1.02] tracking-[-0.03em]">{e.title}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[12px] text-dark/60">
            <MapPin className="h-3 w-3" /> {e.venue}, {e.city}
          </p>
        </div>
        <div className="relative mx-4 border-t-2 border-dashed border-dark/15">
          <span className="absolute -left-[26px] -top-[11px] h-5 w-5 rounded-full bg-dark" />
          <span className="absolute -right-[26px] -top-[11px] h-5 w-5 rounded-full bg-dark" />
        </div>
        <div className="grid grid-cols-4 gap-1 px-4 pt-3 text-center">
          {[
            [cd.d, "days"],
            [cd.h, "hrs"],
            [cd.m, "min"],
            [cd.s, "sec"],
          ].map(([v, l]) => (
            <div key={l as string}>
              <div className="font-display text-[22px] font-bold tabular-nums leading-none">{String(v).padStart(2, "0")}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-dark/45">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-end justify-between gap-3 px-4 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-dark/45">
              {d.weekday} {d.day} {d.month} · from
            </p>
            <p className="font-display text-lg font-bold">{inr(minPrice(e.tickets))}</p>
          </div>
          <div className="h-9 w-24 opacity-80" style={{ background: "repeating-linear-gradient(90deg,#0d0d12 0 2px,transparent 2px 4px,#0d0d12 4px 5px,transparent 5px 8px,#0d0d12 8px 11px,transparent 11px 12px)" }} />
        </div>
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: glare }} />
      </motion.div>
    </motion.a>
  );
}

export function Hero({ next, slides, upcoming }: { next?: EventItem; slides: Slide[]; upcoming: EventItem[] }) {
  const { settings, introDone } = useSite();
  const h = settings.hero;
  const words = h.rotating?.length ? h.rotating : [h.accent];
  const section = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);
  const [touch, setTouch] = useState(false);

  // spotlight that follows the pointer (auto-drifts on touch devices)
  const mx = useMotionValue(68);
  const my = useMotionValue(38);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const mask = useMotionTemplate`radial-gradient(circle at ${sx}% ${sy}%, black 0px, black 110px, transparent 360px)`;
  const beam = useMotionTemplate`radial-gradient(circle at ${sx}% ${sy}%, color-mix(in oklab, var(--pop) 16%, transparent), transparent 300px)`;

  useEffect(() => {
    const t = window.matchMedia("(hover: none)").matches;
    setTouch(t);
    if (!t) return;
    const a = animate(mx, [68, 30, 55, 80, 68], { duration: 14, repeat: Infinity, ease: "easeInOut" });
    const b = animate(my, [30, 45, 25, 50, 30], { duration: 11, repeat: Infinity, ease: "easeInOut" });
    return () => {
      a.stop();
      b.stop();
    };
  }, [mx, my]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setTimeout(() => setIdx((v) => (v + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [idx, slides.length]);

  // as you scroll away the stage shrinks into a rounded card
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const radius = useTransform(scrollYProgress, [0, 0.4], [0, 48]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const slide = slides[idx];
  const show = introDone;
  const imgAnim = {
    initial: { opacity: 0, scale: 1.18 },
    exit: { opacity: 0 },
    transition: { opacity: { duration: 1.4 }, scale: { duration: SLIDE_MS / 1000 + 1.5, ease: "linear" as const } },
  };

  return (
    <section ref={section} className="relative h-[100svh] min-h-[680px] bg-bg">
      <motion.div
        style={{ scale, borderBottomLeftRadius: radius, borderBottomRightRadius: radius }}
        className="grain absolute inset-0 origin-top overflow-hidden bg-dark text-white"
        onPointerMove={(e) => {
          if (touch) return;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(((e.clientX - r.left) / r.width) * 100);
          my.set(((e.clientY - r.top) / r.height) * 100);
        }}
      >
        {/* dimmed stage */}
        <AnimatePresence initial={false}>
          <motion.img key={`dim-${idx}`} src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover saturate-[0.5]" {...imgAnim} animate={{ opacity: 0.2, scale: 1.04 }} />
        </AnimatePresence>
        {/* lit area under the spotlight */}
        <motion.div className="absolute inset-0" style={{ WebkitMaskImage: mask, maskImage: mask }}>
          <AnimatePresence initial={false}>
            <motion.img key={`lit-${idx}`} src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" {...imgAnim} animate={{ opacity: 1, scale: 1.04 }} />
          </AnimatePresence>
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ background: beam }} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-dark via-dark/60 to-transparent" />

        <motion.div style={{ y: contentY, opacity: fade }} className="container-x relative flex h-full flex-col pb-28 pt-6 md:pb-6 md:pt-28">
          {/* top row */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[12px] font-semibold ring-1 ring-white/15 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pop opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-pop" />
              </span>
              {h.eyebrow}
            </span>
            {upcoming.length > 0 && (
              <div className="hidden w-[400px] items-center gap-3 overflow-hidden rounded-full bg-white/10 py-2 pl-4 text-[12px] ring-1 ring-white/15 backdrop-blur-md md:flex">
                <span className="shrink-0 font-bold uppercase tracking-wider text-pop">Now booking</span>
                <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
                  <div className="flex w-max gap-6 whitespace-nowrap text-white/75" style={{ animation: "marquee 24s linear infinite" }}>
                    {[...upcoming, ...upcoming].map((e, k) => (
                      <Link key={k} href={`/events/${e.slug}`} className="hover:text-white">
                        {e.title} · {e.city}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <div className="mt-auto grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <h1 className="font-display text-[clamp(3.1rem,8.4vw,9rem)] font-bold leading-[0.88] tracking-[-0.055em]">
                {[h.line1, null, h.line2].map((line, i) => (
                  <span key={i} className="block overflow-hidden pb-[0.05em]">
                    <motion.span
                      className="block"
                      initial={{ y: "105%" }}
                      animate={show ? { y: "0%" } : {}}
                      transition={{ duration: 1.1, ease: EASE, delay: 0.25 + i * 0.1 }}
                    >
                      {line === null ? (
                        <span className="flex items-center gap-[0.18em]">
                          <RollingWord words={words} run={show} />
                          <motion.span
                            className="hidden h-[0.62em] w-[0.62em] shrink-0 items-center justify-center rounded-full bg-pop text-dark sm:inline-flex"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={show ? { scale: 1, rotate: 0 } : {}}
                            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
                          >
                            <ArrowUpRight className="h-[55%] w-[55%]" strokeWidth={2.5} />
                          </motion.span>
                        </span>
                      ) : (
                        line
                      )}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <div className="mt-7 flex flex-col gap-6 md:mt-9 md:flex-row md:items-end md:gap-12">
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={show ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 1, ease: EASE, delay: 0.7 }}
                  className="max-w-sm text-[15px] leading-relaxed text-white/65 md:text-base"
                >
                  {h.subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={show ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 1, ease: EASE, delay: 0.82 }}
                  className="flex flex-wrap items-center gap-3"
                >
                  <Magnetic>
                    <Link href={h.primaryHref} className="group flex h-14 items-center gap-3 rounded-full bg-pop pl-6 pr-2 text-[15px] font-bold text-dark">
                      {h.primaryCta}
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-dark text-pop transition-transform duration-500 group-hover:rotate-45">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </Magnetic>
                  <Magnetic>
                    <Link href={h.secondaryHref} className="flex h-14 items-center gap-2.5 rounded-full bg-white/10 pl-2.5 pr-5 text-[15px] font-semibold ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white hover:text-dark">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-dark">
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </span>
                      {h.secondaryCta}
                    </Link>
                  </Magnetic>
                </motion.div>
              </div>
            </div>

            {next && (
              <motion.div
                initial={{ opacity: 0, y: 60, rotate: 8 }}
                animate={show ? { opacity: 1, y: 0, rotate: -3 } : {}}
                transition={{ duration: 1.3, ease: EASE, delay: 0.6 }}
                className="hidden pb-2 lg:block"
              >
                <TicketCard e={next} />
              </motion.div>
            )}
          </div>

          {/* slide index */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1 }}
            className="mt-6 hidden items-center gap-6 border-t border-white/10 pt-4 md:flex"
          >
            <div className="flex flex-1 gap-3">
              {slides.map((s, k) => (
                <button key={k} onClick={() => setIdx(k)} className="group min-w-0 flex-1 text-left" aria-label={`Show ${s.title}`}>
                  <div className="h-[3px] overflow-hidden rounded-full bg-white/15">
                    {k === idx ? (
                      <motion.div key={`p-${idx}`} className="h-full bg-pop" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: SLIDE_MS / 1000, ease: "linear" }} />
                    ) : (
                      <div className={`h-full bg-white/45 ${k < idx ? "w-full" : "w-0"}`} />
                    )}
                  </div>
                  <p className={`mt-2 truncate text-[12px] transition ${k === idx ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>
                    <span className="font-bold tabular-nums">{String(k + 1).padStart(2, "0")}</span> · {s.title}
                  </p>
                </button>
              ))}
            </div>
            {!touch && <span className="hidden shrink-0 text-[12px] text-white/45 xl:block">Move your cursor — you hold the spotlight</span>}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
