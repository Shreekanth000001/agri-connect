# 🏗️ ARCHITECTURE — Agri-Connect v2

> **Last updated:** 2026-07-26

---

## 1. High-Level Overview

Agri-Connect is a **digital mandi (marketplace) platform** that connects Indian farmers directly with buyers through a transparent auction / bidding system. The goal is to eliminate middlemen and ensure fair pricing for agricultural produce.

```
┌──────────────────────────────────────────────────────────────┐
│                       VERCEL (Edge)                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Next.js 16 (App Router)                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │  React 19    │  │  API Routes  │  │  Server      │  │  │
│  │  │  Client      │  │  (REST)      │  │  Actions     │  │  │
│  │  │  Components  │  │              │  │              │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │  │
│  │         │                 │                  │          │  │
│  │         └────────┬────────┴──────────────────┘          │  │
│  │                  ▼                                      │  │
│  │         ┌────────────────┐                              │  │
│  │         │  Prisma ORM    │                              │  │
│  │         │  (Client)      │                              │  │
│  │         └────────┬───────┘                              │  │
│  └──────────────────┼────────────────────────────────────┘  │
│                     ▼                                        │
│            ┌────────────────┐                                │
│            │  PostgreSQL    │                                │
│            │  (DATABASE_URL)│                                │
│            └────────────────┘                                │
└──────────────────────────────────────────────────────────────┘
             │                  │                │
             ▼                  ▼                ▼
      ┌────────────┐   ┌──────────────┐  ┌────────────┐
      │ Cloudinary  │   │  Firebase     │  │ Leaflet.js │
      │ (Images)    │   │  (Storage/    │  │ (Maps)     │
      │             │   │   Analytics)  │  │            │
      └────────────┘   └──────────────┘  └────────────┘
```

---

## 2. Technology Stack

| Layer              | Technology                | Version   | Purpose                                        |
|--------------------|---------------------------|-----------|------------------------------------------------|
| **Framework**      | Next.js (App Router)      | 16.1.2    | Full-stack React framework, SSR/SSG            |
| **UI Library**     | React                     | 19.2.3    | Component-based UI                             |
| **Styling**        | Tailwind CSS              | 4.x       | Utility-first CSS via PostCSS                  |
| **Language**       | TypeScript                | 5.x       | Type safety across the codebase                |
| **ORM**            | Prisma                    | 6.4.0     | Database access layer, migrations, seeding     |
| **Database**       | PostgreSQL                | —         | Primary relational data store                  |
| **Auth**           | Custom JWT (jose) + bcrypt| —         | Session-based auth with HTTP-only cookies      |
| **Auth (config)**  | NextAuth (beta)           | 5.0.0-β30 | Auth config scaffold (partially integrated)    |
| **i18n**           | next-intl                 | 4.7.0     | Internationalization (currently English only)   |
| **Maps**           | Leaflet + react-leaflet   | 1.9 / 5.0 | Interactive proximity maps                     |
| **Image Upload**   | Cloudinary / next-cloudinary | 2.9 / 6.17 | Cloud-hosted image storage for listings     |
| **Storage (alt)**  | Firebase Storage          | 12.8.0    | Configured but secondary to Cloudinary         |
| **Icons**          | Lucide React, Heroicons   | —         | SVG icon libraries                             |
| **Date Utilities** | date-fns                  | 4.1.0     | Date formatting and manipulation               |
| **Deployment**     | Vercel                    | —         | Hosting, serverless functions, edge network    |

---

## 3. Directory Structure

