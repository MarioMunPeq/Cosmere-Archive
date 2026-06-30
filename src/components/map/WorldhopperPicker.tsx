import { memo } from 'react'
import type { WorldhopperDisplay } from '@/data/static/timeline'
import { PlayIcon } from '@/components/common/icons'
import FloatingTogglePanel from '@/components/ui/FloatingTogglePanel'

interface Props {
  show: boolean
  worldhoppers: WorldhopperDisplay[]
  onToggle: () => void
  onStartJourney?: (id: string) => void
}

function WorldhopperPickerInner({ show, worldhoppers, onToggle, onStartJourney }: Props) {
  return (
    <FloatingTogglePanel
      show={show}
      onToggle={onToggle}
      buttonContent={
        <span className="flex items-center gap-1.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          {show ? '✕ Close' : 'Worldhoppers'}
        </span>
      }
      title="Worldhoppers"
      buttonFirst={false}
      panelWidth="w-56"
    >
      <div className="space-y-1.5">
        {worldhoppers.map((wh) => (
          <div
            key={wh.id}
            className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-800/50"
          >
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: wh.color }} />
            <span className="flex-1 truncate">{wh.name}</span>
            <button
              onClick={() => onStartJourney?.(wh.id)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-purple-900/30 text-purple-400 transition-colors hover:bg-purple-800/40 hover:text-purple-300"
              aria-label={`Animate ${wh.name}'s journey`}
            >
              <PlayIcon />
            </button>
          </div>
        ))}
      </div>
    </FloatingTogglePanel>
  )
}

const WorldhopperPicker = memo(WorldhopperPickerInner)
export default WorldhopperPicker
