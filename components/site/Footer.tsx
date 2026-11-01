"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useSite } from "./SiteProvider";
import { Newsletter } from "./Newsletter";
import { EASE } from "./motion";

export function Footer({ services }: { services: { title: string; slug: string }[] }) {
  const { settings } = useSite();
  const { brand, nav } = settings;
  const lenis = useLenis();
  return (
    <footer className="bg-ink pt-16 text-bg md:pt-24">
      <div className="container-x">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-5">
            <p className="meta text-white/50">Newsletter</p>
            <p className="mt-4 max-w-sm text-[clamp(1.4rem,2.2vw,1.9rem)] leading-[1.15] tracking-[-0.03em]">Launches, first access to tickets, and the occasional behind-the-scenes. Monthly.</p>
            <div className="mt-6 max-w-md">
              <Newsletter />
            </div>
          </div>
          <div className="meta col-span-6 md:col-span-2 md:col-start-7">
            <p className="text-white/50">Index</p>
            <ul className="mt-4 space-y-1.5">
              {nav.items.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="link-reveal">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="meta col-span-6 md:col-span-2">
            <p className="text-white/50">Services</p>
            <ul className="mt-4 space-y-1.5">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services#${s.slug}`} className="link-reveal">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="meta col-span-12 md:col-span-2">
            <p className="text-white/50">Studio</p>
            <address className="mt-4 space-y-1.5 not-italic">
              <p>
                {brand.address}
                <br />
                {brand.city}
              </p>
              <a href={`mailto:${brand.email}`} className="link-reveal block w-fit">
                {brand.email}
              </a>
              <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="link-reveal block w-fit">
                {brand.phone}
              </a>
              <p className="pt-2">
                {brand.socials.map((s, i) => (
                  <span key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer" className="link-reveal">
                      {s.label}
                    </a>
                    {i < brand.socials.length - 1 && ", "}
                  </span>
                ))}
              </p>
            </address>
          </div>
        </div>

        <div className="mt-20 overflow-hidden md:mt-28" aria-hidden>
          <motion.p
            initial={{ y: "100%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: EASE }}
            className="text-[clamp(6rem,30vw,30rem)] font-light leading-[0.78] tracking-[-0.08em]"
          >
            {brand.name}
          </motion.p>
        </div>

        <div className="meta grid-12 mt-6 border-t border-white/15 py-5 text-white/50">
          <span className="col-span-12 md:col-span-6">
            © {new Date().getFullYear()} {brand.name} Experiences Pvt. Ltd.
          </span>
          <span className="col-span-12 mt-2 flex gap-6 md:col-span-6 md:mt-0 md:justify-end">
            <Link href="/admin" className="hover:text-white">
              Admin
            </Link>
            <button onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.8 }) : window.scrollTo({ top: 0, behavior: "smooth" }))} className="hover:text-white">
              Back to top ↑
            </button>
          </span>
        </div>
      </div>
    </footer>
  );
}
