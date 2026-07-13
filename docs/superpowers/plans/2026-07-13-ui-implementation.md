# UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full web UI for `apps/web` — Outfit font, emerald accent, dark-only — across all 10 pages.

**Architecture:** Tailwind CSS with custom color tokens defined in `tailwind.config.ts` and CSS custom properties in `globals.css`. All pages are Next.js 14 App Router Server Components except form pages which are `'use client'`. Shared components (Nav, Badge, Button) live in `app/components/`. No external component library.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS 3, `next/font/google` (Outfit), TypeScript

---

## File Map

```
apps/web/
├── tailwind.config.ts          ← CREATE — color tokens + font
├── postcss.config.js           ← CREATE — tailwind + autoprefixer
├── app/
│   ├── globals.css             ← CREATE — CSS vars, base reset, dot-grid, ticker animation
│   ├── layout.tsx              ← MODIFY — add Outfit font, import globals.css
│   ├── components/
│   │   ├── Nav.tsx             ← CREATE — shared nav (logo + links + CTA)
│   │   ├── Badge.tsx           ← CREATE — category/status badges
│   │   └── Button.tsx          ← CREATE — primary + ghost button variants
│   ├── (public)/
│   │   ├── page.tsx            ← MODIFY — full homepage
│   │   ├── events/[id]/page.tsx← MODIFY — event detail + ticket listings
│   │   └── search/page.tsx     ← MODIFY — search form + results
│   ├── (auth)/
│   │   ├── login/page.tsx      ← MODIFY — login form (client)
│   │   ├── register/page.tsx   ← MODIFY — register form (client)
│   │   └── verify/page.tsx     ← MODIFY — OTP input (client)
│   ├── (seller)/
│   │   ├── listings/page.tsx   ← MODIFY — my listings
│   │   └── listings/new/page.tsx ← MODIFY — create listing form (client)
│   ├── (buyer)/
│   │   └── orders/page.tsx     ← MODIFY — my orders
│   └── (admin)/
│       ├── admin/events/page.tsx    ← MODIFY — admin event table
│       └── admin/listings/page.tsx  ← MODIFY — verification queue
```

---

## Task 1: Tailwind + Design System Foundation

