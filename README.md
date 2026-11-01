# Lumé — Event management website + Admin (CRM & CMS)

A demo-ready event studio website (editorial system: Host Grotesk only, paper × ink, one accent) built with **Next.js 16 (App Router)**, **Tailwind CSS 4**, **Framer Motion** and **Lenis** smooth scroll — plus a full admin panel to run the business and control the entire site.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Admin: **http://localhost:3000/admin** — demo login `admin@lume.events` / `lume2026` (pre-filled). Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET` in production (see `.env.example`).

Production: `npm run build && npm start`.

## Public website

| Feature | Where |
| --- | --- |
| Intro / preloader — 3 styles (counter + words, big words, logo reveal), curved curtain exit | every first load |
| “Dynamic Island” navbar — morphs from a pill into a full menu with image previews, live clock, scroll-progress ring; docks to the **bottom** on mobile for thumb reach | global |
| **“Stage” hero** — dark stage with a cursor-following spotlight (auto-drifts on mobile), Ken-Burns event slideshow with progress index, letter-by-letter rolling word, 3D-tilt ticket card with live countdown, “now booking” ticker; shrinks into a card on scroll | `/` |
| Scroll-direction marquee, Apple-style scroll-lit statement, animated counters | `/` |
| Sticky **stacking service cards**, **pinned horizontal** event rail (snap carousel on mobile) | `/` |
| Scroll-progress process timeline, 3-column **parallax gallery**, testimonials with progress, spotlight pricing cards, FAQ accordion, scaling CTA with rotating text ring | `/` |
| Events listing with animated filters, search, upcoming/past | `/events` |
| Event page: parallax hero, ticket tiers, quantity, 2-step checkout, add-to-calendar (.ics), share, map | `/events/[slug]` |
| **Ticket confirmation with QR code** + confetti | `/booking/[id]` |
| 4-step **event planner** wizard → creates CRM lead | `/contact` |
| Services, Portfolio (masonry + lightbox), About, Journal (blog), newsletter, custom cursor, page transitions, 404 | … |

## Admin panel (`/admin`)

- **Dashboard** — revenue chart, pipeline by stage, win rate, upcoming events sell-through, latest leads, activity feed.
- **CRM**
  - Leads pipeline — drag-and-drop Kanban + list view, owners, deal value, notes timeline, email/call/WhatsApp actions, CSV export.
  - Contacts — unified from leads + bookings with lifetime spend & timeline.
  - Bookings — filters, status, **quick check-in by booking code / QR text**, CSV export.
  - Subscribers — newsletter list, copy/export.
- **CMS** — Events (with ticket tiers), Services, Portfolio, Journal, Testimonials, Team, Packages, FAQs. Image upload, Unsplash library picker, drag reorder, duplicate, draft/publish.
- **Site settings** — brand & contact, socials, announcement bar, SEO preview, **theme colours/presets/radius**, smooth scroll & cursor toggles, **intro animation** (style, words, duration, live preview), **navbar** items/order/images/CTA, **homepage section order & visibility**, hero copy & image, stats, marquee, about, process, CTA, reset demo data.

## Data

Content is stored in a JSON file (`data/db.json`, created on first change, seeded from `lib/seed.ts`). This is perfect for a demo or a single server. On read-only/serverless hosts (e.g. Vercel) it falls back to the temp directory, so changes are **not durable** there — swap `lib/db.ts` for Postgres/Supabase/Sanity for a real deployment; the UI does not need to change.

Payments are mocked in checkout — plug in Razorpay/Stripe in `app/api/public/booking/route.ts`.

Images: Unsplash.

> Already ran an older version? Admin → Site settings → General → **Reset demo** to load the new theme & hero copy.
