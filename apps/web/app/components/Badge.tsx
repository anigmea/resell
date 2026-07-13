type BadgeVariant = 'category' | 'active' | 'pending' | 'sold' | 'hot' | 'new' | 'upcoming' | 'cancelled'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
}

const styles: Record<BadgeVariant, string> = {
  category:  'text-muted border-[#222]',
  active:    'text-accent border-accent/30 bg-accent/5',
  pending:   'text-warning border-warning/30 bg-warning/5',
  sold:      'text-muted border-border',
  hot:       'text-danger border-danger/30 bg-danger/5',
  new:       'text-accent border-accent/30 bg-accent/5',
  upcoming:  'text-accent border-accent/30 bg-accent/5',
  cancelled: 'text-muted border-border',
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`text-[0.58rem] font-bold uppercase tracking-wider2 border rounded px-[7px] py-[2px] ${styles[variant]}`}>
      {children}
    </span>
  )
}
