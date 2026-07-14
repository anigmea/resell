// apps/web/app/(public)/events/[id]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '../../../components/Nav'
import Badge from '../../../components/Badge'
import { apiFetch } from '../../../../lib/api'
import BuyButton from './BuyButton'

type Listing = {
  id: string; askingPrice: number; originalPrice: number;
  seatSection?: string; seatRow?: string; seatNumber?: string;
  seller: { name: string }; createdAt: string
}
type Event = {
  id: string; title: string; description?: string; organizer?: string; city: string;
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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const event = await apiFetch<Event>(`/events/${params.id}`).catch(() => null)
  if (!event) return { title: 'Event — resell.' }
  const d = new Date(event.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  return {
    title:       `${event.title} Tickets — resell.`,
    description: `Buy verified resale tickets for ${event.title} on ${d} at ${event.venue.name}, ${event.city}.`,
    openGraph: {
      title:       `${event.title} — resell.`,
      description: `Verified resale tickets · ${event.venue.name}, ${event.city} · ${d}`,
      type:        'website',
    },
  }
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { tab?: string; sort?: string }
}) {
  const [event, allListings] = await Promise.all([
    apiFetch<Event>(`/events/${params.id}`).catch(() => null),
    apiFetch<Listing[]>(`/events/${params.id}/listings`).catch(() => [] as Listing[]),
  ])

  if (!event) {
    return (
      <div className="min-h-screen bg-bg">
        <Nav />
        <div className="px-4 md:px-8 py-16 text-muted text-sm">Event not found.</div>
      </div>
    )
  }

  const sort = searchParams.sort ?? 'price-asc'
  const tab  = searchParams.tab  ?? 'tickets'

  const listings = [...allListings].sort((a, b) => {
    if (sort === 'price-desc') return b.askingPrice - a.askingPrice
    if (sort === 'newest')     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return a.askingPrice - b.askingPrice // price-asc default
  })

  const d        = new Date(event.dateTime)
  const gradient = CATEGORY_GRADIENT[event.category] ?? CATEGORY_GRADIENT.OTHER
  const emoji    = CATEGORY_EMOJI[event.category]    ?? '🎭'
  const minPrice = listings.length > 0 ? Math.min(...listings.map(l => l.askingPrice)) : null
  const isPast   = d < new Date()

  const TABS = [
    { key: 'tickets', label: `Tickets (${listings.length})` },
    { key: 'about',   label: 'About' },
    { key: 'venue',   label: 'Venue' },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <Nav backHref="/" backLabel="Events" />

      <main id="main">
      {/* Hero */}
      <div className="px-4 md:px-8 pt-6 md:pt-8 border-b border-border">
        <div className={`w-full h-28 md:h-40 rounded-[10px] mb-5 md:mb-6 flex items-center justify-center text-4xl md:text-5xl bg-gradient-to-br ${gradient}`}>
          {emoji}
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="category">{event.category}</Badge>
          {isPast && <Badge variant="sold">Past event</Badge>}
          <span className="text-[0.65rem] text-muted">
            {d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}
            {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <h1 className="text-[1.6rem] md:text-[2rem] font-extrabold text-primary leading-[1.1] tracking-tighter2 mb-1 [text-wrap:balance]">
          {event.title}
        </h1>
        <p className="text-[0.8rem] text-muted mb-5 md:mb-6">{event.venue.name}, {event.city}</p>

        {/* Tabs */}
        <div className="flex gap-0 border-t border-border -mx-4 md:-mx-8 px-4 md:px-8">
          {TABS.map(t => (
            <Link
              key={t.key}
              href={`/events/${event.id}?tab=${t.key}${sort !== 'price-asc' ? `&sort=${sort}` : ''}`}
              className={`text-[0.73rem] font-medium min-h-[44px] inline-flex items-center px-4 md:px-5 border-b-2 no-underline whitespace-nowrap transition-colors ${
                tab === t.key
                  ? 'text-accent border-accent'
                  : 'text-muted border-transparent hover:text-secondary'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tab: Tickets */}
      {tab === 'tickets' && (
        <div className="px-4 md:px-8 py-5 md:py-6">
          {listings.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <p className="text-[0.8rem] font-semibold text-secondary">
                  {listings.length} verified listing{listings.length === 1 ? '' : 's'}
                  {minPrice != null && ` · from ₹${(minPrice / 100).toLocaleString('en-IN')}`}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] text-muted">Sort:</span>
                  <div className="flex gap-1">
                    {[
                      { key: 'price-asc',  label: 'Cheapest' },
                      { key: 'price-desc', label: 'Priciest' },
                      { key: 'newest',     label: 'Newest'   },
                    ].map(s => (
                      <Link
                        key={s.key}
                        href={`/events/${event.id}?tab=tickets&sort=${s.key}`}
                        className={`text-[0.65rem] px-3 min-h-[44px] inline-flex items-center rounded no-underline border transition-colors ${
                          sort === s.key
                            ? 'border-accent/40 text-accent bg-accent/5'
                            : 'border-[#1e1e1e] text-muted hover:border-[#333] hover:text-secondary'
                        }`}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {listings.map((l) => {
                  const initial = l.seller.name[0]?.toUpperCase() ?? '?'
                  const seat    = [l.seatSection && `Section ${l.seatSection}`, l.seatRow && `Row ${l.seatRow}`, l.seatNumber && `Seat ${l.seatNumber}`].filter(Boolean).join(' · ') || 'General Admission'
                  const savings = l.originalPrice - l.askingPrice
                  return (
                    <div key={l.id} className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 md:py-4 bg-surface border border-border rounded-lg hover:border-accent/30 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[0.8rem] font-bold text-muted flex-shrink-0">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[0.82rem] font-medium text-primary">{seat}</div>
                        <div className="text-[0.65rem] text-muted mt-[2px]">
                          {l.seller.name} · Verified
                          {savings > 0 && <span className="text-accent ml-1">· Save ₹{(savings / 100).toLocaleString('en-IN')}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[0.95rem] md:text-[1rem] font-bold text-accent tracking-tighter2">
                          ₹{(l.askingPrice / 100).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[0.62rem] text-disabled line-through">
                          ₹{(l.originalPrice / 100).toLocaleString('en-IN')}
                        </div>
                      </div>
                      {!isPast && (
                        <BuyButton listingId={l.id} seat={seat} sellerName={l.seller.name} askingPrice={l.askingPrice} />
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 md:py-16">
              <p className="text-muted text-[0.85rem] mb-2">No tickets listed yet.</p>
              {!isPast && (
                <>
                  <p className="text-[0.75rem] text-muted mb-6">Have tickets for this event? List them in 2 minutes.</p>
                  <Link
                    href={`/listings/new?eventId=${event.id}&eventTitle=${encodeURIComponent(event.title)}`}
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold px-6 py-3 rounded-lg no-underline transition-colors"
                  >
                    Sell tickets for this event →
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Sell CTA at bottom when listings exist */}
          {listings.length > 0 && !isPast && (
            <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-[0.78rem] font-medium text-secondary">Have tickets for {event.title}?</p>
                <p className="text-[0.68rem] text-muted">List yours and reach thousands of buyers.</p>
              </div>
              <Link
                href={`/listings/new?eventId=${event.id}&eventTitle=${encodeURIComponent(event.title)}`}
                className="text-[0.75rem] font-semibold text-accent border border-accent/30 rounded-lg px-4 py-2 no-underline hover:bg-accent/5 transition-colors whitespace-nowrap"
              >
                Sell your tickets →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab: About */}
      {tab === 'about' && (
        <div className="px-4 md:px-8 py-6 max-w-2xl">
          {event.description ? (
            <p className="text-[0.85rem] text-secondary leading-relaxed whitespace-pre-line">{event.description}</p>
          ) : (
            <p className="text-muted text-[0.85rem]">No description available for this event.</p>
          )}
          {event.organizer && (
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-[0.65rem] font-bold text-muted uppercase tracking-wider mb-1">Organised by</p>
              <p className="text-[0.85rem] text-primary">{event.organizer}</p>
            </div>
          )}
          <div className="mt-6 pt-5 border-t border-border grid grid-cols-2 gap-6">
            <div>
              <p className="text-[0.65rem] font-bold text-muted uppercase tracking-wider mb-1">Date</p>
              <p className="text-[0.85rem] text-primary">{d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold text-muted uppercase tracking-wider mb-1">Time</p>
              <p className="text-[0.85rem] text-primary">{d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold text-muted uppercase tracking-wider mb-1">City</p>
              <p className="text-[0.85rem] text-primary">{event.city}</p>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold text-muted uppercase tracking-wider mb-1">Category</p>
              <p className="text-[0.85rem] text-primary capitalize">{event.category.toLowerCase()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Venue */}
      {tab === 'venue' && (
        <div className="px-4 md:px-8 py-6 max-w-lg">
          <h2 className="text-[1rem] font-bold text-primary mb-1">{event.venue.name}</h2>
          <p className="text-[0.78rem] text-muted mb-6">{event.venue.address}</p>
          {event.venue.mapsUrl ? (
            <a
              href={event.venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-surface border border-border text-secondary text-[0.78rem] font-medium px-4 py-3 rounded-lg no-underline hover:border-accent/30 hover:text-primary transition-colors"
            >
              <span>📍</span> Open in Google Maps →
            </a>
          ) : (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(event.venue.name + ', ' + event.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-surface border border-border text-secondary text-[0.78rem] font-medium px-4 py-3 rounded-lg no-underline hover:border-accent/30 hover:text-primary transition-colors"
            >
              <span>📍</span> Search on Google Maps →
            </a>
          )}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-[0.78rem] font-semibold text-secondary mb-3">Getting there</p>
            <ul className="text-[0.78rem] text-muted space-y-2">
              <li>Arrive at least 30 minutes before the event starts</li>
              <li>Carry a valid government-issued ID along with your ticket</li>
              <li>Digital tickets are accepted at entry</li>
            </ul>
          </div>
        </div>
      )}
      </main>
    </div>
  )
}
