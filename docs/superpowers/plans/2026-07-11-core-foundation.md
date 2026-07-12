# Core Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the monorepo skeleton, Prisma schema, Fastify API (auth, events, listings, users, search, admin routes), and Next.js web app for the resell ticket platform.

**Architecture:** Turborepo monorepo with `apps/api` (Fastify + Node.js), `apps/web` (Next.js 14 App Router), `apps/mobile` (Expo), and `packages/db` (Prisma) + `packages/shared` (Zod schemas + types) + `packages/config` (shared tsconfig/eslint). All clients hit the same Fastify REST API at `/api/v1`.

**Tech Stack:** Node.js 20, TypeScript, Turborepo, Fastify 4, Prisma 5, PostgreSQL (Supabase), Redis (Upstash), Cloudflare R2, Next.js 14, Expo SDK 51, Vitest, Playwright

---

## File Map

```
resell/
├── package.json                          ← turbo root
├── turbo.json                            ← pipeline config
├── .env.example
├── packages/
│   ├── config/
│   │   ├── tsconfig.base.json
│   │   └── eslint.base.js
│   ├── db/
│   │   ├── package.json
│   │   ├── prisma/schema.prisma          ← full schema (all models + enums)
│   │   └── src/index.ts                  ← exports PrismaClient singleton
│   └── shared/
│       ├── package.json
│       └── src/
│           ├── index.ts
│           ├── constants.ts              ← CATEGORIES, CITIES, PLATFORM_FEE_PCT
│           ├── schemas/
│           │   ├── auth.ts               ← Zod schemas for auth routes
│           │   ├── events.ts
│           │   ├── listings.ts
│           │   ├── users.ts
│           │   └── search.ts
│           └── types.ts                  ← TS types re-exported from schemas
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts                  ← Fastify app entry, registers plugins + routes
│   │   │   ├── plugins/
│   │   │   │   ├── prisma.ts             ← decorates fastify.prisma
│   │   │   │   ├── redis.ts              ← decorates fastify.redis
│   │   │   │   ├── cors.ts
│   │   │   │   └── rateLimit.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts               ← verifyJwt preHandler
│   │   │   │   ├── role.ts               ← requireRole(role) preHandler
│   │   │   │   └── errorHandler.ts
│   │   │   ├── services/
│   │   │   │   ├── AuthService.ts
│   │   │   │   ├── EventService.ts
│   │   │   │   ├── ListingService.ts
│   │   │   │   ├── UploadService.ts      ← R2 pre-signed URL generation
│   │   │   │   └── SearchService.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── events.ts
│   │   │   │   ├── listings.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── search.ts
│   │   │   │   └── admin.ts
│   │   │   └── workers/
│   │   │       └── index.ts              ← BullMQ stubs (empty for now)
│   │   └── test/
│   │       ├── setup.ts
│   │       ├── services/
│   │       │   ├── AuthService.test.ts
│   │       │   ├── EventService.test.ts
│   │       │   ├── ListingService.test.ts
│   │       │   └── SearchService.test.ts
│   │       └── routes/
│   │           ├── auth.test.ts
│   │           ├── events.test.ts
│   │           ├── listings.test.ts
│   │           └── admin.test.ts
│   ├── web/
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   └── app/
│   │       ├── layout.tsx
│   │       ├── (public)/
│   │       │   ├── page.tsx              ← event browse / home
│   │       │   ├── events/[id]/page.tsx  ← event detail + listings
│   │       │   └── search/page.tsx
│   │       ├── (auth)/
│   │       │   ├── login/page.tsx
│   │       │   ├── register/page.tsx
│   │       │   └── verify/page.tsx       ← OTP verification
│   │       ├── (seller)/
│   │       │   ├── listings/new/page.tsx
│   │       │   └── listings/page.tsx     ← my listings
│   │       ├── (buyer)/
│   │       │   └── orders/page.tsx
│   │       └── (admin)/
│   │           ├── events/page.tsx       ← create/edit events
│   │           └── listings/page.tsx     ← verification queue
│   └── mobile/
│       ├── package.json
│       ├── app.json
│       └── src/
│           └── screens/                  ← stub screens (wired in mobile spec)
```

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `package.json`
- Create: `turbo.json`
- Create: `.env.example`
- Create: `packages/config/tsconfig.base.json`
- Create: `packages/config/eslint.base.js`
- Create: `packages/config/package.json`

- [ ] **Step 1: Initialise Turborepo**

```bash
npx create-turbo@latest . --package-manager pnpm
# Select: pnpm workspaces, no example apps
```

