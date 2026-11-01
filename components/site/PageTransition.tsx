"use client";

import { motion } from "framer-motion";
import { EASE, EASE_IO } from "./motion";

/** Mounted fresh on every navigation via app/(site)/template.tsx */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[90] origin-top bg-dark"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.8, ease: EASE_IO }}
        style={{ borderBottomLeftRadius: "50% 8vh", borderBottomRightRadius: "50% 8vh" }}
        aria-hidden
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}>
        {children}
      </motion.div>
    </>
  );
}
