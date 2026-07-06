import { type RefObject, useContext, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getBookById, SAGA_BY_ID, getPlanetById } from '@/data/static'
import { WORLDHOPPERS, TIMELINE_EVENTS } from '@/data/static/timeline'
import { ShardThemeContext } from '@/contexts/ShardThemeContext'
import type { Planet } from '@/types/planet'
import type { Character } from '@/types'
import PlanetHero from './PlanetHero'

interface Props {
  selected: Planet
  selectedCharacters: Character[]
  onClose: () => void
  onSelectCharacter: (id: string) => void
  onStartJourney: (id: string) => void
  panelRef: RefObject<HTMLDivElement | null>
  isClosing?: boolean
}

function BookThumb({ bookId }: { bookId: string }) {
  const book = getBookById(bookId)
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const onLoad = useCallback(() => setImgStatus('loaded'), [])
  const onError = useCallback(() => setImgStatus('error'), [])

  if (!book) return null

  const imgSrc = `${import.meta.env.BASE_URL}images/covers/${book.id}.webp`

  return (
    <Link
      to={`/books/${bookId}`}
      className="group flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-white/[0.08]"
    >
      <div className="relative h-[54px] w-9 shrink-0 overflow-hidden rounded bg-gray-800">
        {(imgStatus === 'loading' || imgStatus === 'loaded') && (
          <img
            src={imgSrc}
            alt=""
            width={36}
            height={54}
            loading="lazy"
            onLoad={onLoad}
            onError={onError}
            className={`h-full w-full object-cover transition-opacity duration-300 ${imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        {imgStatus === 'error' && (
          <div className="flex h-full w-full items-center justify-center bg-gray-800 text-xxs text-gray-600">
            {book.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-gray-400 transition-colors group-hover:text-gray-200">{book.title}</p>
        {book.year && <p className="text-xxs text-gray-600">{book.year}</p>}
      </div>
    </Link>
  )
}

export default function PlanetPanel({
  selected,
  selectedCharacters,
  onClose,
  onSelectCharacter,
  onStartJourney,
  panelRef,
  isClosing = false,
}: Props) {
  const { isActive } = useContext(ShardThemeContext)

  const eventDots = useMemo(() => {
    return TIMELINE_EVENTS.filter((e) => e.planets.includes(selected.id)).slice(0, 8)
  }, [selected.id])

  const worldhoppers = useMemo(() => {
    return WORLDHOPPERS.filter((wh) => wh.planets.includes(selected.id))
  }, [selected.id])

  const topChars = useMemo(() => selectedCharacters.slice(0, 8), [selectedCharacters])
  const extraCount = selectedCharacters.length - 8

  const accentColor = isActive ? 'var(--theme-accent, #6b7280)' : '#6b7280'

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        ref={panelRef}
        key={selected.id}
        className="fixed right-6 top-6 bottom-6 z-40 w-96 overflow-y-auto overscroll-contain rounded-2xl border border-white/[0.06] bg-gray-950/60 p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        style={{
          animation: isClosing ? 'panel-slide-out 0.3s ease-out both' : 'panel-slide-in 0.3s ease-out both',
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-6 w-6 items-center justify-center text-gray-600 transition-all hover:text-gray-300"
          aria-label="Close planet panel"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <line x1="2" y1="2" x2="12" y2="12" />
            <line x1="12" y1="2" x2="2" y2="12" />
          </svg>
        </button>

        <div className="mb-6 flex justify-center">
          <PlanetHero planet={selected} />
        </div>

        <h2 className="text-center text-lg font-semibold tracking-wide text-white">{selected.name}</h2>
        {selected.shard && (
          <p className="mt-1 text-center text-xs font-light tracking-wider text-gray-500">{selected.shard}</p>
        )}
        {selected.description && (
          <p className="mt-3 text-center text-xs leading-relaxed italic text-gray-500">{selected.description}</p>
        )}

        {selected.sagas && selected.sagas.length > 0 && (
          <section className="mt-8">
            <div className="flex flex-wrap justify-center gap-2">
              {selected.sagas.map((sId) => {
                const saga = SAGA_BY_ID.get(sId)
                return saga ? (
                  <span
                    key={sId}
                    className="rounded-full border border-white/[0.06] px-3 py-1 text-xxs font-medium tracking-wider text-gray-400 transition-all hover:-translate-y-0.5 hover:border-white/[0.12]"
                  >
                    {saga.name}
                  </span>
                ) : null
              })}
            </div>
          </section>
        )}

        {selected.investiture && selected.investiture.length > 0 && (
          <section className="mt-8">
            <h3
              className="mb-3 text-xxs font-semibold uppercase tracking-[0.15em]"
              style={{ color: accentColor, transition: 'color 0.5s ease' }}
            >
              Investiture
            </h3>
            <div className="space-y-2">
              {selected.investiture.map((sys) => (
                <div
                  key={sys.name}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-white/[0.08]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-xxs text-gray-500">
                    {sys.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-200">{sys.name}</span>
                      {sys.shard && <span className="text-xxs text-gray-600">{sys.shard}</span>}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{sys.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedCharacters.length > 0 && (
          <section className="mt-8">
            <h3
              className="mb-3 text-xxs font-semibold uppercase tracking-[0.15em]"
              style={{ color: accentColor, transition: 'color 0.5s ease' }}
            >
              Characters
            </h3>
            <div className="flex flex-wrap gap-2">
              {topChars.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCharacter?.(c.id)}
                  className="group flex items-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 transition-all hover:-translate-y-0.5 hover:border-white/[0.08]"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-xxs text-gray-400 transition-colors group-hover:text-gray-200">
                    {c.name.charAt(0)}
                  </span>
                  <span className="text-xs text-gray-500 transition-colors group-hover:text-gray-200">{c.name}</span>
                </button>
              ))}
              {extraCount > 0 && (
                <span className="flex items-center rounded-full border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 text-xxs text-gray-600">
                  +{extraCount}
                </span>
              )}
            </div>
          </section>
        )}

        {selected.books && selected.books.length > 0 && (
          <section className="mt-8">
            <h3
              className="mb-3 text-xxs font-semibold uppercase tracking-[0.15em]"
              style={{ color: accentColor, transition: 'color 0.5s ease' }}
            >
              Books
            </h3>
            <div className="space-y-2">
              {selected.books.map((bId) => (
                <BookThumb key={bId} bookId={bId} />
              ))}
            </div>
          </section>
        )}

        {selected.connectedPlanets && selected.connectedPlanets.length > 0 && (
          <section className="mt-8">
            <h3
              className="mb-3 text-xxs font-semibold uppercase tracking-[0.15em]"
              style={{ color: accentColor, transition: 'color 0.5s ease' }}
            >
              Connected
            </h3>
            <div className="flex flex-wrap gap-2">
              {selected.connectedPlanets.map((pId) => {
                const p = getPlanetById(pId)
                return p ? (
                  <span
                    key={pId}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 text-xs text-gray-500 transition-all hover:-translate-y-0.5 hover:border-white/[0.08]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </span>
                ) : null
              })}
            </div>
          </section>
        )}

        {eventDots.length > 0 && (
          <section className="mt-8">
            <h3
              className="mb-3 text-xxs font-semibold uppercase tracking-[0.15em]"
              style={{ color: accentColor, transition: 'color 0.5s ease' }}
            >
              Timeline
            </h3>
            <div className="relative pt-1">
              <div className="absolute top-[5px] left-0 right-0 h-px bg-white/[0.04]" />
              <div className="flex items-start justify-between">
                {eventDots.map((e) => (
                  <div key={e.id} className="group relative flex flex-col items-center">
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xxs text-gray-300 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {e.title}
                    </div>
                    <div className="relative z-10 h-2.5 w-2.5 rounded-full bg-white/[0.12] transition-all group-hover:h-3 group-hover:w-3 group-hover:bg-white/[0.25]" />
                    <p className="mt-2 whitespace-nowrap text-xxs text-gray-600">{e.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {worldhoppers.length > 0 && (
          <section className="mt-8">
            <h3
              className="mb-3 text-xxs font-semibold uppercase tracking-[0.15em]"
              style={{ color: accentColor, transition: 'color 0.5s ease' }}
            >
              Worldhoppers
            </h3>
            <div className="space-y-2">
              {worldhoppers.map((wh) => (
                <div
                  key={wh.id}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-white/[0.08]"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: wh.color }} />
                  <span className="flex-1 text-xs text-gray-400">{wh.name}</span>
                  <button
                    onClick={() => onStartJourney(wh.id)}
                    className="flex h-6 w-6 items-center justify-center rounded text-gray-700 transition-all hover:bg-white/[0.06] hover:text-gray-400"
                    aria-label={`Animate ${wh.name}'s journey`}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                      <polygon points="0,0 10,5 0,10" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

        <p className="mt-5 text-center text-xxs text-gray-700 italic">— Silverlight Archives —</p>
      </div>
    </>
  )
}
