import { cookies } from 'next/headers'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token: explicitToken, ...rest } = options ?? {}

  // In server components, forward the accessToken cookie as Bearer
  let serverToken: string | undefined
  try {
    const jar = await cookies()
    serverToken = jar.get('accessToken')?.value
  } catch {
    // Not in a server context (e.g. called from client code) — skip
  }

  const token = explicitToken ?? serverToken

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(rest.headers ?? {}),
    },
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}
