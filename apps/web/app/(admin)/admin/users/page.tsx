'use client'
import { useEffect, useState } from 'react'
import Nav from '../../../components/Nav'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie.split('; ').find(r => r.startsWith(`${name}=`))?.split('=')[1]
}

type User = {
  id: string; name: string; email: string; phone: string;
  role: string; kycStatus: string; phoneVerified: boolean; createdAt: string;
  _count: { listings: number; buyerOrders: number }
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN:  'text-accent border-accent/30 bg-accent/5',
  SELLER: 'text-warning border-warning/30 bg-warning/5',
  BUYER:  'text-muted border-border',
}

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')
  const [search,  setSearch]  = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  async function fetchUsers(role?: string) {
    setLoading(true)
    const token = getCookie('accessToken')
    const url   = `${API}/admin/users${role ? `?role=${role}` : ''}`
    const res   = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchUsers(filter || undefined) }, [filter])

  async function handleRoleChange(userId: string, newRole: string) {
    if (!confirm(`Change this user's role to ${newRole}?`)) return
    setUpdating(userId)
    const token = getCookie('accessToken')
    await fetch(`${API}/admin/users/${userId}/role`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body:    JSON.stringify({ role: newRole }),
    })
    await fetchUsers(filter || undefined)
    setUpdating(null)
  }

  const displayed = search
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <div className="px-4 md:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2">Users</h1>
          <div className="flex gap-2 flex-wrap">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="bg-surface border border-border text-primary rounded-lg px-3 py-2 text-[0.8rem] outline-none focus:border-accent transition-colors w-48"
            />
            {(['', 'BUYER', 'SELLER', 'ADMIN'] as const).map(r => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`text-[0.72rem] font-semibold px-3 py-2 rounded-lg border transition-colors ${
                  filter === r
                    ? 'bg-accent text-black border-accent'
                    : 'bg-transparent border-border text-muted hover:border-[#333] hover:text-secondary'
                }`}
              >
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_180px_80px_80px_80px_80px_120px] px-4 py-3 border-b border-border bg-surface">
              {['User', 'Email', 'Role', 'KYC', 'Listings', 'Orders', 'Change role'].map((h, i) => (
                <span key={i} className="text-[0.58rem] font-semibold text-disabled uppercase tracking-wider3">{h}</span>
              ))}
            </div>

            {displayed.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted text-sm">No users found.</div>
            ) : displayed.map(u => (
              <div key={u.id} className="border-b border-[#0f0f0f] hover:bg-surface transition-colors">
                {/* Mobile */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-[0.75rem] font-bold text-accent flex-shrink-0">
                    {u.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.82rem] font-medium text-primary truncate">{u.name}</div>
                    <div className="text-[0.65rem] text-muted truncate">{u.email}</div>
                  </div>
                  <span className={`text-[0.58rem] font-bold uppercase tracking-wider border rounded px-[6px] py-[2px] ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                </div>

                {/* Desktop */}
                <div className="hidden md:grid grid-cols-[1fr_180px_80px_80px_80px_80px_120px] items-center px-4 py-3">
                  <div>
                    <div className="text-[0.82rem] font-medium text-primary">{u.name}</div>
                    <div className="text-[0.65rem] text-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className="text-[0.72rem] text-muted truncate pr-4">{u.email}</div>
                  <span className={`text-[0.58rem] font-bold uppercase tracking-wider border rounded px-[6px] py-[2px] w-fit ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                  <span className={`text-[0.65rem] ${u.kycStatus === 'VERIFIED' ? 'text-accent' : 'text-muted'}`}>{u.kycStatus}</span>
                  <span className="text-[0.72rem] text-secondary">{u._count.listings}</span>
                  <span className="text-[0.72rem] text-secondary">{u._count.buyerOrders}</span>
                  <div className="flex gap-1">
                    {['BUYER', 'SELLER', 'ADMIN'].filter(r => r !== u.role).map(r => (
                      <button
                        key={r}
                        disabled={updating === u.id}
                        onClick={() => handleRoleChange(u.id, r)}
                        className="text-[0.58rem] font-semibold bg-transparent border border-[#1e1e1e] text-muted rounded px-2 py-[3px] cursor-pointer hover:text-primary hover:border-[#333] transition-all disabled:opacity-30"
                      >
                        → {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-[0.65rem] text-muted mt-4">{displayed.length} user{displayed.length === 1 ? '' : 's'} shown</p>
      </div>
    </div>
  )
}
