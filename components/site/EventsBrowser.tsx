"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";

export function EventsBrowser({ events }: { events: EventItem[] }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
  const cats = useMemo(() => ["All", ...Array.from(new Set(events.map((e) => e.category)))], [events]);
  const list = events
    .filter((e) => e.status === when)
    .filter((e) => cat === "All" || e.category === cat)
    .filter((e) => !q || `${e.title} ${e.city} ${e.venue}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (when === "upcoming" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));

  return (
    <section className="container-x pb-24 md:pb-36">
      <div className="sticky top-3 z-30 -mx-2 mb-10 rounded-[4px] p-2 md:top-24">
        <div className="glass flex flex-col gap-3 rounded-[4px] p-2 ring-1 ring-line md:flex-row md:items-center">
          <div className="flex rounded-[3px] bg-ink/5 p-1">
            {(["upcoming", "past"] as const).map((w) => (
              <button key={w} onClick={() => setWhen(w)} className="relative flex-1 rounded-[3px] px-5 py-2 text-sm capitalize md:flex-none">
                {when === w && <motion.span layoutId="when" className="absolute inset-0 rounded-[3px] bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <span className={cn("relative", when === w ? "text-bg" : "text-ink")}>{w}</span>
              </button>
            ))}
          </div>
          <LayoutGroup>
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {cats.map((c) => (
                <button key={c} onClick={() => setCat(c)} className="relative shrink-0 rounded-[3px] px-4 py-2 text-sm">
                  {cat === c && <motion.span layoutId="cat" className="absolute inset-0 rounded-[3px] bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <span className={cn("relative", cat === c ? "text-bg" : "text-muted hover:text-ink")}>{c}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
          <label className="flex h-11 flex-1 items-center gap-2 rounded-[3px] bg-white px-4 ring-1 ring-line md:ml-auto md:max-w-xs">
            <Search className="h-4 w-4 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search city, venue…" className="w-full bg-transparent text-sm outline-none" />
          </label>
        </div>
      </div>

      <motion.div layout className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((e, i) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
            >
              <EventCard e={e} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {!list.length && <p className="py-24 text-center text-muted">No events match — try another filter.</p>}
    </section>
  );
}
