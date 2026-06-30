import { memo } from 'react'
import { CloseIcon } from '@/components/common/icons'

interface Props {
  onClick: () => void
  ariaLabel?: string
  className?: string
}

const CloseButton = memo(function CloseButton({
  onClick,
  ariaLabel = 'Close',
  className = 'absolute right-3 top-3',
}: Props) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${className} text-gray-600 transition-colors hover:text-gray-300`}
    >
      <CloseIcon />
    </button>
  )
})

export default CloseButton
