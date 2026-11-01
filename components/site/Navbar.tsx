"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { useSite } from "./SiteProvider";
import { EASE } from "./motion";
import { cn } from "@/lib/utils";

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const f = () => setM(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return m;
}

function Clock({ tz }: { tz: string }) {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () =>
      setT(new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(new Date()));
    f();
    const id = setInterval(f, 15000);
    return () => clearInterval(id);
  }, [tz]);
  return <span className="tabular-nums">{t}</span>;
}

function ProgressDot() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <span className="relative grid h-8 w-8 place-items-center">
      <svg viewBox="0 0 32 32" className="absolute inset-0 -rotate-90">
        <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
        <motion.circle cx="16" cy="16" r="14" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" style={{ pathLength: p }} />
      </svg>
      <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" />
    </span>
  );
}

export function Navbar() {
  const { settings, menuOpen, setMenuOpen, introDone } = useSite();
  const { nav, brand, announcement } = settings;
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const [preview, setPreview] = useState(0);

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setAtTop(v < 40);
    if (v < 140) setCompact(false);
    else if (v > prev + 4) setCompact(true);
    else if (v < prev - 8) setCompact(false);
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMenuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const showAnnouncement = announcement.enabled && atTop && !isMobile;
  const radius = menuOpen ? 30 : 999;

  return (
    <>
      {/* Announcement bar */}
      {announcement.enabled && (
        <Link
          href={announcement.href || "#"}
          className="relative z-40 hidden h-10 items-center justify-center gap-3 bg-dark text-[13px] text-white/80 md:flex"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
          <span>{announcement.text}</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-accent" />
        </Link>
      )}

      {/* Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          "pointer-events-none fixed inset-x-0 z-[70] flex items-start justify-center px-3 transition-[top] duration-500 ease-[cubic-bezier(.16,1,.3,1)]",
          isMobile && "items-end"
        )}
        style={isMobile ? { bottom: "max(12px, env(safe-area-inset-bottom))", top: "auto" } : { top: showAnnouncement ? 52 : 14, bottom: "auto" }}
        initial={false}
        animate={{ y: introDone ? 0 : isMobile ? 120 : -100, opacity: introDone ? 1 : 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: introDone ? 0.15 : 0 }}
      >
        <LayoutGroup>
          <motion.nav
            layout
            transition={{ layout: { duration: 0.65, ease: EASE } }}
            style={{ borderRadius: radius }}
            className={cn(
              "glass-dark pointer-events-auto relative overflow-hidden text-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10",
              menuOpen ? "w-[min(1120px,calc(100vw-24px))]" : ""
            )}
            aria-label="Main"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {!menuOpen ? (
                <motion.div
                  key="bar"
                  layout="position"
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.15 } }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="flex h-14 items-center gap-1 pl-2 pr-2"
                >
                  <Link href="/" className="flex items-center gap-2 pr-2 font-semibold tracking-tight" aria-label={`${brand.name} home`}>
                    <ProgressDot />
                    <span className="text-[17px]">{brand.name}</span>
                  </Link>

                  <AnimatePresence initial={false}>
                    {!compact && !isMobile && (
                      <motion.ul
                        key="links"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="flex items-center overflow-hidden whitespace-nowrap"
                        onMouseLeave={() => setHovered(null)}
                      >
                        {nav.items.map((it, i) => (
                          <li key={it.href} className="relative">
                            <Link
                              href={it.href}
                              onMouseEnter={() => setHovered(i)}
                              className={cn("relative z-10 block px-3.5 py-2 text-[14px] transition-colors", isActive(it.href) ? "text-white" : "text-white/65 hover:text-white")}
                            >
                              {it.label}
                              {isActive(it.href) && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />}
                            </Link>
                            {hovered === i && (
                              <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-white/10" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                            )}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  {(compact || isMobile) && (
                    <button
                      onClick={() => setMenuOpen(true)}
                      className="group flex h-10 items-center gap-2.5 rounded-full px-4 text-[14px] text-white/85 transition hover:bg-white/10"
                      aria-expanded={menuOpen}
                    >
                      <span className="flex flex-col gap-[4px]">
                        <span className="block h-px w-4 bg-current transition-all group-hover:w-3" />
                        <span className="block h-px w-4 bg-current" />
                      </span>
                      Menu
                    </button>
                  )}

                  <Link
                    href={nav.ctaHref}
                    className="group ml-1 flex h-10 items-center gap-2 overflow-hidden rounded-full bg-accent pl-4 pr-1 text-[14px] font-medium text-white"
                  >
                    <span className="hidden sm:inline">{nav.ctaLabel}</span>
                    <span className="sm:hidden">Book</span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="panel"
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="max-h-[82svh] overflow-y-auto p-3 no-scrollbar md:p-4"
                  data-lenis-prevent
                >
                  <div className="flex items-center justify-between pl-2">
                    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                      <ProgressDot />
                      <span className="text-[17px]">{brand.name}</span>
                    </Link>
                    <span className="eyebrow hidden text-white/45 md:block">
                      {brand.city} — <Clock tz={brand.timezone} /> IST
                    </span>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                      aria-label="Close menu"
                    >
                      <Plus className="h-5 w-5 rotate-45" />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1.25fr_1fr] md:gap-6">
                    <ul className="flex flex-col py-2 md:py-4">
                      {[{ label: "Home", href: "/", image: settings.hero.image }, ...nav.items].map((it, i) => (
                        <motion.li
                          key={it.href}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, ease: EASE, delay: 0.22 + i * 0.05 }}
                          onMouseEnter={() => setPreview(i)}
                          className="border-b border-white/10 last:border-0"
                        >
                          <Link href={it.href} className="group flex items-baseline justify-between gap-4 px-2 py-2.5 md:py-3">
                            <span className="flex items-baseline gap-4">
                              <span className="eyebrow w-6 text-white/35">{String(i).padStart(2, "0")}</span>
                              <span
                                className={cn(
                                  "text-[clamp(2rem,5.2vw,3.6rem)] font-medium leading-none tracking-[-0.045em] transition-all duration-500 group-hover:translate-x-2",
                                  isActive(it.href) ? "text-accent" : "text-white"
                                )}
                              >
                                {it.label}
                              </span>
                            </span>
                            <ArrowUpRight className="h-6 w-6 -translate-x-2 text-accent opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                          </Link>
                        </motion.li>
                      ))}
                    </ul>

                    <div className="hidden flex-col gap-3 md:flex">
                      <div className="relative aspect-[4/3.6] overflow-hidden rounded-[22px] bg-white/5">
                        <AnimatePresence mode="popLayout">
                          <motion.img
                            key={preview}
                            src={([{ image: settings.hero.image }, ...nav.items][preview]?.image) || settings.hero.image}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.2 }}
                            animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: EASE }}
                          />
                        </AnimatePresence>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                          <p className="serif-accent text-2xl">{brand.tagline}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <a href={`mailto:${brand.email}`} className="rounded-2xl bg-white/5 p-4 transition hover:bg-white/10">
                          <span className="eyebrow block text-white/40">Email</span>
                          <span className="mt-1 block truncate">{brand.email}</span>
                        </a>
                        <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="rounded-2xl bg-white/5 p-4 transition hover:bg-white/10">
                          <span className="eyebrow block text-white/40">Call</span>
                          <span className="mt-1 block">{brand.phone}</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-white/5 p-3 pl-5">
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/60">
                      {brand.socials.map((s) => (
                        <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-underline hover:text-white">
                          {s.label}
                        </a>
                      ))}
                    </div>
                    <Link href={nav.ctaHref} className="flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium">
                      {nav.ctaLabel} <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </LayoutGroup>
      </motion.div>
    </>
  );
}
