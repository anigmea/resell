// apps/web/app/(buyer)/orders/page.tsx
import Link from 'next/link'
import Nav from '../../components/Nav'
import Badge from '../../components/Badge'
import { apiFetch } from '../../../lib/api'

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
            <Link href="/" className="text-accent text-[0.83rem] no-underline hover:underline">Browse events →</Link>
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
