"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CalendarDays, ExternalLink, FileText, HelpCircle, Images, Inbox, Kanban, LayoutDashboard, LogOut, Mail, Menu, Package, Quote, Settings, Sparkles,
  Ticket, UserRound, Users, X,
} from "lucide-react";
import { ToastProvider } from "./ui";
import { cn } from "@/lib/utils";

const NAV = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "CRM",
    items: [
      { href: "/admin/leads", label: "Leads pipeline", icon: Kanban, badge: "leads" },
      { href: "/admin/contacts", label: "Contacts", icon: Users },
      { href: "/admin/bookings", label: "Bookings", icon: Ticket },
      { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
    ],
  },
  {
    group: "CMS",
    items: [
      { href: "/admin/content/events", label: "Events", icon: CalendarDays },
      { href: "/admin/content/services", label: "Services", icon: Sparkles },
      { href: "/admin/content/gallery", label: "Portfolio", icon: Images },
      { href: "/admin/content/posts", label: "Journal", icon: FileText },
      { href: "/admin/content/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/content/team", label: "Team", icon: UserRound },
      { href: "/admin/content/packages", label: "Packages", icon: Package },
      { href: "/admin/content/faqs", label: "FAQs", icon: HelpCircle },
    ],
  },
  { group: "Website", items: [{ href: "/admin/settings", label: "Site settings", icon: Settings }] },
];

export function AdminShell({ children, brand, newLeads, accent }: { children: React.ReactNode; brand: string; newLeads: number; accent: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-3 pb-6 pt-2">
        <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#1d1d1f] text-[15px] font-semibold text-white">
          {brand[0]}
          <span className="text-accent">.</span>
        </span>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-tight">{brand} Studio</p>
          <p className="text-[12px] text-[#8e8e93]">Admin · CRM · CMS</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto pb-4">
        {NAV.map((g) => (
          <div key={g.group}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8e8e93]">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const I = it.icon;
                const active = isActive(it.href);
                return (
                  <li key={it.href}>
                    <Link href={it.href} className={cn("relative flex items-center gap-3 rounded-[10px] px-3 py-2 text-[14px] transition", active ? "font-medium text-[#1d1d1f]" : "text-[#3a3a3c] hover:bg-black/[0.04]")}>
                      {active && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-[10px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                      <I className={cn("relative h-[18px] w-[18px]", active ? "text-accent" : "text-[#6e6e73]")} />
                      <span className="relative flex-1">{it.label}</span>
                      {"badge" in it && newLeads > 0 && <span className="relative rounded-full bg-accent px-1.5 text-[11px] font-semibold leading-[18px] text-white">{newLeads}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-black/5 pt-3">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-[14px] text-[#3a3a3c] hover:bg-black/[0.04]">
          <ExternalLink className="h-[18px] w-[18px] text-[#6e6e73]" /> View website
        </a>
        <button
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            router.push("/admin/login");
            router.refresh();
          }}
          className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-[14px] text-[#3a3a3c] hover:bg-black/[0.04]"
        >
          <LogOut className="h-[18px] w-[18px] text-[#6e6e73]" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <style dangerouslySetInnerHTML={{ __html: `:root{--accent:${accent}}` }} />
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] [font-feature-settings:'cv11']">
        <aside className="fixed inset-y-0 left-0 hidden w-[260px] border-r border-black/5 bg-[#f5f5f7]/90 p-3 backdrop-blur-xl lg:block">{sidebar}</aside>

        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black/5 bg-white/75 px-4 backdrop-blur-xl lg:hidden">
          <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-[15px] font-semibold">{brand} Admin</p>
          <Link href="/admin/leads" className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-black/5" aria-label="Leads">
            <Inbox className="h-5 w-5" />
            {newLeads > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" />}
          </Link>
        </header>

        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div className="absolute inset-0 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
              <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 380, damping: 40 }} className="absolute inset-y-0 left-0 w-[280px] bg-[#f5f5f7] p-3 shadow-2xl">
                <button onClick={() => setOpen(false)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/5" aria-label="Close menu">
                  <X className="h-4 w-4" />
                </button>
                {sidebar}
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <main className="lg:pl-[260px]">
          <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-10">
            {children}
          </motion.div>
        </main>
      </div>
    </ToastProvider>
  );
}
