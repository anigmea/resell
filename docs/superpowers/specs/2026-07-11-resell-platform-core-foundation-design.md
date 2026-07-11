# Resell Platform — Core Foundation Design

**Date:** 2026-07-11
**Scope:** Sub-project 1 of 6 — Auth, Event Catalog, Listings, Search

---

## Overview

A hybrid P2P + platform-inventory ticket resale marketplace for India, launching in 1-2 metro cities (quality-first). Buyers discover and purchase resale event tickets; sellers list tickets they own. The platform holds tickets in escrow and verifies authenticity before releasing to buyers.

This spec covers the **core foundation**: monorepo setup, auth, event catalog, listing creation, basic search, and the admin event management interface. Payment, escrow logic, mobile apps, notifications, and admin moderation are covered in subsequent specs.

---

## Architecture

**Pattern:** Dedicated API + Next.js Web + Expo Mobile in a Turborepo monorepo.

All clients (web + mobile) consume the same Fastify REST API. Shared TypeScript types live in `packages/shared`. Prisma schema lives in `packages/db`.

```
resell/
├── apps/
│   ├── api/        ← Fastify + BullMQ workers (Node.js)
│   ├── web/        ← Next.js 14 (App Router, SSR for event pages)
│   └── mobile/     ← Expo SDK 51 (iOS + Android)
├── packages/
│   ├── shared/     ← Zod schemas + TypeScript types
│   ├── db/         ← Prisma schema + generated client
│   └── config/     ← shared tsconfig, eslint
```

**Infrastructure:**
- **Database:** PostgreSQL via Supabase (managed, includes auth helpers)
- **ORM:** Prisma
- **Cache / Sessions:** Redis via Upstash
- **File Storage:** Cloudflare R2 (ticket files, images)
- **Background Jobs:** BullMQ on Redis (escrow expiry, notifications — wired in later specs)

**Third-party integrations (this spec: auth only):**
- MSG91 — OTP / SMS for phone verification
- Resend — transactional email (welcome, listing confirmation)

---

## Data Model

### `users`
```prisma
model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  phone         String   @unique
  passwordHash  String
  role          Role     @default(BUYER)   // BUYER | SELLER | ADMIN
  kycStatus     KycStatus @default(UNVERIFIED) // UNVERIFIED | PENDING | VERIFIED
  upiId         String?
  bankAccount   String?  // encrypted, for payouts
  listings      Listing[]
  orders        Order[]
  createdAt     DateTime @default(now())
}
```

### `venues`
```prisma
model Venue {
  id        String   @id @default(cuid())
  name      String
  city      String
  address   String
  mapsUrl   String?
  capacity  Int?
  events    Event[]
}
```

### `events`
```prisma
model Event {
  id          String      @id @default(cuid())
  title       String
  description String?
  category    Category    // CONCERT | SPORTS | COMEDY | FESTIVAL | OTHER
  venueId     String
  venue       Venue       @relation(fields: [venueId], references: [id])
  organizer   String?
  dateTime    DateTime
  bannerImage String?     // R2 URL
  status      EventStatus @default(UPCOMING) // UPCOMING | LIVE | PAST | CANCELLED
  city        String
  listings    Listing[]
  createdAt   DateTime    @default(now())
}
```

### `listings`
```prisma
model Listing {
  id              String        @id @default(cuid())
  eventId         String
  event           Event         @relation(fields: [eventId], references: [id])
  sellerId        String
  seller          User          @relation(fields: [sellerId], references: [id])
  seatSection     String?
  seatRow         String?
  seatNumber      String?
  originalPrice   Int           // in paise
  askingPrice     Int           // in paise
  ticketFileUrl   String        // R2 URL, encrypted at rest
  status          ListingStatus @default(PENDING_VERIFICATION)
  // PENDING_VERIFICATION | ACTIVE | SOLD | EXPIRED | REJECTED
  expiresAt       DateTime?
  orders          Order[]
  createdAt       DateTime      @default(now())
}
```

### `orders`
```prisma
model Order {
  id                String      @id @default(cuid())
  listingId         String
  listing           Listing     @relation(fields: [listingId], references: [id])
  buyerId           String
  buyer             User        @relation("BuyerOrders", fields: [buyerId], references: [id])
  sellerId          String
  seller            User        @relation("SellerOrders", fields: [sellerId], references: [id])
  amount            Int         // total paid by buyer, in paise
  platformFee       Int         // in paise
  sellerPayout      Int         // in paise
  paymentStatus     PaymentStatus @default(PENDING)
  // PENDING | PAID | REFUNDED
  razorpayOrderId   String?
  razorpayPaymentId String?
  ticketReleasedAt  DateTime?
  createdAt         DateTime    @default(now())
}
```

---

## API Routes

All routes prefixed `/api/v1`. Authentication via JWT (access token in `Authorization: Bearer`, refresh token in httpOnly cookie).

