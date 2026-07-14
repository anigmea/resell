// apps/web/app/(seller)/listings/page.tsx
import Link from 'next/link'
import Nav from '../../components/Nav'
import Badge from '../../components/Badge'
import { apiFetch } from '../../../lib/api'
import RemoveButton from './RemoveButton'

type Stats = { activeCount: number; pendingCount: number; soldCount: number; totalEarned: number }

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
  const [listings, stats] = await Promise.all([
    apiFetch<MyListing[]>('/users/me/listings').catch(() => [] as MyListing[]),
    apiFetch<Stats>('/users/me/stats').catch(() => null),
  ])

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <div className="px-4 md:px-8 py-8">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Active',   value: stats.activeCount,  color: 'text-accent' },
              { label: 'Pending',  value: stats.pendingCount, color: 'text-warning' },
              { label: 'Sold',     value: stats.soldCount,    color: 'text-secondary' },
              { label: 'Earned',   value: `₹${(stats.totalEarned / 100).toLocaleString('en-IN')}`, color: 'text-accent' },
            ].map(s => (
              <div key={s.label} className="bg-surface border border-border rounded-lg px-4 py-3">
                <p className="text-[0.6rem] font-semibold text-muted uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-[1.1rem] font-extrabold tracking-tighter2 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}
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
              const d      = new Date(l.event.dateTime)
              const seat   = [l.seatSection && `Section ${l.seatSection}`, l.seatRow && `Row ${l.seatRow}`].filter(Boolean).join(' · ') || 'GA'
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
                    {!isSold && (
                      <Link href={`/listings/${l.id}/edit`} className="text-[0.65rem] font-semibold bg-transparent border border-[#1e1e1e] text-muted rounded-md px-[10px] py-1 hover:border-[#333] hover:text-secondary transition-all no-underline">
                        Edit
                      </Link>
                    )}
                    {!isSold && <RemoveButton listingId={l.id} />}
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
