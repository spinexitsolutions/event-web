"use client";

import { motion } from "framer-motion";
import { ClipImage, EASE, SplitLines } from "./motion";
import type { ReactNode } from "react";

type Props = {
  label: string;
  title: string;
  accent?: string;
  text?: string;
  children?: ReactNode;
  /** default: editorial left · center: condensed poster · split: title + image · wide: Unbounded type on dark */
  variant?: "default" | "center" | "split" | "wide";
  image?: string;
};

const Label = ({ children, dark }: { children: ReactNode; dark?: boolean }) => (
  <p className={`flex items-center gap-2 text-[13px] font-semibold ${dark ? "text-white/60" : "text-muted"}`}>
    <span className="h-2 w-2 rounded-full bg-accent" /> {children}
  </p>
);

const fade = (d: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, ease: EASE, delay: d } });

export function PageHeader({ label, title, accent, text, children, variant = "default", image }: Props) {
  if (variant === "center")
    return (
      <header className="container-x pb-12 pt-14 text-center md:pb-20 md:pt-40">
        <div className="flex justify-center">
          <Label>{label}</Label>
        </div>
        <h1 className="condensed mt-6 text-[clamp(4.5rem,17vw,17rem)]">
          <SplitLines inView={false} waitForIntro delay={0.3} lines={accent ? [title, <span key="a" className="text-outline">{accent}</span>] : [title]} />
        </h1>
        {text && (
          <motion.p {...fade(0.6)} className="mx-auto mt-8 max-w-xl text-lg text-muted">
            {text}
          </motion.p>
        )}
        {children && <div className="mt-8 flex justify-center">{children}</div>}
      </header>
    );

  if (variant === "split")
    return (
      <header className="container-x grid gap-10 pb-14 pt-12 md:grid-cols-12 md:items-end md:pb-20 md:pt-36">
        <div className="md:col-span-7">
          <Label>{label}</Label>
          <h1 className="mt-6 text-[clamp(3rem,8vw,7.5rem)]">
            <SplitLines inView={false} waitForIntro delay={0.3} lineClassName="display" lines={accent ? [title, <span key="a" className="accent-word text-accent">{accent}</span>] : [title]} />
          </h1>
          {text && (
            <motion.p {...fade(0.6)} className="mt-8 max-w-lg text-lg text-muted">
              {text}
            </motion.p>
          )}
          {children}
        </div>
        {image && <ClipImage src={image} alt="" delay={0.3} className="aspect-[4/5] w-full rounded-[var(--radius)] md:col-span-5 md:aspect-[4/4.6]" />}
      </header>
    );

  if (variant === "wide")
    return (
      <div className="px-3 pt-3 md:px-5 md:pt-24">
        <header className="grain relative overflow-hidden rounded-[clamp(28px,4vw,48px)] bg-dark px-6 pb-12 pt-14 text-white md:px-14 md:pb-16 md:pt-20">
          <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-accent/40 blur-[110px]" />
          <Label dark>{label}</Label>
          <h1 className="mt-6 font-wide text-[clamp(2.6rem,7.5vw,7rem)] font-bold leading-[0.95] tracking-[-0.06em]">
            <SplitLines inView={false} waitForIntro delay={0.3} lines={accent ? [title, <span key="a" className="text-pop">{accent}</span>] : [title]} />
          </h1>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {text && (
              <motion.p {...fade(0.6)} className="max-w-lg text-lg text-white/65">
                {text}
              </motion.p>
            )}
            {children}
          </div>
        </header>
      </div>
    );

  return (
    <header className="container-x pb-10 pt-12 md:pb-16 md:pt-40">
      <Label>{label}</Label>
      <h1 className="mt-6 text-[clamp(3rem,10vw,9.5rem)]">
        <SplitLines inView={false} waitForIntro delay={0.3} lineClassName="display" lines={accent ? [title, <span key="a" className="accent-word text-accent">{accent}</span>] : [title]} />
      </h1>
      <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        {text && (
          <motion.p {...fade(0.6)} className="max-w-lg text-lg text-muted">
            {text}
          </motion.p>
        )}
        {children}
      </div>
    </header>
  );
}
