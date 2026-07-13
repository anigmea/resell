import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resell — Ticket Resale India',
  description: 'Buy and sell event tickets securely',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
