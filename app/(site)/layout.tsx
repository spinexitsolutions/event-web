import { getDb } from "@/lib/db";
import { SiteProvider } from "@/components/site/SiteProvider";
import { Navbar } from "@/components/site/Navbar";
import { Intro } from "@/components/site/Intro";
import { Cursor } from "@/components/site/Cursor";
import { Footer } from "@/components/site/Footer";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const db = getDb();
  const { settings } = db;
  const t = settings.theme;
  const css = `:root{--accent:${t.accent};--accent-soft:${t.accentSoft};--bg:${t.background};--ink:${t.ink};--dark:${t.dark};--radius:${t.radius}px}`;
  return (
    <SiteProvider settings={settings}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Intro />
      {t.cursor && <Cursor />}
      <Navbar />
      <main className="relative">{children}</main>
      <Footer services={db.services.map((s) => ({ title: s.title, slug: s.slug }))} />
    </SiteProvider>
  );
}
