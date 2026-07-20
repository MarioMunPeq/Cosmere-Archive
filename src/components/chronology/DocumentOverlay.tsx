import { useNavigate } from 'react-router-dom'
import { formatJourneyYear } from '@/utils/journey'
import { TYPE_LABELS, PLANET_BY_ID, SAGAS } from '@/data/static'
import type { TimelineEvent } from '@/data/static/timeline'

const SAGA_LABELS: Record<string, string> = {}
for (const saga of SAGAS) SAGA_LABELS[saga.id] = saga.name

interface Props {
  event: TimelineEvent
  x: number
  y: number
  onClose: () => void
  toViewport: (svgX: number, svgY: number) => { left: number; top: number }
}

export default function DocumentOverlay({ event, x, y, onClose, toViewport }: Props) {
  const navigate = useNavigate()
  const vp = toViewport(x, y)
  const docW = 400
  let docLeft = vp.left - docW / 2
  const docTop = Math.max(16, vp.top - 60)
  if (docLeft + docW > window.innerWidth - 8) docLeft = window.innerWidth - docW - 8
  if (docLeft < 8) docLeft = 8

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
      className="fixed z-50"
      style={{ left: docLeft, top: docTop, width: docW }}
    >
      {/* Document */}
      <div className="border border-gray-800 bg-gray-950/98 shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="font-serif text-[11px] uppercase tracking-[0.15em] text-gray-500">
              {TYPE_LABELS[event.type]}
            </span>
            <span className="font-mono text-[11px] text-gray-600">{formatJourneyYear(event.year)}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="flex h-5 w-5 items-center justify-center text-xs text-gray-600 hover:text-gray-400 transition-colors"
            aria-label="Close document"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <h3 className="font-serif text-lg leading-snug text-gray-200">{event.title}</h3>

          {/* Archivist note */}
          {event.archivistNote && (
            <div className="mt-4 border-l border-gray-800 pl-3.5">
              <span className="font-serif text-[11px] italic tracking-wide text-gray-600">Archivist\u2019s note</span>
              <p className="mt-1.5 font-serif text-[13px] italic leading-relaxed text-gray-500">
                {event.archivistNote}
              </p>
            </div>
          )}

          {/* Description */}
          <p className="mt-4 text-[13px] leading-relaxed text-gray-500">{event.description}</p>

          {/* Metadata */}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-gray-800/60 pt-4 text-[12px] text-gray-600">
            {event.saga && (
              <span>
                Saga: <span className="text-gray-400">{SAGA_LABELS[event.saga] || event.saga}</span>
              </span>
            )}
            {event.planets.length > 0 && (
              <span>
                Planets:{' '}
                {event.planets.map((pid, i) => (
                  <span key={pid}>
                    {i > 0 && <span className="text-gray-700">, </span>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/celestial-charts?focus=planet&id=${pid}`)
                      }}
                      className="text-gray-400 transition-colors hover:text-cyan-400"
                    >
                      {PLANET_BY_ID.get(pid)?.name ?? pid}
                    </button>
                  </span>
                ))}
              </span>
            )}
            {event.characters && event.characters.length > 0 && (
              <span>
                Persons: <span className="text-gray-400">{event.characters.join(', ')}</span>
              </span>
            )}
            {event.worldhoppers && event.worldhoppers.length > 0 && (
              <span>
                Worldhoppers: <span className="text-gray-400">{event.worldhoppers.join(', ')}</span>
              </span>
            )}
          </div>

          {/* Importance */}
          <div className="mt-3 flex items-center gap-1.5 text-[10px]">
            <span className="text-gray-600">Significance:</span>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < event.importance ? 'text-gray-500' : 'text-gray-800'}>
                \u25C9
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
