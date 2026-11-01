"use client";

import Link from "next/link";
import type { EventItem } from "@/lib/types";
import { cn, dateParts, inr, minPrice, soldPct } from "@/lib/utils";
import {
  Briefcase, Cake, Heart, Music, Sparkles, Mic, Camera, Utensils, PartyPopper, Gem, Flower2, Megaphone, Palette, Building2, Globe, Star,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = { Briefcase, Cake, Heart, Music, Sparkles, Mic, Camera, Utensils, PartyPopper, Gem, Flower2, Megaphone, Palette, Building2, Globe, Star };
export function Icon({ name, className }: { name: string; className?: string }) {
  const I = ICONS[name] || Sparkles;
  return <I className={className} strokeWidth={1.5} />;
}

export function EventCard({ e, className, dark = false }: { e: EventItem; className?: string; dark?: boolean }) {
  const d = dateParts(e.date);
  const pct = soldPct(e.tickets);
  const soldOut = e.tickets.every((t) => t.sold >= t.capacity);
  const muted = dark ? "text-white/55" : "text-muted";
  return (
    <Link href={`/events/${e.slug}`} className={cn("group block", className)} data-cursor="View">
      <div className="relative aspect-[4/5] overflow-hidden bg-ink">
        <img src={e.image} alt={e.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
      </div>
      <div className={cn("meta mt-3 flex justify-between", muted)}>
        <span className={dark ? "text-white" : "text-ink"}>
          {d.weekday} {d.day} {d.month}
        </span>
        <span>{e.category}</span>
      </div>
      <h3 className="mt-1.5 text-[clamp(1.35rem,1.8vw,1.6rem)] leading-tight tracking-[-0.035em]">{e.title}</h3>
      <p className={cn("meta mt-1", muted)}>
        {e.venue}, {e.city}
      </p>
      <div className={cn("meta mt-4 flex items-center justify-between border-t pt-3", dark ? "border-white/15" : "hairline", muted)}>
        <span>{e.status === "past" ? "Past event" : `From ${inr(minPrice(e.tickets))}`}</span>
        {e.status === "upcoming" && <span className={pct > 80 && !soldOut ? "text-accent" : ""}>{soldOut ? "Sold out" : pct > 80 ? "Few left" : `${pct}% sold`}</span>}
      </div>
    </Link>
  );
}
