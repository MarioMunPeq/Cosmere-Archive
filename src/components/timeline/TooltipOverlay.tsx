import { formatJourneyYear } from '@/utils/journey'
import { TYPE_LABELS } from '@/data/static'
import type { TimelineEvent } from '@/data/static/timeline'

interface Props {
  event: TimelineEvent
  x: number
  y: number
  line: 'main' | 'fork'
  eventTypeBadgeClass: (t: string) => string
  toViewport: (svgX: number, svgY: number) => { left: number; top: number }
}

export default function TooltipOverlay({ event, x, y, line, eventTypeBadgeClass, toViewport }: Props) {
  const vp = toViewport(x + 10, line === 'main' ? y - 52 : y - 48)
  let left = vp.left
  const top = vp.top
  const maxW = Math.min(240, window.innerWidth - 16)
  if (left + maxW > window.innerWidth - 8) left = window.innerWidth - maxW - 8
  if (left < 8) left = 8

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md border border-gray-700 bg-gray-900/95 px-3 py-2 shadow-lg backdrop-blur-sm"
      style={{ left, top, maxWidth: maxW }}
    >
      <div className="flex items-center gap-1.5">
        <span className={eventTypeBadgeClass(event.type)}>{TYPE_LABELS[event.type]}</span>
        <span className="text-xxs text-gray-500">{formatJourneyYear(event.year)}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-purple-300">{event.title}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-gray-400 line-clamp-2">{event.description}</p>
      {event.importance >= 4 && <p className="mt-0.5 text-xxs text-purple-600/80">Click to expand</p>}
    </div>
  )
}
