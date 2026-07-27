import { memo } from 'react'
import TransitionLink from '@/components/ui/TransitionLink'
import { IconChevronLeft } from '@/components/common/icons'

interface Props {
  to?: string
  label?: string
  className?: string
  variant?: 'link' | 'button'
}

const BackToMapButton = memo(function BackToMapButton({
  to = '/',
  label = 'Archive',
  className = '',
  variant = 'link',
}: Props) {
  if (variant === 'button') {
    return (
      <TransitionLink
        to={to}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${className}`}
        style={{
          background: 'rgba(80,60,40,0.12)',
          color: '#5a4a3a',
        }}
      >
        {label}
      </TransitionLink>
    )
  }

  return (
    <TransitionLink
      to={to}
      className={`inline-flex items-center gap-1.5 text-sm transition-colors ${className}`}
      style={{ color: '#8a7050' }}
    >
      <IconChevronLeft aria-hidden="true" />
      {label}
    </TransitionLink>
  )
})

export default BackToMapButton
