"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { cn, dateParts, inr, minPrice, soldPct } from "@/lib/utils";
import {
  Briefcase, Cake, Heart, Music, Sparkles, Mic, Camera, Utensils, PartyPopper, Gem, Flower2, Megaphone, Palette, Building2, Globe, Star,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = { Briefcase, Cake, Heart, Music, Sparkles, Mic, Camera, Utensils, PartyPopper, Gem, Flower2, Megaphone, Palette, Building2, Globe, Star };
export function Icon({ name, className }: { name: string; className?: string }) {
  const I = ICONS[name] || Sparkles;
  return <I className={className} />;
}

export function EventCard({ e, className, dark = false }: { e: EventItem; className?: string; dark?: boolean }) {
  const d = dateParts(e.date);
  const pct = soldPct(e.tickets);
  const soldOut = e.tickets.every((t) => t.sold >= t.capacity);
  return (
    <Link href={`/events/${e.slug}`} className={cn("group block", className)} data-cursor="View">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)] bg-dark">
        <img src={e.image} alt={e.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
        <div className="absolute left-4 top-4 flex flex-col items-center rounded-2xl bg-white px-3 py-2 text-dark">
          <span className="text-2xl font-semibold leading-none tracking-tight">{d.day}</span>
          <span className="eyebrow mt-1 text-[10px]">{d.month}</span>
        </div>
        <div className="absolute right-4 top-4 flex gap-2">
          <span className="glass-dark rounded-full px-3 py-1.5 text-xs text-white">{e.category}</span>
        </div>
        <div className="absolute inset-x-4 bottom-4 text-white">
          {e.status === "upcoming" && (
            <div className="mb-3 flex items-center gap-2 text-xs">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-white/80">{soldOut ? "Sold out" : pct > 80 ? "Selling fast" : `${pct}% sold`}</span>
            </div>
          )}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[22px] font-medium leading-tight tracking-[-0.03em] md:text-2xl">{e.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-white/70">
                <MapPin className="h-3.5 w-3.5" /> {e.venue}, {e.city}
              </p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-dark transition-all duration-500 group-hover:rotate-45 group-hover:bg-accent group-hover:text-white">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>
      <div className={cn("mt-3 flex items-center justify-between px-1 text-sm", dark ? "text-white/60" : "text-muted")}>
        <span>
          {d.weekday}, {e.time}
        </span>
        <span>
          {e.status === "past" ? "Past event" : <>From <b className={dark ? "text-white" : "text-ink"}>{inr(minPrice(e.tickets))}</b></>}
        </span>
      </div>
    </Link>
  );
}