**Files:**
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/app/globals.css`
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Create tailwind.config.ts**

```ts
// apps/web/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg:      '#070707',
        surface: '#0d0d0d',
        'surface-hover': '#111111',
        border:  '#181818',
        'border-subtle': '#111111',
        primary:   '#e8e8e8',
        secondary: '#888888',
        muted:     '#555555',
        disabled:  '#3a3a3a',
        accent: {
          DEFAULT: '#10b981',
          hover:   '#0ea472',
        },
        danger:  '#f87171',
        warning: '#f59e0b',
      },
      letterSpacing: {
        tighter2: '-0.04em',
        tighter3: '-0.05em',
        tighter4: '-0.055em',
        wider2: '0.08em',
        wider3: '0.1em',
        wider4: '0.12em',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Create postcss.config.js**

```js
// apps/web/postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 3: Create app/globals.css**

```css
/* apps/web/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *, *::before, *::after { box-sizing: border-box; }

  html { background: #070707; color: #e8e8e8; }

  body {
    margin: 0;
    font-family: var(--font-outfit), system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  input, select, button, textarea {
    font-family: inherit;
  }
}

@layer utilities {
  .dot-grid {
    background-image: radial-gradient(circle, #1d1d1d 1px, transparent 1px);
    background-size: 26px 26px;
    position: relative;
  }
  .dot-grid::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, #070707 100%);
    pointer-events: none;
  }
  .logo-glow {
    box-shadow: 0 0 8px #10b981;
  }
  .accent-glow {
    box-shadow: 0 0 6px #10b981aa;
  }
}

@layer components {
  .nav-link {
    @apply text-sm text-secondary font-medium no-underline transition-colors hover:text-primary;
    font-size: 0.78rem;
  }

  .row-hover {
    position: relative;
  }
  .row-hover::before {
    content: '';
    position: absolute;
    left: 0; top: 8px; bottom: 8px;
    width: 2px;
    background: #10b981;
    opacity: 0;
    border-radius: 0 2px 2px 0;
    transition: opacity 0.12s;
  }
  .row-hover:hover::before { opacity: 1; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
.animate-blink { animation: blink 2s infinite; }
```

- [ ] **Step 4: Modify app/layout.tsx**

```tsx
// apps/web/app/layout.tsx
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Resell — Ticket Resale India',
  description: 'Buy and sell verified resale tickets for concerts, sports, and live events across India.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="bg-bg text-primary font-sans">{children}</body>
    </html>
  )
}
```

- [ ] **Step 5: Verify Tailwind is working**

Run `pnpm --filter @resell/web dev` and open http://localhost:3000. The page background should be `#070707` (near-black). If it's white, Tailwind is not loading — check that `globals.css` is imported in `layout.tsx`.

- [ ] **Step 6: Commit**

```bash
git add apps/web/tailwind.config.ts apps/web/postcss.config.js apps/web/app/globals.css apps/web/app/layout.tsx
git commit -m "feat(web): set up Tailwind design system — Outfit font, emerald tokens, dark base"
```

---

## Task 2: Shared Components

**Files:**
- Create: `apps/web/app/components/Nav.tsx`
- Create: `apps/web/app/components/Badge.tsx`
- Create: `apps/web/app/components/Button.tsx`

- [ ] **Step 1: Create Nav component**

```tsx
// apps/web/app/components/Nav.tsx
import Link from 'next/link'

interface NavProps {
  backHref?: string
  backLabel?: string
  userName?: string
}

export default function Nav({ backHref, backLabel, userName }: NavProps) {
  return (
    <nav className="flex items-center justify-between px-8 py-[0.85rem] border-b border-border">
      <Link href="/" className="flex items-center no-underline">
        <span className="text-[1.05rem] font-extrabold text-white tracking-tighter3">resell</span>
        <span className="w-[6px] h-[6px] rounded-full bg-accent logo-glow ml-[2px] mb-[2px] inline-block" />
      </Link>

      <div className="flex items-center gap-6">
        {backHref ? (
          <Link href={backHref} className="nav-link">← {backLabel ?? 'Back'}</Link>
        ) : (
          <>
            <Link href="/" className="nav-link">Browse</Link>
            <Link href="/listings/new" className="nav-link">Sell tickets</Link>
          </>
        )}
      </div>

      <div>
        {userName ? (
          <span className="text-[0.78rem] text-secondary font-medium">{userName}</span>
        ) : (
          <Link
            href="/login"
            className="text-[0.75rem] font-semibold border border-[#282828] text-secondary px-4 py-[5px] rounded-md no-underline transition-all hover:border-[#444] hover:text-primary"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create Badge component**

```tsx
// apps/web/app/components/Badge.tsx

type BadgeVariant = 'category' | 'active' | 'pending' | 'sold' | 'hot' | 'new' | 'upcoming' | 'cancelled'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
}

const styles: Record<BadgeVariant, string> = {
  category:  'text-muted border-[#222]',
  active:    'text-accent border-accent/30 bg-accent/5',
  pending:   'text-warning border-warning/30 bg-warning/5',
  sold:      'text-muted border-border',
  hot:       'text-danger border-danger/30 bg-danger/5',
  new:       'text-accent border-accent/30 bg-accent/5',
  upcoming:  'text-accent border-accent/30 bg-accent/5',
  cancelled: 'text-muted border-border',
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`text-[0.58rem] font-bold uppercase tracking-wider2 border rounded px-[7px] py-[2px] ${styles[variant]}`}>
      {children}
    </span>
  )
}
```

- [ ] **Step 3: Create Button component**

```tsx
// apps/web/app/components/Button.tsx
'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'small'
  fullWidth?: boolean
}

export default function Button({ variant = 'primary', fullWidth = false, className = '', children, ...props }: ButtonProps) {
  const base = 'font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-40'
  const width = fullWidth ? 'w-full' : ''

  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold px-6 py-3 border-0',
    ghost:   'bg-transparent border border-[#222] text-secondary text-[0.83rem] px-6 py-3 hover:border-[#444] hover:text-primary',
    small:   'bg-transparent border border-[#1e1e1e] text-muted text-[0.65rem] font-semibold px-[10px] py-1 rounded-md hover:border-[#333] hover:text-secondary',
  }

  return (
    <button className={`${base} ${width} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/components/
git commit -m "feat(web): add Nav, Badge, Button shared components"
```

---

## Task 3: Homepage

**Files:**
- Modify: `apps/web/app/(public)/page.tsx`

- [ ] **Step 1: Replace homepage with full implementation**

```tsx
// apps/web/app/(public)/page.tsx
import Link from 'next/link'
import Nav from '../../components/Nav'
import Badge from '../../components/Badge'
import { apiFetch } from '../../lib/api'

type Event = {
  id: string; title: string; city: string; dateTime: string;
  category: string; bannerImage?: string;
  venue: { name: string }
  _count?: { listings: number }
  minPrice?: number
}

const CATEGORY_EMOJI: Record<string, string> = {
  CONCERT: '🎸', SPORTS: '🏏', COMEDY: '🎤', FESTIVAL: '🎪', OTHER: '🎭',
}
const CATEGORY_GRADIENT: Record<string, string> = {
  CONCERT: 'from-[#0a2e1e] to-[#051208]',
  SPORTS:  'from-[#1e1505] to-[#0d0802]',
  COMEDY:  'from-[#1a0520] to-[#0a0210]',
  FESTIVAL:'from-[#1a1505] to-[#0a0802]',
  OTHER:   'from-[#0a0a2e] to-[#050512]',
}

const TICKER_ITEMS = [
  'Just sold — Coldplay GA · ₹5,200',
  'New listing — IPL MI vs RR · ₹980',
  'Just sold — Diljit Floor · ₹3,100',
  'New listing — Prateek Kuhad · ₹1,400',
]

export default async function HomePage({
  searchParams,
}: {
  searchParams: { city?: string; category?: string }
}) {
  const params = new URLSearchParams()
  if (searchParams.city)     params.set('city',     searchParams.city)
  if (searchParams.category) params.set('category', searchParams.category)

  const events = await apiFetch<Event[]>(`/events?${params}`).catch(() => [] as Event[])

  const featured = events.slice(0, 3)
  const rest     = events.slice(3)

  return (
    <div className="min-h-screen bg-bg">
      <Nav />

      {/* Ticker */}
      <div className="bg-[#0a0a0a] border-b border-border px-8 py-[0.4rem] flex items-center gap-4 overflow-hidden">
        <div className="flex items-center gap-[0.4rem] text-[0.6rem] font-bold text-accent uppercase tracking-wider4 whitespace-nowrap">
          <span className="w-[5px] h-[5px] rounded-full bg-accent accent-glow animate-blink inline-block" />
          Live
        </div>
        <div className="w-px h-[14px] bg-[#222]" />
        <div className="flex gap-8 text-[0.7rem] text-muted overflow-hidden">
          {TICKER_ITEMS.map((item, i) => {
            const [prefix, ...rest] = item.split('—')
            return (
              <span key={i} className="whitespace-nowrap">
                {prefix}—<strong className="text-secondary font-medium">{rest.join('—')}</strong>
              </span>
            )
          })}
        </div>
      </div>

      {/* Hero */}
      <div className="dot-grid px-8 pt-12 pb-10">
        <div className="flex justify-between items-start gap-12 mb-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 text-[0.65rem] font-semibold text-accent uppercase tracking-wider4 border border-accent/20 rounded-full px-3 py-[3px] mb-4 bg-accent/5">
              ● &nbsp;Verified resale · India
            </div>
            <h1 className="text-[4.5rem] font-black leading-[0.92] tracking-tighter4 text-primary mb-4">
              Tickets for<br />
              <span className="bg-gradient-to-r from-accent to-[#34d399] bg-clip-text text-transparent">
                live India.
              </span>
            </h1>
            <p className="text-[0.83rem] text-muted leading-relaxed max-w-[360px]">
              Buy and sell verified resale tickets for concerts, sports, and live events.
              Every ticket checked before it goes live.
            </p>
          </div>
          <div className="flex flex-col gap-6 flex-shrink-0 pt-2 text-right">
            <div>
              <div className="text-[2rem] font-extrabold text-primary tracking-tighter2 leading-none">
                2,4<em className="not-italic text-accent">00</em>
              </div>
              <div className="text-[0.62rem] text-muted uppercase tracking-wider3 mt-1">Active listings</div>
            </div>
            <div>
              <div className="text-[2rem] font-extrabold text-primary tracking-tighter2 leading-none">
                <em className="not-italic text-accent">₹</em>12cr
              </div>
              <div className="text-[0.62rem] text-muted uppercase tracking-wider3 mt-1">Sold this month</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <form
          method="GET"
          action="/search"
          className="flex items-stretch border border-[#1e1e1e] rounded-[10px] overflow-hidden bg-surface relative z-10 focus-within:border-accent/30 transition-colors"
        >
          <input
            name="q"
            type="text"
            placeholder="Search events, artists, teams…"
            className="flex-1 bg-transparent border-none outline-none text-[0.875rem] text-primary placeholder:text-disabled px-5 py-[0.9rem]"
          />
          <div className="w-px bg-[#1e1e1e] my-[0.6rem]" />
          <select
            name="city"
            className="bg-transparent border-none outline-none text-[0.8rem] text-secondary px-5 cursor-pointer appearance-none"
            defaultValue={searchParams.city ?? ''}
          >
            <option value="">All cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
          </select>
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover border-none text-black text-[0.82rem] font-bold px-6 transition-colors cursor-pointer"
          >
            Search →
          </button>
        </form>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-border px-8 overflow-x-auto">
        {['All', 'Concerts', 'Sports', 'Comedy', 'Festival', 'Theatre'].map((cat) => (
          <Link
            key={cat}
            href={cat === 'All' ? '/' : `/?category=${cat.toUpperCase().replace('S','')}`}
            className="text-[0.73rem] font-medium text-disabled px-4 py-3 whitespace-nowrap border-b-2 border-transparent no-underline hover:text-secondary transition-colors data-[active=true]:text-accent data-[active=true]:border-accent"
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <>
          <div className="flex items-center gap-3 px-8 pt-5 pb-3">
            <h2 className="text-[0.6rem] font-bold text-muted uppercase tracking-wider4 whitespace-nowrap">In demand</h2>
            <hr className="flex-1 border-none border-t border-border" style={{ borderTopWidth: 1 }} />
          </div>
          <div className="grid grid-cols-3 gap-px bg-border border-t border-b border-border">
            {featured.map((ev) => {
              const d = new Date(ev.dateTime)
              const gradient = CATEGORY_GRADIENT[ev.category] ?? CATEGORY_GRADIENT.OTHER
              const emoji    = CATEGORY_EMOJI[ev.category]   ?? '🎭'
              return (
                <Link key={ev.id} href={`/events/${ev.id}`} className="bg-bg hover:bg-surface p-6 no-underline group transition-colors">
                  <div className={`w-full h-20 rounded-[7px] mb-4 flex items-center justify-center text-3xl bg-gradient-to-br ${gradient}`}>
                    {emoji}
                  </div>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <Badge variant="category">{ev.category}</Badge>
                  </div>
                  <div className="text-[0.875rem] font-semibold text-primary leading-snug mb-1 group-hover:text-white transition-colors">
                    {ev.title}
                  </div>
                  <div className="text-[0.68rem] text-muted mb-3">
                    {ev.venue.name}, {ev.city} · {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[0.95rem] font-bold text-accent tracking-tighter2">
                      {ev.minPrice ? `₹${(ev.minPrice / 100).toLocaleString('en-IN')}+` : 'View tickets'}
                    </span>
                    {ev._count?.listings != null && (
                      <span className="text-[0.63rem] text-disabled">{ev._count.listings} listings</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* All events */}
      <div className="flex items-center gap-3 px-8 pt-5 pb-3">
        <h2 className="text-[0.6rem] font-bold text-muted uppercase tracking-wider4 whitespace-nowrap">
          All events{searchParams.city ? ` · ${searchParams.city}` : ''}
        </h2>
        <hr className="flex-1 border-none" style={{ borderTop: '1px solid #181818' }} />
      </div>

      {events.length === 0 ? (
        <p className="px-8 py-12 text-muted text-sm">No events yet — check back soon.</p>
      ) : (
        <>
          {/* Table header */}
          <div className="grid grid-cols-[56px_1fr_120px_90px] px-8 py-[0.45rem] border-b border-border-subtle">
            {['', 'Event', 'Venue', 'From'].map((h, i) => (
              <span key={i} className={`text-[0.58rem] font-semibold text-disabled uppercase tracking-wider3 ${i === 3 ? 'text-right' : ''}`}>
                {h}
              </span>
            ))}
          </div>

          {rest.map((ev) => {
            const d     = new Date(ev.dateTime)
            const scarce = (ev._count?.listings ?? 99) <= 3
            return (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="row-hover grid grid-cols-[56px_1fr_120px_90px] items-center px-8 py-3 border-b border-[#0f0f0f] no-underline hover:bg-surface group transition-colors"
              >
                <div>
                  <div className="text-[1.2rem] font-extrabold text-primary leading-none tracking-tighter2">
                    {d.getDate()}
                  </div>
                  <div className="text-[0.56rem] text-muted uppercase tracking-wider2 font-semibold mt-[1px]">
                    {d.toLocaleString('en-IN', { month: 'short' })}
                  </div>
                </div>
                <div className="pr-4">
                  <div className="text-[0.84rem] font-medium text-secondary group-hover:text-primary transition-colors mb-1">
                    {ev.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="category">{ev.category}</Badge>
                    <span className="text-[0.66rem] text-muted">{ev.venue.name}</span>
                  </div>
                </div>
                <div className="text-[0.69rem] text-muted">{ev.venue.name}</div>
                <div className="text-right">
                  <div className="text-[0.88rem] font-bold text-accent tracking-tighter2">
                    {ev.minPrice ? `₹${(ev.minPrice / 100).toLocaleString('en-IN')}` : '—'}
                  </div>
                  {ev._count?.listings != null && (
                    <div className={`text-[0.62rem] mt-[2px] ${scarce ? 'text-danger/50' : 'text-disabled'}`}>
                      {scarce ? `${ev._count.listings} left` : `${ev._count.listings} listings`}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Open http://localhost:3000 and verify**

Expected: near-black background, Outfit font loaded, hero with dot-grid, emerald accent on prices and search button. Event list shows empty state if API is not running.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(public\)/page.tsx
git commit -m "feat(web): implement homepage — hero, ticker, featured events, event table"
```

---

## Task 4: Event Detail Page

**Files:**
- Modify: `apps/web/app/(public)/events/[id]/page.tsx`

- [ ] **Step 1: Replace with full event detail implementation**

```tsx
// apps/web/app/(public)/events/[id]/page.tsx
import Nav from '../../../../components/Nav'
import Badge from '../../../../components/Badge'
import { apiFetch } from '../../../../lib/api'

type Listing = {
  id: string; askingPrice: number; originalPrice: number;
  seatSection?: string; seatRow?: string; seatNumber?: string;
  seller: { name: string }
}
type Event = {
  id: string; title: string; description?: string; city: string;
  dateTime: string; category: string; status: string; bannerImage?: string;
  venue: { name: string; address: string; mapsUrl?: string }
}

const CATEGORY_GRADIENT: Record<string, string> = {
  CONCERT: 'from-[#0a2e1e] to-[#051208]',
  SPORTS:  'from-[#1e1505] to-[#0d0802]',
  COMEDY:  'from-[#1a0520] to-[#0a0210]',
  FESTIVAL:'from-[#1a1505] to-[#0a0802]',
  OTHER:   'from-[#0a0a2e] to-[#050512]',
}
const CATEGORY_EMOJI: Record<string, string> = {
  CONCERT: '🎸', SPORTS: '🏏', COMEDY: '🎤', FESTIVAL: '🎪', OTHER: '🎭',
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const [event, listings] = await Promise.all([
    apiFetch<Event>(`/events/${params.id}`).catch(() => null),
    apiFetch<Listing[]>(`/events/${params.id}/listings`).catch(() => [] as Listing[]),
  ])

  if (!event) {
    return (
      <div className="min-h-screen bg-bg">
        <Nav />
        <div className="px-8 py-16 text-muted text-sm">Event not found.</div>
      </div>
    )
  }

  const d         = new Date(event.dateTime)
  const gradient  = CATEGORY_GRADIENT[event.category] ?? CATEGORY_GRADIENT.OTHER
  const emoji     = CATEGORY_EMOJI[event.category]    ?? '🎭'
  const minPrice  = listings.length > 0 ? Math.min(...listings.map(l => l.askingPrice)) : null

  return (
    <div className="min-h-screen bg-bg">
      <Nav backHref="/" backLabel="Events" />

      {/* Hero */}
      <div className="px-8 pt-8 border-b border-border">
        <div className={`w-full h-40 rounded-[10px] mb-6 flex items-center justify-center text-5xl bg-gradient-to-br ${gradient}`}>
          {emoji}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="category">{event.category}</Badge>
          <span className="text-[0.65rem] text-muted">
            {d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}
            {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <h1 className="text-[2rem] font-extrabold text-primary leading-[1.1] tracking-tighter2 mb-2">
          {event.title}
        </h1>
        <p className="text-[0.8rem] text-muted mb-6">{event.venue.name}, {event.city}</p>
        <div className="flex gap-0 border-t border-border mt-4">
          <div className="text-[0.73rem] font-medium text-accent py-[0.7rem] px-5 border-b-2 border-accent">
            Tickets ({listings.length})
          </div>
          <div className="text-[0.73rem] font-medium text-disabled py-[0.7rem] px-5 border-b-2 border-transparent">
            About
          </div>
          <div className="text-[0.73rem] font-medium text-disabled py-[0.7rem] px-5 border-b-2 border-transparent">
            Venue
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="px-8 py-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[0.8rem] font-semibold text-secondary">
            {listings.length > 0
              ? `${listings.length} verified listing${listings.length === 1 ? '' : 's'}${minPrice ? ` · from ₹${(minPrice / 100).toLocaleString('en-IN')}` : ''}`
              : 'No tickets available right now.'}
          </h3>
          {listings.length > 0 && (
            <select className="bg-surface border border-border rounded-md px-3 py-[5px] text-[0.72rem] text-muted outline-none cursor-pointer">
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest first</option>
            </select>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {listings.map((l) => {
            const initial = l.seller.name[0]?.toUpperCase() ?? '?'
            const seat    = [l.seatSection && `Section ${l.seatSection}`, l.seatRow && `Row ${l.seatRow}`, l.seatNumber && `Seat ${l.seatNumber}`].filter(Boolean).join(' · ') || 'General Admission'
            return (
              <div
                key={l.id}
                className="flex items-center gap-4 px-4 py-4 bg-surface border border-border rounded-lg hover:border-accent/30 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[0.8rem] font-bold text-muted flex-shrink-0">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.82rem] font-medium text-primary">{seat}</div>
                  <div className="text-[0.68rem] text-muted mt-[2px]">Sold by {l.seller.name} · Verified seller</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[1rem] font-bold text-accent tracking-tighter2">
                    ₹{(l.askingPrice / 100).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[0.65rem] text-disabled line-through mt-[2px]">
                    ₹{(l.originalPrice / 100).toLocaleString('en-IN')}
                  </div>
                </div>
                <button className="bg-accent hover:bg-accent-hover text-black text-[0.75rem] font-bold px-4 py-[7px] rounded-md border-0 cursor-pointer transition-colors whitespace-nowrap">
                  Buy now
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(public\)/events/
git commit -m "feat(web): implement event detail page with listings"
```

---

## Task 5: Search Page

**Files:**
- Modify: `apps/web/app/(public)/search/page.tsx`

- [ ] **Step 1: Replace with full search implementation**

```tsx
// apps/web/app/(public)/search/page.tsx
import Link from 'next/link'
import Nav from '../../../components/Nav'
import Badge from '../../../components/Badge'
import { apiFetch } from '../../../lib/api'

type SearchResult = {
  id: string; title: string; city: string; dateTime: string;
  category: string; venue: { name: string }
  minPrice?: number
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; city?: string } }) {
  const results = searchParams.q
    ? await apiFetch<SearchResult[]>(`/search?q=${encodeURIComponent(searchParams.q)}${searchParams.city ? `&city=${searchParams.city}` : ''}`).catch(() => [] as SearchResult[])
    : []

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <div className="px-8 py-8 max-w-2xl">
        <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2 mb-6">Search</h1>
        <form method="GET" className="flex gap-2 mb-8">
          <input
            name="q"
            type="text"
            defaultValue={searchParams.q}
            placeholder="Events, artists, teams…"
            autoFocus
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-[0.875rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-black text-[0.82rem] font-bold px-5 rounded-lg border-0 cursor-pointer transition-colors"
          >
            Search →
          </button>
        </form>

        {searchParams.q && (
          <>
            <p className="text-[0.72rem] text-muted mb-4 uppercase tracking-wider3 font-semibold">
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{searchParams.q}&rdquo;
            </p>
            {results.length === 0 ? (
              <p className="text-muted text-sm">No events found. Try a different search.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {results.map((r) => {
                  const d = new Date(r.dateTime)
                  return (
                    <Link
                      key={r.id}
                      href={`/events/${r.id}`}
                      className="flex items-center gap-4 px-4 py-4 bg-surface border border-border rounded-lg no-underline hover:border-accent/30 transition-colors group"
                    >
                      <div>
                        <div className="text-[0.84rem] font-medium text-secondary group-hover:text-primary transition-colors mb-1">
                          {r.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="category">{r.category}</Badge>
                          <span className="text-[0.66rem] text-muted">{r.venue.name}, {r.city}</span>
                          <span className="text-[0.66rem] text-muted">
                            {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      {r.minPrice && (
                        <div className="ml-auto text-[0.88rem] font-bold text-accent">
                          ₹{(r.minPrice / 100).toLocaleString('en-IN')}+
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(public\)/search/
git commit -m "feat(web): implement search page"
```

---

## Task 6: Auth Pages

**Files:**
- Modify: `apps/web/app/(auth)/login/page.tsx`
- Modify: `apps/web/app/(auth)/register/page.tsx`
- Modify: `apps/web/app/(auth)/verify/page.tsx`

- [ ] **Step 1: Implement login page**

```tsx
// apps/web/app/(auth)/login/page.tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Login failed')
      }
      window.location.href = '/'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-[1.4rem] font-black text-white tracking-tighter3 no-underline mb-1">
        resell<span className="text-accent">.</span>
      </Link>
      <p className="text-[0.78rem] text-muted mb-8">Buy and sell verified resale tickets across India</p>

      <div className="w-full max-w-[400px] bg-surface border border-border rounded-xl p-7">
        <h2 className="text-[1.1rem] font-bold text-primary tracking-tighter2 mb-1">Welcome back</h2>
        <p className="text-[0.75rem] text-muted mb-6">Sign in to your account to continue</p>

        {error && (
          <div className="text-[0.75rem] text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Email or phone</label>
            <input
              type="text" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold py-3 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <hr className="flex-1 border-none" style={{ borderTop: '1px solid #1a1a1a' }} />
          <span className="text-[0.65rem] text-disabled">or</span>
          <hr className="flex-1 border-none" style={{ borderTop: '1px solid #1a1a1a' }} />
        </div>

        <button className="w-full bg-transparent border border-[#222] text-secondary text-[0.83rem] font-medium py-3 rounded-lg cursor-pointer hover:border-[#444] hover:text-primary transition-all">
          Continue with OTP →
        </button>

        <p className="text-center mt-5 text-[0.73rem] text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent no-underline hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement register page**

```tsx
// apps/web/app/(auth)/register/page.tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
  const [form, setForm]      = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Registration failed')
      }
      window.location.href = '/verify'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">{label}</label>
      <input
        type={type} value={form[key]} onChange={set(key)}
        placeholder={placeholder} required
        className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-[1.4rem] font-black text-white tracking-tighter3 no-underline mb-1">
        resell<span className="text-accent">.</span>
      </Link>
      <p className="text-[0.78rem] text-muted mb-8">Join India&apos;s verified ticket resale platform</p>

      <div className="w-full max-w-[400px] bg-surface border border-border rounded-xl p-7">
        <h2 className="text-[1.1rem] font-bold text-primary tracking-tighter2 mb-1">Create account</h2>
        <p className="text-[0.75rem] text-muted mb-6">Takes less than 2 minutes</p>

        {error && (
          <div className="text-[0.75rem] text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {field('Full name', 'name', 'text', 'Rahul Mehta')}
          {field('Email', 'email', 'email', 'you@example.com')}
          {field('Phone', 'phone', 'tel', '9876543210')}
          {field('Password', 'password', 'password', '••••••••')}
          <button
            type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold py-3 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? 'Creating account…' : 'Create account →'}
          </button>
        </form>

        <p className="text-center mt-5 text-[0.73rem] text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-accent no-underline hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Implement OTP verify page**

```tsx
// apps/web/app/(auth)/verify/page.tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function VerifyPage() {
  const [otp, setOtp]        = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ otp }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Invalid OTP')
      }
      window.location.href = '/'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-[1.4rem] font-black text-white tracking-tighter3 no-underline mb-1">
        resell<span className="text-accent">.</span>
      </Link>
      <p className="text-[0.78rem] text-muted mb-8">Verify your phone number</p>

      <div className="w-full max-w-[400px] bg-surface border border-border rounded-xl p-7">
        <h2 className="text-[1.1rem] font-bold text-primary tracking-tighter2 mb-1">Enter OTP</h2>
        <p className="text-[0.75rem] text-muted mb-6">We sent a 6-digit code to your phone</p>

        {error && (
          <div className="text-[0.75rem] text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000" maxLength={6} required
            className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-4 text-[1.5rem] font-bold text-primary text-center tracking-[0.3em] placeholder:text-disabled outline-none focus:border-accent/30 transition-colors"
          />
          <button
            type="submit" disabled={loading || otp.length < 6}
            className="w-full bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold py-3 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify →'}
          </button>
        </form>

        <p className="text-center mt-5 text-[0.73rem] text-muted">
          Didn&apos;t get the code?{' '}
          <button className="text-accent bg-transparent border-0 cursor-pointer text-[0.73rem] p-0 hover:underline">
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\(auth\)/
git commit -m "feat(web): implement login, register, and OTP verify pages"
```

---

## Task 7: Create Listing Page

**Files:**
- Modify: `apps/web/app/(seller)/listings/new/page.tsx`

- [ ] **Step 1: Implement create listing form**

```tsx
// apps/web/app/(seller)/listings/new/page.tsx
'use client'
import { useState } from 'react'
import Nav from '../../../components/Nav'

const PLATFORM_FEE = 0.05

export default function NewListingPage() {
  const [form, setForm] = useState({
    eventSearch: '', section: '', row: '', seatNumber: '',
    originalPrice: '', askingPrice: '',
  })
  const [file, setFile]      = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const payout = form.askingPrice
    ? Math.round(parseFloat(form.askingPrice) * (1 - PLATFORM_FEE))
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Please upload your ticket file.'); return }
    setLoading(true); setError('')
    try {
      // 1. Get pre-signed upload URL
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/listings/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      if (!uploadRes.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, fileUrl } = await uploadRes.json()

      // 2. Upload file directly to R2
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })

      // 3. Create listing
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          seatSection:   form.section   || undefined,
          seatRow:       form.row        || undefined,
          seatNumber:    form.seatNumber || undefined,
          originalPrice: Math.round(parseFloat(form.originalPrice) * 100),
          askingPrice:   Math.round(parseFloat(form.askingPrice)   * 100),
          ticketFileUrl: fileUrl,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create listing')
      }
      window.location.href = '/listings'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Nav backHref="/listings" backLabel="My listings" />

      <div className="max-w-[580px] mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2 mb-1">List a ticket</h1>
          <p className="text-[0.78rem] text-muted">Takes 2 minutes. Admin reviews within 4 hours before going live.</p>
        </div>

        {error && (
          <div className="text-[0.75rem] text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Event */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <h3 className="text-[0.7rem] font-bold text-muted uppercase tracking-wider4 mb-4">Event</h3>
            <div>
              <label className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Search event</label>
              <input
                type="text" value={form.eventSearch} onChange={set('eventSearch')}
                placeholder="e.g. Coldplay, IPL, Zakir Khan…" required
                className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors"
              />
            </div>
          </div>

          {/* Seat details */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <h3 className="text-[0.7rem] font-bold text-muted uppercase tracking-wider4 mb-4">Seat details</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Section</label>
                <input type="text" value={form.section} onChange={set('section')} placeholder="e.g. GA, A, VIP"
                  className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors" />
              </div>
              <div>
                <label className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Row</label>
                <input type="text" value={form.row} onChange={set('row')} placeholder="e.g. 4"
                  className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">
                Seat number <span className="text-disabled font-normal">(optional)</span>
              </label>
              <input type="text" value={form.seatNumber} onChange={set('seatNumber')} placeholder="e.g. 12"
                className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors" />
            </div>
          </div>

          {/* Ticket file */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <h3 className="text-[0.7rem] font-bold text-muted uppercase tracking-wider4 mb-4">Ticket file</h3>
            <label
              className={`flex flex-col items-center justify-center border border-dashed rounded-lg p-8 cursor-pointer transition-colors text-center ${file ? 'border-accent/40 bg-accent/5' : 'border-[#252525] hover:border-accent/30'}`}
            >
              <span className="text-2xl mb-2">{file ? '✅' : '📄'}</span>
              <p className="text-[0.78rem] text-muted">
                {file ? file.name : 'Drop your ticket PDF or image here'}
              </p>
              <p className="text-[0.65rem] text-disabled mt-1">PDF, PNG, JPG · Max 10MB</p>
              <input
                type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* Pricing */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <h3 className="text-[0.7rem] font-bold text-muted uppercase tracking-wider4 mb-4">Pricing</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Original price (₹)</label>
                <input type="number" value={form.originalPrice} onChange={set('originalPrice')} placeholder="6999" min="1" required
                  className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors" />
              </div>
              <div>
                <label className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Asking price (₹)</label>
                <input type="number" value={form.askingPrice} onChange={set('askingPrice')} placeholder="4500" min="1" required
                  className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors" />
              </div>
            </div>
            {payout && (
              <p className="text-[0.68rem] text-muted">
                You receive <span className="text-accent font-semibold">₹{payout.toLocaleString('en-IN')}</span> after 5% platform fee.
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 bg-transparent border border-[#222] text-secondary text-[0.83rem] font-medium py-3 rounded-lg cursor-pointer hover:border-[#444] hover:text-primary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-[2] bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold py-3 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting…' : 'Submit for review →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(seller\)/listings/new/
git commit -m "feat(web): implement create listing page with file upload and payout preview"
```

---

## Task 8: My Listings + My Orders

**Files:**
- Modify: `apps/web/app/(seller)/listings/page.tsx`
- Modify: `apps/web/app/(buyer)/orders/page.tsx`

- [ ] **Step 1: Implement my listings page**

```tsx
// apps/web/app/(seller)/listings/page.tsx
import Link from 'next/link'
import Nav from '../../../components/Nav'
import Badge from '../../../components/Badge'
import { apiFetch } from '../../../lib/api'

type MyListing = {
  id: string; askingPrice: number; status: string;
  seatSection?: string; seatRow?: string; seatNumber?: string;
  event: { title: string; city: string; dateTime: string; venue: { name: string } }
}

const STATUS_VARIANT: Record<string, 'active' | 'pending' | 'sold'> = {
  ACTIVE:               'active',
  PENDING_VERIFICATION: 'pending',
  SOLD:                 'sold',
  EXPIRED:              'sold',
  REJECTED:             'sold',
}
const STATUS_LABEL: Record<string, string> = {
  ACTIVE:               'Active',
  PENDING_VERIFICATION: 'Pending review',
  SOLD:                 'Sold',
  EXPIRED:              'Expired',
  REJECTED:             'Rejected',
}

export default async function MyListingsPage() {
  const listings = await apiFetch<MyListing[]>('/users/me/listings').catch(() => [] as MyListing[])

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2">My listings</h1>
          <Link
            href="/listings/new"
            className="bg-accent hover:bg-accent-hover text-black text-[0.78rem] font-bold px-4 py-[7px] rounded-md no-underline transition-colors"
          >
            + New listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-sm mb-4">You haven&apos;t listed any tickets yet.</p>
            <Link href="/listings/new" className="text-accent text-[0.83rem] no-underline hover:underline">
              List your first ticket →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {listings.map((l) => {
              const d    = new Date(l.event.dateTime)
              const seat = [l.seatSection && `Section ${l.seatSection}`, l.seatRow && `Row ${l.seatRow}`].filter(Boolean).join(' · ') || 'GA'
              const isSold = ['SOLD', 'EXPIRED', 'REJECTED'].includes(l.status)
              return (
                <div key={l.id} className="flex items-center gap-4 px-4 py-4 bg-surface border border-border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.84rem] font-medium text-primary mb-[3px]">{l.event.title}</div>
                    <div className="text-[0.67rem] text-muted">
                      {seat} · {l.event.venue.name} · {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[l.status] ?? 'sold'}>{STATUS_LABEL[l.status] ?? l.status}</Badge>
                  <div className={`text-[0.9rem] font-bold tracking-tighter2 min-w-[70px] text-right ${isSold ? 'text-disabled' : 'text-accent'}`}>
                    ₹{(l.askingPrice / 100).toLocaleString('en-IN')}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-[0.65rem] font-semibold bg-transparent border border-[#1e1e1e] text-muted rounded-md px-[10px] py-1 cursor-pointer hover:border-[#333] hover:text-secondary transition-all disabled:opacity-30" disabled={isSold}>
                      Edit
                    </button>
                    <button className="text-[0.65rem] font-semibold bg-transparent border border-[#1e1e1e] text-muted rounded-md px-[10px] py-1 cursor-pointer hover:border-danger/40 hover:text-danger transition-all disabled:opacity-30" disabled={isSold}>
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement my orders page**

```tsx
// apps/web/app/(buyer)/orders/page.tsx
import Nav from '../../components/Nav'
import Badge from '../../components/Badge'
import { apiFetch } from '../../lib/api'

type Order = {
  id: string; amount: number; paymentStatus: string; createdAt: string;
  listing: {
    seatSection?: string; seatRow?: string; seatNumber?: string;
    event: { title: string; dateTime: string; venue: { name: string } }
    seller: { name: string }
  }
}

const STATUS_VARIANT: Record<string, 'active' | 'pending' | 'sold'> = {
  PAID:     'active',
  PENDING:  'pending',
  REFUNDED: 'sold',
}
const STATUS_LABEL: Record<string, string> = {
  PAID: 'Paid', PENDING: 'Pending', REFUNDED: 'Refunded',
}

export default async function MyOrdersPage() {
  const orders = await apiFetch<Order[]>('/users/me/orders').catch(() => [] as Order[])

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <div className="px-8 py-8">
        <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2 mb-8">My orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-sm mb-4">No orders yet.</p>
            <a href="/" className="text-accent text-[0.83rem] no-underline hover:underline">Browse events →</a>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.map((o) => {
              const d    = new Date(o.listing.event.dateTime)
              const seat = [o.listing.seatSection && `Section ${o.listing.seatSection}`, o.listing.seatRow && `Row ${o.listing.seatRow}`].filter(Boolean).join(' · ') || 'GA'
              return (
                <div key={o.id} className="flex items-center gap-4 px-4 py-4 bg-surface border border-border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.84rem] font-medium text-primary mb-[3px]">{o.listing.event.title}</div>
                    <div className="text-[0.67rem] text-muted">
                      {seat} · {o.listing.event.venue.name} · {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {' · '}Seller: {o.listing.seller.name}
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[o.paymentStatus] ?? 'sold'}>{STATUS_LABEL[o.paymentStatus] ?? o.paymentStatus}</Badge>
                  <div className="text-[0.9rem] font-bold text-accent tracking-tighter2 min-w-[80px] text-right">
                    ₹{(o.amount / 100).toLocaleString('en-IN')}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(seller\)/listings/page.tsx apps/web/app/\(buyer\)/
git commit -m "feat(web): implement my listings and my orders pages"
```

---

## Task 9: Admin Pages

**Files:**
- Modify: `apps/web/app/(admin)/admin/events/page.tsx`
- Modify: `apps/web/app/(admin)/admin/listings/page.tsx`

- [ ] **Step 1: Implement admin events page**

```tsx
// apps/web/app/(admin)/admin/events/page.tsx
import Link from 'next/link'
import Nav from '../../../../components/Nav'
import Badge from '../../../../components/Badge'
import { apiFetch } from '../../../../lib/api'

type AdminEvent = {
  id: string; title: string; city: string; dateTime: string;
  category: string; status: string;
  venue: { name: string }
}

const EVENT_STATUS_VARIANT: Record<string, 'active' | 'pending' | 'sold' | 'upcoming'> = {
  UPCOMING:  'upcoming',
  LIVE:      'active',
  PAST:      'sold',
  CANCELLED: 'sold',
}

export default async function AdminEventsPage() {
  const events = await apiFetch<AdminEvent[]>('/admin/events').catch(() => [] as AdminEvent[])

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2">Events</h1>
          <button className="bg-accent hover:bg-accent-hover text-black text-[0.78rem] font-bold px-4 py-[7px] rounded-md border-0 cursor-pointer transition-colors">
            + Create event
          </button>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_120px_100px_80px_100px] px-4 py-3 border-b border-border bg-surface">
            {['Event', 'City', 'Date', 'Category', 'Status', 'Actions'].map((h, i) => (
              <span key={i} className="text-[0.58rem] font-semibold text-disabled uppercase tracking-wider3">{h}</span>
            ))}
          </div>
          {events.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted text-sm">No events yet.</div>
          ) : events.map((ev) => {
            const d = new Date(ev.dateTime)
            return (
              <div key={ev.id} className="grid grid-cols-[1fr_100px_120px_100px_80px_100px] items-center px-4 py-3 border-b border-[#0f0f0f] hover:bg-surface transition-colors">
                <div>
                  <div className="text-[0.82rem] font-medium text-primary">{ev.title}</div>
                  <div className="text-[0.66rem] text-muted">{ev.venue.name}</div>
                </div>
                <div className="text-[0.72rem] text-secondary">{ev.city}</div>
                <div className="text-[0.72rem] text-secondary">
                  {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="text-[0.72rem] text-secondary">{ev.category}</div>
                <Badge variant={EVENT_STATUS_VARIANT[ev.status] ?? 'sold'}>{ev.status}</Badge>
                <div className="flex gap-2">
                  <button className="text-[0.62rem] font-semibold bg-transparent border border-[#1e1e1e] text-muted rounded px-2 py-[3px] cursor-pointer hover:text-primary hover:border-[#333] transition-all">
                    Edit
                  </button>
                  <button className="text-[0.62rem] font-semibold bg-transparent border border-[#1e1e1e] text-muted rounded px-2 py-[3px] cursor-pointer hover:text-danger hover:border-danger/30 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement admin listings (verification queue) page**

```tsx
// apps/web/app/(admin)/admin/listings/page.tsx
import Nav from '../../../../components/Nav'
import Badge from '../../../../components/Badge'
import { apiFetch } from '../../../../lib/api'

type AdminListing = {
  id: string; askingPrice: number; originalPrice: number; status: string;
  ticketFileUrl: string;
  seatSection?: string; seatRow?: string; seatNumber?: string;
  event: { title: string; dateTime: string }
  seller: { name: string; email: string }
}

const FILTER_TABS = ['All', 'Pending', 'Active', 'Rejected'] as const

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const status   = searchParams.status?.toUpperCase() ?? ''
  const endpoint = status && status !== 'ALL' ? `/admin/listings?status=${status}` : '/admin/listings'
  const listings = await apiFetch<AdminListing[]>(endpoint).catch(() => [] as AdminListing[])

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <div className="px-8 py-8">
        <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2 mb-6">Listing Verification Queue</h1>

        <div className="flex border-b border-border mb-6">
          {FILTER_TABS.map((tab) => (
            <a
              key={tab}
              href={tab === 'All' ? '/admin/listings' : `/admin/listings?status=${tab}`}
              className={`text-[0.73rem] font-medium px-4 py-3 no-underline whitespace-nowrap border-b-2 transition-colors ${
                (!searchParams.status && tab === 'All') || searchParams.status?.toLowerCase() === tab.toLowerCase()
                  ? 'text-accent border-accent'
                  : 'text-disabled border-transparent hover:text-secondary'
              }`}
            >
              {tab}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {listings.length === 0 ? (
            <p className="text-muted text-sm py-8 text-center">No listings in this queue.</p>
          ) : listings.map((l) => {
            const seat = [l.seatSection && `Section ${l.seatSection}`, l.seatRow && `Row ${l.seatRow}`, l.seatNumber && `Seat ${l.seatNumber}`].filter(Boolean).join(' · ') || 'GA'
            const isPending = l.status === 'PENDING_VERIFICATION'
            return (
              <div key={l.id} className="flex items-center gap-4 px-4 py-4 bg-surface border border-border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-[0.84rem] font-medium text-primary mb-[3px]">{l.event.title}</div>
                  <div className="text-[0.67rem] text-muted">
                    {seat} · Seller: {l.seller.name} ({l.seller.email})
                  </div>
                </div>
                <a
                  href={l.ticketFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.65rem] text-accent no-underline hover:underline"
                >
                  View ticket →
                </a>
                <div className="text-[0.85rem] font-bold text-accent tracking-tighter2">
                  ₹{(l.askingPrice / 100).toLocaleString('en-IN')}
                </div>
                <Badge variant={l.status === 'ACTIVE' ? 'active' : l.status === 'PENDING_VERIFICATION' ? 'pending' : 'sold'}>
                  {l.status === 'PENDING_VERIFICATION' ? 'Pending' : l.status}
                </Badge>
                {isPending && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="text-[0.65rem] font-bold bg-accent/10 border border-accent/30 text-accent rounded-md px-3 py-[5px] cursor-pointer hover:bg-accent/20 transition-colors">
                      Approve
                    </button>
                    <button className="text-[0.65rem] font-bold bg-danger/5 border border-danger/20 text-danger rounded-md px-3 py-[5px] cursor-pointer hover:bg-danger/10 transition-colors">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(admin\)/
git commit -m "feat(web): implement admin events and listing verification queue"
```

---

## Task 10: Final verification

- [ ] **Step 1: Run the web app**

```bash
pnpm --filter @resell/web dev
```

- [ ] **Step 2: Check each route**

Open each URL and confirm it renders without crashing, uses the correct dark background, Outfit font, and emerald accents:

| URL | Expected |
|-----|----------|
| `http://localhost:3000/` | Homepage with hero, ticker, tabs, event table (empty state if no API) |
| `http://localhost:3000/search` | Search form renders |
| `http://localhost:3000/login` | Login card centered on dark bg |
| `http://localhost:3000/register` | Register form |
| `http://localhost:3000/verify` | OTP input |
| `http://localhost:3000/listings` | My listings (empty state) |
| `http://localhost:3000/listings/new` | Create listing form with upload zone |
| `http://localhost:3000/orders` | My orders (empty state) |
| `http://localhost:3000/admin/events` | Admin events table |
| `http://localhost:3000/admin/listings` | Verification queue |

- [ ] **Step 3: Run build to catch type errors**

```bash
pnpm --filter @resell/web build
```

Expected: build completes without TypeScript errors. Fix any type errors before proceeding.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat(web): complete UI implementation — all pages styled, dark mode, Outfit font, emerald accent"
```
