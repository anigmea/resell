import Link from 'next/link'
import NavUser from './NavUser'

interface NavProps {
  backHref?:  string
  backLabel?: string
}

export default function Nav({ backHref, backLabel }: NavProps) {
  return (
    <nav aria-label="Main navigation" className="flex items-center justify-between px-8 py-[0.85rem] border-b border-border">
      <Link href="/" className="flex items-center no-underline">
        <span className="text-[1.05rem] font-extrabold text-white tracking-tighter3">resell</span>
        <span className="w-[6px] h-[6px] rounded-full bg-accent logo-glow ml-[2px] mb-[2px] inline-block" />
      </Link>

      <div className="flex items-center gap-6">
        {backHref ? (
          <Link href={backHref} className="nav-link"><span aria-hidden="true">← </span>{backLabel ?? 'Back'}</Link>
        ) : (
          <>
            <Link href="/" className="nav-link">Browse</Link>
            <Link href="/listings/new" className="nav-link">Sell tickets</Link>
          </>
        )}
      </div>

      <NavUser />
    </nav>
  )
}
