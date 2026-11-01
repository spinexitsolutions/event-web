import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { Planner } from "@/components/site/Planner";
import { FaqList } from "@/components/site/home/Sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Plan an event" };

export default function ContactPage() {
  const db = getDb();
  const b = db.settings.brand;
  const cards = [
    { icon: Mail, label: "Email", value: b.email, href: `mailto:${b.email}` },
    { icon: Phone, label: "Call", value: b.phone, href: `tel:${b.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with a producer", href: `https://wa.me/${b.whatsapp}` },
    { icon: MapPin, label: "Studio", value: `${b.address}, ${b.city}`, href: `https://maps.google.com/?q=${encodeURIComponent(b.address + " " + b.city)}` },
  ];
  return (
    <>
      <PageHeader variant="wide" label="Plan an event" title="Tell us" accent="the dream." text="Four quick questions. A real producer — not a bot — replies within 24 hours with first ideas and a rough budget." />
      <section className="container-x grid gap-10 pb-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <Suspense fallback={<div className="h-[560px] rounded-[var(--radius)] bg-white ring-1 ring-line" />}>
            <Planner services={db.services.map((s) => s.title)} />
          </Suspense>
        </div>
        <div className="space-y-3 md:col-span-5">
          {cards.map(({ icon: I, label, value, href }) => (
            <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-4 rounded-[4px] bg-white p-5 ring-1 ring-line transition hover:ring-ink/30">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[4px] bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-white">
                <I className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="eyebrow block text-muted">{label}</span>
                <span className="mt-0.5 block truncate font-medium">{value}</span>
              </span>
            </a>
          ))}
          <div className="flex items-center gap-3 rounded-[4px] bg-dark p-5 text-white">
            <Clock className="h-5 w-5 text-accent" />
            <span className="text-sm">{b.hours}</span>
          </div>
          <div className="overflow-hidden rounded-[4px] ring-1 ring-line">
            <iframe title="Studio map" loading="lazy" className="h-64 w-full grayscale" src={`https://maps.google.com/maps?q=${encodeURIComponent(b.address + ", " + b.city)}&z=15&output=embed`} />
          </div>
        </div>
      </section>
      <FaqList items={db.faqs} />
    </>
  );
}
