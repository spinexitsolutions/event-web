"use client";

import { motion } from "framer-motion";
import { EASE, SectionLabel, SplitLines } from "./motion";
import type { ReactNode } from "react";

export function PageHeader({ label, title, accent, text, children }: { label: string; title: string; accent?: string; text?: string; children?: ReactNode }) {
  return (
    <header className="container-x pb-10 pt-12 md:pb-16 md:pt-40">
      <SectionLabel>{label}</SectionLabel>
      <h1 className="mt-6 text-[clamp(3rem,10vw,9.5rem)]">
        <SplitLines inView={false} waitForIntro delay={0.3} lineClassName="display" lines={accent ? [title, <span key="a" className="accent-word text-accent">{accent}</span>] : [title]} />
      </h1>
      <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        {text && (
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.6 }} className="max-w-lg text-lg text-muted">
            {text}
          </motion.p>
        )}
        {children}
      </div>
    </header>
  );
}
