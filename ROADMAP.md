# 🗺️ ROADMAP — Agri-Connect v2

> **Last updated:** 2026-07-26  
> **Current version:** 0.1.0 (MVP)  
> **Live:** [agri-connect-it.vercel.app](https://agri-connect-it.vercel.app)

---

## Current State Summary

Agri-Connect v2 is a working MVP deployed on Vercel. The core auction flow — farmer lists produce → buyer places bid → farmer accepts/rejects — is fully functional. Authentication, profile management, proximity maps, and a contact form are all live. The codebase uses Next.js 16 (App Router), Prisma with PostgreSQL, Tailwind CSS, and Leaflet.js.

### ✅ What's Working

- Farmer registration with role selection and GPS map picker
- Buyer registration with location tracking
- Custom JWT session auth (bcrypt + jose + HTTP-only cookies)
- Product auction creation with Cloudinary image upload (up to 5 images)
- Marketplace grid with product cards (home page)
- Product detail page with image gallery, bid form, and proximity map
- Bid placement with duplicate-bid prevention
- Farmer dashboard: view listings, accept/reject bids (auto-closes auction)
- Buyer dashboard: view bid history and status
- Server-side search by title/description
- User profile view and edit (phone, address)
- Contact form with database persistence
- Responsive header/footer (hidden on auth pages)
- Vercel deployment with PostgreSQL

---

## Phase 1 — Code Quality & Security Hardening

> **Priority:** Critical  
> **Effort:** 1–2 weeks

These items address bugs, security gaps, and tech debt in the existing codebase.

### 🔒 Security

- [ ] **Move Firebase API keys to environment variables** — keys are currently hardcoded in `src/firebaseConfig.js`
- [ ] **Add server-side auth guards to all API routes** — `/productsroute` and `/productListings` lack rate-limiting; `/product/bid/route.ts` does not verify session
- [ ] **Add input validation and sanitization** — no Zod / schema validation on most API route inputs (bid amounts, form fields)
- [ ] **Fix bcrypt import** — replace `require('bcrypt')` with proper ES module import, or switch to a WASM-compatible alternative like `bcryptjs` for edge compatibility
- [ ] **Add CSRF protection** — API routes using cookie-based auth have no CSRF tokens

### 🐛 Bug Fixes

- [ ] **Fix typo in BidForm** — `fontally` should be `finally` in `app/product/ProdUI/BidForm.tsx`
- [ ] **Consolidate duplicate route files** — two route files serve product listings (`productsroute/route.ts` and `productListings/route.ts`); the `/productListings` route handler has a `POST` method that overlaps with what the product page does server-side
- [ ] **Consolidate signup route** — `signupauth/route.ts` and `lib/auth.ts > signup()` both handle registration; only one path should remain
- [ ] **Consolidate login route** — `/api/auth` (unused) and `/auth/login/loginauth` (active) both handle login; clean up the unused route
- [ ] **Fix double-import in prisma references** — several files use `@/lib//prisma` (double slash)

### 🏗️ Tech Debt

- [ ] **Remove unused `next-auth` dependency** — NextAuth is configured as a stub but the app uses custom JWT auth; either commit to NextAuth or remove it
- [ ] **Decide on Firebase vs Cloudinary** — Firebase Storage is initialized but unused; Cloudinary is the active image pipeline. Remove unused integration.
- [ ] **Type the `any` types** — `SessionContext`, page component props, and API responses use `any` throughout
- [ ] **Add `loading.tsx` and `error.tsx` files** — Next.js App Router conventions for loading/error states are not used
- [ ] **Extract reusable product card component** — duplicated across home page, search page, and search results

---

## Phase 2 — Core Feature Enhancements

> **Priority:** High  
> **Effort:** 3–4 weeks

Features that strengthen the core marketplace experience.

### 🔍 Search & Discovery

- [ ] **Full-text search with PostgreSQL** — replace `contains` with `pg_trgm` or full-text search for fuzzy matching and better performance
- [ ] **Category-based browsing pages** — dedicated routes like `/category/vegetables` with SSR
- [ ] **Sort and filter controls** — by price range, auction end date, distance, category on marketplace
- [ ] **Pagination / infinite scroll** — currently all products are fetched in a single query with no limit

### ⚖️ Auction System

- [ ] **Automatic auction closing** — use a cron job or Vercel scheduled function to close expired auctions and notify participants
- [ ] **Counter-bidding / bid updates** — allow buyers to increase their existing bid instead of being locked out
- [ ] **Minimum bid increment** — enforce a minimum increment over the current highest bid
- [ ] **Bid history timeline** — show full bid history on the product page with timestamps
- [ ] **Reserve price support** — let farmers set a minimum acceptable price

### 👤 User Experience

- [ ] **Password reset / forgot password** — the "Forgot password?" link is currently a dead `#` anchor
- [ ] **Email verification** — no email verification on signup; anyone can register with any email
- [ ] **Notifications system** — notify farmers when bids are received; notify buyers when bids are accepted/rejected
- [ ] **Avatar upload** — currently uses the first letter of the name; add Cloudinary-powered profile photos
- [ ] **Role switching** — allow a user to be both a farmer and a buyer without creating separate accounts

---

## Phase 3 — Platform Expansion

> **Priority:** Medium  
> **Effort:** 4–6 weeks

Features that expand the platform's value proposition.

### 🌐 Localization & Accessibility

- [ ] **Add Hindi and Kannada translations** — the `next-intl` infrastructure is in place but only English exists
- [ ] **RTL layout support** — for potential Urdu or Arabic markets
- [ ] **Accessibility audit** — semantic HTML, ARIA labels, keyboard navigation, color contrast

### 📊 Analytics & Insights

- [ ] **Farmer analytics dashboard** — total bids received, average bid price, revenue over time, top performing products
- [ ] **Buyer analytics** — bid success rate, spending history, favorite categories
- [ ] **Admin dashboard** — manage users, moderate listings, view contact messages, platform-wide stats
- [ ] **Activate Firebase Analytics** — analytics is initialized but not connected to any event tracking

### 💬 Communication

- [ ] **In-app messaging** — direct chat between farmer and buyer after bid acceptance
- [ ] **Email notifications** — transactional emails for bid updates, auction reminders using a service like Resend or SendGrid
- [ ] **SMS notifications** — via Twilio for farmers who may not check email regularly

### 💳 Payments & Logistics

- [ ] **Payment gateway integration** — Razorpay / Stripe for escrow-based payments
- [ ] **Order tracking** — post-acceptance delivery workflow with status updates
- [ ] **Invoice generation** — PDF invoices for completed transactions
- [ ] **Delivery cost estimation** — integrate with logistics APIs or use distance-based calculation

---

## Phase 4 — Scale & Infrastructure

> **Priority:** Low (future)  
> **Effort:** Ongoing

### 🏗️ Infrastructure

- [ ] **Add automated tests** — unit tests (Vitest), integration tests, and E2E tests (Playwright)
- [ ] **Set up CI/CD pipeline** — GitHub Actions for lint, test, and deploy on push
- [ ] **Add API rate limiting** — protect endpoints from abuse (e.g. bid spamming)
- [ ] **Database connection pooling** — use Prisma Accelerate or PgBouncer for production scaling
- [ ] **Image optimization** — use Next.js `<Image>` component with Cloudinary loader instead of raw `<img>` tags
- [ ] **Error monitoring** — integrate Sentry for production error tracking
- [ ] **Structured logging** — replace `console.log` / `console.error` with a proper logger

### 📱 Mobile

- [ ] **Progressive Web App (PWA)** — add service worker, manifest, offline support
- [ ] **React Native app** — native mobile experience for farmers with limited connectivity

### 🤖 Intelligence

- [ ] **Price suggestion AI** — ML-based pricing recommendations for farmers based on historical data, season, and market trends
- [ ] **Crop disease detection** — image analysis on uploaded product photos
- [ ] **Demand forecasting** — predict buyer demand by region and season

---

## Version Milestones

| Version | Target                      | Key Deliverables                                              |
|---------|-----------------------------|---------------------------------------------------------------|
| **0.2** | Code quality release        | Bug fixes, security hardening, type safety, test setup        |
| **0.3** | Enhanced marketplace        | Pagination, sorting, fuzzy search, auto-close auctions        |
| **0.4** | User trust release          | Password reset, email verification, notifications             |
| **0.5** | Multi-language              | Hindi + Kannada translations, accessibility audit             |
| **0.6** | Admin & analytics           | Admin dashboard, farmer/buyer analytics                       |
| **1.0** | Payment-ready               | Razorpay integration, order tracking, invoices                |
| **1.5** | Mobile-first                | PWA + optional React Native app                               |
| **2.0** | Intelligence layer          | AI pricing, demand forecasting, crop analysis                 |
