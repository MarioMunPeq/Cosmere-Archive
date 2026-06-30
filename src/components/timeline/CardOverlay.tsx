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
  eventTypeBadgeClass: (t: string) => string
  onClose: () => void
  toViewport: (svgX: number, svgY: number) => { left: number; top: number }
}

export default function CardOverlay({ event, x, y, eventTypeBadgeClass, onClose, toViewport }: Props) {
  const navigate = useNavigate()
  const vp = toViewport(x, y)
  const cardW = 280
  let cardLeft = vp.left - cardW / 2
  const cardTop = vp.top + 14
  if (cardLeft + cardW > window.innerWidth - 8) cardLeft = window.innerWidth - cardW - 8
  if (cardLeft < 8) cardLeft = 8

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
      className="fixed z-50 w-[280px] rounded-lg border border-gray-700 bg-gray-900/95 shadow-xl backdrop-blur-sm"
      style={{ left: cardLeft, top: cardTop }}
    >
      <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className={eventTypeBadgeClass(event.type)}>{TYPE_LABELS[event.type]}</span>
          <span className="text-[11px] text-gray-500">{formatJourneyYear(event.year)}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="flex h-5 w-5 items-center justify-center rounded text-xs text-gray-600 hover:bg-gray-800 hover:text-gray-300"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      <div className="px-3 py-2">
        <h3 className="text-sm font-bold text-purple-300">{event.title}</h3>
        <p className="mt-1 text-[12px] leading-relaxed text-gray-300">{event.description}</p>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xxs text-gray-500">
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
                  {i > 0 && <span className="text-gray-600">, </span>}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/?focus=planet&id=${pid}`)
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
              Characters: <span className="text-gray-400">{event.characters.join(', ')}</span>
            </span>
          )}
          {event.worldhoppers && event.worldhoppers.length > 0 && (
            <span>
              Worldhoppers: <span className="text-gray-400">{event.worldhoppers.join(', ')}</span>
            </span>
          )}
          {event.importance && (
            <span>
              Importance:{' '}
              <span className="text-gray-400">
                {'★'.repeat(event.importance)}
                {'☆'.repeat(5 - event.importance)}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
