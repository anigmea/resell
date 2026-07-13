import { apiFetch } from '../../lib/api'

type Event = {
  id: string; title: string; city: string; dateTime: string;
  category: string; bannerImage?: string;
  venue: { name: string }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { city?: string; category?: string }
}) {
  const params = new URLSearchParams()
  if (searchParams.city)     params.set('city',     searchParams.city)
  if (searchParams.category) params.set('category', searchParams.category)

  const events = await apiFetch<Event[]>(`/events?${params}`)

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Upcoming Events</h1>
      <ul>
        {events.map((ev) => (
          <li key={ev.id}>
            <a href={`/events/${ev.id}`}>
              <strong>{ev.title}</strong> — {ev.venue.name}, {ev.city}
              <br />
              {new Date(ev.dateTime).toLocaleDateString('en-IN')}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
