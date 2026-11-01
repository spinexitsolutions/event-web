"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { EventItem } from "@/lib/types";
import { SectionHead } from "../Editorial";
import { EASE } from "../motion";
import { cn, dateParts, inr, minPrice, soldPct } from "@/lib/utils";

/** (03) Upcoming — a concert-listing table with a pinned preview */
export function EventsRail({ events }: { events: EventItem[] }) {
  const [i, setI] = useState(0);
  const e = events[i];
  if (!e) return null;
  return (
    <section className="container-x py-24 md:py-36">
      <SectionHead index="03" title="Upcoming" note={<Link href="/events" className="link-underline text-ink">All {events.length} events →</Link>} />
      <div className="grid-12 mt-10 gap-y-8 md:mt-16">
        <div className="col-span-12 hidden md:col-span-4 md:block">
          <div className="sticky top-24">
            <Link href={`/events/${e.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-ink" data-cursor="Tickets">
              <AnimatePresence initial={false}>
                <motion.img
                  key={e.id}
                  src={e.image}
                  alt={e.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ clipPath: "inset(0 0 100% 0)" }}
                  animate={{ clipPath: "inset(0 0 0% 0)" }}
                  exit={{ opacity: 0.7 }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                />
              </AnimatePresence>
            </Link>
            <div className="meta mt-3 flex justify-between text-muted">
              <span>{e.venue}</span>
              <span>{soldPct(e.tickets)}% sold</span>
            </div>
            <div className="mt-2 h-px bg-line">
              <motion.div key={e.id} className="h-px bg-ink" initial={{ width: 0 }} animate={{ width: `${soldPct(e.tickets)}%` }} transition={{ duration: 1, ease: EASE }} />
            </div>
          </div>
        </div>
        <ul className="col-span-12 md:col-span-8">
          <li className="meta hidden grid-cols-[7rem_1fr_9rem_7rem] border-b hairline pb-3 text-muted md:grid">
            <span>Date</span>
            <span>Event</span>
            <span>City</span>
            <span className="text-right">From</span>
          </li>
          {events.map((ev, k) => {
            const d = dateParts(ev.date);
            return (
              <li key={ev.id} onMouseEnter={() => setI(k)}>
                <Link
                  href={`/events/${ev.slug}`}
                  className={cn("grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 border-b hairline py-5 transition-colors md:grid-cols-[7rem_1fr_9rem_7rem] md:gap-x-0 md:py-6", k === i ? "text-ink" : "md:text-muted")}
                >
                  <span className="meta tabular-nums">
                    {d.day} {d.month}
                    <span className="block text-muted">{d.weekday}</span>
                  </span>
                  <span className="text-[clamp(1.35rem,2.2vw,2rem)] leading-tight tracking-[-0.035em]">
                    {ev.title}
                    <span className="meta mt-1 block text-muted">{ev.category}</span>
                  </span>
                  <span className="meta hidden md:block">{ev.city}</span>
                  <span className="meta text-right">
                    {inr(minPrice(ev.tickets))}
                    <span className={cn("block transition-opacity", k === i ? "text-accent opacity-100" : "opacity-0 md:opacity-0")}>Tickets →</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
