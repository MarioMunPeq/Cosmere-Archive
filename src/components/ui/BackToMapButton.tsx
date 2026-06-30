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
  label = 'Back to the map',
  className = '',
  variant = 'link',
}: Props) {
  if (variant === 'button') {
    return (
      <TransitionLink
        to={to}
        className={`rounded-lg bg-purple-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600 ${className}`}
      >
        {label}
      </TransitionLink>
    )
  }

  return (
    <TransitionLink
      to={to}
      className={`inline-flex items-center gap-1.5 text-sm text-purple-400 transition-colors hover:text-purple-300 ${className}`}
    >
      <IconChevronLeft aria-hidden="true" />
      {label}
    </TransitionLink>
  )
})

export default BackToMapButton
