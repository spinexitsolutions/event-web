"use client";

import { AnimatePresence, animate, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSite } from "./SiteProvider";
import { EASE } from "./motion";

/** Minimal preloader — admin chooses counter / words / logo. */
export function Intro() {
  const { settings, introDone, setIntroDone } = useSite();
  const { intro, brand } = settings;
  const [show, setShow] = useState(intro.enabled);
  const [count, setCount] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const words = intro.words.length ? intro.words : [brand.name];
  const duration = Math.max(1200, Math.min(8000, intro.duration));

  useEffect(() => {
    if (!intro.enabled) return;
    let seen = false;
    try {
      seen = intro.oncePerSession && sessionStorage.getItem("lume-intro") === "1";
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow(false);
      setIntroDone(true);
      return;
    }
    const ctrl = animate(0, 100, {
      duration: duration / 1000,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        try {
          sessionStorage.setItem("lume-intro", "1");
        } catch {}
        setTimeout(() => setShow(false), 200);
      },
    });
    const t = setInterval(() => setWordIdx((i) => Math.min(i + 1, words.length - 1)), duration / words.length);
    return () => {
      ctrl.stop();
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence onExitComplete={() => setIntroDone(true)}>
      {show && !introDone && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] bg-ink text-bg"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <div className="container-x flex h-full flex-col justify-between py-5">
            <div className="grid-12 meta text-white/50">
              <span className="col-span-6 text-white">{brand.name}®</span>
              <span className="col-span-6 text-right">{brand.tagline}</span>
            </div>

            {intro.style === "logo" ? (
              <div className="flex overflow-hidden text-[clamp(5rem,24vw,22rem)] font-light leading-none tracking-[-0.08em]">
                {brand.name.split("").map((ch, i) => (
                  <motion.span key={i} initial={{ y: "100%" }} animate={{ y: "0%" }} transition={{ duration: 1, ease: EASE, delay: 0.1 + i * 0.06 }}>
                    {ch}
                  </motion.span>
                ))}
              </div>
            ) : (
              <div className="relative h-[1.1em] overflow-hidden text-[clamp(2.6rem,8vw,7rem)] leading-none tracking-[-0.05em]">
                <AnimatePresence mode="popLayout">
                  <motion.span key={wordIdx} className="block" initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }} transition={{ duration: 0.7, ease: EASE }}>
                    {words[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}

            <div>
              <div className="flex items-end justify-between">
                {intro.style === "counter" ? (
                  <span className="text-[clamp(4rem,14vw,12rem)] font-light leading-[0.8] tracking-[-0.07em] tabular-nums">{count}</span>
                ) : (
                  <span className="meta text-white/50">Loading</span>
                )}
                <span className="meta tabular-nums text-white/50">{count}%</span>
              </div>
              <div className="mt-4 h-px bg-white/15">
                <div className="h-px bg-white" style={{ width: `${count}%` }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
