import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Resell — Ticket Resale India',
  description: 'Buy and sell verified resale tickets for concerts, sports, and live events across India.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="bg-bg text-primary font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-black focus:rounded-lg focus:text-[0.8rem] focus:font-bold focus:no-underline"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
