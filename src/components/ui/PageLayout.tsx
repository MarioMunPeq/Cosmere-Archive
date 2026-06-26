import type { ReactNode } from 'react'

type Variant = 'default' | 'center' | 'none'

interface Props {
  children: ReactNode
  variant?: Variant
  className?: string
  as?: 'div' | 'section'
}

const BASE = 'flex min-h-0 flex-1'
const VARIANT_CLASS: Record<Variant, string> = {
  default: 'flex-col gap-4 overflow-y-auto p-4 sm:p-6',
  center: 'items-center justify-center p-6',
  none: 'flex-col',
}

export default function PageLayout({ children, variant = 'default', className = '', as: Tag = 'div' }: Props) {
  return <Tag className={`${BASE} ${VARIANT_CLASS[variant]} ${className}`}>{children}</Tag>
}
