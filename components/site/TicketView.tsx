"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { ArrowUpRight, Check, Download, MapPin } from "lucide-react";
import type { Booking, EventItem } from "@/lib/types";
import { dateParts, fmtDate, inr } from "@/lib/utils";
import { EASE } from "./motion";

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }).map((_, i) => ({
        x: Math.random() * 100,
        r: Math.random() * 720 - 360,
        d: 2.2 + Math.random() * 2.2,
        delay: Math.random() * 0.6,
        c: ["var(--accent)", "#0b0b0c", "#f7c948", "#7c6cff", "#ffffff"][i % 5],
        w: 6 + Math.random() * 8,
      })),
    []
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block rounded-[2px]"
          style={{ left: `${p.x}%`, width: p.w, height: p.w * 0.45, background: p.c }}
          initial={{ y: -40, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: p.r, opacity: [1, 1, 0] }}
          transition={{ duration: p.d, delay: 0.5 + p.delay, ease: [0.2, 0.6, 0.4, 1] }}
        />
      ))}
    </div>
  );
}

export function TicketView({ booking: b, event, qr }: { booking: Booking; event?: EventItem; qr: string }) {
  const d = event ? dateParts(event.date) : null;
  return (
    <section className="container-x flex min-h-screen flex-col items-center justify-center py-16 md:py-36">
      <Confetti />
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.4 }} className="grid h-16 w-16 place-items-center rounded-full bg-accent text-white">
        <Check className="h-8 w-8" />
      </motion.span>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.5 }} className="mt-6 text-center text-[clamp(2.5rem,6vw,5rem)] font-medium leading-none tracking-[-0.045em]">
        You&apos;re <span className="accent-word text-accent">in</span>, {b.name.split(" ")[0]}.
      </motion.h1>
      <p className="mt-4 text-center text-muted">A confirmation has been sent to {b.email}. Show this QR at the entrance.</p>

      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 25 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.7 }}
        style={{ transformPerspective: 1200 }}
        className="mt-12 w-full max-w-3xl"
      >
        <div className="grid overflow-hidden rounded-[var(--radius)] bg-dark text-white shadow-2xl md:grid-cols-[1fr_auto]">
          <div className="relative p-6 md:p-9">
            {event && <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-white/50">Admit {b.qty}</span>
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium">{b.ticket}</span>
              </div>
              <h2 className="mt-8 text-[clamp(1.8rem,3.4vw,2.75rem)] font-medium leading-[1] tracking-[-0.04em]">{b.eventTitle}</h2>
              {event && d && (
                <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="eyebrow text-white/40">Date</p>
                    <p className="mt-1 font-medium">
                      {d.day} {d.month} {d.year}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow text-white/40">Doors</p>
                    <p className="mt-1 font-medium">{event.time}</p>
                  </div>
                  <div>
                    <p className="eyebrow text-white/40">Paid</p>
                    <p className="mt-1 font-medium">{inr(b.total)}</p>
                  </div>
                  <p className="col-span-3 flex items-center gap-1.5 text-white/70">
                    <MapPin className="h-4 w-4" /> {event.venue}, {event.city}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center gap-3 border-t-2 border-dashed border-white/20 bg-white p-6 text-dark md:border-l-2 md:border-t-0">
            <span className="absolute -top-3 left-[-12px] hidden h-6 w-6 rounded-full bg-bg md:-left-3 md:top-[-12px] md:block" />
            <span className="absolute -bottom-3 hidden h-6 w-6 rounded-full bg-bg md:-left-3 md:block" />
            <img src={qr} alt="Ticket QR code" className="h-44 w-44" />
            <p className="font-mono text-sm tracking-widest">{b.id}</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button onClick={() => window.print()} className="flex h-12 items-center gap-2 rounded-full px-5 text-sm ring-1 ring-line transition hover:bg-ink hover:text-bg">
          <Download className="h-4 w-4" /> Save / print ticket
        </button>
        <Link href="/events" className="flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm text-bg transition hover:bg-accent">
          More events <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted">Booked on {fmtDate(b.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
    </section>
  );
}
