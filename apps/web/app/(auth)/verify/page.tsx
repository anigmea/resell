'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function VerifyPage() {
  const [otp, setOtp]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ otp }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Invalid OTP')
      }
      window.location.href = '/'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-[1.4rem] font-black text-white tracking-tighter3 no-underline mb-1">
        resell<span className="text-accent">.</span>
      </Link>
      <p className="text-[0.78rem] text-muted mb-8">Verify your phone number</p>

      <div className="w-full max-w-[400px] bg-surface border border-border rounded-xl p-7">
        <h1 className="text-[1.1rem] font-bold text-primary tracking-tighter2 mb-1">Enter OTP</h1>
        <p className="text-[0.75rem] text-muted mb-6">We sent a 6-digit code to your phone</p>

        {error && (
          <div className="text-[0.75rem] text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="otp-input" className="sr-only">6-digit OTP</label>
          <input
            id="otp-input"
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            required
            className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-4 text-[1.5rem] font-bold text-primary text-center tracking-[0.3em] placeholder:text-disabled outline-none focus:border-accent/30 transition-colors"
          />
          <button
            type="submit" disabled={loading || otp.length < 6}
            className="w-full bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold py-3 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify →'}
          </button>
        </form>

        <p className="text-center mt-5 text-[0.73rem] text-muted">
          Didn&apos;t get the code?{' '}
          <button className="text-accent bg-transparent border-0 cursor-pointer text-[0.73rem] p-0 hover:underline">
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  )
}
