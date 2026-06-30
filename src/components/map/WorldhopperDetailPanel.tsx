import type { RefObject } from 'react'
import type { WorldhopperDisplay } from '@/data/static/timeline'
import type { Planet } from '@/types/planet'
import CloseButton from '@/components/ui/CloseButton'
import InfoSection from '@/components/ui/InfoSection'
import { PlayIcon } from '@/components/common/icons'

interface Props {
  wh: WorldhopperDisplay
  activeWorldhoppers: string[]
  planetMap: Map<string, Planet>
  onToggleWorldhopper: (id: string) => void
  onSelectPlanet: (id: string | null) => void
  onStartJourney?: (id: string) => void
  panelRef: RefObject<HTMLDivElement | null>
}

export default function WorldhopperDetailPanel({
  wh,
  activeWorldhoppers,
  planetMap,
  onToggleWorldhopper,
  onSelectPlanet,
  onStartJourney,
  panelRef,
}: Props) {
  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/60 sm:hidden" onClick={() => onToggleWorldhopper(wh.id)} />
      <div
        ref={panelRef}
        key={wh.id}
        className="absolute inset-0 z-40 flex flex-col overflow-y-auto bg-gray-900 animate-slide-up sm:inset-auto sm:left-auto sm:right-4 sm:top-4 sm:w-72 sm:rounded-xl sm:border sm:border-gray-700/60 sm:bg-gray-900/95 sm:p-5 sm:shadow-2xl sm:backdrop-blur-lg sm:animate-scale-in"
      >
        <CloseButton onClick={() => onToggleWorldhopper(wh.id)} ariaLabel="Close worldhopper panel" />

        <div className="mb-3 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: wh.color }} />
          <h3 className="text-lg font-bold text-gray-100">{wh.name}</h3>
        </div>

        <p className="text-sm leading-relaxed text-gray-400">{wh.description}</p>

        {activeWorldhoppers.length > 1 && (
          <p className="mt-2 text-xs text-gray-500">+{activeWorldhoppers.length - 1} more worldhopper(s) selected</p>
        )}

        <InfoSection label="Visited planets">
          <div className="flex flex-wrap gap-1.5">
            {wh.planets.map((pid) => {
              const p = planetMap.get(pid)
              return p ? (
                <button
                  key={pid}
                  onClick={() => {
                    onSelectPlanet(pid)
                    onToggleWorldhopper(wh.id)
                  }}
                  className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300 hover:bg-gray-700"
                >
                  {p.name}
                </button>
              ) : null
            })}
          </div>
        </InfoSection>

        <InfoSection label="Sagas">
          <div className="flex flex-wrap gap-1.5">
            {wh.sagas.map((s) => (
              <span key={s} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                {s}
              </span>
            ))}
          </div>
        </InfoSection>

        <button
          onClick={() => onStartJourney?.(wh.id)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-purple-600/40 bg-purple-900/20 px-3 py-2 text-xs font-medium text-purple-400 transition-colors hover:bg-purple-900/40 hover:border-purple-500/60"
        >
          <PlayIcon size={12} />
          Animate Journey
        </button>
      </div>
    </>
  )
}
