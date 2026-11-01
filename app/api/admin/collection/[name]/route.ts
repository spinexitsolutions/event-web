import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getDb, mutate, uid } from "@/lib/db";
import type { CollectionName } from "@/lib/types";

const allowed: CollectionName[] = ["events", "services", "gallery", "testimonials", "posts", "team", "faqs", "packages", "leads", "bookings", "subscribers"];
const labels: Record<string, string> = { events: "event", services: "service", gallery: "gallery item", testimonials: "testimonial", posts: "journal post", team: "team member", faqs: "FAQ", packages: "package", leads: "lead", bookings: "booking", subscribers: "subscriber" };

type Ctx = { params: Promise<{ name: string }> };
type Item = { id: string; [k: string]: unknown };

async function guard(ctx: Ctx) {
  if (!(await isAuthed())) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { name } = await ctx.params;
  if (!allowed.includes(name as CollectionName)) return { error: NextResponse.json({ error: "Unknown collection" }, { status: 404 }) };
  return { name: name as CollectionName };
}

const titleOf = (it: Item) => String(it.title || it.name || it.q || it.email || it.id);

export async function GET(_: Request, ctx: Ctx) {
  const g = await guard(ctx);
  if (g.error) return g.error;
  return NextResponse.json(getDb()[g.name]);
}

/** Upsert one item */
export async function PUT(req: Request, ctx: Ctx) {
  const g = await guard(ctx);
  if (g.error) return g.error;
  const item = (await req.json()) as Item;
  let created = false;
  if (!item.id) {
    item.id = uid(g.name.slice(0, 1));
    created = true;
  }
  mutate(
    (db) => {
      const list = db[g.name] as unknown as Item[];
      const idx = list.findIndex((x) => x.id === item.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...item };
      else {
        list.unshift(item);
        created = true;
      }
    },
    { type: g.name === "leads" || g.name === "bookings" ? (g.name === "leads" ? "lead" : "booking") : "content", text: `${created ? "Created" : "Updated"} ${labels[g.name]}: ${titleOf(item)}` }
  );
  return NextResponse.json({ ok: true, item });
}

/** Replace order of whole collection (for drag reorder) */
export async function POST(req: Request, ctx: Ctx) {
  const g = await guard(ctx);
  if (g.error) return g.error;
  const { order } = (await req.json()) as { order: string[] };
  mutate((db) => {
    const list = db[g.name] as unknown as Item[];
    const map = new Map(list.map((x) => [x.id, x]));
    const next = order.map((id) => map.get(id)).filter(Boolean) as Item[];
    list.forEach((x) => !order.includes(x.id) && next.push(x));
    (db as unknown as Record<string, Item[]>)[g.name] = next;
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const g = await guard(ctx);
  if (g.error) return g.error;
  const id = new URL(req.url).searchParams.get("id");
  let removed: Item | undefined;
  mutate(
    (db) => {
      const list = db[g.name] as unknown as Item[];
      removed = list.find((x) => x.id === id);
      (db as unknown as Record<string, Item[]>)[g.name] = list.filter((x) => x.id !== id);
    },
    { type: "content", text: `Deleted ${labels[g.name]} ${id}` }
  );
  return NextResponse.json({ ok: true, removed: !!removed });
}
