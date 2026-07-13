'use client'
import { useState } from 'react'
import Nav from '../../../components/Nav'

const PLATFORM_FEE = 0.05

export default function NewListingPage() {
  const [form, setForm] = useState({
    eventSearch: '', section: '', row: '', seatNumber: '',
    originalPrice: '', askingPrice: '',
  })
  const [file, setFile]       = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const payout = form.askingPrice
    ? Math.round(parseFloat(form.askingPrice) * (1 - PLATFORM_FEE))
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Please upload your ticket file.'); return }
    setLoading(true); setError('')
    try {
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/listings/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      if (!uploadRes.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, fileUrl } = await uploadRes.json()

      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          seatSection:   form.section    || undefined,
          seatRow:       form.row        || undefined,
          seatNumber:    form.seatNumber || undefined,
          originalPrice: Math.round(parseFloat(form.originalPrice) * 100),
          askingPrice:   Math.round(parseFloat(form.askingPrice)   * 100),
          ticketFileUrl: fileUrl,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create listing')
      }
      window.location.href = '/listings'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors'

  return (
    <div className="min-h-screen bg-bg">
      <Nav backHref="/listings" backLabel="My listings" />

      <div className="max-w-[580px] mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2 mb-1">List a ticket</h1>
          <p className="text-[0.78rem] text-muted">Takes 2 minutes. Admin reviews within 4 hours before going live.</p>
        </div>

        {error && (
          <div className="text-[0.75rem] text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Event */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <h2 className="text-[0.7rem] font-bold text-muted uppercase tracking-wider4 mb-4">Event</h2>
            <label htmlFor="event-search" className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Search event</label>
            <input
              id="event-search"
              type="text" value={form.eventSearch} onChange={set('eventSearch')}
              placeholder="e.g. Coldplay, IPL, Zakir Khan…" required
              className={inputCls}
            />
          </div>

          {/* Seat details */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <h2 className="text-[0.7rem] font-bold text-muted uppercase tracking-wider4 mb-4">Seat details</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="seat-section" className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Section</label>
                <input id="seat-section" type="text" value={form.section} onChange={set('section')} placeholder="e.g. GA, A, VIP" className={inputCls} />
              </div>
              <div>
                <label htmlFor="seat-row" className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Row</label>
                <input id="seat-row" type="text" value={form.row} onChange={set('row')} placeholder="e.g. 4" className={inputCls} />
              </div>
            </div>
            <label htmlFor="seat-number" className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">
              Seat number <span className="text-disabled font-normal">(optional)</span>
            </label>
            <input id="seat-number" type="text" value={form.seatNumber} onChange={set('seatNumber')} placeholder="e.g. 12" className={inputCls} />
          </div>

          {/* Ticket file */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <h2 className="text-[0.7rem] font-bold text-muted uppercase tracking-wider4 mb-4">Ticket file</h2>
            <label
              className={`flex flex-col items-center justify-center border border-dashed rounded-lg p-8 cursor-pointer transition-colors text-center ${file ? 'border-accent/40 bg-accent/5' : 'border-[#252525] hover:border-accent/30'}`}
            >
              <span className="text-2xl mb-2" aria-hidden="true">{file ? '✅' : '📄'}</span>
              <p className="text-[0.78rem] text-muted">
                {file ? file.name : 'Drop your ticket PDF or image here'}
              </p>
              <p className="text-[0.65rem] text-disabled mt-1">PDF, PNG, JPG · Max 10MB</p>
              <input
                type="file" accept=".pdf,.png,.jpg,.jpeg" className="sr-only"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                aria-label="Upload ticket file"
              />
            </label>
          </div>

          {/* Pricing */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <h2 className="text-[0.7rem] font-bold text-muted uppercase tracking-wider4 mb-4">Pricing</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="original-price" className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Original price (₹)</label>
                <input id="original-price" type="number" value={form.originalPrice} onChange={set('originalPrice')} placeholder="6999" min="1" required className={inputCls} />
              </div>
              <div>
                <label htmlFor="asking-price" className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Asking price (₹)</label>
                <input id="asking-price" type="number" value={form.askingPrice} onChange={set('askingPrice')} placeholder="4500" min="1" required className={inputCls} />
              </div>
            </div>
            {payout != null && (
              <p className="text-[0.68rem] text-muted">
                You receive <span className="text-accent font-semibold">₹{payout.toLocaleString('en-IN')}</span> after 5% platform fee.
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 bg-transparent border border-[#222] text-secondary text-[0.83rem] font-medium py-3 rounded-lg cursor-pointer hover:border-[#444] hover:text-primary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-[2] bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold py-3 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting…' : 'Submit for review →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
