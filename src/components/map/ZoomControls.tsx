import { memo } from 'react'
import { CloseIcon } from '@/components/common/icons'

interface Props {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

function ZoomControlsInner({ onZoomIn, onZoomOut, onReset }: Props) {
  return (
    <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1">
      <button
        onClick={onZoomIn}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700/60 bg-gray-900/80 text-gray-400 backdrop-blur-sm transition-colors hover:border-purple-500/60 hover:text-purple-400"
        aria-label="Zoom in"
      >
        <CloseIcon />
      </button>
      <button
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700/60 bg-gray-900/80 text-gray-400 backdrop-blur-sm transition-colors hover:border-purple-500/60 hover:text-purple-400"
        aria-label="Zoom out"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700/60 bg-gray-900/80 text-gray-400 backdrop-blur-sm transition-colors hover:border-purple-500/60 hover:text-purple-400"
        aria-label="Reset view"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

const ZoomControls = memo(ZoomControlsInner)
export default ZoomControls
