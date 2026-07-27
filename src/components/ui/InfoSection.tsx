import { memo, type ReactNode } from 'react'

interface Props {
  label: string
  children: ReactNode
  className?: string
}

const InfoSection = memo(function InfoSection({ label, children, className = '' }: Props) {
  return (
    <div className={`mt-3 ${className}`}>
      <h4 className="mb-1.5 font-serif text-[8px] uppercase tracking-[0.12em]" style={{ color: '#8a7050' }}>
        {label}
      </h4>
      {children}
    </div>
  )
})

export default InfoSection
