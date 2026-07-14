// apps/web/app/(public)/search/page.tsx
import Link from 'next/link'
import Nav from '../../components/Nav'
import Badge from '../../components/Badge'
import { apiFetch } from '../../../lib/api'

type SearchResult = {
  id: string; title: string; city: string; dateTime: string;
  category: string; venue: { name: string }
  minPrice?: number
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string | string[]; city?: string | string[] }
}) {
  const q    = Array.isArray(searchParams.q)    ? searchParams.q[0]    : searchParams.q
  const city = Array.isArray(searchParams.city) ? searchParams.city[0] : searchParams.city

  const results = q
    ? await apiFetch<SearchResult[]>(`/search?q=${encodeURIComponent(q)}${city ? `&city=${encodeURIComponent(city)}` : ''}`).catch(() => [] as SearchResult[])
    : []

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <div className="px-8 py-8 max-w-2xl mx-auto">
        <h1 className="text-[1.6rem] font-extrabold text-primary tracking-tighter2 mb-6">Search</h1>
        <form method="GET" className="flex gap-2 mb-8">
          <label htmlFor="search-q" className="sr-only">Search events</label>
          <input
            id="search-q"
            name="q"
            type="text"
            defaultValue={q}
            placeholder="Events, artists, teams…"
            autoFocus
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-[0.875rem] text-primary placeholder:text-disabled outline-none focus:border-accent/30 transition-colors"
          />
          <select
            name="city"
            defaultValue={city ?? ''}
            className="bg-surface border border-border rounded-lg px-3 text-[0.8rem] text-secondary outline-none cursor-pointer"
          >
            <option value="">All cities</option>
            {['Mumbai','Delhi','Bengaluru','Hyderabad','Chennai','Pune'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-black text-[0.82rem] font-bold px-5 rounded-lg border-0 cursor-pointer transition-colors"
          >
            Search →
          </button>
        </form>

        {q && (
          <div className="text-[0.72rem] text-muted mb-4">
            {results.length > 0
              ? `${results.length} result${results.length === 1 ? '' : 's'} for "${q}"`
              : `No results for "${q}"`}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {results.map((ev) => {
            const d = new Date(ev.dateTime)
            return (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="flex items-center gap-4 px-4 py-4 bg-surface border border-border rounded-lg no-underline hover:border-accent/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[0.875rem] font-semibold text-primary group-hover:text-white transition-colors mb-1">
                    {ev.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="category">{ev.category}</Badge>
                    <span className="text-[0.66rem] text-muted">{ev.venue.name} · {ev.city}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[0.88rem] font-bold text-accent tracking-tighter2">
                    {ev.minPrice != null ? `₹${(ev.minPrice / 100).toLocaleString('en-IN')}` : '—'}
                  </div>
                  <div className="text-[0.63rem] text-muted mt-[2px]">
                    {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