- [ ] **Step 2: Replace generated turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev":   { "cache": false, "persistent": true },
    "test":  { "dependsOn": ["^build"] },
    "lint":  {}
  }
}
```

- [ ] **Step 3: Replace root package.json**

```json
{
  "name": "resell",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "build": "turbo build",
    "dev":   "turbo dev",
    "test":  "turbo test",
    "lint":  "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 4: Create packages/config/tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 5: Create .env.example**

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/resell"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_ACCESS_SECRET="change-me-access"
JWT_REFRESH_SECRET="change-me-refresh"

# MSG91
MSG91_AUTH_KEY=""
MSG91_TEMPLATE_ID=""

# Resend
RESEND_API_KEY=""

# Cloudflare R2
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="resell-tickets"
R2_PUBLIC_URL=""
```

- [ ] **Step 6: Create packages/config/package.json**

```json
{
  "name": "@resell/config",
  "version": "0.0.1",
  "files": ["tsconfig.base.json", "eslint.base.js"]
}
```

- [ ] **Step 7: Create packages/config/eslint.base.js**

```js
/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: initialise turborepo monorepo"
```

---

## Task 2: packages/db — Prisma Schema

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/prisma/schema.prisma`
- Create: `packages/db/src/index.ts`

- [ ] **Step 1: Create packages/db/package.json**

```json
{
  "name": "@resell/db",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate":  "prisma migrate dev",
    "db:push":     "prisma db push"
  },
  "dependencies": {
    "@prisma/client": "^5.14.0"
  },
  "devDependencies": {
    "prisma": "^5.14.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create packages/db/prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  BUYER
  SELLER
  ADMIN
}

enum KycStatus {
  UNVERIFIED
  PENDING
  VERIFIED
}

enum Category {
  CONCERT
  SPORTS
  COMEDY
  FESTIVAL
  OTHER
}

enum EventStatus {
  UPCOMING
  LIVE
  PAST
  CANCELLED
}

enum ListingStatus {
  PENDING_VERIFICATION
  ACTIVE
  SOLD
  EXPIRED
  REJECTED
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
}

model User {
  id            String     @id @default(cuid())
  name          String
  email         String     @unique
  phone         String     @unique
  passwordHash  String
  role          Role       @default(BUYER)
  kycStatus     KycStatus  @default(UNVERIFIED)
  upiId         String?
  bankAccount   String?
  phoneVerified Boolean    @default(false)
  listings      Listing[]
  buyerOrders   Order[]    @relation("BuyerOrders")
  sellerOrders  Order[]    @relation("SellerOrders")
  createdAt     DateTime   @default(now())
}

model Venue {
  id        String   @id @default(cuid())
  name      String
  city      String
  address   String
  mapsUrl   String?
  capacity  Int?
  events    Event[]
}

model Event {
  id          String      @id @default(cuid())
  title       String
  description String?
  category    Category
  venueId     String
  venue       Venue       @relation(fields: [venueId], references: [id])
  organizer   String?
  dateTime    DateTime
  bannerImage String?
  status      EventStatus @default(UPCOMING)
  city        String
  listings    Listing[]
  createdAt   DateTime    @default(now())
}

model Listing {
  id              String        @id @default(cuid())
  eventId         String
  event           Event         @relation(fields: [eventId], references: [id])
  sellerId        String
  seller          User          @relation(fields: [sellerId], references: [id])
  seatSection     String?
  seatRow         String?
  seatNumber      String?
  originalPrice   Int
  askingPrice     Int
  ticketFileUrl   String
  status          ListingStatus @default(PENDING_VERIFICATION)
  expiresAt       DateTime?
  orders          Order[]
  createdAt       DateTime      @default(now())
}

model Order {
  id                String        @id @default(cuid())
  listingId         String
  listing           Listing       @relation(fields: [listingId], references: [id])
  buyerId           String
  buyer             User          @relation("BuyerOrders", fields: [buyerId], references: [id])
  sellerId          String
  seller            User          @relation("SellerOrders", fields: [sellerId], references: [id])
  amount            Int
  platformFee       Int
  sellerPayout      Int
  paymentStatus     PaymentStatus @default(PENDING)
  razorpayOrderId   String?
  razorpayPaymentId String?
  ticketReleasedAt  DateTime?
  createdAt         DateTime      @default(now())
}
```

- [ ] **Step 3: Create packages/db/src/index.ts**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from '@prisma/client'
```

- [ ] **Step 4: Install and generate**

```bash
cd packages/db
pnpm install
pnpm db:generate
```

Expected: `✔ Generated Prisma Client` with no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/db
git commit -m "feat(db): add prisma schema with all models and enums"
```

---

## Task 3: packages/shared — Zod Schemas + Constants

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/src/constants.ts`
- Create: `packages/shared/src/schemas/auth.ts`
- Create: `packages/shared/src/schemas/events.ts`
- Create: `packages/shared/src/schemas/listings.ts`
- Create: `packages/shared/src/schemas/users.ts`
- Create: `packages/shared/src/schemas/search.ts`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create packages/shared/package.json**

```json
{
  "name": "@resell/shared",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create packages/shared/src/constants.ts**

```typescript
export const CATEGORIES = ['CONCERT', 'SPORTS', 'COMEDY', 'FESTIVAL', 'OTHER'] as const
export type Category = typeof CATEGORIES[number]

export const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'] as const
export type City = typeof CITIES[number]

export const PLATFORM_FEE_PCT = 0.10  // 10% platform fee on buyer price

export const EVENT_STATUSES = ['UPCOMING', 'LIVE', 'PAST', 'CANCELLED'] as const
export const LISTING_STATUSES = ['PENDING_VERIFICATION', 'ACTIVE', 'SOLD', 'EXPIRED', 'REJECTED'] as const
```

- [ ] **Step 3: Create packages/shared/src/schemas/auth.ts**

```typescript
import { z } from 'zod'

export const RegisterSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  phone:    z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(8).max(100),
})

export const LoginSchema = z.object({
  emailOrPhone: z.string().min(1),
  password:     z.string().min(1),
})

export const SendOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
})

export const VerifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp:   z.string().length(6),
})

export type RegisterInput  = z.infer<typeof RegisterSchema>
export type LoginInput     = z.infer<typeof LoginSchema>
export type SendOtpInput   = z.infer<typeof SendOtpSchema>
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>
```

- [ ] **Step 4: Create packages/shared/src/schemas/events.ts**

```typescript
import { z } from 'zod'
import { CATEGORIES, CITIES } from '../constants'

export const CreateEventSchema = z.object({
  title:       z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  category:    z.enum(CATEGORIES),
  venueId:     z.string().cuid(),
  organizer:   z.string().max(200).optional(),
  dateTime:    z.string().datetime(),
  bannerImage: z.string().url().optional(),
  city:        z.enum(CITIES),
})

export const UpdateEventSchema = CreateEventSchema.partial().extend({
  status: z.enum(['UPCOMING', 'LIVE', 'PAST', 'CANCELLED']).optional(),
})

export const EventFiltersSchema = z.object({
  city:     z.enum(CITIES).optional(),
  category: z.enum(CATEGORIES).optional(),
  date:     z.string().datetime().optional(),
  q:        z.string().max(200).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(50).default(20),
})

export type CreateEventInput  = z.infer<typeof CreateEventSchema>
export type UpdateEventInput  = z.infer<typeof UpdateEventSchema>
export type EventFilters      = z.infer<typeof EventFiltersSchema>
```

- [ ] **Step 5: Create packages/shared/src/schemas/listings.ts**

```typescript
import { z } from 'zod'

export const CreateListingSchema = z.object({
  eventId:       z.string().cuid(),
  seatSection:   z.string().max(50).optional(),
  seatRow:       z.string().max(10).optional(),
  seatNumber:    z.string().max(10).optional(),
  originalPrice: z.number().int().min(1),   // in paise
  askingPrice:   z.number().int().min(1),   // in paise
  ticketFileUrl: z.string().url(),
})

export const UpdateListingSchema = z.object({
  askingPrice: z.number().int().min(1),
})

export const RejectListingSchema = z.object({
  reason: z.string().min(5).max(500),
})

export type CreateListingInput = z.infer<typeof CreateListingSchema>
export type UpdateListingInput = z.infer<typeof UpdateListingSchema>
export type RejectListingInput = z.infer<typeof RejectListingSchema>
```

- [ ] **Step 6: Create packages/shared/src/schemas/users.ts**

```typescript
import { z } from 'zod'

export const UpdateUserSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  upiId:       z.string().max(50).optional(),
  bankAccount: z.string().max(200).optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
```

- [ ] **Step 7: Create packages/shared/src/schemas/search.ts**

```typescript
import { z } from 'zod'
import { CATEGORIES, CITIES } from '../constants'

export const SearchSchema = z.object({
  q:        z.string().min(1).max(200),
  city:     z.enum(CITIES).optional(),
  category: z.enum(CATEGORIES).optional(),
  date:     z.string().datetime().optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(50).default(20),
})

export type SearchInput = z.infer<typeof SearchSchema>
```

- [ ] **Step 8: Create packages/shared/src/types.ts**

```typescript
export type { RegisterInput, LoginInput, SendOtpInput, VerifyOtpInput } from './schemas/auth'
export type { CreateEventInput, UpdateEventInput, EventFilters } from './schemas/events'
export type { CreateListingInput, UpdateListingInput, RejectListingInput } from './schemas/listings'
export type { UpdateUserInput } from './schemas/users'
export type { SearchInput } from './schemas/search'
```

- [ ] **Step 9: Create packages/shared/src/index.ts**

```typescript
export * from './constants'
export * from './schemas/auth'
export * from './schemas/events'
export * from './schemas/listings'
export * from './schemas/users'
export * from './schemas/search'
export * from './types'
```

- [ ] **Step 10: Install and verify**

```bash
cd packages/shared && pnpm install
cd ../.. && pnpm build --filter=@resell/shared
```

Expected: no TypeScript errors.

- [ ] **Step 11: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): add zod schemas, types, and constants"
```

---

## Task 4: apps/api — Fastify App Skeleton

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/plugins/prisma.ts`
- Create: `apps/api/src/plugins/redis.ts`
- Create: `apps/api/src/plugins/cors.ts`
- Create: `apps/api/src/plugins/rateLimit.ts`
- Create: `apps/api/src/middleware/errorHandler.ts`
- Create: `apps/api/src/workers/index.ts`

- [ ] **Step 1: Create apps/api/package.json**

```json
{
  "name": "@resell/api",
  "version": "0.0.1",
  "scripts": {
    "dev":   "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "test":  "vitest run"
  },
  "dependencies": {
    "@fastify/cors": "^9.0.0",
    "@fastify/rate-limit": "^9.0.0",
    "@fastify/cookie": "^9.0.0",
    "@resell/db": "workspace:*",
    "@resell/shared": "workspace:*",
    "fastify": "^4.27.0",
    "ioredis": "^5.3.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "zod": "^3.23.0",
    "fastify-plugin": "^4.5.0",
    "@aws-sdk/client-s3": "^3.600.0",
    "@aws-sdk/s3-request-presigner": "^3.600.0"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create apps/api/src/plugins/prisma.ts**

```typescript
import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import { prisma } from '@resell/db'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma
  }
}

const prismaPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.decorate('prisma', prisma)
  fastify.addHook('onClose', async () => { await prisma.$disconnect() })
})

export default prismaPlugin
```

- [ ] **Step 3: Create apps/api/src/plugins/redis.ts**

```typescript
import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import Redis from 'ioredis'

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

const redisPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const redis = new Redis(process.env.REDIS_URL!)
  fastify.decorate('redis', redis)
  fastify.addHook('onClose', async () => { await redis.quit() })
})

export default redisPlugin
```

- [ ] **Step 4: Create apps/api/src/plugins/cors.ts**

```typescript
import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import cors from '@fastify/cors'

const corsPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(cors, {
    origin: [process.env.WEB_URL ?? 'http://localhost:3000'],
    credentials: true,
  })
})

export default corsPlugin
```

- [ ] **Step 5: Create apps/api/src/plugins/rateLimit.ts**

```typescript
import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import rateLimit from '@fastify/rate-limit'

const rateLimitPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })
})

export default rateLimitPlugin
```

- [ ] **Step 6: Create apps/api/src/middleware/errorHandler.ts**

```typescript
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation error',
      issues: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    })
  }

  const statusCode = error.statusCode ?? 500
  const message    = statusCode < 500 ? error.message : 'Internal server error'

  if (statusCode >= 500) console.error(error)

  return reply.status(statusCode).send({ error: message })
}
```

- [ ] **Step 7: Create apps/api/src/workers/index.ts**

```typescript
// BullMQ workers — wired in escrow/notifications spec
export {}
```

- [ ] **Step 8: Create apps/api/src/index.ts**

```typescript
import Fastify from 'fastify'
import cookie from '@fastify/cookie'

import prismaPlugin   from './plugins/prisma'
import redisPlugin    from './plugins/redis'
import corsPlugin     from './plugins/cors'
import rateLimitPlugin from './plugins/rateLimit'
import { errorHandler } from './middleware/errorHandler'

// Routes (stubbed — filled in subsequent tasks)
import authRoutes     from './routes/auth'
import eventRoutes    from './routes/events'
import listingRoutes  from './routes/listings'
import userRoutes     from './routes/users'
import searchRoutes   from './routes/search'
import adminRoutes    from './routes/admin'

const fastify = Fastify({ logger: true })

async function main() {
  await fastify.register(cookie)
  await fastify.register(corsPlugin)
  await fastify.register(rateLimitPlugin)
  await fastify.register(prismaPlugin)
  await fastify.register(redisPlugin)

  fastify.setErrorHandler(errorHandler)

  await fastify.register(authRoutes,    { prefix: '/api/v1/auth' })
  await fastify.register(eventRoutes,   { prefix: '/api/v1/events' })
  await fastify.register(listingRoutes, { prefix: '/api/v1/listings' })
  await fastify.register(userRoutes,    { prefix: '/api/v1/users' })
  await fastify.register(searchRoutes,  { prefix: '/api/v1/search' })
  await fastify.register(adminRoutes,   { prefix: '/api/v1/admin' })

  await fastify.listen({ port: Number(process.env.PORT ?? 4000), host: '0.0.0.0' })
}

main().catch((err) => { fastify.log.error(err); process.exit(1) })
```

- [ ] **Step 9: Install and verify the app starts**

```bash
cd apps/api && pnpm install
# Create stub route files so imports resolve:
mkdir -p src/routes && touch src/routes/auth.ts src/routes/events.ts src/routes/listings.ts src/routes/users.ts src/routes/search.ts src/routes/admin.ts
# Each stub file:
# import { FastifyPluginAsync } from 'fastify'
# const routes: FastifyPluginAsync = async () => {}
# export default routes
pnpm dev
```

Expected: `Server listening at http://0.0.0.0:4000`

- [ ] **Step 10: Commit**

```bash
git add apps/api
git commit -m "feat(api): fastify app skeleton with plugins and stub routes"
```

---

## Task 5: AuthService + Auth Routes (TDD)

**Files:**
- Create: `apps/api/src/services/AuthService.ts`
- Create: `apps/api/src/middleware/auth.ts`
- Create: `apps/api/src/middleware/role.ts`
- Create: `apps/api/src/routes/auth.ts`
- Create: `apps/api/test/services/AuthService.test.ts`
- Create: `apps/api/test/routes/auth.test.ts`

- [ ] **Step 1: Write AuthService unit tests**

Create `apps/api/test/services/AuthService.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../../src/services/AuthService'

const mockPrisma = {
  user: {
    create:  vi.fn(),
    findFirst: vi.fn(),
    update:  vi.fn(),
  },
}
const mockRedis = {
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
}

let service: AuthService

beforeEach(() => {
  vi.clearAllMocks()
  service = new AuthService(mockPrisma as any, mockRedis as any)
})

describe('AuthService.register', () => {
  it('hashes the password and creates user', async () => {
    mockPrisma.user.create.mockResolvedValue({
      id: 'cuid1', name: 'Raj', email: 'raj@test.com', phone: '9876543210',
      role: 'BUYER', kycStatus: 'UNVERIFIED', phoneVerified: false, createdAt: new Date(),
    })
    const user = await service.register({
      name: 'Raj', email: 'raj@test.com', phone: '9876543210', password: 'password123',
    })
    expect(mockPrisma.user.create).toHaveBeenCalledOnce()
    const call = mockPrisma.user.create.mock.calls[0][0]
    expect(call.data.passwordHash).not.toBe('password123')
    expect(user.id).toBe('cuid1')
  })

  it('throws if email already exists', async () => {
    mockPrisma.user.create.mockRejectedValue({ code: 'P2002' })
    await expect(service.register({
      name: 'Raj', email: 'raj@test.com', phone: '9876543210', password: 'password123',
    })).rejects.toThrow('Email or phone already registered')
  })
})

describe('AuthService.login', () => {
  it('returns token pair for valid credentials', async () => {
    const bcrypt = await import('bcrypt')
    const hash = await bcrypt.hash('password123', 12)
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'cuid1', email: 'raj@test.com', passwordHash: hash, role: 'BUYER',
    })
    const result = await service.login({ emailOrPhone: 'raj@test.com', password: 'password123' })
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
  })

  it('throws for wrong password', async () => {
    const bcrypt = await import('bcrypt')
    const hash = await bcrypt.hash('correct', 12)
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'c1', passwordHash: hash, role: 'BUYER' })
    await expect(service.login({ emailOrPhone: 'raj@test.com', password: 'wrong' }))
      .rejects.toThrow('Invalid credentials')
  })

  it('throws for unknown user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null)
    await expect(service.login({ emailOrPhone: 'nobody@test.com', password: 'x' }))
      .rejects.toThrow('Invalid credentials')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd apps/api && pnpm test test/services/AuthService.test.ts
```

Expected: FAIL — `AuthService` not found.

- [ ] **Step 3: Create apps/api/src/services/AuthService.ts**

