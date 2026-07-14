// apps/web/app/(public)/page.tsx
import Link from 'next/link'
import Nav from '../components/Nav'
import Badge from '../components/Badge'
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
  'Just sold — IPL MI vs RR · ₹980',
  'Just sold — Diljit Floor · ₹3,100',
  'Just sold — Prateek Kuhad · ₹1,400',
]

export const dynamic = 'force-dynamic'

const CAT_MAP: Record<string, string> = {
  Concerts: 'CONCERT', Sports: 'SPORTS', Comedy: 'COMEDY',
  Festival: 'FESTIVAL', Theatre: 'THEATRE',
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { city?: string | string[]; category?: string | string[] }
}) {
  const city     = Array.isArray(searchParams.city)     ? searchParams.city[0]     : searchParams.city
  const category = Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category

  const params = new URLSearchParams()
  if (city)     params.set('city',     city)
  if (category) params.set('category', category)

  const events = await apiFetch<Event[]>(`/events?${params}`).catch(() => [] as Event[])

  const featured  = events.slice(0, 3)
  const rest      = events.slice(3)

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
        <div className="overflow-hidden flex-1">
          <div className="flex gap-12 text-[0.7rem] text-muted animate-ticker whitespace-nowrap w-max">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => {
              const [prefix, ...parts] = item.split('—')
              return (
                <span key={i} className="whitespace-nowrap">
                  {prefix}—<strong className="text-secondary font-medium">{parts.join('—')}</strong>
                </span>
              )
            })}
          </div>
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
                2,4<span className="text-accent">00</span>
              </div>
              <div className="text-[0.62rem] text-muted uppercase tracking-wider3 mt-1">Active listings</div>
            </div>
            <div>
              <div className="text-[2rem] font-extrabold text-primary tracking-tighter2 leading-none">
                <span className="text-accent">₹</span>12cr
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
            defaultValue={city ?? ''}
          >
            <option value="">All cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Chennai">Chennai</option>
            <option value="Pune">Pune</option>
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
        {['All', 'Concerts', 'Sports', 'Comedy', 'Festival', 'Theatre'].map((cat) => {
          const catValue = cat === 'All' ? undefined : CAT_MAP[cat]
          const isActive = cat === 'All' ? !category : category === catValue
          return (
            <Link
              key={cat}
              href={cat === 'All' ? '/' : `/?category=${catValue}`}
              data-active={isActive ? 'true' : undefined}
              className="text-[0.73rem] font-medium text-disabled px-4 py-3 whitespace-nowrap border-b-2 border-transparent no-underline hover:text-secondary transition-colors data-[active=true]:text-accent data-[active=true]:border-accent"
            >
              {cat}
            </Link>
          )
        })}
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
          All events{city ? ` · ${city}` : ''}
        </h2>
        <hr className="flex-1 border-t border-border border-b-0 border-l-0 border-r-0" />
      </div>

      {events.length === 0 ? (
        <p className="px-8 py-12 text-muted text-sm">No events yet — check back soon.</p>
      ) : (
        <>
          {/* Table header */}
          <div className="grid grid-cols-[56px_1fr_120px_90px] px-8 py-[0.45rem] border-b border-border-subtle">
            {['Date', 'Event', 'Venue', 'From'].map((h, i) => (
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
