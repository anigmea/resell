import Link from 'next/link'

interface NavProps {
  backHref?: string
  backLabel?: string
  userName?: string
}

export default function Nav({ backHref, backLabel, userName }: NavProps) {
  return (
    <nav className="flex items-center justify-between px-8 py-[0.85rem] border-b border-border">
      <Link href="/" className="flex items-center no-underline">
        <span className="text-[1.05rem] font-extrabold text-white tracking-tighter3">resell</span>
        <span className="w-[6px] h-[6px] rounded-full bg-accent logo-glow ml-[2px] mb-[2px] inline-block" />
      </Link>

      <div className="flex items-center gap-6">
        {backHref ? (
          <Link href={backHref} className="nav-link">← {backLabel ?? 'Back'}</Link>
        ) : (
          <>
            <Link href="/" className="nav-link">Browse</Link>
            <Link href="/listings/new" className="nav-link">Sell tickets</Link>
          </>
        )}
      </div>

      <div>
        {userName ? (
          <span className="text-[0.78rem] text-secondary font-medium">{userName}</span>
        ) : (
          <Link
            href="/login"
            className="text-[0.75rem] font-semibold border border-[#282828] text-secondary px-4 py-[5px] rounded-md no-underline transition-all hover:border-[#444] hover:text-primary"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
