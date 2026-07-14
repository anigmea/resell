'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center">
      <Link href="/" className="text-[1.4rem] font-black text-white tracking-tighter3 no-underline mb-8">
        resell<span className="text-accent">.</span>
      </Link>
      <h1 className="text-[1.1rem] font-bold text-primary mb-2">Something went wrong</h1>
      <p className="text-[0.78rem] text-muted mb-8 max-w-xs">
        An unexpected error occurred. Try again or go back to the homepage.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold px-5 py-3 rounded-lg border-0 cursor-pointer transition-colors"
        >
          Try again
        </button>
        <Link href="/" className="border border-border text-secondary text-[0.83rem] font-medium px-5 py-3 rounded-lg no-underline hover:border-[#333] hover:text-primary transition-colors">
          Home
        </Link>
      </div>
    </div>
  )
}
