'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Login failed')
      }
      window.location.href = '/'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-[1.4rem] font-black text-white tracking-tighter3 no-underline mb-1">
        resell<span className="text-accent">.</span>
      </Link>
      <p className="text-[0.78rem] text-muted mb-8">Buy and sell verified resale tickets across India</p>

      <div className="w-full max-w-[400px] bg-surface border border-border rounded-xl p-7">
        <h1 className="text-[1.1rem] font-bold text-primary tracking-tighter2 mb-1">Welcome back</h1>
        <p className="text-[0.75rem] text-muted mb-6">Sign in to your account to continue</p>

        {error && (
          <div className="text-[0.75rem] text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="login-email" className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Email or phone</label>
            <input
              id="login-email"
              type="text" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">Password</label>
            <input
              id="login-password"
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold py-3 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <hr className="flex-1 border-t border-border border-b-0 border-l-0 border-r-0" />
          <span className="text-[0.65rem] text-disabled">or</span>
          <hr className="flex-1 border-t border-border border-b-0 border-l-0 border-r-0" />
        </div>

        <button className="w-full bg-transparent border border-[#222] text-secondary text-[0.83rem] font-medium py-3 rounded-lg cursor-pointer hover:border-[#444] hover:text-primary transition-all">
          Continue with OTP →
        </button>

        <p className="text-center mt-5 text-[0.73rem] text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent no-underline hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
