import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center">
      <Link href="/" className="text-[1.4rem] font-black text-white tracking-tighter3 no-underline mb-8">
        resell<span className="text-accent">.</span>
      </Link>
      <div className="text-[6rem] font-black text-[#111] leading-none mb-4">404</div>
      <h1 className="text-[1.1rem] font-bold text-primary mb-2">Page not found</h1>
      <p className="text-[0.78rem] text-muted mb-8 max-w-xs">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold px-6 py-3 rounded-lg no-underline transition-colors">
        Back to events →
      </Link>
    </div>
  )
}
