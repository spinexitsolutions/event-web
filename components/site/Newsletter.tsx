"use client";

import { useState } from "react";

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
      <div className={`flex items-center border-b pb-2 ${dark ? "border-white/40 focus-within:border-white" : "border-ink/30 focus-within:border-ink"} transition-colors`}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className={`min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none ${dark ? "placeholder:text-white/40" : "placeholder:text-muted"}`}
          aria-label="Email address"
        />
        <button disabled={state === "loading"} className="meta shrink-0 disabled:opacity-50">
          {state === "done" ? "Subscribed ✓" : "Subscribe →"}
        </button>
      </div>
      {state === "error" && <p className="meta mt-2 text-red-400">{msg}</p>}
    </form>
  );
}
