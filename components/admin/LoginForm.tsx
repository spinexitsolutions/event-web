"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Loader2, Lock } from "lucide-react";

export function LoginForm({ brand, image, demo }: { brand: string; image: string; demo?: { email: string; password: string } }) {
  const router = useRouter();
  const [email, setEmail] = useState(demo?.email || "");
  const [password, setPassword] = useState(demo?.password || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="grid min-h-screen bg-[#f5f5f7] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <motion.img src={image} alt="" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="text-[56px] font-medium leading-[0.95] tracking-[-0.045em]">
            Run every event <br />
            from <span className="serif-accent text-accent">one place.</span>
          </p>
          <p className="mt-4 max-w-md text-white/70">Leads, bookings, content and the entire website — controlled from this studio dashboard.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setErr("");
            const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
            if (r.ok) {
              router.push("/admin");
              router.refresh();
            } else {
              setErr((await r.json()).error);
              setBusy(false);
            }
          }}
          className="w-full max-w-sm"
        >
          <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-[#1d1d1f] text-xl font-semibold text-white">
            {brand[0]}
            <span className="text-accent">.</span>
          </span>
          <h1 className="mt-6 text-[32px] font-semibold tracking-[-0.03em]">Sign in to {brand}</h1>
          <p className="mt-1 text-[#6e6e73]">Studio admin · CRM · CMS</p>
          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="h-14 w-full border-b border-black/5 px-4 text-[16px] outline-none" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="h-14 w-full px-4 text-[16px] outline-none" />
          </div>
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
          <button disabled={busy} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] font-medium text-white transition hover:bg-black disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Continue <ArrowRight className="h-4 w-4" />
          </button>
          {demo && (
            <p className="mt-6 rounded-xl bg-white p-3 text-[13px] text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
              Demo credentials are pre-filled: <b className="text-[#1d1d1f]">{demo.email}</b> / <b className="text-[#1d1d1f]">{demo.password}</b>. Set <code>ADMIN_EMAIL</code> & <code>ADMIN_PASSWORD</code> env vars in production.
            </p>
          )}
        </motion.form>
      </div>
    </div>
  );
}
