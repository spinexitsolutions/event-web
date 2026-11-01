"use client";

import { motion } from "framer-motion";
import { EASE, EASE_IO } from "./motion";

/** Mounted fresh on every navigation via app/(site)/template.tsx */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[90] bg-ink"
        initial={{ clipPath: "inset(0 0 0% 0)" }}
        animate={{ clipPath: "inset(0 0 100% 0)" }}
        transition={{ duration: 0.7, ease: EASE_IO }}
        aria-hidden
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}>
        {children}
      </motion.div>
    </>
  );
}
