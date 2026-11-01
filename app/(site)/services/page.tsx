import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { getDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { Icon } from "@/components/site/EventCard";
import { ClipImage, Reveal } from "@/components/site/motion";
import { FaqList, Packages, Process } from "@/components/site/home/Sections";
import { inr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  const db = getDb();
  return (
    <>
      <PageHeader variant="split" image={db.services[0]?.image} label="Services" title="One studio." accent="Every format." text="Specialist teams for weddings, corporate, live music, launches and private celebrations — sharing one design language and one obsession with detail." />
      <section className="container-x pb-12">
        {db.services.map((s, i) => (
          <article id={s.slug} key={s.id} className="grid scroll-mt-28 gap-8 border-t border-line py-14 md:grid-cols-12 md:gap-10 md:py-20">
            <div className={`md:col-span-6 ${i % 2 ? "md:order-2" : ""}`}>
              <ClipImage src={s.image} alt={s.title} className="aspect-[4/3] w-full rounded-[var(--radius)]" />
            </div>
            <div className="flex flex-col justify-center md:col-span-5 md:col-start-auto">
              <Reveal>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent">
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  <span className="eyebrow text-muted">0{i + 1}</span>
                </div>
                <h2 className="mt-6 text-[clamp(2.25rem,4.5vw,4rem)] font-medium leading-[0.95] tracking-[-0.045em]">{s.title}</h2>
                <p className="mt-5 text-lg text-muted">{s.description}</p>
                <ul className="mt-6 grid grid-cols-2 gap-3 text-[15px]">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex items-center gap-5">
                  <Link href={`/contact?type=${encodeURIComponent(s.title)}`} className="group flex h-12 items-center gap-2 rounded-full bg-ink pl-5 pr-1.5 text-sm font-medium text-bg">
                    Plan this <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white transition group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span>
                  </Link>
                  <span className="text-sm text-muted">From <b className="text-ink">{inr(s.startingPrice, true)}</b></span>
                </div>
              </Reveal>
            </div>
          </article>
        ))}
      </section>
      <Process images={db.services.map((s) => s.image)} />
      <Packages items={db.packages} />
      <FaqList items={db.faqs} />
    </>
  );
}
