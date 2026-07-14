// apps/web/app/(admin)/admin/listings/page.tsx
import Link from 'next/link'
import Nav from '../../../components/Nav'
import Badge from '../../../components/Badge'
import { apiFetch } from '../../../../lib/api'
import ListingActions from './ListingActions'

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
  searchParams: { status?: string | string[] }
}) {
  const rawStatus = Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status
  const STATUS_MAP: Record<string, string> = { pending: 'PENDING_VERIFICATION', active: 'ACTIVE', rejected: 'REJECTED' }
  const status   = rawStatus ? STATUS_MAP[rawStatus.toLowerCase()] ?? rawStatus.toUpperCase() : ''
  const endpoint = status ? `/admin/listings?status=${status}` : '/admin/listings'
  const listings = await apiFetch<AdminListing[]>(endpoint).catch(() => [] as AdminListing[])

  const activeTab = searchParams.status ? (Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status) : 'All'

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <div className="px-8 py-8">
        <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2 mb-6 [text-wrap:balance]">Listing Verification Queue</h1>

        <div className="flex border-b border-border mb-6">
          {FILTER_TABS.map((tab) => {
            const isActive = tab === 'All' ? !searchParams.status : activeTab?.toLowerCase() === tab.toLowerCase()
            return (
              <Link
                key={tab}
                href={tab === 'All' ? '/admin/listings' : `/admin/listings?status=${tab}`}
                className={`text-[0.73rem] font-medium px-4 py-3 no-underline whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? 'text-accent border-accent' : 'text-muted border-transparent hover:text-secondary'
                }`}
              >
                {tab}
              </Link>
            )
          })}
        </div>

        <div className="flex flex-col gap-2">
          {listings.length === 0 ? (
            <p className="text-muted text-sm py-8 text-center">No listings in this queue.</p>
          ) : listings.map((l) => {
            const seat      = [l.seatSection && `Section ${l.seatSection}`, l.seatRow && `Row ${l.seatRow}`, l.seatNumber && `Seat ${l.seatNumber}`].filter(Boolean).join(' · ') || 'General Admission'
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
                  className="text-[0.65rem] text-accent no-underline hover:underline whitespace-nowrap"
                >
                  View ticket →
                </a>
                <div className="text-[0.85rem] font-bold text-accent tracking-tighter2">
                  ₹{(l.askingPrice / 100).toLocaleString('en-IN')}
                </div>
                <Badge variant={l.status === 'ACTIVE' ? 'active' : l.status === 'PENDING_VERIFICATION' ? 'pending' : 'sold'}>
                  {l.status === 'PENDING_VERIFICATION' ? 'Pending' : l.status}
                </Badge>
                {isPending && <ListingActions listingId={l.id} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
