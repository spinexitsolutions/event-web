import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { PostCard } from "@/components/site/home/Sections";
import { Reveal } from "@/components/site/motion";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Journal" };

export default function JournalPage() {
  const posts = getDb().posts.filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date));
  const [lead, ...rest] = posts;
  return (
    <>
      <PageHeader label="Journal" title="Notes from" accent="backstage." text="Guides, behind-the-scenes and ideas from the people who build events for a living." />
      {lead && (
        <section className="container-x pb-16">
          <Link href={`/journal/${lead.slug}`} className="group grid overflow-hidden rounded-[var(--radius)] bg-dark text-white md:grid-cols-2" data-cursor="Read">
            <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
              <img src={lead.cover} alt={lead.title} className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-between gap-10 p-7 md:p-12">
              <span className="eyebrow text-white/50">Featured · {lead.tags.join(" / ")}</span>
              <div>
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1] tracking-[-0.04em]">{lead.title}</h2>
                <p className="mt-5 text-white/65">{lead.excerpt}</p>
                <p className="mt-8 text-sm text-white/50">{fmtDate(lead.date)} · {lead.author}</p>
              </div>
            </div>
          </Link>
        </section>
      )}
      <section className="container-x grid gap-10 pb-24 md:grid-cols-3 md:gap-5">
        {rest.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <PostCard p={p} />
          </Reveal>
        ))}
      </section>
    </>
  );
}