```typescript
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@resell/db'
import { Redis } from 'ioredis'
import { RegisterInput, LoginInput } from '@resell/shared'

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export class AuthService {
  constructor(private prisma: PrismaClient, private redis: Redis) {}

  async register(input: RegisterInput) {
    const passwordHash = await bcrypt.hash(input.password, 12)
    try {
      const user = await this.prisma.user.create({
        data: { name: input.name, email: input.email, phone: input.phone, passwordHash },
        select: { id: true, name: true, email: true, phone: true, role: true,
                  kycStatus: true, phoneVerified: true, createdAt: true },
      })
      return user
    } catch (err: any) {
      if (err?.code === 'P2002') throw new Error('Email or phone already registered')
      throw err
    }
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: input.emailOrPhone }, { phone: input.emailOrPhone }],
      },
      select: { id: true, passwordHash: true, role: true, name: true, email: true },
    })
    if (!user) throw new Error('Invalid credentials')

    const valid = await bcrypt.compare(input.password, user.passwordHash)
    if (!valid) throw new Error('Invalid credentials')

    const payload = { sub: user.id, role: user.role }
    const accessToken  = jwt.sign(payload, ACCESS_SECRET,  { expiresIn: '15m' })
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' })

    // store refresh token in redis for revocation
    await this.redis.set(`refresh:${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 30)

    return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  }

  async refresh(refreshToken: string) {
    let payload: any
    try { payload = jwt.verify(refreshToken, REFRESH_SECRET) }
    catch { throw new Error('Invalid refresh token') }

    const stored = await this.redis.get(`refresh:${payload.sub}`)
    if (stored !== refreshToken) throw new Error('Invalid refresh token')

    const newAccess  = jwt.sign({ sub: payload.sub, role: payload.role }, ACCESS_SECRET, { expiresIn: '15m' })
    const newRefresh = jwt.sign({ sub: payload.sub, role: payload.role }, REFRESH_SECRET, { expiresIn: '30d' })
    await this.redis.set(`refresh:${payload.sub}`, newRefresh, 'EX', 60 * 60 * 24 * 30)

    return { accessToken: newAccess, refreshToken: newRefresh }
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`)
  }

  async sendOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await this.redis.set(`otp:${phone}`, otp, 'EX', 300) // 5 min TTL
    // MSG91 call — omitted; inject MSG91_AUTH_KEY from env in production
    console.log(`[DEV] OTP for ${phone}: ${otp}`)
    return { sent: true }
  }

  async verifyOtp(phone: string, otp: string) {
    const stored = await this.redis.get(`otp:${phone}`)
    if (stored !== otp) throw new Error('Invalid or expired OTP')
    await this.redis.del(`otp:${phone}`)
    await this.prisma.user.update({
      where: { phone },
      data:  { phoneVerified: true, role: 'SELLER' },
    })
    return { verified: true }
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd apps/api && pnpm test test/services/AuthService.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Create apps/api/src/middleware/auth.ts**

```typescript
import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing token' })
  }
  try {
    const token   = header.slice(7)
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { sub: string; role: string }
    request.user  = { id: payload.sub, role: payload.role }
  } catch {
    return reply.status(401).send({ error: 'Invalid token' })
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: { id: string; role: string }
  }
}
```

- [ ] **Step 6: Create apps/api/src/middleware/role.ts**

```typescript
import { FastifyRequest, FastifyReply } from 'fastify'

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(request.user?.role)) {
      return reply.status(403).send({ error: 'Forbidden' })
    }
  }
}
```

- [ ] **Step 7: Create apps/api/src/routes/auth.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { AuthService } from '../services/AuthService'
import {
  RegisterSchema, LoginSchema, SendOtpSchema, VerifyOtpSchema,
} from '@resell/shared'
import { verifyJwt } from '../middleware/auth'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const svc = new AuthService(fastify.prisma, fastify.redis)

  fastify.post('/register', async (req, reply) => {
    const body = RegisterSchema.parse(req.body)
    const user = await svc.register(body)
    return reply.status(201).send({ user })
  })

  fastify.post('/login', async (req, reply) => {
    const body = LoginSchema.parse(req.body)
    const { accessToken, refreshToken, user } = await svc.login(body)
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
    })
    return { accessToken, user }
  })

  fastify.post('/logout', { preHandler: verifyJwt }, async (req, reply) => {
    await svc.logout(req.user.id)
    reply.clearCookie('refreshToken')
    return { success: true }
  })

  fastify.post('/refresh', async (req, reply) => {
    const token = req.cookies?.refreshToken
    if (!token) return reply.status(401).send({ error: 'No refresh token' })
    const tokens = await svc.refresh(token)
    reply.setCookie('refreshToken', tokens.refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
    })
    return { accessToken: tokens.accessToken }
  })

  fastify.post('/otp/send', async (req, reply) => {
    const { phone } = SendOtpSchema.parse(req.body)
    return svc.sendOtp(phone)
  })

  fastify.post('/otp/verify', { preHandler: verifyJwt }, async (req, reply) => {
    const { phone, otp } = VerifyOtpSchema.parse(req.body)
    return svc.verifyOtp(phone, otp)
  })
}

export default authRoutes
```

- [ ] **Step 8: Write route integration tests**

Create `apps/api/test/routes/auth.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import authRoutes from '../../src/routes/auth'

// minimal stubs
const prismaStub = {
  user: {
    create: async () => ({
      id: 'c1', name: 'Test', email: 't@t.com', phone: '9000000001',
      role: 'BUYER', kycStatus: 'UNVERIFIED', phoneVerified: false, createdAt: new Date(),
    }),
    findFirst: async () => null,
    update: async () => ({}),
  },
  $disconnect: async () => {},
}
const redisStub = { set: async () => 'OK', get: async () => null, del: async () => 1, quit: async () => {} }

const app = Fastify()

beforeAll(async () => {
  app.decorate('prisma', prismaStub as any)
  app.decorate('redis', redisStub as any)
  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  await app.ready()
})

afterAll(() => app.close())

it('POST /auth/register returns 201 with user', async () => {
  const res = await app.inject({
    method: 'POST', url: '/api/v1/auth/register',
    payload: { name: 'Test', email: 't@t.com', phone: '9000000001', password: 'password123' },
  })
  expect(res.statusCode).toBe(201)
  expect(JSON.parse(res.body).user.email).toBe('t@t.com')
})

it('POST /auth/register returns 400 for invalid phone', async () => {
  const res = await app.inject({
    method: 'POST', url: '/api/v1/auth/register',
    payload: { name: 'Test', email: 't@t.com', phone: '1234', password: 'password123' },
  })
  expect(res.statusCode).toBe(400)
})
```

- [ ] **Step 9: Run all auth tests**

```bash
cd apps/api && pnpm test test/routes/auth.test.ts test/services/AuthService.test.ts
```

Expected: all tests PASS.

- [ ] **Step 10: Commit**

```bash
git add apps/api/src/services/AuthService.ts apps/api/src/middleware apps/api/src/routes/auth.ts apps/api/test
git commit -m "feat(api): auth service and routes with JWT + OTP"
```

---

## Task 6: EventService + Event Routes (TDD)

**Files:**
- Create: `apps/api/src/services/EventService.ts`
- Create: `apps/api/src/routes/events.ts`
- Create: `apps/api/test/services/EventService.test.ts`
- Create: `apps/api/test/routes/events.test.ts`

- [ ] **Step 1: Write EventService tests**

