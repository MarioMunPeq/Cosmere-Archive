import { memo, type ReactNode } from 'react'
import CloseButton from '@/components/ui/CloseButton'

interface Props {
  children: ReactNode
  onClose: () => void
  ariaLabel: string
}

function DetailPanel({ children, onClose, ariaLabel }: Props) {
  return (
    <div className="absolute bottom-4 left-4 right-4 top-auto w-auto animate-scale-in rounded-xl border border-gray-700/60 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-lg sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:w-80 sm:p-5">
      <CloseButton onClick={onClose} ariaLabel={ariaLabel} />
      {children}
    </div>
  )
}

export default memo(DetailPanel)
