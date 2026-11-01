import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { ParallaxImage, Reveal, ScrollWords, SectionLabel } from "@/components/site/motion";
import { Cta, MarqueeStrip, Statement, Team, Testimonials } from "@/components/site/home/Sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const db = getDb();
  const a = db.settings.about;
  return (
    <>
      <PageHeader label="About the studio" title="Obsessed with" accent="the details." text={a.heading} />
      <div className="container-x">
        <ParallaxImage src={a.image} alt="Lumé studio" className="aspect-[4/5] w-full rounded-[var(--radius)] md:aspect-[21/9]" amount={14} />
      </div>
      <section className="container-x grid gap-10 py-20 md:grid-cols-12 md:py-32">
        <div className="md:col-span-4">
          <SectionLabel>Our story</SectionLabel>
        </div>
        <div className="md:col-span-8">
          <ScrollWords text={a.body} className="text-[clamp(1.5rem,3vw,2.6rem)] font-medium leading-[1.15] tracking-[-0.03em]" />
        </div>
      </section>
      <section className="container-x grid gap-4 pb-12 md:grid-cols-3">
        {a.values.map((v, i) => (
          <Reveal key={v.title} delay={i * 0.1} className="rounded-[var(--radius)] bg-white p-8 ring-1 ring-line">
            <span className="accent-word text-5xl text-accent">0{i + 1}</span>
            <h3 className="mt-8 text-2xl font-medium tracking-tight">{v.title}</h3>
            <p className="mt-3 text-muted">{v.text}</p>
          </Reveal>
        ))}
      </section>
      <Statement />
      <MarqueeStrip />
      <Team items={db.team} />
      <Testimonials items={db.testimonials} />
      <Cta />
    </>
  );
}
