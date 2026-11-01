"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSite } from "./SiteProvider";
import { cn } from "@/lib/utils";

export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_IO = [0.76, 0, 0.24, 1] as const;

/** Fade + rise when entering viewport */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "span";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/** Masked line-by-line text reveal. Pass lines as array. */
export function SplitLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  waitForIntro = false,
  inView = true,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  waitForIntro?: boolean;
  inView?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });
  const { introDone } = useSite();
  const go = (inView ? seen : true) && (!waitForIntro || introDone);
  return (
    <div ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={cn("block will-change-transform", lineClassName)}
            initial={{ y: "110%", rotate: 2 }}
            animate={go ? { y: "0%", rotate: 0 } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * stagger }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

/** Apple-style paragraph whose words light up as you scroll */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] mt-[0.05em]">
      {children}
    </motion.span>
  );
}

/** Animated number counter */
export function Counter({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 2.2, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className={className}>
      {n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/** Element that gently follows the pointer */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Image with scroll parallax inside an overflow-hidden frame */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  amount = 12,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ y, scale: 1 + amount / 50 }}
        className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}

/** Image that unveils with a clip-path wipe on enter */
export function ClipImage({ src, alt, className, delay = 0 }: { src: string; alt: string; className?: string; delay?: number }) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial={{ clipPath: "inset(100% 0% 0% 0% round 24px)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 24px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.3, ease: EASE_IO, delay }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.3 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.6, ease: EASE, delay }}
      />
    </motion.div>
  );
}

/** Infinite marquee whose direction follows scroll direction */
export function Marquee({ children, speed = 40, className, reverse = false }: { children: ReactNode; speed?: number; className?: string; reverse?: boolean }) {
  const { scrollY } = useScroll();
  const [dir, setDir] = useState<1 | -1>(1);
  useEffect(() => {
    let last = 0;
    return scrollY.on("change", (v) => {
      if (Math.abs(v - last) < 4) return;
      setDir(v > last ? 1 : -1);
      last = v;
    });
  }, [scrollY]);
  return (
    <div className={cn("flex overflow-hidden", className)}>
      <div
        className="flex shrink-0 whitespace-nowrap"
        style={{ animation: `marquee ${speed}s linear infinite`, animationDirection: (dir === 1) !== reverse ? "normal" : "reverse" }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SectionLabel({ index, children, className }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("eyebrow flex items-center gap-2 text-muted", className)}>
      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 ring-1 ring-current/20">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        {children}
      </span>
      {index && <span className="font-display text-[13px] font-bold tracking-normal opacity-60">({index})</span>}
    </div>
  );
}
