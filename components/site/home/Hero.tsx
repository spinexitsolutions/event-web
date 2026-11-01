"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { useSite } from "../SiteProvider";
import { EASE, Magnetic, SplitLines } from "../motion";
import type { EventItem } from "@/lib/types";
import { dateParts } from "@/lib/utils";

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

export function Hero({ next }: { next?: EventItem }) {
  const { settings, introDone } = useSite();
  const h = settings.hero;
  const frame = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frame, offset: ["start start", "end end"] });
  const clip = useTransform(scrollYProgress, [0, 0.55], ["inset(6% 5% 6% 5% round 32px)", "inset(0% 0% 0% 0% round 0px)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const overlay = useTransform(scrollYProgress, [0.35, 0.7], [0, 1]);
  const overlayY = useTransform(scrollYProgress, [0.35, 0.75], [60, 0]);
  const cd = useCountdown(next?.date || "2027-01-01");
  const show = introDone;

  return (
    <section className="relative">
      <div className="container-x relative pt-10 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <span className="eyebrow flex items-center gap-2 text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            {h.eyebrow}
          </span>
          <span className="eyebrow hidden text-muted md:block">Est. 2014 — {settings.brand.city}</span>
        </motion.div>

        <h1 className="mt-6 text-[clamp(3.1rem,10.5vw,10.5rem)] md:mt-6">
          <SplitLines
            waitForIntro
            inView={false}
            delay={0.15}
            lineClassName="display"
            lines={[
              <span key="1">{h.line1}</span>,
              <span key="2" className="flex items-baseline gap-[0.18em] pl-[8vw] md:pl-[16vw]">
                <span className="serif-accent text-accent">{h.accent}</span>
                <motion.span
                  className="hidden h-[0.62em] w-[1.6em] translate-y-[0.05em] overflow-hidden rounded-full sm:inline-block"
                  initial={{ width: 0 }}
                  animate={show ? { width: "1.6em" } : {}}
                  transition={{ duration: 1.2, ease: EASE, delay: 0.9 }}
                >
                  <img src={settings.nav.items[0]?.image || h.image} alt="" className="h-full w-full object-cover" />
                </motion.span>
              </span>,
              <span key="3">{h.line2}</span>,
            ]}
          />
        </h1>

        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-12 md:items-end">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE, delay: 0.6 }}
            className="max-w-md text-[17px] leading-relaxed text-muted md:col-span-5 md:text-lg"
          >
            {h.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE, delay: 0.75 }}
            className="flex flex-wrap items-center gap-3 md:col-span-7 md:justify-end"
          >
            <Magnetic>
              <Link href={h.primaryHref} className="group flex h-14 items-center gap-3 rounded-full bg-ink pl-6 pr-2 text-[15px] font-medium text-bg">
                {h.primaryCta}
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-white transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href={h.secondaryHref} className="flex h-14 items-center rounded-full px-6 text-[15px] font-medium ring-1 ring-line transition hover:bg-ink hover:text-bg">
                {h.secondaryCta}
              </Link>
            </Magnetic>
          </motion.div>
        </div>
      </div>

      {/* Scroll-expanding media */}
      <div ref={frame} className="relative mt-6 h-[150vh] md:mt-10 md:h-[210vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <motion.div style={{ clipPath: clip }} className="absolute inset-0 overflow-hidden bg-dark" data-cursor="Scroll">
            <motion.img
              src={h.image}
              alt="Event highlight"
              style={{ scale }}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={show ? { opacity: 1 } : {}}
              transition={{ duration: 1.4, delay: 0.4 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />

            <motion.div style={{ opacity: overlay, y: overlayY }} className="container-x absolute inset-x-0 bottom-0 pb-28 text-white md:pb-14">
              <div className="grid items-end gap-6 md:grid-cols-12">
                <h2 className="text-[clamp(2.2rem,6vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.045em] md:col-span-7">
                  Ballrooms, beaches <br />
                  & <span className="serif-accent">rooftops.</span>
                </h2>
                {next && (
                  <Link href={`/events/${next.slug}`} className="glass-dark group rounded-[24px] p-4 ring-1 ring-white/15 transition hover:ring-white/40 md:col-span-5 md:ml-auto md:w-[420px]">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow flex items-center gap-2 text-white/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" /> Next up
                      </span>
                      <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
                    </div>
                    <div className="mt-3 flex gap-4">
                      <img src={next.image.replace("w=1600", "w=400")} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-lg font-medium tracking-tight">{next.title}</p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-white/60">
                          <MapPin className="h-3.5 w-3.5" /> {next.city} · {dateParts(next.date).day} {dateParts(next.date).month}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                      {[
                        [cd.d, "Days"],
                        [cd.h, "Hrs"],
                        [cd.m, "Min"],
                        [cd.s, "Sec"],
                      ].map(([v, l]) => (
                        <div key={l as string} className="rounded-xl bg-white/10 py-2">
                          <div className="text-xl font-medium tabular-nums">{String(v).padStart(2, "0")}</div>
                          <div className="eyebrow text-[9px] text-white/50">{l}</div>
                        </div>
                      ))}
                    </div>
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]) }}
            className="pointer-events-none absolute bottom-[9%] left-1/2 hidden -translate-x-1/2 md:block"
          >
            <span className="glass-dark flex items-center gap-2 rounded-full px-4 py-2 text-xs text-white">
              <ArrowDown className="h-3.5 w-3.5 animate-bounce" /> Scroll to explore
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
