"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Reorder, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Copy, ExternalLink, GripVertical, Plus, Search, Star, Trash2 } from "lucide-react";
import type { TicketTier } from "@/lib/types";
import { SCHEMAS, type Field, type Schema } from "./schemas";
import { api, Badge, Button, Drawer, Empty, ImageInput, Input, Label, PageTitle, Segmented, Select, Textarea, Toggle, useToast } from "./ui";
import { cn, inr, slugify } from "@/lib/utils";

type Item = Record<string, unknown> & { id: string };

export function CollectionManager({ name, initial }: { name: string; initial: Item[] }) {
  const schema = SCHEMAS[name];
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Item | null>(null);
  const [view, setView] = useState<"grid" | "list">(schema.imageKey ? "grid" : "list");
  const [busy, setBusy] = useState(false);

  useEffect(() => setItems(initial), [initial]);
  useEffect(() => {
    if (sp.get("new")) setEdit({ id: "", ...structuredClone(schema.defaults) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = items.filter((it) => !q || JSON.stringify(it).toLowerCase().includes(q.toLowerCase()));
  const reorderable = !q;

  async function save() {
    if (!edit) return;
    setBusy(true);
    try {
      const body = { ...edit };
      if (!body.id) delete (body as Partial<Item>).id;
      const r = await api<{ item: Item }>(`/api/admin/collection/${name}`, "PUT", body);
      setItems((list) => (edit.id ? list.map((x) => (x.id === r.item.id ? r.item : x)) : [r.item, ...list]));
      toast(`${schema.singular[0].toUpperCase() + schema.singular.slice(1)} saved — live on the website`);
      setEdit(null);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "err");
    }
    setBusy(false);
  }

  async function remove(it: Item) {
    if (!confirm(`Delete "${String(it[schema.titleKey])}"? This cannot be undone.`)) return;
    await api(`/api/admin/collection/${name}?id=${it.id}`, "DELETE");
    setItems((l) => l.filter((x) => x.id !== it.id));
    setEdit(null);
    toast("Deleted");
    router.refresh();
  }

  async function persistOrder(next: Item[]) {
    await api(`/api/admin/collection/${name}`, "POST", { order: next.map((x) => x.id) });
    toast("Order saved");
    router.refresh();
  }

  const card = (it: Item) => {
    const img = schema.imageKey ? String(it[schema.imageKey] || "") : "";
    return (
      <div className="group relative overflow-hidden rounded-[4px] bg-white/70 border border-line transition hover:">
        {view === "grid" && schema.imageKey && (
          <button onClick={() => setEdit(structuredClone(it))} className="block aspect-[4/3] w-full overflow-hidden bg-ink/[0.05]">
            {img && <img src={img.replace("w=1600", "w=600").replace("w=1200", "w=600")} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />}
          </button>
        )}
        <div className="flex items-center gap-3 p-3.5">
          {view === "list" && reorderable && <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink/30" />}
          {view === "list" && img && <img src={img.replace("w=1600", "w=200").replace("w=1200", "w=200")} alt="" className="h-11 w-11 shrink-0 rounded-[3px] object-cover" />}
          <button onClick={() => setEdit(structuredClone(it))} className="min-w-0 flex-1 text-left">
            <p className="flex items-center gap-1.5 truncate text-[14px] font-medium">
              {String(it[schema.titleKey] || "Untitled")}
              {(it.featured === true || it.highlighted === true) && <Star className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" />}
            </p>
            <p className="truncate text-[12px] text-muted">{schema.subtitle(it)}</p>
          </button>
          {"status" in it && <Badge tone={it.status === "upcoming" ? "green" : it.status === "draft" ? "yellow" : "gray"}>{String(it.status)}</Badge>}
          {"published" in it && <Badge tone={it.published ? "green" : "yellow"}>{it.published ? "Live" : "Draft"}</Badge>}
        </div>
      </div>
    );
  };

  return (
    <>
      <PageTitle title={schema.label} subtitle={schema.description}>
        <Button onClick={() => setEdit({ id: "", ...structuredClone(schema.defaults) })}>
          <Plus className="h-4 w-4" /> New {schema.singular}
        </Button>
      </PageTitle>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-[3px] bg-white/70 px-4 border border-line md:max-w-xs">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${schema.label.toLowerCase()}`} className="w-full bg-transparent text-[14px] outline-none" />
        </label>
        {schema.imageKey && (
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "grid", label: "Grid" },
              { value: "list", label: "List · reorder" },
            ]}
          />
        )}
        <span className="text-[13px] text-muted md:ml-auto">
          {items.length} {items.length === 1 ? schema.singular : schema.label.toLowerCase()}
        </span>
      </div>

      {!filtered.length ? (
        <Empty>Nothing here yet. Create your first {schema.singular}.</Empty>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((it) => (
            <motion.div key={it.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {card(it)}
            </motion.div>
          ))}
        </div>
      ) : reorderable ? (
        <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
          {items.map((it) => (
            <Reorder.Item key={it.id} value={it} onDragEnd={() => persistOrder(items)} className="list-none">
              {card(it)}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="space-y-2">{filtered.map((it) => <div key={it.id}>{card(it)}</div>)}</div>
      )}

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        wide
        title={edit?.id ? `Edit ${schema.singular}` : `New ${schema.singular}`}
        footer={
          <>
            <div className="flex gap-2">
              {edit?.id && (
                <Button variant="danger" onClick={() => remove(edit)}>
                  <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
                </Button>
              )}
              {edit?.id && (
                <Button variant="ghost" onClick={() => setEdit({ ...structuredClone(edit), id: "", [schema.titleKey]: `${edit[schema.titleKey]} (copy)`, ...("slug" in edit ? { slug: `${edit.slug}-copy` } : {}) })}>
                  <Copy className="h-4 w-4" /> <span className="hidden sm:inline">Duplicate</span>
                </Button>
              )}
              {edit?.id && schema.publicHref && (
                <a href={schema.publicHref(edit)} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-[3px] px-3 text-[14px] hover:bg-ink/[0.05]">
                  <ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">View</span>
                </a>
              )}
            </div>
            <Button loading={busy} onClick={save}>
              {edit?.id ? "Save changes" : `Create ${schema.singular}`}
            </Button>
          </>
        }
      >
        {edit && <ItemForm schema={schema} item={edit} onChange={setEdit} />}
      </Drawer>
    </>
  );
}

function ItemForm({ schema, item, onChange }: { schema: Schema; item: Item; onChange: (i: Item) => void }) {
  const set = (k: string, v: unknown) => {
    const next = { ...item, [k]: v };
    // auto slug for new items
    const slugField = schema.fields.find((f) => f.type === "slug" && f.from === k);
    if (slugField && (!item.id || !item[slugField.key])) next[slugField.key] = slugify(String(v));
    onChange(next);
  };
  return (
    <div className="grid gap-4 rounded-[4px] bg-white/70 p-4 sm:grid-cols-2 md:p-5">
      {schema.fields.map((f) => (
        <div key={f.key} className={cn(f.half ? "" : "sm:col-span-2")}>
          <FieldInput f={f} value={item[f.key]} onChange={(v) => set(f.key, v)} />
        </div>
      ))}
    </div>
  );
}

function FieldInput({ f, value, onChange }: { f: Field; value: unknown; onChange: (v: unknown) => void }) {
  switch (f.type) {
    case "boolean":
      return (
        <div className="rounded-[3px] bg-ink/[0.04] px-4 py-3">
          <Toggle checked={!!value} onChange={onChange} label={f.label} />
        </div>
      );
    case "image":
      return (
        <Label label={f.label} hint={f.hint}>
          <ImageInput value={String(value || "")} onChange={onChange} />
        </Label>
      );
    case "textarea":
      return (
        <Label label={f.label} hint={f.hint}>
          <Textarea rows={3} value={String(value || "")} onChange={(e) => onChange(e.target.value)} />
        </Label>
      );
    case "richtext":
      return (
        <Label label={f.label} hint={f.hint}>
          <Textarea rows={10} value={String(value || "")} onChange={(e) => onChange(e.target.value)} className="font-[inherit]" />
        </Label>
      );
    case "number":
      return (
        <Label label={f.label} hint={f.hint}>
          <Input type="number" value={Number(value ?? 0)} onChange={(e) => onChange(+e.target.value)} />
        </Label>
      );
    case "date":
      return (
        <Label label={f.label}>
          <Input type="date" value={String(value || "")} onChange={(e) => onChange(e.target.value)} />
        </Label>
      );
    case "select":
      return (
        <Label label={f.label}>
          <Select value={String(value || "")} onChange={(e) => onChange(e.target.value)} options={f.options || []} />
        </Label>
      );
    case "tags":
      return (
        <Label label={f.label} hint={f.hint}>
          <Input value={((value as string[]) || []).join(", ")} onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
        </Label>
      );
    case "list":
      return (
        <Label label={f.label} hint={f.hint}>
          <Textarea rows={4} value={((value as string[]) || []).join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} onBlur={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
        </Label>
      );
    case "slug":
      return (
        <Label label={f.label} hint="Auto-generated from title">
          <Input value={String(value || "")} onChange={(e) => onChange(slugify(e.target.value))} className="font-mono text-[13px]" />
        </Label>
      );
    case "tickets":
      return <TicketsEditor value={(value as TicketTier[]) || []} onChange={onChange} />;
    default:
      return (
        <Label label={f.label} hint={f.hint}>
          <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </Label>
      );
  }
}

function TicketsEditor({ value, onChange }: { value: TicketTier[]; onChange: (v: TicketTier[]) => void }) {
  const up = (i: number, k: keyof TicketTier, v: string | number) => onChange(value.map((t, j) => (j === i ? { ...t, [k]: v } : t)));
  const cap = value.reduce((a, t) => a + t.capacity, 0);
  const sold = value.reduce((a, t) => a + t.sold, 0);
  const rev = value.reduce((a, t) => a + t.sold * t.price, 0);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink/80">Ticket tiers</span>
        <span className="text-[12px] text-muted">
          {sold}/{cap} sold · {inr(rev, true)} gross
        </span>
      </div>
      <div className="space-y-2">
        {value.map((t, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 rounded-[3px] bg-ink/[0.04] p-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
            <Input placeholder="Tier name" value={t.name} onChange={(e) => up(i, "name", e.target.value)} className="bg-white/70" />
            <Input type="number" placeholder="Price" value={t.price} onChange={(e) => up(i, "price", +e.target.value)} className="bg-white/70" title="Price" />
            <Input type="number" placeholder="Capacity" value={t.capacity} onChange={(e) => up(i, "capacity", +e.target.value)} className="bg-white/70" title="Capacity" />
            <Input type="number" placeholder="Sold" value={t.sold} onChange={(e) => up(i, "sold", +e.target.value)} className="bg-white/70" title="Sold" />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid h-11 w-11 place-items-center rounded-[3px] text-muted hover:bg-red-50 hover:text-red-600" aria-label="Remove tier">
              <Trash2 className="h-4 w-4" />
            </button>
            <Input placeholder="Perks (e.g. Entry · 1 drink)" value={t.perks} onChange={(e) => up(i, "perks", e.target.value)} className="col-span-2 bg-white/70 sm:col-span-5" />
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" className="mt-2" onClick={() => onChange([...value, { name: "New tier", price: 999, capacity: 100, sold: 0, perks: "" }])}>
        <Plus className="h-4 w-4" /> Add tier
      </Button>
      <p className="mt-2 flex items-center gap-1 text-[12px] text-muted">
        Columns: name · price (₹) · capacity · sold
      </p>
    </div>
  );
}