```
agri-connect-v2/
├── app/                          # Next.js App Router (pages & routes)
│   ├── layout.tsx                # Root layout (HTML shell, providers)
│   ├── page.tsx                  # Home / Marketplace page (client)
│   ├── action.ts                 # Server actions (listing creation, test bids)
│   ├── globals.css               # Global styles (Tailwind import + overrides)
│   │
│   ├── ui/                       # Shared UI components
│   │   ├── Header.tsx            # Responsive nav bar (auth-aware)
│   │   └── Footer.tsx            # Site footer (auth-aware)
│   │
│   ├── auth/                     # Authentication pages
│   │   ├── login/page.tsx        # Login form (client)
│   │   ├── signup/page.tsx       # Registration form (client)
│   │   └── signupauth/route.ts   # Signup API handler (delegates to lib/auth)
│   │
│   ├── api/                      # REST API route handlers
│   │   ├── auth/route.ts         # POST — login (bcrypt verify → JWT session)
│   │   ├── bid/route.ts          # POST — place a bid (auth-guarded)
│   │   ├── contact/route.ts      # POST — submit contact message
│   │   └── profileedit/route.ts  # PUT  — update user profile (auth-guarded)
│   │
│   ├── dashboard/                # Farmer/Buyer dashboard
│   │   ├── page.tsx              # Server component — listings & bids
│   │   └── bidActionButtons.tsx  # Client component — accept/reject bids
│   │
│   ├── product/                  # Single product auction detail
│   │   ├── page.tsx              # Server component — auction + bids + map
│   │   ├── DisplayMap.tsx        # Leaflet map (client, farmer↔buyer distance)
│   │   ├── MapWrapper.tsx        # Dynamic import wrapper (SSR disabled)
│   │   ├── bid/page.tsx          # Bid placement form (client)
│   │   └── ProdUI/               # (Reserved / empty)
│   │
│   ├── productAuc/               # Create new auction listing
│   │   ├── page.tsx              # Listing form with Cloudinary upload (client)
│   │   └── imgUpload/            # Image upload sub-component
│   │
│   ├── productsroute/route.ts    # GET — open auctions (JSON, for homepage)
│   ├── productListings/route.ts  # GET — all auctions (JSON, for search)
│   │
│   ├── profile/                  # User profile
│   │   ├── page.tsx              # Profile view (server)
│   │   └── edit/page.tsx         # Profile edit form (client)
│   │
│   ├── search/page.tsx           # Search & filter page (client)
│   ├── about/page.tsx            # About / mission page (client)
│   └── contact/page.tsx          # Contact form page (client)
│
├── lib/                          # Shared server-side utilities
│   ├── auth.ts                   # Signup logic (bcrypt hash → Prisma → session)
│   ├── session.ts                # JWT encrypt/decrypt, cookie CRUD, logout
│   ├── prisma.ts                 # Singleton PrismaClient (dev hot-reload safe)
│   ├── definitions.tsx           # Zod schemas & TypeScript types
│   └── SessionProvider.tsx       # React Context provider (client session)
│
├── src/
│   ├── firebaseConfig.js         # Firebase app init (analytics + storage)
│   ├── i18n/request.ts           # next-intl locale resolver
│   └── generated/prisma/         # Prisma-generated client (auto-generated)
│
├── prisma/
│   ├── schema.prisma             # Database schema (4 models, 5 enums)
│   ├── seed.ts                   # Seed script (faker.js — 15 farmers, 5 buyers, 100 products, 50 bids)
│   └── migrations/               # 7 migration snapshots (Jan–Mar 2026)
│
├── messages/
│   └── en.json                   # English locale strings (minimal)
│
├── public/
│   ├── agri-conn-logo.png        # Logo icon
│   └── agri-conn.png             # Full logo image
│
├── auth.config.ts                # NextAuth config stub (signIn page override)
├── proxy.ts                      # Middleware (path header injection + NextAuth)
├── next.config.ts                # Next.js config (next-intl plugin)
├── tsconfig.json                 # TypeScript config (path aliases: @/*)
├── postcss.config.mjs            # PostCSS with Tailwind CSS plugin
├── eslint.config.mjs             # ESLint config (Next.js preset)
├── package.json                  # Dependencies & scripts
└── .gitignore                    # Git ignore rules
```

---

## 4. Authentication & Session Flow

The application uses a **custom JWT-based session system** built on the `jose` library, stored in HTTP-only cookies. NextAuth is configured at the skeleton level but is **not** the primary auth mechanism.

```
┌────────────┐        ┌──────────────┐        ┌──────────────┐
│   Client   │  POST  │  /api/auth   │        │   lib/       │
│  (Login    │───────▶│  route.ts    │───────▶│  session.ts  │
│   Form)    │        │              │        │              │
└────────────┘        │ 1. Find user │        │ 3. encrypt() │
                      │ 2. bcrypt    │        │    (JWT/HS256)│
                      │    compare   │        │ 4. Set cookie │
                      └──────────────┘        └──────────────┘
```

### Key Details

| Aspect           | Implementation                                                   |
|------------------|------------------------------------------------------------------|
| **Password hash**| `bcrypt` with 10 salt rounds                                     |
| **Token format** | JWT signed with HS256 via `jose`                                 |
| **Token payload**| `{ userDetails: { uid, uname, uloc }, expiresAt }`              |
| **Storage**      | HTTP-only, secure, SameSite=Lax cookie named `session`           |
| **TTL**          | 7 days                                                           |
| **Server read**  | `getUserSession()` — decrypts cookie, returns `{ uid, uname }`  |
| **Client read**  | `useUser()` hook via React Context (`SessionProvider`)           |
| **Logout**       | Deletes the `session` cookie and redirects to `/`                |

### Signup Flow

1. Client form POSTs to `/auth/signupauth` (route handler).
2. Route handler calls `signup()` in `lib/auth.ts`.
3. `signup()` hashes the password, creates a `User` row via Prisma, then calls `createSession()`.
4. Redirect to `/`.

---

## 5. Data Flow Patterns

### 5.1 Server Components (SSR)

Used for pages that need auth-gated data:

- **`/dashboard`** — Fetches farmer listings + buyer bids directly from Prisma on the server.
- **`/product?id=X`** — Fetches auction details, bids, and farmer info server-side.
- **`/profile`** — Reads user data from Prisma with session UID.

### 5.2 Client Components (CSR + Fetch)

Used for interactive, publicly browsable pages:

