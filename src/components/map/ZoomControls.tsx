import { memo } from 'react'
import { PlusIcon, MinusIcon, CloseIcon } from '@/components/common/icons'

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
        <PlusIcon />
      </button>
      <button
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700/60 bg-gray-900/80 text-gray-400 backdrop-blur-sm transition-colors hover:border-purple-500/60 hover:text-purple-400"
        aria-label="Zoom out"
      >
        <MinusIcon />
      </button>
      <button
        onClick={onReset}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700/60 bg-gray-900/80 text-gray-400 backdrop-blur-sm transition-colors hover:border-purple-500/60 hover:text-purple-400"
        aria-label="Reset view"
      >
        <CloseIcon />
      </button>
    </div>
  )
}

const ZoomControls = memo(ZoomControlsInner)
export default ZoomControls
