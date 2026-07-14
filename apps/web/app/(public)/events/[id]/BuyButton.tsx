'use client'
import { useState } from 'react'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

interface BuyButtonProps {
  listingId:   string
  seat:        string
  sellerName:  string
  askingPrice: number
}

export default function BuyButton({ listingId, seat, sellerName, askingPrice }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleBuy() {
    setLoading(true)
    setError('')
    try {
      // 1. Create order on backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/orders`,
        {
          method:      'POST',
          headers:     { 'Content-Type': 'application/json' },
          credentials: 'include',
          body:        JSON.stringify({ listingId }),
        },
      )
      if (res.status === 401) { window.location.href = '/login'; return }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create order')
      }
      const { orderId, razorpayOrderId, amount, currency, keyId } = await res.json()

      // 2. Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload  = () => resolve()
          s.onerror = () => reject(new Error('Failed to load payment SDK'))
          document.head.appendChild(s)
        })
      }

      // 3. Open Razorpay checkout
      new window.Razorpay({
        key:         keyId,
        order_id:    razorpayOrderId,
        amount,
        currency,
        name:        'resell.',
        description: `${seat} — sold by ${sellerName}`,
        theme:       { color: '#10b981' },
        handler: async (response: Record<string, string>) => {
          // 4. Verify payment on backend
          const verifyRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/orders/${orderId}/verify`,
            {
              method:      'POST',
              headers:     { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId:   response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            },
          )
          if (verifyRes.ok) {
            window.location.href = '/orders'
          } else {
            const body = await verifyRes.json().catch(() => ({}))
            setError(body.error ?? 'Payment verification failed')
          }
        },
      }).open()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <p className="text-[0.65rem] text-danger mb-1 text-right">{error}</p>
      )}
      <button
        onClick={handleBuy}
        disabled={loading}
        aria-label={`Buy ticket — ${seat}`}
        className="bg-accent hover:bg-accent-hover text-black text-[0.75rem] font-bold px-4 py-[7px] rounded-md border-0 cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50"
      >
        {loading ? '…' : 'Buy now'}
      </button>
    </div>
  )
}