### Auth
```
POST   /auth/register          ← email + phone + password
POST   /auth/login             ← email/phone + password → JWT pair
POST   /auth/logout            ← clears refresh token cookie
POST   /auth/refresh           ← rotate access token
POST   /auth/otp/send          ← send OTP to phone via MSG91
POST   /auth/otp/verify        ← verify OTP, mark phone as confirmed
```

### Events
```
GET    /events                 ← list, filterable: ?city=&category=&date=&q=
GET    /events/:id             ← event detail + venue
GET    /events/:id/listings    ← all ACTIVE listings for event (paginated)
```

### Listings
```
POST   /listings               ← seller creates listing, uploads ticket file to R2
GET    /listings/:id           ← listing detail
PATCH  /listings/:id           ← seller updates asking price or removes listing
DELETE /listings/:id           ← seller deletes listing (if not SOLD)
GET    /users/me/listings      ← seller's own listings
```

### Users
```
GET    /users/me               ← current user profile
PATCH  /users/me               ← update name, UPI ID, bank account
GET    /users/me/orders        ← buyer's purchase history
```

### Search
```
GET    /search?q=&city=&category=&date=  ← full-text search across events
```

### Admin
```
POST   /admin/events           ← create event (admin only)
PATCH  /admin/events/:id       ← update event details or status
POST   /admin/venues           ← create venue
PATCH  /admin/listings/:id/verify   ← approve listing → status ACTIVE
PATCH  /admin/listings/:id/reject   ← reject listing → status REJECTED
```

---

## Key Design Decisions

### Authentication
- Phone OTP (MSG91) required to activate seller account
- Email + password for primary login; phone OTP as second factor for sellers
- JWT access tokens (15 min expiry) + refresh tokens (30 days, httpOnly cookie)
- Passwords hashed with bcrypt (12 rounds)

### Ticket Upload
- Seller uploads ticket file (PDF or image) directly to R2 via a pre-signed URL returned by the API
- File URL stored in `listings.ticketFileUrl`; file is private (not publicly accessible)
- Admin reviews the file before marking listing ACTIVE
- File encryption at rest handled by R2 default encryption

### Listing Verification Flow
1. Seller submits listing form + uploads ticket file
2. Listing created with status `PENDING_VERIFICATION`
3. Admin receives notification (out of scope this spec) and reviews ticket
4. Admin approves → `ACTIVE`; or rejects → `REJECTED` with reason
5. Only `ACTIVE` listings appear in event listing pages and search

### Search
- PostgreSQL full-text search using `tsvector` on `events.title`, `events.description`, `events.city`, `venues.name`
- Filtered by city, category, date range
- Simple for launch; can move to Meilisearch/Typesense later when needed

### Seller Role
- Any registered user can become a seller by completing phone OTP verification
- KYC (ID + bank details) required before first payout (handled in payments spec)

---

## Component Breakdown

### `apps/api`
- `src/routes/` — one file per resource (auth, events, listings, users, search, admin)
- `src/middleware/` — auth guard, role guard, error handler
- `src/services/` — business logic (AuthService, EventService, ListingService, UploadService)
- `src/workers/` — BullMQ worker stubs (wired in escrow spec)
- `src/plugins/` — Fastify plugins (prisma, redis, cors, rate-limit)

### `apps/web`
- `app/(public)/` — event browse, search, event detail, listing detail
- `app/(auth)/` — login, register, OTP verification
- `app/(seller)/` — create listing, my listings
- `app/(buyer)/` — my orders
- `app/(admin)/` — event management, listing verification queue

### `apps/mobile`
- Same screen structure as web, React Navigation for routing
- Shares `packages/shared` types and Zod schemas

### `packages/shared`
- Zod schemas for all request/response bodies
- TypeScript types derived from Prisma schema (re-exported)
- Constants: categories, cities, fee structure

---

## Out of Scope (Subsequent Specs)

| Feature | Spec |
|---|---|
| Checkout & Razorpay payment | Spec 2: Payments |
| Escrow release logic | Spec 2: Payments |
| Seller payouts | Spec 2: Payments |
| Buyer guarantee / refund flows | Spec 2: Payments |
| Platform-owned inventory management | Spec 3: Admin Dashboard |
| Seller ratings & reviews | Spec 3: Admin Dashboard |
| Push / SMS / email notifications | Spec 4: Notifications |
| Native mobile deep-linking, app store submission | Spec 5: Mobile |

---

## Testing

- **Unit:** Services tested in isolation with mocked Prisma client (Vitest)
- **Integration:** Fastify `inject()` for route-level tests against a test Postgres DB
- **E2E (web):** Playwright covering: register → verify phone → create listing → browse events → search
- **Mobile:** Detox for critical flows (register, browse, listing creation)