Create `apps/api/test/services/EventService.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventService } from '../../src/services/EventService'

const mockPrisma = {
  event: {
    findMany:  vi.fn(),
    findUnique: vi.fn(),
    create:    vi.fn(),
    update:    vi.fn(),
  },
}

let svc: EventService
beforeEach(() => { vi.clearAllMocks(); svc = new EventService(mockPrisma as any) })

const sampleEvent = {
  id: 'ev1', title: 'Coldplay Mumbai', category: 'CONCERT',
  city: 'Mumbai', status: 'UPCOMING', dateTime: new Date('2026-10-01'),
  venue: { id: 'v1', name: 'DY Patil', city: 'Mumbai', address: 'Navi Mumbai' },
}

describe('EventService.list', () => {
  it('returns events array', async () => {
    mockPrisma.event.findMany.mockResolvedValue([sampleEvent])
    const result = await svc.list({ page: 1, limit: 20 })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Coldplay Mumbai')
  })

  it('filters by city', async () => {
    mockPrisma.event.findMany.mockResolvedValue([])
    await svc.list({ city: 'Delhi', page: 1, limit: 20 })
    const where = mockPrisma.event.findMany.mock.calls[0][0].where
    expect(where.city).toBe('Delhi')
  })
})

describe('EventService.getById', () => {
  it('returns event with venue', async () => {
    mockPrisma.event.findUnique.mockResolvedValue(sampleEvent)
    const ev = await svc.getById('ev1')
    expect(ev?.title).toBe('Coldplay Mumbai')
  })

  it('returns null for unknown id', async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null)
    const ev = await svc.getById('unknown')
    expect(ev).toBeNull()
  })
})
```

- [ ] **Step 2: Run — verify FAIL**

```bash
cd apps/api && pnpm test test/services/EventService.test.ts
```

Expected: FAIL — `EventService` not found.

- [ ] **Step 3: Create apps/api/src/services/EventService.ts**

```typescript
import { PrismaClient } from '@resell/db'
import { EventFilters, CreateEventInput, UpdateEventInput } from '@resell/shared'

export class EventService {
  constructor(private prisma: PrismaClient) {}

  async list(filters: EventFilters) {
    const where: any = { status: { not: 'CANCELLED' } }
    if (filters.city)     where.city     = filters.city
    if (filters.category) where.category = filters.category
    if (filters.date)     where.dateTime = { gte: new Date(filters.date) }
    if (filters.q)        where.title    = { contains: filters.q, mode: 'insensitive' }

    return this.prisma.event.findMany({
      where,
      include: { venue: true },
      orderBy: { dateTime: 'asc' },
      skip:    (filters.page - 1) * filters.limit,
      take:    filters.limit,
    })
  }

  async getById(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: { venue: true },
    })
  }

  async getListings(eventId: string, page: number, limit: number) {
    return this.prisma.listing.findMany({
      where:   { eventId, status: 'ACTIVE' },
      include: { seller: { select: { id: true, name: true } } },
      orderBy: { askingPrice: 'asc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })
  }

  async create(input: CreateEventInput) {
    return this.prisma.event.create({
      data: {
        ...input,
        dateTime: new Date(input.dateTime),
      },
      include: { venue: true },
    })
  }

  async update(id: string, input: UpdateEventInput) {
    return this.prisma.event.update({
      where: { id },
      data:  { ...input, dateTime: input.dateTime ? new Date(input.dateTime) : undefined },
      include: { venue: true },
    })
  }
}
```

- [ ] **Step 4: Run — verify PASS**

```bash
cd apps/api && pnpm test test/services/EventService.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Create apps/api/src/routes/events.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { EventService } from '../services/EventService'
import { EventFiltersSchema } from '@resell/shared'

const eventRoutes: FastifyPluginAsync = async (fastify) => {
  const svc = new EventService(fastify.prisma)

  fastify.get('/', async (req) => {
    const filters = EventFiltersSchema.parse(req.query)
    return svc.list(filters)
  })

  fastify.get('/:id', async (req: any, reply) => {
    const ev = await svc.getById(req.params.id)
    if (!ev) return reply.status(404).send({ error: 'Event not found' })
    return ev
  })

  fastify.get('/:id/listings', async (req: any) => {
    const page  = Number(req.query.page  ?? 1)
    const limit = Number(req.query.limit ?? 20)
    return svc.getListings(req.params.id, page, limit)
  })
}

export default eventRoutes
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/services/EventService.ts apps/api/src/routes/events.ts apps/api/test/services/EventService.test.ts
git commit -m "feat(api): event service and routes"
```

---

## Task 7: UploadService + ListingService + Listing Routes (TDD)

**Files:**
- Create: `apps/api/src/services/UploadService.ts`
- Create: `apps/api/src/services/ListingService.ts`
- Create: `apps/api/src/routes/listings.ts`
- Create: `apps/api/test/services/ListingService.test.ts`

- [ ] **Step 1: Write ListingService tests**

Create `apps/api/test/services/ListingService.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListingService } from '../../src/services/ListingService'

const mockPrisma = {
  listing: {
    create:     vi.fn(),
    findUnique: vi.fn(),
    update:     vi.fn(),
    findMany:   vi.fn(),
    delete:     vi.fn(),
  },
}

let svc: ListingService
beforeEach(() => { vi.clearAllMocks(); svc = new ListingService(mockPrisma as any) })

const baseListing = {
  id: 'l1', eventId: 'ev1', sellerId: 'u1',
  originalPrice: 500000, askingPrice: 750000,
  ticketFileUrl: 'https://r2.example.com/t.pdf',
  status: 'PENDING_VERIFICATION',
}

describe('ListingService.create', () => {
  it('creates listing with PENDING_VERIFICATION status', async () => {
    mockPrisma.listing.create.mockResolvedValue(baseListing)
    const l = await svc.create('u1', {
      eventId: 'ev1', originalPrice: 500000, askingPrice: 750000,
      ticketFileUrl: 'https://r2.example.com/t.pdf',
    })
    expect(l.status).toBe('PENDING_VERIFICATION')
    expect(mockPrisma.listing.create.mock.calls[0][0].data.sellerId).toBe('u1')
  })
})

describe('ListingService.delete', () => {
  it('throws if listing is SOLD', async () => {
    mockPrisma.listing.findUnique.mockResolvedValue({ ...baseListing, status: 'SOLD', sellerId: 'u1' })
    await expect(svc.delete('l1', 'u1')).rejects.toThrow('Cannot delete a sold listing')
  })

  it('throws if seller is not owner', async () => {
    mockPrisma.listing.findUnique.mockResolvedValue({ ...baseListing, sellerId: 'other' })
    await expect(svc.delete('l1', 'u1')).rejects.toThrow('Not authorised')
  })
})
```

- [ ] **Step 2: Run — verify FAIL**

```bash
cd apps/api && pnpm test test/services/ListingService.test.ts
```

- [ ] **Step 3: Create apps/api/src/services/UploadService.ts**

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export class UploadService {
  async getPresignedUrl(sellerId: string, mimeType: 'application/pdf' | 'image/jpeg' | 'image/png') {
    const ext = mimeType === 'application/pdf' ? 'pdf' : mimeType.split('/')[1]
    const key = `tickets/${sellerId}/${randomUUID()}.${ext}`
    const command = new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET_NAME!,
      Key:         key,
      ContentType: mimeType,
    })
    const uploadUrl  = await getSignedUrl(s3, command, { expiresIn: 300 })
    const fileUrl    = `${process.env.R2_PUBLIC_URL}/${key}`
    return { uploadUrl, fileUrl, key }
  }
}
```

- [ ] **Step 4: Create apps/api/src/services/ListingService.ts**

```typescript
import { PrismaClient } from '@resell/db'
import { CreateListingInput, UpdateListingInput } from '@resell/shared'

