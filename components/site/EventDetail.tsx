"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowLeft, CalendarPlus, Clock, MapPin, Share2, Sparkle, Ticket } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { BookingWidget } from "./BookingWidget";
import { EventCard } from "./EventCard";
import { EASE, Reveal, SectionLabel, SplitLines } from "./motion";
import { dateParts, fmtDate, inr, minPrice, soldPct } from "@/lib/utils";

function ics(e: EventItem) {
  const d = e.date.replace(/-/g, "");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${d}`,
    `SUMMARY:${e.title}`,
    `LOCATION:${e.venue}, ${e.city}`,
    `DESCRIPTION:${e.excerpt}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
  return `data:text/calendar;charset=utf8,${encodeURIComponent(body)}`;
}

export function EventDetail({ e, related }: { e: EventItem; related: EventItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const [copied, setCopied] = useState(false);
  const d = dateParts(e.date);

  return (
    <>
      <div ref={ref} className="relative h-[88svh] overflow-hidden bg-dark text-white md:h-screen">
        <motion.img src={e.image} alt={e.title} style={{ y, scale }} className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/30" />
        <div className="container-x relative flex h-full flex-col justify-between pb-10 pt-6 md:pb-16 md:pt-36">
          <Link href="/events" className="glass-dark flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> All events
          </Link>
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium">{e.category}</span>
              {e.status === "upcoming" && <span className="glass-dark rounded-full px-3 py-1 text-xs">{soldPct(e.tickets)}% sold</span>}
            </div>
            <h1 className="mt-5 max-w-5xl text-[clamp(2.75rem,8.5vw,8rem)]">
              <SplitLines inView={false} waitForIntro delay={0.35} lineClassName="display" lines={[e.title]} />
            </h1>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.7 }} className="mt-8 grid grid-cols-2 gap-3 md:flex md:gap-8">
              <Info icon={<Sparkle className="h-4 w-4" />} label="Date" value={`${d.weekday}, ${d.day} ${d.month} ${d.year}`} />
              <Info icon={<Clock className="h-4 w-4" />} label="Time" value={e.time} />
              <Info icon={<MapPin className="h-4 w-4" />} label="Venue" value={`${e.venue}, ${e.city}`} />
              <Info icon={<Ticket className="h-4 w-4" />} label="From" value={inr(minPrice(e.tickets))} />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container-x grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <SectionLabel>About the experience</SectionLabel>
          <p className="mt-6 text-[clamp(1.5rem,2.6vw,2.25rem)] font-medium leading-[1.2] tracking-[-0.03em]">{e.excerpt}</p>
          <div className="prose-lume mt-8">
            {e.description.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {e.highlights.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-3">
              {e.highlights.map((h, i) => (
                <Reveal key={h} delay={i * 0.06} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                  <span className="serif-accent text-3xl text-accent">0{i + 1}</span>
                  <p className="mt-2 font-medium tracking-tight">{h}</p>
                </Reveal>
              ))}
            </div>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={ics(e)} download={`${e.slug}.ics`} className="flex h-12 items-center gap-2 rounded-full px-5 text-sm ring-1 ring-line transition hover:bg-ink hover:text-bg">
              <CalendarPlus className="h-4 w-4" /> Add to calendar
            </a>
            <button
              onClick={async () => {
                const url = window.location.href;
                if (navigator.share) await navigator.share({ title: e.title, url }).catch(() => {});
                else {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }
              }}
              className="flex h-12 items-center gap-2 rounded-full px-5 text-sm ring-1 ring-line transition hover:bg-ink hover:text-bg"
            >
              <Share2 className="h-4 w-4" /> {copied ? "Link copied" : "Share"}
            </button>
          </div>
          <div className="mt-12 overflow-hidden rounded-[var(--radius)] ring-1 ring-line">
            <iframe
              title="Map"
              className="h-72 w-full grayscale md:h-96"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${e.venue}, ${e.city}`)}&z=14&output=embed`}
            />
          </div>
        </div>
        <aside className="md:col-span-5 md:col-start-8">
          <div className="md:sticky md:top-28">
            <BookingWidget event={e} />
            <p className="mt-4 text-center text-xs text-muted">Event on {fmtDate(e.date, { dateStyle: "full" })}</p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-x pb-24">
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-medium tracking-[-0.04em]">
            You might also <span className="serif-accent text-accent">love</span>
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <EventCard key={r.id} e={r} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky buy bar */}
      {e.status === "upcoming" && (
        <a href="#tickets" className="fixed inset-x-3 bottom-[84px] z-50 flex h-14 items-center justify-between rounded-full bg-accent pl-6 pr-2 text-white shadow-xl md:hidden">
          <span className="text-sm">
            From <b>{inr(minPrice(e.tickets))}</b>
          </span>
          <span className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-dark">Get tickets</span>
        </a>
      )}
    </>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-dark rounded-2xl px-4 py-3 md:bg-transparent md:p-0 md:backdrop-blur-none">
      <p className="eyebrow flex items-center gap-1.5 text-white/50">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-[15px] font-medium md:text-lg">{value}</p>
    </div>
  );
}
