"use client";

import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { EventCard } from "../EventCard";
import { SectionLabel, SplitLines } from "../motion";

export function EventsRail({ events }: { events: EventItem[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * dist);
  const sx = useSpring(x, { stiffness: 140, damping: 30, mass: 0.4 });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useLayoutEffect(() => {
    const m = () => track.current && setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, [events.length]);

  const header = (
    <div className="flex w-[82vw] shrink-0 flex-col justify-between pr-6 md:w-[34vw] md:pr-16">
      <div>
        <SectionLabel index="03" className="text-white/50">
          Upcoming
        </SectionLabel>
        <h2 className="mt-5 text-[clamp(2.75rem,6.4vw,6rem)] text-white">
          <SplitLines lineClassName="display" lines={["Get on", <span key="l" className="accent-word text-pop">the list.</span>]} />
        </h2>
        <p className="mt-6 max-w-xs text-white/60">Ticketed experiences we design and host ourselves. Limited capacity, always.</p>
      </div>
      <Link href="/events" className="group mt-8 hidden w-fit items-center gap-3 text-white md:flex">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-accent transition group-hover:rotate-45">
          <ArrowUpRight className="h-5 w-5" />
        </span>
        <span className="link-underline">All events</span>
      </Link>
    </div>
  );

  return (
    <section ref={section} className="relative bg-dark md:h-[300vh]" style={{ height: undefined }}>
      {/* Desktop: pinned horizontal scroll */}
      <div className="sticky top-0 hidden h-screen items-center overflow-hidden md:flex">
        <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-accent/25 blur-[120px]" />
        <motion.div ref={track} style={{ x: sx }} className="flex items-stretch gap-6 pl-10 pr-[10vw] will-change-transform">
          {header}
          {events.map((e) => (
            <EventCard key={e.id} e={e} dark className="w-[30vw] min-w-[340px] max-w-[440px] shrink-0" />
          ))}
          <Link href="/events" className="group grid w-[26vw] max-w-[380px] shrink-0 place-items-center rounded-[var(--radius)] border border-dashed border-white/20 text-white transition hover:border-accent" data-cursor="Open">
            <div className="text-center">
              <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-accent transition duration-700 group-hover:scale-110 group-hover:rotate-45">
                <ArrowUpRight className="h-8 w-8" />
              </span>
              <p className="mt-6 text-2xl font-medium tracking-tight">View all events</p>
            </div>
          </Link>
        </motion.div>
        <div className="absolute bottom-10 left-10 right-10 h-px bg-white/10">
          <motion.div style={{ width: bar }} className="h-px bg-pop" />
        </div>
      </div>

      {/* Mobile: native snap carousel */}
      <div className="py-20 md:hidden">
        <div className="px-5">{header}</div>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2">
          {events.map((e) => (
            <EventCard key={e.id} e={e} dark className="w-[80vw] shrink-0 snap-center" />
          ))}
        </div>
        <div className="mt-8 px-5">
          <Link href="/events" className="flex h-14 items-center justify-center gap-2 rounded-full bg-accent font-medium text-white">
            View all events <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
