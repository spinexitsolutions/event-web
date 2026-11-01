"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function LoginForm({ brand, image, demo }: { brand: string; image: string; demo?: { email: string; password: string } }) {
  const router = useRouter();
  const [email, setEmail] = useState(demo?.email || "");
  const [password, setPassword] = useState(demo?.password || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="grid min-h-screen bg-bg text-ink lg:grid-cols-2">
      <div className="flex flex-col justify-between p-6 md:p-10">
        <div className="meta flex justify-between border-b border-line pb-3 text-muted">
          <span className="text-ink">{brand}® — Studio admin</span>
          <a href="/" className="link-reveal">← Website</a>
        </div>
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
          className="my-16 w-full max-w-md"
        >
          <h1 className="text-[clamp(2.6rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.055em]">
            Sign in<span className="text-muted"> to run the studio.</span>
          </h1>
          <div className="mt-12 space-y-6">
            <label className="block">
              <span className="meta text-muted">Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 h-11 w-full border-b border-line bg-transparent text-[17px] outline-none transition-colors focus:border-ink" />
            </label>
            <label className="block">
              <span className="meta text-muted">Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-1 h-11 w-full border-b border-line bg-transparent text-[17px] outline-none transition-colors focus:border-ink" />
            </label>
          </div>
          {err && <p className="meta mt-4 text-[#b42318]">{err}</p>}
          <button disabled={busy} className="mt-10 flex h-12 w-full items-center justify-between rounded-[3px] bg-ink px-5 text-[14px] text-bg transition-colors hover:bg-ink/85 disabled:opacity-60">
            <span>{busy ? "Signing in…" : "Continue"}</span>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>→</span>}
          </button>
          {demo && (
            <p className="meta mt-6 text-muted">
              Demo access is pre-filled ({demo.email} / {demo.password}). Set ADMIN_EMAIL and ADMIN_PASSWORD in production.
            </p>
          )}
        </motion.form>
        <p className="meta text-muted">Leads · Bookings · Content · Website settings</p>
      </div>
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <motion.img src={image} alt="" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>
  );
}
