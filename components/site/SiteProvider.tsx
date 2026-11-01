"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import type { Settings } from "@/lib/types";

type Ctx = {
  settings: Settings;
  introDone: boolean;
  setIntroDone: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
};

const SiteCtx = createContext<Ctx | null>(null);

export function useSite() {
  const c = useContext(SiteCtx);
  if (!c) throw new Error("useSite outside provider");
  return c;
}

function ScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname, lenis]);
  return null;
}

function LockWhen({ locked }: { locked: boolean }) {
  const lenis = useLenis();
  useEffect(() => {
    if (locked) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }, [locked, lenis]);
  return null;
}

export function SiteProvider({ settings, children }: { settings: Settings; children: ReactNode }) {
  const [introDone, setIntroDone] = useState(!settings.intro.enabled);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setMenuOpen(false), [pathname]);

  const body = (
    <SiteCtx.Provider value={{ settings, introDone, setIntroDone, menuOpen, setMenuOpen }}>
      <ScrollReset />
      <LockWhen locked={menuOpen || !introDone} />
      {children}
    </SiteCtx.Provider>
  );

  if (!settings.theme.smoothScroll) return body;
  return (
    <ReactLenis root options={{ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true, touchMultiplier: 1.2 }}>
      {body}
    </ReactLenis>
  );
}
