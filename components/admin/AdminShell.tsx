"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ToastProvider } from "./ui";
import { cn } from "@/lib/utils";

const NAV = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard" }] },
  {
    group: "CRM",
    items: [
      { href: "/admin/leads", label: "Leads", badge: true },
      { href: "/admin/contacts", label: "Contacts" },
      { href: "/admin/bookings", label: "Bookings" },
      { href: "/admin/subscribers", label: "Subscribers" },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/content/events", label: "Events" },
      { href: "/admin/content/services", label: "Services" },
      { href: "/admin/content/gallery", label: "Portfolio" },
      { href: "/admin/content/posts", label: "Journal" },
      { href: "/admin/content/testimonials", label: "Testimonials" },
      { href: "/admin/content/team", label: "Team" },
      { href: "/admin/content/packages", label: "Packages" },
      { href: "/admin/content/faqs", label: "FAQs" },
    ],
  },
  { group: "Website", items: [{ href: "/admin/settings", label: "Settings" }] },
];

export function AdminShell({ children, brand, newLeads, accent }: { children: React.ReactNode; brand: string; newLeads: number; accent: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  let n = 0;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-line px-5 pb-4 pt-5">
        <Link href="/admin" className="text-[17px] tracking-[-0.03em]">
          {brand}®
        </Link>
        <span className="meta text-muted">Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-5 py-5">
        {NAV.map((g) => (
          <div key={g.group} className="mb-6">
            <p className="meta mb-2 text-muted">{g.group}</p>
            <ul>
              {g.items.map((it) => {
                const active = isActive(it.href);
                n++;
                return (
                  <li key={it.href}>
                    <Link href={it.href} className={cn("group flex items-baseline gap-3 py-1 text-[14px] transition-colors", active ? "text-ink" : "text-muted hover:text-ink")}>
                      <span className="meta w-5 tabular-nums text-ink/30">{String(n).padStart(2, "0")}</span>
                      <span className="relative flex-1">
                        {it.label}
                        {active && <motion.span layoutId="admin-nav" className="absolute -left-[3.15rem] top-1/2 h-1.5 w-1.5 -translate-y-1/2 bg-accent" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                      </span>
                      {"badge" in it && newLeads > 0 && <span className="meta tabular-nums text-accent">{newLeads} new</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="meta flex justify-between border-t border-line px-5 py-4 text-muted">
        <a href="/" target="_blank" className="link-reveal text-ink">
          View site ↗
        </a>
        <button
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            router.push("/admin/login");
            router.refresh();
          }}
          className="hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <style dangerouslySetInnerHTML={{ __html: `:root{--accent:${accent}}` }} />
      <div className="min-h-screen bg-bg text-ink">
        <aside className="fixed inset-y-0 left-0 hidden w-[240px] border-r border-line bg-bg lg:block">{sidebar}</aside>

        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur lg:hidden">
          <span className="text-[16px] tracking-[-0.03em]">{brand}® Admin</span>
          <button onClick={() => setOpen(true)} className="meta" aria-label="Open menu">
            Menu {newLeads > 0 && <span className="text-accent">· {newLeads}</span>}
          </button>
        </header>

        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div className="absolute inset-0 bg-ink/25" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
              <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-y-0 left-0 w-[260px] border-r border-line bg-bg">
                {sidebar}
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <main className="lg:pl-[240px]">
          <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="mx-auto max-w-[1400px] px-4 py-6 md:px-10 md:py-10">
            {children}
          </motion.div>
        </main>
      </div>
    </ToastProvider>
  );
}
