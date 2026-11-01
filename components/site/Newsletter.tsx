"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Newsletter({ dark = true }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setState("loading");
        const r = await fetch("/api/public/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        const j = await r.json();
        if (r.ok) {
          setState("done");
          setEmail("");
        } else {
          setState("error");
          setMsg(j.error);
        }
      }}
      className="w-full"
    >
      <div className={`flex h-14 items-center rounded-full p-1.5 pl-5 ring-1 ${dark ? "bg-white/5 ring-white/15 focus-within:ring-white/40" : "bg-white ring-line focus-within:ring-ink/30"} transition`}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className={`min-w-0 flex-1 bg-transparent text-[15px] outline-none ${dark ? "placeholder:text-white/35" : "placeholder:text-muted"}`}
          aria-label="Email address"
        />
        <button disabled={state === "loading"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white transition hover:scale-105 disabled:opacity-60" aria-label="Subscribe">
          {state === "done" ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
      <AnimatePresence>
        {state === "done" && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm text-accent">
            You&apos;re on the list. Expect good things.
          </motion.p>
        )}
        {state === "error" && <p className="mt-3 text-sm text-red-400">{msg}</p>}
      </AnimatePresence>
    </form>
  );
}
