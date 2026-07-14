'use client'
import { useEffect, useState } from 'react'
import Nav from '../../components/Nav'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie.split('; ').find(r => r.startsWith(`${name}=`))?.split('=')[1]
}

type User = {
  id: string; name: string; email: string; phone: string;
  role: string; kycStatus: string; upiId?: string; phoneVerified: boolean
}

export default function AccountPage() {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // profile edit
  const [name,    setName]    = useState('')
  const [upiId,   setUpiId]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // become seller
  const [sellerUpi,      setSellerUpi]      = useState('')
  const [becomingSeller, setBecomingSeller] = useState(false)
  const [sellerMsg,      setSellerMsg]      = useState<string | null>(null)
  const [sellerError,    setSellerError]    = useState<string | null>(null)

  useEffect(() => {
    const token = getCookie('accessToken')
    if (!token) { window.location.href = '/login'; return }
    fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((u: User) => {
        setUser(u)
        setName(u.name)
        setUpiId(u.upiId ?? '')
        setLoading(false)
      })
      .catch(() => { window.location.href = '/login' })
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaveMsg(null)
    const token = getCookie('accessToken')
    const body: Record<string, string> = {}
    if (name.trim())  body.name  = name.trim()
    if (upiId.trim()) body.upiId = upiId.trim()
    const res = await fetch(`${API}/users/me`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body:    JSON.stringify(body),
    })
    if (res.ok) {
      const updated = await res.json()
      setUser(u => u ? { ...u, ...updated } : u)
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(null), 2000)
    } else {
      const b = await res.json().catch(() => ({}))
      setSaveMsg(b.error ?? 'Failed to save')
    }
    setSaving(false)
  }

  async function handleBecomeSeller(e: React.FormEvent) {
    e.preventDefault()
    if (!sellerUpi.trim()) { setSellerError('Enter your UPI ID'); return }
    setBecomingSeller(true); setSellerError(null); setSellerMsg(null)
    const token = getCookie('accessToken')
    const res = await fetch(`${API}/users/me/become-seller`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body:    JSON.stringify({ upiId: sellerUpi.trim() }),
    })
    if (res.ok) {
      setSellerMsg('You are now a seller! Refreshing…')
      setTimeout(() => window.location.reload(), 1200)
    } else {
      const b = await res.json().catch(() => ({}))
      setSellerError(b.error ?? 'Failed')
    }
    setBecomingSeller(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Nav />
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN'
  const initials = user?.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <div className="px-8 py-8 max-w-lg">
        <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2 mb-8">Account</h1>

        {/* Avatar + role */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-[1.1rem] font-bold text-accent">
            {initials}
          </div>
          <div>
            <p className="text-[0.95rem] font-semibold text-primary">{user?.name}</p>
            <p className="text-[0.72rem] text-muted capitalize">{user?.role.toLowerCase()} · {user?.email}</p>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSaveProfile} className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="text-[0.8rem] font-bold text-secondary uppercase tracking-wider mb-5">Profile</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.7rem] font-semibold text-muted uppercase tracking-wider">Full name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-bg border border-border text-primary rounded-lg px-4 py-3 text-[0.88rem] outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.7rem] font-semibold text-muted uppercase tracking-wider">Email</label>
              <input value={user?.email ?? ''} disabled className="bg-[#0a0a0a] border border-border text-disabled rounded-lg px-4 py-3 text-[0.88rem] outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.7rem] font-semibold text-muted uppercase tracking-wider">Phone</label>
              <input value={user?.phone ?? ''} disabled className="bg-[#0a0a0a] border border-border text-disabled rounded-lg px-4 py-3 text-[0.88rem] outline-none" />
            </div>
            {isSeller && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold text-muted uppercase tracking-wider">UPI ID (for payouts)</label>
                <input
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="you@upi"
                  className="bg-bg border border-border text-primary rounded-lg px-4 py-3 text-[0.88rem] outline-none focus:border-accent transition-colors"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-5">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent hover:bg-accent-hover text-black text-[0.8rem] font-bold px-5 py-[9px] rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saveMsg && <span className="text-[0.75rem] text-accent">{saveMsg}</span>}
          </div>
        </form>

        {/* Become seller */}
        {!isSeller && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-[0.8rem] font-bold text-secondary uppercase tracking-wider mb-1">Sell tickets</h2>
            <p className="text-[0.75rem] text-muted mb-5">
              List your verified tickets for resale. You need a UPI ID to receive payouts.
            </p>
            <form onSubmit={handleBecomeSeller} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold text-muted uppercase tracking-wider">Your UPI ID</label>
                <input
                  value={sellerUpi}
                  onChange={e => setSellerUpi(e.target.value)}
                  placeholder="yourname@upi"
                  className="bg-bg border border-border text-primary rounded-lg px-4 py-3 text-[0.88rem] outline-none focus:border-accent transition-colors"
                />
              </div>
              {sellerError && <p className="text-danger text-[0.75rem]">{sellerError}</p>}
              {sellerMsg && <p className="text-accent text-[0.75rem]">{sellerMsg}</p>}
              <button
                type="submit"
                disabled={becomingSeller}
                className="bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold py-3 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50"
              >
                {becomingSeller ? 'Upgrading…' : 'Become a seller →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
