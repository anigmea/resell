'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie.split('; ').find(r => r.startsWith(`${name}=`))?.split('=')[1]
}

export default function EventActions({ eventId, status }: { eventId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm('Cancel this event? All active listings will remain visible.')) return
    setLoading(true)
    const token = getCookie('accessToken')
    await fetch(`${API}/admin/events/${eventId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body:    JSON.stringify({ status: 'CANCELLED' }),
    })
    setLoading(false)
    router.refresh()
  }

  const isCancelled = status === 'CANCELLED' || status === 'PAST'

  return (
    <div className="flex gap-2">
      <a
        href={`/admin/events/${eventId}/edit`}
        className="text-[0.62rem] font-semibold bg-transparent border border-[#1e1e1e] text-muted rounded px-2 py-[3px] cursor-pointer hover:text-primary hover:border-[#333] transition-all no-underline"
      >
        Edit
      </a>
      <button
        onClick={handleCancel}
        disabled={loading || isCancelled}
        className="text-[0.62rem] font-semibold bg-transparent border border-[#1e1e1e] text-muted rounded px-2 py-[3px] cursor-pointer hover:text-danger hover:border-danger/30 transition-all disabled:opacity-30"
      >
        {loading ? '…' : 'Cancel'}
      </button>
    </div>
  )
}