export class ListingService {
  constructor(private prisma: PrismaClient) {}

  async create(sellerId: string, input: CreateListingInput) {
    return this.prisma.listing.create({
      data: { ...input, sellerId },
      include: { event: { include: { venue: true } }, seller: { select: { id: true, name: true } } },
    })
  }

  async getById(id: string) {
    return this.prisma.listing.findUnique({
      where: { id },
      include: { event: { include: { venue: true } }, seller: { select: { id: true, name: true } } },
    })
  }

  async update(id: string, sellerId: string, input: UpdateListingInput) {
    const listing = await this.prisma.listing.findUnique({ where: { id } })
    if (!listing)              throw new Error('Listing not found')
    if (listing.sellerId !== sellerId) throw new Error('Not authorised')
    return this.prisma.listing.update({ where: { id }, data: input })
  }

  async delete(id: string, sellerId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } })
    if (!listing)              throw new Error('Listing not found')
    if (listing.sellerId !== sellerId) throw new Error('Not authorised')
    if (listing.status === 'SOLD')     throw new Error('Cannot delete a sold listing')
    return this.prisma.listing.delete({ where: { id } })
  }

  async myListings(sellerId: string, page: number, limit: number) {
    return this.prisma.listing.findMany({
      where:   { sellerId },
      include: { event: { select: { id: true, title: true, dateTime: true } } },
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })
  }
}
```

- [ ] **Step 5: Run — verify PASS**

```bash
cd apps/api && pnpm test test/services/ListingService.test.ts
```

Expected: all 3 tests PASS.

- [ ] **Step 6: Create apps/api/src/routes/listings.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { ListingService } from '../services/ListingService'
import { UploadService }  from '../services/UploadService'
import { CreateListingSchema, UpdateListingSchema } from '@resell/shared'
import { verifyJwt } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { z } from 'zod'

const PresignSchema = z.object({
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
})

const listingRoutes: FastifyPluginAsync = async (fastify) => {
  const svc    = new ListingService(fastify.prisma)
  const upload = new UploadService()

  // get pre-signed upload URL
  fastify.post('/upload-url',
    { preHandler: [verifyJwt, requireRole('SELLER', 'ADMIN')] },
    async (req, reply) => {
      const { mimeType } = PresignSchema.parse(req.body)
      return upload.getPresignedUrl(req.user.id, mimeType)
    },
  )

  fastify.post('/',
    { preHandler: [verifyJwt, requireRole('SELLER', 'ADMIN')] },
    async (req, reply) => {
      const body = CreateListingSchema.parse(req.body)
      const listing = await svc.create(req.user.id, body)
      return reply.status(201).send(listing)
    },
  )

  fastify.get('/:id', async (req: any, reply) => {
    const l = await svc.getById(req.params.id)
    if (!l) return reply.status(404).send({ error: 'Listing not found' })
    return l
  })

  fastify.patch('/:id',
    { preHandler: verifyJwt },
    async (req: any, reply) => {
      const body = UpdateListingSchema.parse(req.body)
      return svc.update(req.params.id, req.user.id, body)
    },
  )

  fastify.delete('/:id',
    { preHandler: verifyJwt },
    async (req: any, reply) => {
      await svc.delete(req.params.id, req.user.id)
      return reply.status(204).send()
    },
  )
}

export default listingRoutes
```

- [ ] **Step 7: Create apps/api/src/routes/users.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { ListingService } from '../services/ListingService'
import { UpdateUserSchema } from '@resell/shared'
import { verifyJwt } from '../middleware/auth'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const listingSvc = new ListingService(fastify.prisma)

  fastify.get('/me', { preHandler: verifyJwt }, async (req) => {
    return fastify.prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true,
                kycStatus: true, phoneVerified: true, upiId: true, createdAt: true },
    })
  })

  fastify.patch('/me', { preHandler: verifyJwt }, async (req) => {
    const body = UpdateUserSchema.parse(req.body)
    return fastify.prisma.user.update({
      where:  { id: req.user.id },
      data:   body,
      select: { id: true, name: true, email: true, upiId: true },
    })
  })

  fastify.get('/me/listings', { preHandler: verifyJwt }, async (req) => {
    const page  = Number((req.query as any).page  ?? 1)
    const limit = Number((req.query as any).limit ?? 20)
    return listingSvc.myListings(req.user.id, page, limit)
  })

  fastify.get('/me/orders', { preHandler: verifyJwt }, async (req) => {
    const page  = Number((req.query as any).page  ?? 1)
    const limit = Number((req.query as any).limit ?? 20)
    return fastify.prisma.order.findMany({
      where:   { buyerId: req.user.id },
      include: { listing: { include: { event: { select: { id: true, title: true, dateTime: true } } } } },
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })
  })
}

export default userRoutes
```

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/services apps/api/src/routes/listings.ts apps/api/src/routes/users.ts apps/api/test/services/ListingService.test.ts
git commit -m "feat(api): listing service, upload service, listing + user routes"
```

---

## Task 8: SearchService + Admin Routes

**Files:**
- Create: `apps/api/src/services/SearchService.ts`
- Create: `apps/api/src/routes/search.ts`
- Create: `apps/api/src/routes/admin.ts`
- Create: `apps/api/test/services/SearchService.test.ts`

- [ ] **Step 1: Write SearchService tests**

Create `apps/api/test/services/SearchService.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SearchService } from '../../src/services/SearchService'

const mockPrisma = { $queryRaw: vi.fn() }
let svc: SearchService
beforeEach(() => { vi.clearAllMocks(); svc = new SearchService(mockPrisma as any) })

describe('SearchService.search', () => {
  it('calls $queryRaw and returns results', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ id: 'ev1', title: 'Coldplay' }])
    const results = await svc.search({ q: 'Coldplay', page: 1, limit: 10 })
    expect(results).toHaveLength(1)
    expect(mockPrisma.$queryRaw).toHaveBeenCalledOnce()
  })

  it('returns empty array when nothing matches', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([])
    const results = await svc.search({ q: 'zzznomatch', page: 1, limit: 10 })
    expect(results).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run — verify FAIL**

```bash
cd apps/api && pnpm test test/services/SearchService.test.ts
```

- [ ] **Step 3: Create apps/api/src/services/SearchService.ts**

```typescript
import { PrismaClient, Prisma } from '@resell/db'
import { SearchInput } from '@resell/shared'

export class SearchService {
  constructor(private prisma: PrismaClient) {}

