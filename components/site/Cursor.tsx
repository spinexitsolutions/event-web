"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });
  const [label, setLabel] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement;
      const c = t.closest<HTMLElement>("[data-cursor]");
      setLabel(c?.dataset.cursor || null);
      setHover(!!t.closest("a,button,[role=button],input,textarea,select,label"));
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
    };
  }, [x, y]);

  if (!enabled) return null;
  const size = label ? 96 : hover ? 44 : 12;
  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[200] hidden md:block"
      style={{ x: sx, y: sy }}
      aria-hidden
    >
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[12px] font-medium text-white"
        animate={{
          width: size,
          height: size,
          scale: down ? 0.85 : 1,
          backgroundColor: label ? "var(--accent)" : hover ? "rgba(255,255,255,1)" : "var(--accent)",
          mixBlendMode: label ? "normal" : hover ? "difference" : "normal",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {label && (
          <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}>
            {label}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}
