"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useSite } from "./SiteProvider";
import { EASE } from "./motion";

type Props = {
  label: string;
  title: string;
  accent?: string;
  text?: string;
  children?: ReactNode;
  variant?: string;
  image?: string;
};

/** Editorial page opener: meta rule, a sentence-sized title, intro paragraph, optional figure. */
export function PageHeader({ label, title, accent, text, children, image }: Props) {
  const { introDone } = useSite();
  const words = `${title}${accent ? " " + accent : ""}`.split(" ");
  const titleCount = title.split(" ").length;
  return (
    <header className="container-x pb-12 pt-20 md:pb-20 md:pt-24">
      <div className="grid-12 meta border-b hairline pb-3 text-muted">
        <span className="col-span-6 text-ink md:col-span-3">{label}</span>
        <span className="col-span-6 text-right md:col-span-9">(Index)</span>
      </div>
      <div className="grid-12 mt-10 gap-y-8 md:mt-14">
        <h1 className="col-span-12 text-[clamp(2.8rem,8vw,8rem)] leading-[0.95] tracking-[-0.055em] md:col-span-9">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-top">
              <motion.span
                className={`inline-block ${i >= titleCount ? "text-muted" : ""}`}
                initial={{ y: "105%" }}
                animate={introDone ? { y: "0%" } : {}}
                transition={{ duration: 1, ease: EASE, delay: 0.2 + i * 0.05 }}
              >
                {w.replace(/[.]$/, "")}
                {i < words.length - 1 ? " " : ""}
              </motion.span>
            </span>
          ))}
        </h1>
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={introDone ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="col-span-12 max-w-sm self-end text-[15px] leading-relaxed text-muted md:col-span-3"
          >
            {text}
          </motion.p>
        )}
      </div>
      {children && <div className="mt-8">{children}</div>}
      {image && (
        <motion.div
          initial={{ clipPath: "inset(10% 0 0 0)", opacity: 0 }}
          animate={introDone ? { clipPath: "inset(0% 0 0 0)", opacity: 1 } : {}}
          transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1], delay: 0.4 }}
          className="mt-12 aspect-[16/9] overflow-hidden bg-ink md:mt-16 md:aspect-[21/8]"
        >
          <img src={image} alt="" className="h-full w-full object-cover" />
        </motion.div>
      )}
    </header>
  );
}
