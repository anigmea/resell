'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie.split('; ').find(r => r.startsWith(`${name}=`))?.split('=')[1]
}

function VerifyForm() {
  const searchParams = useSearchParams()
  const phone        = searchParams.get('phone') ?? ''

  const [otp, setOtp]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [resendSent, setResent] = useState(false)

  async function handleResend() {
    setResent(false)
    try {
      await fetch(`${API}/auth/otp/send`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone }),
      })
      setResent(true)
    } catch {
      // silently fail — user can try again
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const token = getCookie('accessToken')
      const res = await fetch(`${API}/auth/otp/verify`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ phone, otp }),
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
    <div className="w-full max-w-[400px] bg-surface border border-border rounded-xl p-7">
      <h1 className="text-[1.1rem] font-bold text-primary tracking-tighter2 mb-1">Verify your phone</h1>
      <p className="text-[0.75rem] text-muted mb-6">
        We sent a 6-digit code to{phone ? ` ${phone}` : ' your phone'}
      </p>

      {error && (
        <div role="alert" aria-live="assertive" className="text-[0.75rem] text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 mb-4">
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
          className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-4 text-[1.5rem] font-bold text-primary text-center tracking-[0.3em] placeholder:text-muted outline-none focus:border-accent/30 transition-colors"
        />
        <button
          type="submit" disabled={loading || otp.length < 6}
          className="w-full bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold py-3 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying…' : 'Verify →'}
        </button>
      </form>

      <p className="text-center mt-5 text-[0.73rem] text-muted">
        {resendSent ? (
          <span className="text-accent">Code resent!</span>
        ) : (
          <>
            Didn&apos;t get the code?{' '}
            <button onClick={handleResend} className="text-accent bg-transparent border-0 cursor-pointer text-[0.73rem] p-0 hover:underline">
              Resend OTP
            </button>
          </>
        )}
      </p>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-[1.4rem] font-black text-white tracking-tighter3 no-underline mb-1">
        resell<span className="text-accent">.</span>
      </Link>
      <p className="text-[0.78rem] text-muted mb-8">Verify your phone number</p>
      <Suspense fallback={<div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />}>
        <VerifyForm />
      </Suspense>
    </div>
  )
}
