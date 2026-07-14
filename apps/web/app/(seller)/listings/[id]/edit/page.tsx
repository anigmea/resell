'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Nav from '../../../../components/Nav'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie.split('; ').find(r => r.startsWith(`${name}=`))?.split('=')[1]
}

type Listing = {
  id: string
  askingPrice: number
  originalPrice: number
  seatSection?: string
  seatRow?: string
  seatNumber?: string
  event: { title: string; dateTime: string }
}

export default function EditListingPage() {
  const params   = useParams()
  const router   = useRouter()
  const id       = params.id as string

  const [listing,  setListing]  = useState<Listing | null>(null)
  const [price,    setPrice]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    const token = getCookie('accessToken')
    fetch(`${API}/listings/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((l: Listing) => {
        setListing(l)
        setPrice(String(l.askingPrice / 100))
        setLoading(false)
      })
      .catch(() => { setError('Listing not found'); setLoading(false) })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const paise = Math.round(parseFloat(price) * 100)
    if (!paise || paise < 1) { setError('Enter a valid price'); return }
    setSaving(true)
    setError(null)
    const token = getCookie('accessToken')
    const res = await fetch(`${API}/listings/${id}`, {
      method:  'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ askingPrice: paise }),
    })
    if (res.ok) {
      router.push('/listings')
    } else {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed to update listing')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Nav backHref="/listings" backLabel="My listings" />
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-bg">
        <Nav backHref="/listings" backLabel="My listings" />
        <div className="flex items-center justify-center h-64">
          <p className="text-danger text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const d = listing ? new Date(listing.event.dateTime) : null

  return (
    <div className="min-h-screen bg-bg">
      <Nav backHref="/listings" backLabel="My listings" />
      <div className="px-8 py-8 max-w-md">
        <h1 className="text-[1.4rem] font-extrabold text-primary tracking-tighter2 mb-1">
          Edit listing
        </h1>
        {listing && (
          <p className="text-[0.75rem] text-muted mb-8">
            {listing.event.title} · {d?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {listing.seatSection && ` · Section ${listing.seatSection}`}
            {listing.seatRow && ` · Row ${listing.seatRow}`}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-semibold text-muted uppercase tracking-wider">
              Asking price (₹)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="bg-surface border border-border text-primary rounded-lg px-4 py-3 text-[0.9rem] outline-none focus:border-accent transition-colors"
              placeholder="e.g. 2500"
              required
            />
            {listing && (
              <p className="text-[0.65rem] text-muted">
                Original price: ₹{(listing.originalPrice / 100).toLocaleString('en-IN')}
              </p>
            )}
          </div>

          {error && <p className="text-danger text-[0.75rem]">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => router.push('/listings')}
              className="flex-1 py-3 rounded-lg border border-border text-secondary text-[0.83rem] font-semibold bg-transparent cursor-pointer hover:border-[#333] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-lg bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold cursor-pointer transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
