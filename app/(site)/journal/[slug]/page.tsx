import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/lib/db";
import { ParallaxImage, SplitLines } from "@/components/site/motion";
import { PostCard } from "@/components/site/home/Sections";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const p = getDb().posts.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.excerpt } : {};
}

export default async function PostPage({ params }: P) {
  const { slug } = await params;
  const db = getDb();
  const p = db.posts.find((x) => x.slug === slug && x.published);
  if (!p) notFound();
  const more = db.posts.filter((x) => x.id !== p.id && x.published).slice(0, 3);
  return (
    <article>
      <header className="container-x max-w-5xl pb-10 pt-10 md:pt-40">
        <Link href="/journal" className="flex w-fit items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Journal
        </Link>
        <p className="eyebrow mt-10 text-accent">{p.tags.join(" · ")}</p>
        <h1 className="mt-5 text-[clamp(2.4rem,6vw,5.5rem)]">
          <SplitLines inView={false} waitForIntro delay={0.3} lineClassName="display !leading-[1]" lines={[p.title]} />
        </h1>
        <p className="mt-8 text-muted">{fmtDate(p.date, { dateStyle: "long" })} · By {p.author} · {Math.max(2, Math.round(p.body.split(" ").length / 200))} min read</p>
      </header>
      <div className="container-x">
        <ParallaxImage src={p.cover} alt={p.title} className="aspect-[16/10] w-full rounded-[var(--radius)] md:aspect-[21/9]" />
      </div>
      <div className="prose-lume container-x max-w-3xl py-16 md:py-24">
        <p className="!text-[1.35rem] !leading-relaxed !text-ink">{p.excerpt}</p>
        {renderBody(p.body)}
      </div>
      {more.length > 0 && (
        <section className="container-x border-t border-line py-20">
          <h2 className="text-3xl font-medium tracking-[-0.04em]">Keep reading</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-5">
            {more.map((m) => <PostCard key={m.id} p={m} />)}
          </div>
        </section>
      )}
    </article>
  );
}

function renderBody(body: string) {
  return body.split("\n\n").flatMap((block, i) => {
    if (!block.startsWith("## ")) return [<p key={i}>{block}</p>];
    const [h, ...rest] = block.split("\n");
    return [<h2 key={i}>{h.slice(3)}</h2>, ...(rest.length ? [<p key={`${i}p`}>{rest.join(" ")}</p>] : [])];
  });
}
