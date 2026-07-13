'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'small'
  fullWidth?: boolean
}

export default function Button({ variant = 'primary', fullWidth = false, className = '', children, ...props }: ButtonProps) {
  const base = 'font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-40'
  const width = fullWidth ? 'w-full' : ''

  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-black text-[0.83rem] font-bold px-6 py-3 border-0',
    ghost:   'bg-transparent border border-[#222] text-secondary text-[0.83rem] px-6 py-3 hover:border-[#444] hover:text-primary',
    small:   'bg-transparent border border-[#1e1e1e] text-muted text-[0.65rem] font-semibold px-[10px] py-1 rounded-md hover:border-[#333] hover:text-secondary',
  }

  return (
    <button className={`${base} ${width} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