- **`/` (Home)** — Client-side `fetch('/productsroute')` to load open auctions.
- **`/search`** — Client-side `fetch('/productListings')` with local filtering by name and category.
- **`/product/bid`** — Client-side form that POSTs to `/api/bid`.
- **`/contact`** — Client-side form that POSTs to `/api/contact`.
- **`/profile/edit`** — Client-side form that PUTs to `/api/profileedit`.

### 5.3 API Routes (REST)

| Endpoint             | Method | Auth Required | Purpose                        |
|----------------------|--------|---------------|--------------------------------|
| `/productsroute`     | GET    | No            | List open auctions             |
| `/productListings`   | GET    | No            | List all auctions              |
| `/api/auth`          | POST   | No            | Login (email + password)       |
| `/auth/signupauth`   | POST   | No            | Register new user              |
| `/api/bid`           | POST   | Yes           | Place a bid on an auction      |
| `/api/contact`       | POST   | No            | Submit a contact message       |
| `/api/profileedit`   | PUT    | Yes           | Update user profile            |

---

## 6. Component Architecture

```
RootLayout (server)
├── NextIntlClientProvider          — i18n context
│   └── SessionProvider (client)    — user session context
│       ├── Header (client)         — nav bar, auth-aware, hides on /auth/*
│       ├── <main>
│       │   └── [Page]              — route-specific content
│       └── Footer (client)         — site footer, hides on /auth/*
```

### Key Component Behaviors

| Component               | Type     | Notable Behavior                                               |
|--------------------------|----------|----------------------------------------------------------------|
| `Header`                 | Client   | Responsive mobile menu; highlights active route; hides on auth pages |
| `Footer`                 | Client   | Multi-column links; newsletter form; hides on auth pages       |
| `SessionProvider`        | Client   | React Context wrapping `useUser()` hook                        |
| `DisplayMap`             | Client   | Leaflet map; calculates Haversine distance between two coords  |
| `MapWrapper`             | Client   | `next/dynamic` import with `ssr: false` for Leaflet            |
| `BidActionButtons`       | Client   | Accept / Reject buttons that PATCH bid status                  |

---

## 7. External Service Integration

### 7.1 Cloudinary

- **Usage:** Image uploads for product auction listings.
- **Integration:** `next-cloudinary` provides `CldUploadWidget` on the `productAuc` page.
- **Server-side:** `cloudinary` v2 SDK configured in `app/action.ts` (upload logic currently commented out in favor of client-side widget).
- **Config:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### 7.2 Firebase

- **Usage:** Firebase Storage and Analytics are initialized in `src/firebaseConfig.js`.
- **Status:** Configured but appears secondary — Cloudinary is the active image pipeline.
- **Config:** API keys hardcoded in config file (should be moved to env vars).

### 7.3 Leaflet.js

- **Usage:** Interactive map on the product detail page showing farmer and buyer locations.
- **Feature:** Calculates straight-line (displacement) distance between the two parties.
- **SSR:** Disabled via dynamic import (`MapWrapper`), since Leaflet requires `window`.

---

## 8. Middleware

**File:** `proxy.ts`

- Injects an `x-current-path` header with the current pathname into every request.
- Integrates NextAuth's `auth` middleware (from `auth.config.ts`).
- Excludes `api`, `_next/static`, `_next/image`, and `favicon.ico` from middleware matching.

---

## 9. Internationalization (i18n)

- **Library:** `next-intl` v4.7
- **Current locales:** English only (`messages/en.json`).
- **Resolver:** `src/i18n/request.ts` hardcodes locale to `'en'`.
- **Usage:** `useFormatter()` is used for date formatting on the marketplace and search pages.
- **Expansion:** The architecture supports adding new locale JSON files under `messages/`.

---

## 10. Environment Variables

| Variable                              | Used In              | Purpose                      |
|---------------------------------------|----------------------|------------------------------|
| `DATABASE_URL`                        | Prisma schema        | PostgreSQL connection string |
| `SESSION_SECRET`                      | `lib/session.ts`     | JWT signing key              |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`   | `app/action.ts`      | Cloudinary cloud name        |
| `CLOUDINARY_API_KEY`                  | `app/action.ts`      | Cloudinary API key           |
| `CLOUDINARY_API_SECRET`              | `app/action.ts`      | Cloudinary API secret        |

> **Note:** Firebase config values are currently hardcoded in `src/firebaseConfig.js` rather than loaded from environment variables.

---

## 11. Build & Development

```bash
# Development
npm run dev          # Starts Next.js dev server on port 3000

# Production build
npm run build        # Runs `prisma generate && next build`

# Start production
npm start            # Runs `next start`

# Database
npx prisma migrate dev    # Apply migrations
npx prisma db seed        # Seed with faker data (15 farmers, 5 buyers, 100 products, 50 bids)
npx prisma studio         # Visual database browser
```

---

## 12. Deployment

- **Platform:** Vercel
- **Live URL:** [https://agri-connect-it.vercel.app](https://agri-connect-it.vercel.app)
- **Build command:** `prisma generate && next build`
- **Serverless functions:** API routes and server components run as Vercel serverless functions.
- **Database:** External PostgreSQL instance (connection via `DATABASE_URL`).
