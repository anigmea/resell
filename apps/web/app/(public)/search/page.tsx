import { apiFetch } from '../../../lib/api'

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  if (!searchParams.q) {
    return (
      <main style={{ padding: '2rem' }}>
        <form method="GET">
          <input name="q" placeholder="Search events..." />
          <button type="submit">Search</button>
        </form>
      </main>
    )
  }

  const results = await apiFetch<any[]>(`/search?q=${encodeURIComponent(searchParams.q)}`)

  return (
    <main style={{ padding: '2rem' }}>
      <form method="GET">
        <input name="q" defaultValue={searchParams.q} placeholder="Search events..." />
        <button type="submit">Search</button>
      </form>
      <h2>Results for &quot;{searchParams.q}&quot;</h2>
      {results.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul>
          {results.map((ev) => (
            <li key={ev.id}>
              <a href={`/events/${ev.id}`}>{ev.title}</a> — {ev.city}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
