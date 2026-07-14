'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

export default function RemoveButton({ listingId }: { listingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRemove() {
    if (!confirm('Remove this listing?')) return
    setLoading(true)
    try {
      await fetch(`${API}/listings/${listingId}`, { method: 'DELETE', credentials: 'include' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="text-[0.65rem] font-semibold bg-transparent border border-[#1e1e1e] text-muted rounded-md px-[10px] py-1 cursor-pointer hover:border-danger/40 hover:text-danger transition-all disabled:opacity-30"
    >
      {loading ? '…' : 'Remove'}
    </button>
  )
}