  async search(input: SearchInput) {
    const { q, city, category, date, page, limit } = input
    const offset = (page - 1) * limit

    // PostgreSQL full-text search via tsvector
    return this.prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        e.id, e.title, e.description, e.category, e.city,
        e."dateTime", e."bannerImage", e.status,
        v.name AS "venueName", v.city AS "venueCity"
      FROM "Event" e
      JOIN "Venue" v ON v.id = e."venueId"
      WHERE
        e.status != 'CANCELLED'
        AND to_tsvector('english', e.title || ' ' || COALESCE(e.description,'') || ' ' || e.city || ' ' || v.name)
            @@ plainto_tsquery('english', ${q})
        ${city     ? Prisma.sql`AND e.city = ${city}`         : Prisma.empty}
        ${category ? Prisma.sql`AND e.category = ${category}::\"Category\"` : Prisma.empty}
        ${date     ? Prisma.sql`AND e."dateTime" >= ${new Date(date)}` : Prisma.empty}
      ORDER BY e."dateTime" ASC
      LIMIT ${limit} OFFSET ${offset}
    `)
  }
}
```

- [ ] **Step 4: Run — verify PASS**

```bash
cd apps/api && pnpm test test/services/SearchService.test.ts
```

- [ ] **Step 5: Create apps/api/src/routes/search.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { SearchService } from '../services/SearchService'
import { SearchSchema } from '@resell/shared'

const searchRoutes: FastifyPluginAsync = async (fastify) => {
  const svc = new SearchService(fastify.prisma)

  fastify.get('/', async (req) => {
    const input = SearchSchema.parse(req.query)
    return svc.search(input)
  })
}

export default searchRoutes
```

- [ ] **Step 6: Create apps/api/src/routes/admin.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { EventService }   from '../services/EventService'
import { verifyJwt }      from '../middleware/auth'
import { requireRole }    from '../middleware/role'
import { CreateEventSchema, UpdateEventSchema, RejectListingSchema } from '@resell/shared'
import { z } from 'zod'

const CreateVenueSchema = z.object({
  name:     z.string().min(2).max(200),
  city:     z.string().min(2).max(100),
  address:  z.string().min(5).max(500),
  mapsUrl:  z.string().url().optional(),
  capacity: z.number().int().positive().optional(),
})

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  const eventSvc = new EventService(fastify.prisma)
  const guard = [verifyJwt, requireRole('ADMIN')]

  // Venues
  fastify.post('/venues', { preHandler: guard }, async (req, reply) => {
    const body = CreateVenueSchema.parse(req.body)
    const venue = await fastify.prisma.venue.create({ data: body })
    return reply.status(201).send(venue)
  })

  // Events
  fastify.post('/events', { preHandler: guard }, async (req, reply) => {
    const body  = CreateEventSchema.parse(req.body)
    const event = await eventSvc.create(body)
    return reply.status(201).send(event)
  })

  fastify.patch('/events/:id', { preHandler: guard }, async (req: any, reply) => {
    const body  = UpdateEventSchema.parse(req.body)
    const event = await eventSvc.update(req.params.id, body)
    return event
  })

  // Listing moderation
  fastify.patch('/listings/:id/verify', { preHandler: guard }, async (req: any, reply) => {
    const listing = await fastify.prisma.listing.update({
      where: { id: req.params.id },
      data:  { status: 'ACTIVE' },
    })
    return listing
  })

  fastify.patch('/listings/:id/reject', { preHandler: guard }, async (req: any, reply) => {
    const { reason } = RejectListingSchema.parse(req.body)
    const listing = await fastify.prisma.listing.update({
      where: { id: req.params.id },
      data:  { status: 'REJECTED' },
    })
    // TODO(notifications spec): send rejection email to seller with reason
    return { ...listing, reason }
  })

  // Pending verification queue
  fastify.get('/listings/pending', { preHandler: guard }, async (req) => {
    const page  = Number((req.query as any).page  ?? 1)
    const limit = Number((req.query as any).limit ?? 20)
    return fastify.prisma.listing.findMany({
      where:   { status: 'PENDING_VERIFICATION' },
      include: { event: { select: { title: true } }, seller: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })
  })
}

export default adminRoutes
```

- [ ] **Step 7: Run all tests**

```bash
cd apps/api && pnpm test
```

Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/services/SearchService.ts apps/api/src/routes/search.ts apps/api/src/routes/admin.ts apps/api/test/services/SearchService.test.ts
git commit -m "feat(api): search service, search + admin routes"
```

---

## Task 9: Next.js Web App Scaffold

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/(public)/page.tsx`
- Create: `apps/web/app/(public)/events/[id]/page.tsx`
- Create: `apps/web/app/(public)/search/page.tsx`
- Create: `apps/web/app/(auth)/login/page.tsx`
- Create: `apps/web/app/(auth)/register/page.tsx`
- Create: `apps/web/app/(auth)/verify/page.tsx`
- Create: `apps/web/app/(seller)/listings/new/page.tsx`
- Create: `apps/web/app/(seller)/listings/page.tsx`
- Create: `apps/web/app/(buyer)/orders/page.tsx`
- Create: `apps/web/app/(admin)/events/page.tsx`
- Create: `apps/web/app/(admin)/listings/page.tsx`
- Create: `apps/web/lib/api.ts`

- [ ] **Step 1: Create apps/web/package.json**

```json
{
  "name": "@resell/web",
  "version": "0.0.1",
  "scripts": {
    "dev":   "next dev -p 3000",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@resell/shared": "workspace:*",
    "next": "14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

- [ ] **Step 2: Create apps/web/lib/api.ts** (shared fetch wrapper)

```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...rest } = options ?? {}
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(rest.headers ?? {}),
    },
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}
```

- [ ] **Step 3: Create apps/web/app/layout.tsx**

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resell — Ticket Resale India',
  description: 'Buy and sell event tickets securely',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Create apps/web/app/(public)/page.tsx** (event browse)

```tsx
import { apiFetch } from '../../lib/api'

