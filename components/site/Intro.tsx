"use client";

import { AnimatePresence, animate, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSite } from "./SiteProvider";
import { EASE, EASE_IO } from "./motion";

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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
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
        setTimeout(() => setShow(false), 250);
      },
    });
    const step = duration / words.length;
    const t = setInterval(() => setWordIdx((i) => Math.min(i + 1, words.length - 1)), step);
    return () => {
      ctrl.stop();
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence onExitComplete={() => setIntroDone(true)}>
      {show && !introDone && (
        <motion.div key="intro" className="fixed inset-0 z-[100]" aria-hidden>
          {/* accent under-layer revealed during exit */}
          <motion.div
            className="absolute inset-0 bg-accent"
            exit={{ y: "-100%", borderBottomLeftRadius: "50% 12vh", borderBottomRightRadius: "50% 12vh" }}
            transition={{ duration: 1.1, ease: EASE_IO, delay: 0.12 }}
          />
          <motion.div
            className="grain absolute inset-0 overflow-hidden bg-dark text-white"
            exit={{ y: "-100%", borderBottomLeftRadius: "50% 12vh", borderBottomRightRadius: "50% 12vh" }}
            transition={{ duration: 1, ease: EASE_IO }}
          >
            {intro.style === "counter" && <CounterStyle count={count} word={words[wordIdx]} wordKey={wordIdx} brand={brand.name} tagline={brand.tagline} />}
            {intro.style === "words" && <WordsStyle word={words[wordIdx]} wordKey={wordIdx} count={count} />}
            {intro.style === "logo" && <LogoStyle brand={brand.name} count={count} tagline={brand.tagline} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CounterStyle({ count, word, wordKey, brand, tagline }: { count: number; word: string; wordKey: number; brand: string; tagline: string }) {
  return (
    <div className="flex h-full flex-col justify-between p-5 md:p-10">
      <div className="flex items-center justify-between">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-semibold tracking-tight">
          {brand}
          <span className="text-accent">.</span>
        </motion.span>
        <span className="eyebrow text-white/50">Loading experience</span>
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <div className="pointer-events-none absolute h-[46vmin] w-[46vmin] rounded-full bg-accent/25 blur-[90px]" />
        <div className="relative h-[1.1em] overflow-hidden text-[clamp(3rem,11vw,9rem)] leading-none">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={wordKey}
              className="serif-accent block"
              initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-100%", opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              {word}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-end justify-between gap-6">
        <div className="display font-medium tabular-nums text-[clamp(5rem,22vw,17rem)] leading-[0.8]">
          {String(count).padStart(3, "0")}
        </div>
        <span className="eyebrow mb-3 hidden text-white/60 md:block">{tagline}</span>
      </div>
      <div className="mt-5 h-px w-full bg-white/15">
        <div className="h-px bg-accent transition-[width] duration-100" style={{ width: `${count}%` }} />
      </div>
    </div>
  );
}

function WordsStyle({ word, wordKey, count }: { word: string; wordKey: number; count: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="relative h-[1.05em] overflow-hidden text-[clamp(3.5rem,14vw,12rem)] font-medium leading-none tracking-[-0.05em]">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={wordKey}
            className="block"
            initial={{ y: "105%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-105%" }}
            transition={{ duration: 0.65, ease: EASE_IO }}
          >
            {word}
            <span className="text-accent">.</span>
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="absolute bottom-10 left-1/2 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-white/15">
        <div className="h-1 bg-accent" style={{ width: `${count}%` }} />
      </div>
    </div>
  );
}

function LogoStyle({ brand, count, tagline }: { brand: string; count: number; tagline: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="flex overflow-hidden text-[clamp(4.5rem,20vw,16rem)] font-semibold leading-none tracking-[-0.06em]">
        {brand.split("").map((ch, i) => (
          <motion.span
            key={i}
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, ease: EASE, delay: 0.1 + i * 0.07 }}
          >
            {ch}
          </motion.span>
        ))}
        <motion.span
          className="text-accent"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 + brand.length * 0.07 }}
        >
          .
        </motion.span>
      </div>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.6, y: 0 }} transition={{ delay: 0.8 }} className="eyebrow">
        {tagline} — {count}%
      </motion.p>
    </div>
  );
}
