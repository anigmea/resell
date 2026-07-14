'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '../../../../components/Nav'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

const CATEGORIES = ['CONCERT', 'SPORTS', 'COMEDY', 'FESTIVAL', 'OTHER'] as const
const CITIES     = ['Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'] as const

type Venue = { id: string; name: string; city: string }

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie.split('; ').find(r => r.startsWith(`${name}=`))?.split('=')[1]
}

export default function AdminCreateEventPage() {
  const router = useRouter()
  const [venues,  setVenues]  = useState<Venue[]>([])
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    'CONCERT',
    venueId:     '',
    city:        'Mumbai',
    dateTime:    '',
    organizer:   '',
  })

  useEffect(() => {
    const token = getCookie('accessToken')
    fetch(`${API}/admin/venues`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : [])
      .then(setVenues)
      .catch(() => {})
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.venueId) { setError('Select a venue'); return }
    setSaving(true); setError(null)
    const token = getCookie('accessToken')
    const body = {
      title:       form.title,
      category:    form.category,
      venueId:     form.venueId,
      city:        form.city,
      dateTime:    new Date(form.dateTime).toISOString(),
      ...(form.description && { description: form.description }),
      ...(form.organizer   && { organizer:   form.organizer }),
    }
    const res = await fetch(`${API}/admin/events`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body:    JSON.stringify(body),
    })
    if (res.ok) {
      router.push('/admin/events')
    } else {
      const b = await res.json().catch(() => ({}))
      setError(b.error ?? 'Failed to create event')
    }
    setSaving(false)
  }

  const label = (text: string) => (
    <label className="text-[0.7rem] font-semibold text-muted uppercase tracking-wider">{text}</label>
  )
  const inputClass = "bg-bg border border-border text-primary rounded-lg px-4 py-3 text-[0.88rem] outline-none focus:border-accent transition-colors"

  return (
    <div className="min-h-screen bg-bg">
      <Nav backHref="/admin/events" backLabel="Events" />
      <div className="px-8 py-8 max-w-lg">
        <h1 className="text-[1.4rem] font-extrabold text-primary tracking-tighter2 mb-8">Create event</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            {label('Title')}
            <input value={form.title} onChange={set('title')} placeholder="e.g. Coldplay World Tour" required className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              {label('Category')}
              <select value={form.category} onChange={set('category')} className={inputClass + ' cursor-pointer'}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              {label('City')}
              <select value={form.city} onChange={set('city')} className={inputClass + ' cursor-pointer'}>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {label('Venue')}
            <select value={form.venueId} onChange={set('venueId')} required className={inputClass + ' cursor-pointer'}>
              <option value="">Select venue…</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name} ({v.city})</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            {label('Date & time')}
            <input type="datetime-local" value={form.dateTime} onChange={set('dateTime')} required className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            {label('Organizer (optional)')}
            <input value={form.organizer} onChange={set('organizer')} placeholder="e.g. BookMyShow Live" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            {label('Description (optional)')}
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="Event details…"
              className={inputClass + ' resize-none'}
            />
          </div>

          {error && <p className="text-danger text-[0.75rem]">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => router.push('/admin/events')}
              className="flex-1 py-3 rounded-lg border border-border text-secondary text-[0.83rem] font-semibold bg-transparent cursor-pointer hover:border-[#333] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-lg bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold cursor-pointer transition-colors disabled:opacity-50">
              {saving ? 'Creating…' : 'Create event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
