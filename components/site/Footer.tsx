"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { useLenis } from "lenis/react";
import { useSite } from "./SiteProvider";
import { Newsletter } from "./Newsletter";
import { EASE } from "./motion";

export function Footer({ services }: { services: { title: string; slug: string }[] }) {
  const { settings } = useSite();
  const { brand, nav } = settings;
  const lenis = useLenis();
  return (
    <footer className="grain relative overflow-hidden rounded-t-[clamp(28px,4vw,56px)] bg-dark pb-28 pt-16 text-white md:pb-8 md:pt-24">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
      <div className="container-x relative">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow text-white/45">Newsletter</p>
            <h3 className="mt-4 text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.035em]">
              Ideas, launches & <span className="accent-word text-pop">first access</span> to tickets.
            </h3>
            <div className="mt-6 max-w-md">
              <Newsletter />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7 md:pl-10">
            <div>
              <p className="eyebrow text-white/45">Explore</p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-white/75">
                {nav.items.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="link-underline hover:text-white">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-white/45">Services</p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-white/75">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services#${s.slug}`} className="link-underline hover:text-white">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="eyebrow text-white/45">Studio</p>
              <address className="mt-4 space-y-2.5 text-[15px] not-italic text-white/75">
                <p>
                  {brand.address}, {brand.city}
                </p>
                <p>{brand.hours}</p>
                <a href={`mailto:${brand.email}`} className="block hover:text-white">
                  {brand.email}
                </a>
                <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="block hover:text-white">
                  {brand.phone}
                </a>
              </address>
              <div className="mt-5 flex flex-wrap gap-2">
                {brand.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10 transition hover:bg-white hover:text-dark">
                    {s.label} <ArrowUpRight className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex overflow-hidden md:mt-24" aria-hidden>
          {(brand.name + ".").split("").map((ch, i) => (
            <motion.span
              key={i}
              className={`block text-[clamp(6rem,27vw,26rem)] font-semibold leading-[0.78] tracking-[-0.07em] ${ch === "." ? "text-pop" : ""}`}
              initial={{ y: "100%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE, delay: i * 0.06 }}
            >
              {ch}
            </motion.span>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name} Experiences Pvt. Ltd. · {brand.tagline}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/admin" className="hover:text-white">
              Admin
            </Link>
            <Link href="/contact" className="hover:text-white">
              Careers
            </Link>
            <button onClick={() => (lenis ? lenis.scrollTo(0, { duration: 2 }) : window.scrollTo({ top: 0, behavior: "smooth" }))} className="flex items-center gap-2 hover:text-white">
              Back to top <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
