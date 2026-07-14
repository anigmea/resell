// apps/web/app/(admin)/admin/events/page.tsx
import Link from 'next/link'
import Nav from '../../../components/Nav'
import Badge from '../../../components/Badge'
import { apiFetch } from '../../../../lib/api'
import EventActions from './EventActions'

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
const EVENT_STATUS_LABEL: Record<string, string> = {
  UPCOMING:  'Upcoming',
  LIVE:      'Live',
  PAST:      'Past',
  CANCELLED: 'Cancelled',
}

export default async function AdminEventsPage() {
  const events = await apiFetch<AdminEvent[]>('/admin/events').catch(() => [] as AdminEvent[])

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2">Events</h1>
          <Link href="/admin/events/new" className="bg-accent hover:bg-accent-hover text-black text-[0.78rem] font-bold px-4 py-[7px] rounded-md no-underline transition-colors">
            + Create event
          </Link>
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
                <Badge variant={EVENT_STATUS_VARIANT[ev.status] ?? 'sold'}>{EVENT_STATUS_LABEL[ev.status] ?? ev.status}</Badge>
                <EventActions eventId={ev.id} status={ev.status} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
