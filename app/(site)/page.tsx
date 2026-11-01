import { getDb } from "@/lib/db";
import { Hero } from "@/components/site/home/Hero";
import { ServicesStack } from "@/components/site/home/ServicesStack";
import { EventsRail } from "@/components/site/home/EventsRail";
import { Cta, FaqList, GalleryParallax, JournalTeaser, MarqueeStrip, Packages, Process, Statement, Team, Testimonials } from "@/components/site/home/Sections";
import type { HomeSectionId } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function Home() {
  const db = getDb();
  const upcoming = db.events.filter((e) => e.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const featured = upcoming.filter((e) => e.featured);
  const map: Record<HomeSectionId, React.ReactNode> = {
    hero: <Hero next={upcoming[0]} />,
    marquee: <MarqueeStrip />,
    statement: <Statement />,
    services: <ServicesStack services={db.services} />,
    events: <EventsRail events={featured.length ? featured : upcoming} />,
    process: <Process />,
    gallery: <GalleryParallax items={db.gallery} />,
    testimonials: <Testimonials items={db.testimonials} />,
    packages: <Packages items={db.packages} />,
    team: <Team items={db.team} />,
    journal: <JournalTeaser posts={db.posts.filter((p) => p.published).slice(0, 3)} />,
    faq: <FaqList items={db.faqs} />,
    cta: <Cta />,
  };
  return (
    <>
      {db.settings.sections
        .filter((s) => s.enabled)
        .map((s) => (
          <div key={s.id} data-section={s.id}>
            {map[s.id]}
          </div>
        ))}
    </>
  );
}
