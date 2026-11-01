import type { CollectionName } from "@/lib/types";

export type FieldType = "text" | "textarea" | "richtext" | "number" | "image" | "select" | "boolean" | "date" | "tags" | "list" | "tickets" | "slug";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  hint?: string;
  half?: boolean;
  from?: string; // for slug
};

export type Schema = {
  name: CollectionName;
  label: string;
  singular: string;
  description: string;
  titleKey: string;
  subtitle: (it: Record<string, unknown>) => string;
  imageKey?: string;
  publicHref?: (it: Record<string, unknown>) => string;
  fields: Field[];
  defaults: Record<string, unknown>;
};

const ICON_OPTIONS = ["Heart", "Briefcase", "Music", "Sparkles", "Cake", "Mic", "Camera", "Utensils", "PartyPopper", "Gem", "Flower2", "Megaphone", "Palette", "Building2", "Globe", "Star"];

export const SCHEMAS: Record<string, Schema> = {
  events: {
    name: "events",
    label: "Events",
    singular: "event",
    description: "Ticketed events shown on the website, with tiers, capacity and live sales.",
    titleKey: "title",
    imageKey: "image",
    subtitle: (e) => `${e.date} · ${e.city} · ${e.status}`,
    publicHref: (e) => `/events/${e.slug}`,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "URL slug", type: "slug", from: "title" },
      { key: "category", label: "Category", type: "select", options: ["Concert", "Conference", "Dining", "Exhibition", "Festival", "Gala", "Wedding", "Workshop", "Party"], half: true },
      { key: "status", label: "Status", type: "select", options: ["upcoming", "past", "draft"], half: true },
      { key: "date", label: "Date", type: "date", half: true },
      { key: "time", label: "Start time", type: "text", half: true },
      { key: "venue", label: "Venue", type: "text", half: true },
      { key: "city", label: "City", type: "text", half: true },
      { key: "featured", label: "Feature on homepage", type: "boolean" },
      { key: "image", label: "Cover image", type: "image" },
      { key: "excerpt", label: "Short description", type: "textarea" },
      { key: "description", label: "Full description", type: "richtext", hint: "Blank line = new paragraph" },
      { key: "highlights", label: "Highlights", type: "list", hint: "One per line" },
      { key: "tickets", label: "Ticket tiers", type: "tickets" },
    ],
    defaults: { title: "", slug: "", category: "Concert", status: "draft", date: new Date().toISOString().slice(0, 10), time: "7:00 PM", venue: "", city: "Mumbai", featured: false, image: "", excerpt: "", description: "", highlights: [], tickets: [{ name: "General", price: 1999, capacity: 200, sold: 0, perks: "Entry" }] },
  },
  services: {
    name: "services",
    label: "Services",
    singular: "service",
    description: "Service verticals — shown as stacking cards on the homepage and on /services.",
    titleKey: "title",
    imageKey: "image",
    subtitle: (s) => String(s.short),
    publicHref: (s) => `/services#${s.slug}`,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "Slug", type: "slug", from: "title" },
      { key: "icon", label: "Icon", type: "select", options: ICON_OPTIONS, half: true },
      { key: "startingPrice", label: "Starting price (₹)", type: "number", half: true },
      { key: "short", label: "One-liner", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
      { key: "features", label: "Features", type: "list", hint: "One per line" },
    ],
    defaults: { title: "", slug: "", icon: "Sparkles", startingPrice: 500000, short: "", description: "", image: "", features: [] },
  },
  gallery: {
    name: "gallery",
    label: "Portfolio",
    singular: "photo",
    description: "Portfolio photos — used in the parallax gallery and the /portfolio masonry.",
    titleKey: "title",
    imageKey: "image",
    subtitle: (g) => `${g.category} · ${g.shape}`,
    fields: [
      { key: "image", label: "Photo", type: "image" },
      { key: "title", label: "Caption", type: "text" },
      { key: "category", label: "Category", type: "select", options: ["Weddings", "Corporate", "Concerts", "Private"], half: true },
      { key: "shape", label: "Shape", type: "select", options: ["square", "tall", "wide"], half: true },
    ],
    defaults: { image: "", title: "", category: "Weddings", shape: "square" },
  },
  posts: {
    name: "posts",
    label: "Journal",
    singular: "post",
    description: "Blog / journal articles. Use ## at the start of a paragraph for a heading.",
    titleKey: "title",
    imageKey: "cover",
    subtitle: (p) => `${p.date} · ${p.author} · ${p.published ? "Published" : "Draft"}`,
    publicHref: (p) => `/journal/${p.slug}`,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "Slug", type: "slug", from: "title" },
      { key: "published", label: "Published", type: "boolean" },
      { key: "date", label: "Date", type: "date", half: true },
      { key: "author", label: "Author", type: "text", half: true },
      { key: "tags", label: "Tags", type: "tags", hint: "Comma separated" },
      { key: "cover", label: "Cover image", type: "image" },
      { key: "excerpt", label: "Excerpt", type: "textarea" },
      { key: "body", label: "Body", type: "richtext", hint: "## Heading, blank line between paragraphs" },
    ],
    defaults: { title: "", slug: "", published: false, date: new Date().toISOString().slice(0, 10), author: "Lumé Studio", tags: [], cover: "", excerpt: "", body: "" },
  },
  testimonials: {
    name: "testimonials",
    label: "Testimonials",
    singular: "testimonial",
    description: "Client quotes shown in the testimonials carousel.",
    titleKey: "name",
    imageKey: "avatar",
    subtitle: (t) => String(t.role),
    fields: [
      { key: "name", label: "Name", type: "text", half: true },
      { key: "role", label: "Role / event", type: "text", half: true },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "avatar", label: "Photo", type: "image" },
      { key: "rating", label: "Rating (1–5)", type: "number" },
    ],
    defaults: { name: "", role: "", quote: "", avatar: "", rating: 5 },
  },
  team: {
    name: "team",
    label: "Team",
    singular: "team member",
    description: "People shown on the About page and (optionally) the homepage.",
    titleKey: "name",
    imageKey: "photo",
    subtitle: (t) => String(t.role),
    fields: [
      { key: "name", label: "Name", type: "text", half: true },
      { key: "role", label: "Role", type: "text", half: true },
      { key: "photo", label: "Photo", type: "image" },
      { key: "bio", label: "Short bio", type: "textarea" },
    ],
    defaults: { name: "", role: "", photo: "", bio: "" },
  },
  packages: {
    name: "packages",
    label: "Packages",
    singular: "package",
    description: "Pricing packages shown on the homepage and services page.",
    titleKey: "name",
    subtitle: (p) => `₹${Number(p.price).toLocaleString("en-IN")} ${p.unit}${p.highlighted ? " · Highlighted" : ""}`,
    fields: [
      { key: "name", label: "Name", type: "text", half: true },
      { key: "price", label: "Price (₹)", type: "number", half: true },
      { key: "unit", label: "Price label", type: "text", half: true },
      { key: "highlighted", label: "Highlight as most popular", type: "boolean" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "features", label: "Features", type: "list", hint: "One per line" },
    ],
    defaults: { name: "", price: 500000, unit: "starting", highlighted: false, tagline: "", features: [] },
  },
  faqs: {
    name: "faqs",
    label: "FAQs",
    singular: "question",
    description: "Frequently asked questions.",
    titleKey: "q",
    subtitle: (f) => String(f.a).slice(0, 90) + "…",
    fields: [
      { key: "q", label: "Question", type: "text" },
      { key: "a", label: "Answer", type: "textarea" },
    ],
    defaults: { q: "", a: "" },
  },
};
