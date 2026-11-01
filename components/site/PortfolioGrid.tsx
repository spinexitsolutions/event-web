"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EASE } from "./motion";

export function PortfolioGrid({ items }: { items: GalleryItem[] }) {
  const cats = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const list = items.filter((i) => cat === "All" || i.category === cat);

  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % list.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + list.length) % list.length));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, list.length]);

  return (
    <section className="container-x pb-24 md:pb-36">
      <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("relative shrink-0 rounded-[3px] px-5 py-2.5 text-sm ring-1 transition", cat === c ? "bg-ink text-bg ring-ink" : "ring-line hover:ring-ink/40")}>
            {c}
            <span className="ml-2 text-xs opacity-50">{c === "All" ? items.length : items.filter((i) => i.category === c).length}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="columns-2 gap-3 md:columns-3 md:gap-5 [&>*]:mb-3 md:[&>*]:mb-5">
        <AnimatePresence mode="popLayout">
          {list.map((g, i) => (
            <motion.button
              layout
              key={g.id}
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: EASE, delay: (i % 6) * 0.05 }}
              className="group relative block w-full break-inside-avoid overflow-hidden rounded-[calc(var(--radius)-8px)] text-left"
              data-cursor="Open"
            >
              <img src={g.image} alt={g.title} loading="lazy" className={cn("w-full object-cover transition duration-1000 group-hover:scale-105", g.shape === "tall" ? "aspect-[3/4]" : g.shape === "wide" ? "aspect-[4/3]" : "aspect-square")} />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="p-4 text-white">
                  <p className="font-medium">{g.title}</p>
                  <p className="text-xs text-white/70">{g.category}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {open !== null && list[open] && (
          <motion.div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <AnimatePresence mode="wait">
              <motion.figure
                key={list[open].id}
                initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="relative max-h-[85vh] max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={list[open].image.replace("w=1200", "w=2000")} alt={list[open].title} className="max-h-[78vh] w-auto rounded-[4px] object-contain" />
                <figcaption className="mt-4 flex items-center justify-between text-white">
                  <span className="font-medium">{list[open].title}</span>
                  <span className="text-sm text-white/60">
                    {open + 1} / {list.length}
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
            <button className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <button onClick={(e) => (e.stopPropagation(), setOpen((open - 1 + list.length) % list.length))} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={(e) => (e.stopPropagation(), setOpen((open + 1) % list.length))} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
