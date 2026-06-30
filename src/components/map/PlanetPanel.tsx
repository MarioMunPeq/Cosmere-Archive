import { type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { getBookById, SAGA_BY_ID, getPlanetById } from '@/data/static'
import { WORLDHOPPERS } from '@/data/static/timeline'
import ColorDot from '@/components/ui/ColorDot'
import CloseButton from '@/components/ui/CloseButton'
import InfoSection from '@/components/ui/InfoSection'
import { PlayIcon } from '@/components/common/icons'
import type { Planet } from '@/types/planet'
import type { Character } from '@/types'

interface Props {
  selected: Planet
  selectedCharacters: Character[]
  onSelectPlanet: (id: string | null) => void
  onSelectCharacter: (id: string) => void
  onStartJourney: (id: string) => void
  panelRef: RefObject<HTMLDivElement | null>
}

export default function PlanetPanel({
  selected,
  selectedCharacters,
  onSelectPlanet,
  onSelectCharacter,
  onStartJourney,
  panelRef,
}: Props) {
  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/60 sm:hidden" onClick={() => onSelectPlanet(null)} />
      <div
        ref={panelRef}
        key={selected.id}
        className="absolute inset-0 z-40 flex flex-col overflow-y-auto bg-gray-900 animate-slide-up sm:inset-auto sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:max-h-[calc(100vh-2rem)] sm:w-72 sm:rounded-xl sm:border sm:border-gray-700/60 sm:bg-gray-900/95 sm:p-5 sm:shadow-2xl sm:backdrop-blur-lg sm:animate-scale-in"
      >
        <CloseButton onClick={() => onSelectPlanet(null)} ariaLabel="Close planet panel" />

        <div className="mb-3 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: selected.color }} />
          <h3 className="text-lg font-bold text-gray-100">{selected.name}</h3>
        </div>

        <p className="text-xs font-medium text-purple-400/80">{selected.shard}</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">{selected.description}</p>

        {selected.investiture && selected.investiture.length > 0 && (
          <InfoSection label="Investiture Systems">
            <div className="space-y-1.5">
              {selected.investiture.map((sys) => (
                <div key={sys.name} className="rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-200">{sys.name}</span>
                    {sys.shard && (
                      <span className="rounded bg-purple-900/30 px-1.5 py-0.5 text-xxs text-purple-400">
                        {sys.shard}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{sys.description}</p>
                </div>
              ))}
            </div>
          </InfoSection>
        )}

        {selected.magicSystem && !selected.investiture?.length && (
          <div className="mt-3 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2">
            <h4 className="mb-1 text-xxs font-semibold uppercase tracking-wider text-gray-500">Magic System</h4>
            <p className="text-xs leading-relaxed text-gray-400">{selected.magicSystem}</p>
          </div>
        )}

        {selected.sagas && selected.sagas.length > 0 && (
          <InfoSection label="Sagas">
            <div className="flex flex-wrap gap-1.5">
              {selected.sagas.map((sId) => {
                const saga = SAGA_BY_ID.get(sId)
                return saga ? (
                  <span key={sId} className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                    {saga.name}
                  </span>
                ) : null
              })}
            </div>
          </InfoSection>
        )}

        {selected.books && selected.books.length > 0 && (
          <InfoSection label="Books">
            <div className="space-y-1">
              {selected.books.map((bId) => {
                const book = getBookById(bId)
                return book ? (
                  <Link
                    key={bId}
                    to={`/books/${bId}`}
                    className="flex items-center gap-2 rounded bg-gray-800/50 px-2 py-1 transition-colors hover:bg-gray-700/60"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: selected.color }} />
                    <span className="text-xs text-gray-400">{book.title}</span>
                  </Link>
                ) : null
              })}
            </div>
          </InfoSection>
        )}

        {selectedCharacters.length > 0 && (
          <InfoSection label={`Characters (${selectedCharacters.length})`}>
            <div className="flex flex-wrap gap-1.5">
              {selectedCharacters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCharacter?.(c.id)}
                  className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </InfoSection>
        )}

        {selected.connectedPlanets && selected.connectedPlanets.length > 0 && (
          <InfoSection label="Connected Planets">
            <div className="flex flex-wrap gap-1.5">
              {selected.connectedPlanets.map((pId) => {
                const p = getPlanetById(pId)
                return p ? (
                  <span
                    key={pId}
                    className="flex items-center gap-1 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
                  >
                    <ColorDot color={p.color} size="xs" />
                    {p.name}
                  </span>
                ) : null
              })}
            </div>
          </InfoSection>
        )}

        {WORLDHOPPERS.filter((wh) => wh.planets.includes(selected.id)).length > 0 && (
          <InfoSection label="Worldhoppers">
            <div className="space-y-1.5">
              {WORLDHOPPERS.filter((wh) => wh.planets.includes(selected.id)).map((wh) => (
                <div
                  key={wh.id}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-800/50"
                >
                  <ColorDot color={wh.color} size="lg" />
                  <span className="flex-1 truncate">{wh.name}</span>
                  <button
                    onClick={() => onStartJourney(wh.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-purple-900/30 text-purple-400 transition-colors hover:bg-purple-800/40 hover:text-purple-300"
                    aria-label={`Animate ${wh.name}'s journey`}
                  >
                    <PlayIcon />
                  </button>
                </div>
              ))}
            </div>
          </InfoSection>
        )}
      </div>
    </>
  )
}
