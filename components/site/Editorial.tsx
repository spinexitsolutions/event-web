"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE } from "./motion";

/** Section header row: "(02)  Services ———— right note" on a hairline */
export function SectionHead({ index, title, note, className, dark }: { index: string; title: string; note?: ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={cn("grid-12 items-baseline border-t pt-4 meta", dark ? "border-white/15 text-white/60" : "hairline text-muted", className)}>
      <span className="col-span-2 md:col-span-1">({index})</span>
      <span className={cn("col-span-6 md:col-span-5", dark ? "text-white" : "text-ink")}>{title}</span>
      {note && <span className="col-span-4 text-right md:col-span-6">{note}</span>}
    </div>
  );
}

/** Words that fade up one after another when in view */
export function Words({ text, className, delay = 0, play }: { text: string; className?: string; delay?: number; play?: boolean }) {
  const words = text.split(" ");
  const anim = (i: number) => ({
    initial: { opacity: 0, y: "0.35em" },
    transition: { duration: 0.9, ease: EASE, delay: delay + i * 0.035 },
  });
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          {...anim(i)}
          {...(play === undefined ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-40px" } } : { animate: play ? { opacity: 1, y: 0 } : undefined })}
        >
          {w}
          {i < words.length - 1 && " "}
        </motion.span>
      ))}
    </span>
  );
}

/** A small image that follows the cursor while `src` is set (desktop only) */
export function CursorPreview({ src, w = 280, h = 360 }: { src: string | null; w?: number; h?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });
  const [fine, setFine] = useState(false);
  useEffect(() => {
    setFine(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    const m = (e: PointerEvent) => {
      x.set(e.clientX + 24);
      y.set(e.clientY - h / 2);
    };
    window.addEventListener("pointermove", m);
    return () => window.removeEventListener("pointermove", m);
  }, [x, y, h]);
  if (!fine) return null;
  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-50" style={{ x: sx, y: sy, width: w, height: h }} aria-hidden>
      <AnimatePresence>
        {src && (
          <motion.img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, clipPath: "inset(50% 0 50% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0% 0 0% 0)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Text link with arrow, underline animates away on hover */
export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={cn("group inline-flex items-baseline gap-2", className)}>
      <span className="link-underline">{children}</span>
      <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
    </a>
  );
}
