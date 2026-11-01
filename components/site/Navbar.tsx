"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { useSite } from "./SiteProvider";
import { EASE } from "./motion";
import { cn } from "@/lib/utils";

function Clock({ tz }: { tz: string }) {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date()));
    f();
    const id = setInterval(f, 15000);
    return () => clearInterval(id);
  }, [tz]);
  return <span className="tabular-nums">{t}</span>;
}

export function Navbar() {
  const { settings, menuOpen, setMenuOpen, introDone } = useSite();
  const { nav, brand } = settings;
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (v < 120) setHidden(false);
    else if (v > prev + 6) setHidden(true);
    else if (v < prev - 6) setHidden(false);
  });

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [setMenuOpen]);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const all = [{ label: "Index", href: "/" }, ...nav.items];

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: (hidden && !menuOpen) || !introDone ? "-110%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fixed inset-x-0 top-0 z-[70] text-white mix-blend-difference"
      >
        <div className="container-x grid-12 h-16 items-center text-[14px]">
          <Link href="/" className="col-span-6 font-medium tracking-[-0.02em] md:col-span-3" aria-label={`${brand.name} home`}>
            {brand.name}®
          </Link>
          <nav className="hidden md:col-span-6 md:flex md:gap-6" aria-label="Main">
            {nav.items.map((it, i) => (
              <Link key={it.href} href={it.href} className={cn("group relative transition-opacity", active(it.href) ? "opacity-100" : "opacity-60 hover:opacity-100")}>
                {it.label}
                <sup className="ml-0.5 text-[9px] opacity-60">{i + 1}</sup>
                {active(it.href) && <span className="absolute -bottom-1 left-0 h-px w-full bg-white" />}
              </Link>
            ))}
          </nav>
          <div className="col-span-6 flex items-center justify-end gap-6 md:col-span-3">
            <span className="hidden opacity-60 lg:inline">
              {brand.city} <Clock tz={brand.timezone} />
            </span>
            <Link href={nav.ctaHref} className="hidden md:inline">
              <span className="link-underline">{nav.ctaLabel}</span>
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 md:hidden" aria-expanded={menuOpen}>
              {menuOpen ? "Close" : "Menu"}
              <span className="relative block h-2.5 w-4">
                <span className={cn("absolute left-0 h-px w-4 bg-white transition-all duration-500", menuOpen ? "top-1 rotate-45" : "top-0")} />
                <span className={cn("absolute left-0 h-px w-4 bg-white transition-all duration-500", menuOpen ? "top-1 -rotate-45" : "top-2")} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Full-screen menu (mobile) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[65] flex flex-col bg-ink pt-20 text-bg"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="container-x flex-1" onMouseLeave={() => setHover(null)}>
              {all.map((it, i) => (
                <motion.li
                  key={it.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.25 + i * 0.05 }}
                  className="border-b border-white/10"
                  onMouseEnter={() => setHover(i)}
                >
                  <Link
                    href={it.href}
                    className={cn("flex items-baseline justify-between py-3 transition-opacity duration-300", hover !== null && hover !== i ? "opacity-30" : "opacity-100")}
                  >
                    <span className="text-[clamp(2.4rem,11vw,5rem)] leading-none tracking-[-0.05em]">{it.label}</span>
                    <span className="meta text-white/40">0{i}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="container-x grid grid-cols-2 gap-4 pb-10 pt-6 meta text-white/60">
              <a href={`mailto:${brand.email}`} className="text-white">
                {brand.email}
              </a>
              <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="text-right text-white">
                {brand.phone}
              </a>
              <span>{brand.socials.map((s) => s.label).join(" · ")}</span>
              <span className="text-right">
                {brand.city} <Clock tz={brand.timezone} />
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