type Event = {
  id: string; title: string; city: string; dateTime: string;
  category: string; bannerImage?: string;
  venue: { name: string }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { city?: string; category?: string }
}) {
  const params = new URLSearchParams()
  if (searchParams.city)     params.set('city',     searchParams.city)
  if (searchParams.category) params.set('category', searchParams.category)

  const events = await apiFetch<Event[]>(`/events?${params}`)

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Upcoming Events</h1>
      <ul>
        {events.map((ev) => (
          <li key={ev.id}>
            <a href={`/events/${ev.id}`}>
              <strong>{ev.title}</strong> — {ev.venue.name}, {ev.city}
              <br />
              {new Date(ev.dateTime).toLocaleDateString('en-IN')}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

- [ ] **Step 5: Create apps/web/app/(public)/events/[id]/page.tsx**

```tsx
import { apiFetch } from '../../../../lib/api'

type Listing = {
  id: string; askingPrice: number; seatSection?: string; seatRow?: string; seatNumber?: string;
  seller: { name: string }
}
type Event = {
  id: string; title: string; description?: string; city: string; dateTime: string;
  category: string; status: string; bannerImage?: string;
  venue: { name: string; address: string; mapsUrl?: string }
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const [event, listings] = await Promise.all([
    apiFetch<Event>(`/events/${params.id}`),
    apiFetch<Listing[]>(`/events/${params.id}/listings`),
  ])

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{event.title}</h1>
      <p>{event.venue.name} · {event.city}</p>
      <p>{new Date(event.dateTime).toLocaleString('en-IN')}</p>
      {event.description && <p>{event.description}</p>}

      <h2>Available Tickets</h2>
      {listings.length === 0 ? (
        <p>No tickets available right now.</p>
      ) : (
        <ul>
          {listings.map((l) => (
            <li key={l.id}>
              ₹{(l.askingPrice / 100).toLocaleString('en-IN')}
              {l.seatSection && ` · Section ${l.seatSection}`}
              {l.seatRow     && ` Row ${l.seatRow}`}
              {l.seatNumber  && ` Seat ${l.seatNumber}`}
              {' '}— Sold by {l.seller.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
```

- [ ] **Step 6: Create apps/web/app/(public)/search/page.tsx**

```tsx
import { apiFetch } from '../../../lib/api'

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  if (!searchParams.q) {
    return (
      <main style={{ padding: '2rem' }}>
        <form method="GET">
          <input name="q" placeholder="Search events..." />
          <button type="submit">Search</button>
        </form>
      </main>
    )
  }

  const results = await apiFetch<any[]>(`/search?q=${encodeURIComponent(searchParams.q)}`)

  return (
    <main style={{ padding: '2rem' }}>
      <form method="GET">
        <input name="q" defaultValue={searchParams.q} placeholder="Search events..." />
        <button type="submit">Search</button>
      </form>
      <h2>Results for "{searchParams.q}"</h2>
      {results.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul>
          {results.map((ev) => (
            <li key={ev.id}>
              <a href={`/events/${ev.id}`}>{ev.title}</a> — {ev.city}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
```

- [ ] **Step 7: Create stub pages for auth, seller, buyer, admin routes**

`apps/web/app/(auth)/login/page.tsx`:
```tsx
export default function LoginPage() {
  return <main style={{ padding: '2rem' }}><h1>Login</h1><p>Login form — UI spec TBD</p></main>
}
```

`apps/web/app/(auth)/register/page.tsx`:
```tsx
export default function RegisterPage() {
  return <main style={{ padding: '2rem' }}><h1>Register</h1><p>Registration form — UI spec TBD</p></main>
}
```

`apps/web/app/(auth)/verify/page.tsx`:
```tsx
export default function VerifyPage() {
  return <main style={{ padding: '2rem' }}><h1>Verify Phone</h1><p>OTP entry form — UI spec TBD</p></main>
}
```

`apps/web/app/(seller)/listings/new/page.tsx`:
```tsx
export default function NewListingPage() {
  return <main style={{ padding: '2rem' }}><h1>Create Listing</h1><p>Listing form — UI spec TBD</p></main>
}
```

`apps/web/app/(seller)/listings/page.tsx`:
```tsx
export default function MyListingsPage() {
  return <main style={{ padding: '2rem' }}><h1>My Listings</h1></main>
}
```

`apps/web/app/(buyer)/orders/page.tsx`:
```tsx
export default function MyOrdersPage() {
  return <main style={{ padding: '2rem' }}><h1>My Orders</h1></main>
}
```

`apps/web/app/(admin)/events/page.tsx`:
```tsx
export default function AdminEventsPage() {
  return <main style={{ padding: '2rem' }}><h1>Admin: Events</h1></main>
}
```

`apps/web/app/(admin)/listings/page.tsx`:
```tsx
export default function AdminListingsPage() {
  return <main style={{ padding: '2rem' }}><h1>Admin: Listing Verification Queue</h1></main>
}
```

- [ ] **Step 8: Install and verify web app builds**

```bash
cd apps/web && pnpm install && pnpm build
```

Expected: Next.js build completes with no TypeScript errors.

- [ ] **Step 9: Commit**

```bash
git add apps/web
git commit -m "feat(web): next.js app scaffold with public, auth, seller, buyer, admin routes"
```

---

## Task 10: Expo Mobile Scaffold

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/App.tsx`
- Create: `apps/mobile/src/screens/HomeScreen.tsx`

- [ ] **Step 1: Create apps/mobile/package.json**

```json
{
  "name": "@resell/mobile",
  "version": "0.0.1",
  "main": "App.tsx",
  "scripts": {
    "start":    "expo start",
    "android":  "expo start --android",
    "ios":      "expo start --ios"
  },
  "dependencies": {
    "@resell/shared": "workspace:*",
    "expo": "~51.0.0",
    "expo-status-bar": "~1.12.0",
    "react": "18.2.0",
    "react-native": "0.74.0",
    "@react-navigation/native": "^6.0.0",
    "@react-navigation/native-stack": "^6.0.0",
    "react-native-safe-area-context": "^4.0.0",
    "react-native-screens": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create apps/mobile/app.json**

```json
{
  "expo": {
    "name": "Resell",
    "slug": "resell",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "ios":     { "supportsTablet": false, "bundleIdentifier": "in.resell.app" },
    "android": { "package": "in.resell.app" }
  }
}
```

- [ ] **Step 3: Create apps/mobile/App.tsx**

```tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resell</Text>
      <Text>Mobile app — full screens in mobile spec</Text>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title:     { fontSize: 32, fontWeight: '700', marginBottom: 12 },
})
```

- [ ] **Step 4: Install**

```bash
cd apps/mobile && pnpm install
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile
git commit -m "feat(mobile): expo app scaffold"
```

---

## Task 11: Database Migration + E2E Smoke Test

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (add full-text search index)

- [ ] **Step 1: Add full-text search index to schema**

Add inside the `Event` model, after `createdAt`:

```prisma
  @@index([city])
  @@index([category])
  @@index([dateTime])
```

- [ ] **Step 2: Run migration against Supabase**

```bash
# Set DATABASE_URL to your Supabase connection string in .env
cd packages/db
pnpm db:migrate --name init
```

Expected: `✔ Database is now in sync with the migration`.

- [ ] **Step 3: Seed test data**

Create `packages/db/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const venue = await prisma.venue.create({
    data: { name: 'DY Patil Stadium', city: 'Mumbai', address: 'Navi Mumbai, Maharashtra' },
  })

  await prisma.event.create({
    data: {
      title:    'Coldplay Music of the Spheres',
      category: 'CONCERT',
      venueId:  venue.id,
      dateTime: new Date('2026-12-01T19:00:00Z'),
      city:     'Mumbai',
      status:   'UPCOMING',
    },
  })

  console.log('Seeded successfully')
}

main().finally(() => prisma.$disconnect())
```

```bash
cd packages/db && npx tsx prisma/seed.ts
```

Expected: `Seeded successfully`

- [ ] **Step 4: Smoke test the API end-to-end**

```bash
# Terminal 1: start API
cd apps/api && pnpm dev

# Terminal 2: run smoke tests
curl http://localhost:4000/api/v1/events
# Expected: JSON array with Coldplay event

curl "http://localhost:4000/api/v1/search?q=Coldplay"
# Expected: JSON array with matching event

curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","phone":"9876543210","password":"password123"}'
# Expected: {"user":{"id":"...","email":"test@test.com",...}}
```

- [ ] **Step 5: Commit**

```bash
git add packages/db
git commit -m "chore(db): add indexes and seed data"
```

---

## Task 12: Run Full Test Suite + Final Verification

- [ ] **Step 1: Run all API tests**

```bash
cd apps/api && pnpm test
```

Expected output (all PASS):
```
✓ AuthService > register > hashes the password and creates user
✓ AuthService > register > throws if email already exists
✓ AuthService > login > returns token pair for valid credentials
✓ AuthService > login > throws for wrong password
✓ AuthService > login > throws for unknown user
✓ EventService > list > returns events array
✓ EventService > list > filters by city
✓ EventService > getById > returns event with venue
✓ EventService > getById > returns null for unknown id
✓ ListingService > create > creates listing with PENDING_VERIFICATION status
✓ ListingService > delete > throws if listing is SOLD
✓ ListingService > delete > throws if seller is not owner
✓ SearchService > search > calls $queryRaw and returns results
✓ SearchService > search > returns empty array when nothing matches
✓ Auth route > POST /auth/register returns 201 with user
✓ Auth route > POST /auth/register returns 400 for invalid phone
```

- [ ] **Step 2: Build all packages**

```bash
cd /path/to/resell && pnpm build
```

Expected: all packages build with no TypeScript errors.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "chore: all tests passing, foundation complete"
```

---

## What's Next

This plan delivers Sub-project 1. Subsequent specs to build in order:

| Spec | Focus |
|---|---|
| Spec 2: Payments | Razorpay checkout, escrow release, seller payouts, buyer guarantee |
| Spec 3: Admin Dashboard | Platform inventory, seller ratings, moderation tooling |
| Spec 4: Notifications | Email (Resend), SMS (MSG91), push (Firebase) wired to BullMQ workers |
| Spec 5: Mobile | Full React Native screens, deep-linking, app store submission |
