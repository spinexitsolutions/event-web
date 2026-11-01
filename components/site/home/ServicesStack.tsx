"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Service } from "@/lib/types";
import { CursorPreview, SectionHead } from "../Editorial";
import { EASE } from "../motion";
import { cn, inr } from "@/lib/utils";

/** (02) Services — a typographic index. Hover a row, the work appears at the cursor. */
export function ServicesStack({ services }: { services: Service[] }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section className="container-x py-24 md:py-36">
      <CursorPreview src={hover !== null ? services[hover]?.image : null} />
      <SectionHead index="02" title="Services" note="Five disciplines, one team" />
      <ul className="mt-10 md:mt-16" onMouseLeave={() => setHover(null)}>
        {services.map((s, i) => (
          <motion.li
            key={s.id}
            id={s.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.9, ease: EASE, delay: i * 0.06 }}
            onMouseEnter={() => setHover(i)}
            className="scroll-mt-24"
          >
            <Link
              href={`/services#${s.slug}`}
              className={cn("grid-12 items-center gap-y-3 border-b hairline py-5 transition-opacity duration-500 md:py-7", hover !== null && hover !== i && "md:opacity-30")}
            >
              <span className="meta col-span-2 text-muted md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <span className="col-span-7 text-[clamp(2rem,5.6vw,5.25rem)] leading-[0.95] tracking-[-0.055em] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] md:col-span-6 md:group-hover:translate-x-4">
                <span className={cn("inline-block transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)]", hover === i && "md:translate-x-4")}>{s.title}</span>
              </span>
              <img src={s.image.replace("w=1600", "w=300")} alt="" className="col-span-3 aspect-square w-full object-cover md:hidden" />
              <span className="meta col-span-12 text-muted md:col-span-3 md:col-start-8">{s.short}</span>
              <span className="meta col-span-12 text-muted md:col-span-2 md:text-right">from {inr(s.startingPrice, true)}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
