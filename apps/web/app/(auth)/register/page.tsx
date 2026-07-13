'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Registration failed')
      }
      window.location.href = '/verify'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (id: string, label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label htmlFor={id} className="block text-[0.72rem] font-semibold text-secondary mb-[6px]">{label}</label>
      <input
        id={id}
        type={type} value={form[key]} onChange={set(key)}
        placeholder={placeholder} required
        className="w-full bg-bg border border-[#1e1e1e] rounded-lg px-4 py-3 text-[0.85rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-[1.4rem] font-black text-white tracking-tighter3 no-underline mb-1">
        resell<span className="text-accent">.</span>
      </Link>
      <p className="text-[0.78rem] text-muted mb-8">Join India&apos;s verified ticket resale platform</p>

      <div className="w-full max-w-[400px] bg-surface border border-border rounded-xl p-7">
        <h1 className="text-[1.1rem] font-bold text-primary tracking-tighter2 mb-1">Create account</h1>
        <p className="text-[0.75rem] text-muted mb-6">Takes less than 2 minutes</p>

        {error && (
          <div className="text-[0.75rem] text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {field('reg-name',     'Full name', 'name',     'text',     'Rahul Mehta')}
          {field('reg-email',    'Email',     'email',    'email',    'you@example.com')}
          {field('reg-phone',    'Phone',     'phone',    'tel',      '9876543210')}
          {field('reg-password', 'Password',  'password', 'password', '••••••••')}
          <button
            type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold py-3 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? 'Creating account…' : 'Create account →'}
          </button>
        </form>

        <p className="text-center mt-5 text-[0.73rem] text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-accent no-underline hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
