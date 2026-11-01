export type ID = string;

export interface NavItem {
  label: string;
  href: string;
  image?: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface HomeSection {
  id: HomeSectionId;
  label: string;
  enabled: boolean;
}

export type HomeSectionId =
  | "hero"
  | "marquee"
  | "statement"
  | "services"
  | "events"
  | "process"
  | "gallery"
  | "testimonials"
  | "packages"
  | "team"
  | "journal"
  | "faq"
  | "cta";

export type IntroStyle = "counter" | "words" | "logo";

export interface Settings {
  brand: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    hours: string;
    timezone: string;
    socials: { label: string; href: string }[];
  };
  theme: {
    accent: string;
    accentSoft: string;
    pop: string;
    background: string;
    ink: string;
    dark: string;
    radius: number;
    cursor: boolean;
    smoothScroll: boolean;
  };
  intro: {
    enabled: boolean;
    style: IntroStyle;
    words: string[];
    duration: number;
    oncePerSession: boolean;
  };
  nav: {
    items: NavItem[];
    ctaLabel: string;
    ctaHref: string;
  };
  announcement: { enabled: boolean; text: string; href: string };
  hero: {
    eyebrow: string;
    line1: string;
    accent: string;
    rotating: string[];
    line2: string;
    subtitle: string;
    image: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
  };
  statement: { label: string; text: string };
  stats: Stat[];
  marquee: string[];
  about: {
    heading: string;
    body: string;
    image: string;
    values: { title: string; text: string }[];
  };
  process: { title: string; text: string }[];
  cta: { heading: string; accent: string; text: string; button: string };
  sections: HomeSection[];
  seo: { title: string; description: string };
}

export interface TicketTier {
  name: string;
  price: number;
  capacity: number;
  sold: number;
  perks: string;
}

export interface EventItem {
  id: ID;
  slug: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  image: string;
  excerpt: string;
  description: string;
  featured: boolean;
  status: "upcoming" | "past" | "draft";
  tickets: TicketTier[];
  highlights: string[];
}

export interface Service {
  id: ID;
  slug: string;
  title: string;
  icon: string;
  short: string;
  description: string;
  image: string;
  features: string[];
  startingPrice: number;
}

export interface GalleryItem {
  id: ID;
  image: string;
  title: string;
  category: string;
  shape: "tall" | "wide" | "square";
}

export interface Testimonial {
  id: ID;
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
}

export interface Post {
  id: ID;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  body: string;
  author: string;
  date: string;
  tags: string[];
  published: boolean;
}

export interface TeamMember {
  id: ID;
  name: string;
  role: string;
  photo: string;
  bio: string;
}

export interface Faq {
  id: ID;
  q: string;
  a: string;
}

export interface Package {
  id: ID;
  name: string;
  price: number;
  unit: string;
  tagline: string;
  features: string[];
  highlighted: boolean;
}

export type LeadStage = "new" | "contacted" | "proposal" | "negotiation" | "won" | "lost";

export interface Note {
  text: string;
  at: string;
}

export interface Lead {
  id: ID;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guests: number;
  budget: string;
  message: string;
  source: "contact" | "planner" | "manual" | "event";
  stage: LeadStage;
  value: number;
  owner: string;
  notes: Note[];
  createdAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "checked-in" | "cancelled";

export interface Booking {
  id: ID;
  eventId: ID;
  eventTitle: string;
  ticket: string;
  qty: number;
  total: number;
  name: string;
  email: string;
  phone: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Subscriber {
  id: ID;
  email: string;
  createdAt: string;
}

export interface Activity {
  id: ID;
  type: "lead" | "booking" | "content" | "settings" | "subscriber";
  text: string;
  at: string;
}

export interface Database {
  settings: Settings;
  events: EventItem[];
  services: Service[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  posts: Post[];
  team: TeamMember[];
  faqs: Faq[];
  packages: Package[];
  leads: Lead[];
  bookings: Booking[];
  subscribers: Subscriber[];
  activity: Activity[];
}

export type CollectionName =
  | "events"
  | "services"
  | "gallery"
  | "testimonials"
  | "posts"
  | "team"
  | "faqs"
  | "packages"
  | "leads"
  | "bookings"
  | "subscribers";
