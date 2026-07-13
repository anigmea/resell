import { apiFetch } from '../../../../lib/api'

type Listing = {
  id: string; askingPrice: number; seatSection?: string; seatRow?: string; seatNumber?: string;
  seller: { name: string }
}
type Event = {
  id: string; title: string; description?: string; city: string; dateTime: string;
  category: string; status: string; bannerImage?: string;
  venue: { name: string; address: string; mapsUrl?: string }
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const [event, listings] = await Promise.all([
    apiFetch<Event>(`/events/${params.id}`),
    apiFetch<Listing[]>(`/events/${params.id}/listings`),
  ])

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{event.title}</h1>
      <p>{event.venue.name} · {event.city}</p>
      <p>{new Date(event.dateTime).toLocaleString('en-IN')}</p>
      {event.description && <p>{event.description}</p>}

      <h2>Available Tickets</h2>
      {listings.length === 0 ? (
        <p>No tickets available right now.</p>
      ) : (
        <ul>
          {listings.map((l) => (
            <li key={l.id}>
              ₹{(l.askingPrice / 100).toLocaleString('en-IN')}
              {l.seatSection && ` · Section ${l.seatSection}`}
              {l.seatRow     && ` Row ${l.seatRow}`}
              {l.seatNumber  && ` Seat ${l.seatNumber}`}
              {' '}— Sold by {l.seller.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
