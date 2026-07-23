import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary'
}

export default function ArchiveButton({ children, variant = 'primary', className = '', ...rest }: Props) {
  const base = 'font-[Cormorant_Garamond,serif] tracking-[0.12em] uppercase transition-all duration-300 cursor-pointer'

  const styles: Record<string, string> = {
    primary: [
      'px-5 py-2.5 text-[13px] font-semibold',
      'border border-[#8a7a5a]/40',
      'text-[#3a2a1a] hover:text-[#2d1a0e]',
      'hover:border-[#8a7a5a]/70 hover:bg-[#c4a06008]',
      'active:bg-[#c4a06012]',
    ].join(' '),
    secondary: [
      'px-4 py-2 text-[12px] font-medium',
      'border border-[#8a7a5a]/20',
      'text-[#8a7a5a] hover:text-[#5a4a3a]',
      'hover:border-[#8a7a5a]/40',
    ].join(' '),
    tertiary: [
      'px-3 py-1.5 text-[11px] font-medium',
      'text-[#8a7a5a]/60 hover:text-[#8a7a5a]',
      'border border-transparent hover:border-[#8a7a5a]/15',
    ].join(' '),
  }

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
