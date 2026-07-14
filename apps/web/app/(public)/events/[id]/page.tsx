// apps/web/app/(public)/events/[id]/page.tsx
import type { Metadata } from 'next'
import Nav from '../../../components/Nav'
import Badge from '../../../components/Badge'
import { apiFetch } from '../../../../lib/api'
import BuyButton from './BuyButton'

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
          <p className="text-[0.8rem] font-semibold text-secondary">
            {listings.length > 0
              ? `${listings.length} verified listing${listings.length === 1 ? '' : 's'}${minPrice != null ? ` · from ₹${(minPrice / 100).toLocaleString('en-IN')}` : ''}`
              : 'No tickets available right now.'}
          </p>
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
                <BuyButton
                  listingId={l.id}
                  seat={seat}
                  sellerName={l.seller.name}
                  askingPrice={l.askingPrice}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
