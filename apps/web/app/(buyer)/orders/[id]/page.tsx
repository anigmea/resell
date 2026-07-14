import Link from 'next/link'
import Nav from '../../../components/Nav'
import { apiFetch } from '../../../../lib/api'

type Order = {
  id: string; amount: number; paymentStatus: string; createdAt: string;
  listing: {
    seatSection?: string; seatRow?: string; seatNumber?: string; ticketFileUrl: string;
    event: { title: string; dateTime: string; city: string; venue: { name: string } }
    seller: { name: string }
  }
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const orders = await apiFetch<Order[]>('/users/me/orders').catch(() => [] as Order[])
  const order  = orders.find(o => o.id === params.id)

  if (!order) {
    return (
      <div className="min-h-screen bg-bg">
        <Nav />
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted text-sm mb-4">Order not found.</p>
          <Link href="/orders" className="text-accent text-[0.83rem] no-underline hover:underline">← My orders</Link>
        </div>
      </div>
    )
  }

  const d    = new Date(order.listing.event.dateTime)
  const seat = [
    order.listing.seatSection && `Section ${order.listing.seatSection}`,
    order.listing.seatRow     && `Row ${order.listing.seatRow}`,
    order.listing.seatNumber  && `Seat ${order.listing.seatNumber}`,
  ].filter(Boolean).join(' · ') || 'General Admission'

  const isPaid = order.paymentStatus === 'PAID'

  return (
    <div className="min-h-screen bg-bg">
      <Nav backHref="/orders" backLabel="My orders" />

      <div className="max-w-lg mx-auto px-4 md:px-8 py-12">
        {/* Status hero */}
        <div className="text-center mb-10">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 ${isPaid ? 'bg-accent/10' : 'bg-warning/10'}`}>
            {isPaid ? '✓' : '⏳'}
          </div>
          <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2 mb-1">
            {isPaid ? 'Booking confirmed!' : 'Payment pending'}
          </h1>
          <p className="text-[0.78rem] text-muted">
            Order <span className="font-mono text-secondary">{order.id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        {/* Ticket card */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-[0.65rem] font-bold text-muted uppercase tracking-wider mb-3">Event details</h2>
            <div className="text-[1rem] font-bold text-primary mb-1">{order.listing.event.title}</div>
            <div className="text-[0.75rem] text-muted">
              {d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="text-[0.75rem] text-muted">{order.listing.event.venue.name}, {order.listing.event.city}</div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="px-6 py-4">
              <div className="text-[0.6rem] font-bold text-muted uppercase tracking-wider mb-1">Seat</div>
              <div className="text-[0.84rem] font-semibold text-primary">{seat}</div>
            </div>
            <div className="px-6 py-4">
              <div className="text-[0.6rem] font-bold text-muted uppercase tracking-wider mb-1">Amount paid</div>
              <div className="text-[0.84rem] font-semibold text-accent">₹{(order.amount / 100).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border">
            <div className="text-[0.6rem] font-bold text-muted uppercase tracking-wider mb-1">Seller</div>
            <div className="text-[0.78rem] text-secondary">{order.listing.seller.name} · Verified seller</div>
          </div>
        </div>

        {/* Download ticket */}
        {isPaid && (
          <a
            href={order.listing.ticketFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold no-underline transition-colors mb-3"
          >
            Download ticket →
          </a>
        )}

        <Link
          href="/orders"
          className="flex items-center justify-center w-full py-3 rounded-lg border border-border text-secondary text-[0.83rem] font-medium no-underline hover:border-[#333] hover:text-primary transition-colors"
        >
          View all orders
        </Link>

        {isPaid && (
          <p className="text-center text-[0.68rem] text-muted mt-6">
            A copy of your ticket has been saved. Show it at the venue entrance.
          </p>
        )}
      </div>
    </div>
  )
}
