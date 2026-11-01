import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow text-muted">Error 404</p>
      <h1 className="display mt-6 text-[clamp(4rem,16vw,14rem)]">
        Lost<span className="accent-word text-accent">?</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-muted">This page left the party early. Let&apos;s get you back to where the music is.</p>
      <Link href="/" className="mt-10 rounded-full bg-ink px-6 py-4 text-bg transition hover:bg-accent">Back to home</Link>
    </section>
  );
}
