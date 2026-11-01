export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function inr(n: number, compact = false) {
  if (compact) {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(n % 1e7 === 0 ? 0 : 1)} Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(n % 1e5 === 0 ? 0 : 1)}L`;
    if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function fmtDate(d: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  const date = new Date(d.length === 10 ? d + "T00:00:00" : d);
  if (isNaN(date.getTime())) return d;
  return new Intl.DateTimeFormat("en-IN", opts).format(date);
}

export function dateParts(d: string) {
  const date = new Date(d.length === 10 ? d + "T00:00:00" : d);
  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: date.toLocaleString("en-US", { month: "short" }),
    weekday: date.toLocaleString("en-US", { weekday: "short" }),
    year: date.getFullYear(),
  };
}

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(iso);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function minPrice(tickets: { price: number }[]) {
  return tickets.length ? Math.min(...tickets.map((t) => t.price)) : 0;
}

export function soldPct(tickets: { capacity: number; sold: number }[]) {
  const cap = tickets.reduce((a, t) => a + t.capacity, 0);
  const sold = tickets.reduce((a, t) => a + t.sold, 0);
  return cap ? Math.round((sold / cap) * 100) : 0;
}
