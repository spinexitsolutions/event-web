"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import type { Service } from "@/lib/types";
import { Icon } from "../EventCard";
import { SectionLabel, SplitLines } from "../motion";
import { inr } from "@/lib/utils";

export function ServicesStack({ services }: { services: Service[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section className="relative py-24 md:py-36">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-muted">
              <span className="h-2 w-2 rounded-full bg-accent" /> One studio, every format
            </p>
            <h2 className="condensed mt-4 text-[clamp(4.5rem,15vw,14rem)]">
              What we
              <br />
              <span className="text-outline">do</span>
              <span className="ml-3 inline-grid h-[0.42em] min-w-[0.8em] translate-y-[-0.9em] place-items-center rounded-full bg-pop px-[0.15em] font-wide text-[0.16em] font-bold text-dark">{String(services.length).padStart(2, "0")}</span>
            </h2>
          </div>
          <ul className="md:col-span-4 md:col-start-9">
            {services.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.slug}`} className="group flex items-center justify-between border-b border-line py-3 text-lg font-semibold transition hover:pl-2 hover:text-accent">
                  <span>
                    <span className="mr-3 font-wide text-xs text-muted">0{i + 1}</span>
                    {s.title}
                  </span>
                  <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div ref={ref} className="relative mt-14 md:mt-20">
          {services.map((s, i) => (
            <Card key={s.id} s={s} i={i} n={services.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ s, i, n, progress }: { s: Service; i: number; n: number; progress: MotionValue<number> }) {
  const start = i / n;
  const scale = useTransform(progress, [start, 1], [1, 1 - (n - i) * 0.035]);
  const dim = useTransform(progress, [start, Math.min(1, start + 1 / n + 0.1)], [0, i === n - 1 ? 0 : 0.35]);
  const dark = i % 2 === 1;
  return (
    <div className="sticky h-[auto] pb-6 md:h-[78vh] md:pb-0" style={{ top: `calc(84px + ${i * 22}px)` }}>
      <motion.article
        id={s.slug}
        style={{ scale }}
        className={`relative grid origin-top overflow-hidden rounded-[var(--radius)] md:h-[68vh] md:grid-cols-2 ${dark ? "bg-dark text-white" : "bg-white text-ink"} shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]`}
      >
        <div className="flex flex-col justify-between gap-8 p-6 md:p-12">
          <div className="flex items-center justify-between">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${dark ? "bg-white/10" : "bg-accent-soft text-accent"}`}>
              <Icon name={s.icon} className="h-5 w-5" />
            </span>
            <span className="eyebrow opacity-50">
              {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          </div>
          <div>
            <h3 className="text-[clamp(2rem,4.2vw,3.8rem)] font-medium leading-[0.95] tracking-[-0.045em]">{s.title}</h3>
            <p className={`mt-4 max-w-md text-[16px] leading-relaxed ${dark ? "text-white/65" : "text-muted"}`}>{s.description}</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {s.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${dark ? "text-white/60" : "text-muted"}`}>
              From <b className={dark ? "text-white" : "text-ink"}>{inr(s.startingPrice, true)}</b>
            </span>
            <Link href={`/contact?type=${encodeURIComponent(s.title)}`} className={`group flex h-11 items-center gap-2 rounded-full pl-5 pr-1.5 text-sm font-medium ${dark ? "bg-white text-dark" : "bg-ink text-bg"}`}>
              Enquire
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-white transition group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
        <div className="relative order-first h-56 overflow-hidden sm:h-72 md:order-none md:h-auto">
          <img src={s.image} alt={s.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" />
      </motion.article>
    </div>
  );
}
