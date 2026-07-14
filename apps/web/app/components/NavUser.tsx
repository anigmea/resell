'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type User = { id: string; name: string; role: string }

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie.split('; ').find(r => r.startsWith(`${name}=`))?.split('=')[1]
}

export default function NavUser() {
  const [user,    setUser]    = useState<User | null>(null)
  const [open,    setOpen]    = useState(false)
  const [checked, setChecked] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  async function fetchMe(token: string) {
    const r = await fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
    if (r.ok) return r.json() as Promise<User>
    // token may be expired — try silent refresh
    if (r.status === 401) {
      const rr = await fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' }).catch(() => null)
      if (rr?.ok) {
        const { accessToken } = await rr.json()
        const r2 = await fetch(`${API}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: 'include',
        })
        if (r2.ok) return r2.json() as Promise<User>
      }
    }
    return null
  }

  useEffect(() => {
    const token = getCookie('accessToken')
    if (!token) { setChecked(true); return }
    fetchMe(token)
      .then(u => { setUser(u); setChecked(true) })
      .catch(() => setChecked(true))
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    const token = getCookie('accessToken')
    await fetch(`${API}/auth/logout`, {
      method: 'POST', credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {})
    window.location.href = '/login'
  }

  if (!checked) return <div className="w-20 h-7 bg-surface rounded-md animate-pulse" />

  if (!user) {
    return (
      <Link href="/login" className="text-[0.78rem] font-semibold text-secondary hover:text-primary no-underline transition-colors">
        Sign in →
      </Link>
    )
  }

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-transparent border-0 cursor-pointer group"
      >
        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[0.65rem] font-bold text-accent">
          {initials}
        </div>
        <span className="text-[0.78rem] font-medium text-secondary group-hover:text-primary transition-colors max-w-[90px] truncate">
          {user.name.split(' ')[0]}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-border mb-1">
            <p className="text-[0.72rem] font-semibold text-primary truncate">{user.name}</p>
            <p className="text-[0.62rem] text-muted capitalize">{user.role.toLowerCase()}</p>
          </div>

          <Link href="/account" onClick={() => setOpen(false)} className="block px-4 py-2 text-[0.75rem] text-secondary hover:text-primary hover:bg-bg no-underline transition-colors">
            Account
          </Link>
          {(user.role === 'SELLER' || user.role === 'ADMIN') && (
            <Link href="/listings" onClick={() => setOpen(false)} className="block px-4 py-2 text-[0.75rem] text-secondary hover:text-primary hover:bg-bg no-underline transition-colors">
              My listings
            </Link>
          )}
          <Link href="/orders" onClick={() => setOpen(false)} className="block px-4 py-2 text-[0.75rem] text-secondary hover:text-primary hover:bg-bg no-underline transition-colors">
            My orders
          </Link>
          {user.role === 'ADMIN' && (
            <>
              <Link href="/admin/events" onClick={() => setOpen(false)} className="block px-4 py-2 text-[0.75rem] text-secondary hover:text-primary hover:bg-bg no-underline transition-colors">
                Admin — Events
              </Link>
              <Link href="/admin/listings" onClick={() => setOpen(false)} className="block px-4 py-2 text-[0.75rem] text-secondary hover:text-primary hover:bg-bg no-underline transition-colors">
                Admin — Listings
              </Link>
              <Link href="/admin/users" onClick={() => setOpen(false)} className="block px-4 py-2 text-[0.75rem] text-secondary hover:text-primary hover:bg-bg no-underline transition-colors">
                Admin — Users
              </Link>
            </>
          )}
          <div className="border-t border-border mt-1 pt-1">
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-[0.75rem] text-danger hover:bg-bg bg-transparent border-0 cursor-pointer transition-colors">
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
