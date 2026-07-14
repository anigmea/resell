'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

export default function ListingActions({ listingId }: { listingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [error, setError]     = useState('')

  async function act(action: 'approve' | 'reject') {
    setLoading(action)
    setError('')
    try {
      const endpoint = action === 'approve'
        ? `${API}/admin/listings/${listingId}/verify`
        : `${API}/admin/listings/${listingId}/reject`
      const body = action === 'reject' ? JSON.stringify({ reason: 'Does not meet verification standards.' }) : undefined
      const res = await fetch(endpoint, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error ?? `Failed to ${action}`)
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-[0.6rem] text-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => act('approve')}
          disabled={loading !== null}
          className="text-[0.65rem] font-bold bg-accent/10 border border-accent/30 text-accent rounded-md px-3 py-[5px] cursor-pointer hover:bg-accent/20 transition-colors disabled:opacity-50"
        >
          {loading === 'approve' ? '…' : 'Approve'}
        </button>
        <button
          onClick={() => act('reject')}
          disabled={loading !== null}
          className="text-[0.65rem] font-bold bg-danger/5 border border-danger/20 text-danger rounded-md px-3 py-[5px] cursor-pointer hover:bg-danger/10 transition-colors disabled:opacity-50"
        >
          {loading === 'reject' ? '…' : 'Reject'}
        </button>
      </div>
    </div>
  )
}
