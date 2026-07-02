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
  const vp = toViewport(x + 14, line === 'main' ? y - 72 : y - 56)
  let left = vp.left
  const top = vp.top
  const maxW = Math.min(320, window.innerWidth - 16)
  if (left + maxW > window.innerWidth - 8) left = window.innerWidth - maxW - 8
  if (left < 8) left = 8

  return (
    <div
      className="pointer-events-none fixed z-50 animate-fade-in-up rounded-lg border border-cyan-500/20 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 px-4 py-3 shadow-2xl shadow-cyan-900/20 backdrop-blur-xl"
      style={{ left, top, maxWidth: maxW }}
    >
      <div className="flex items-center gap-2">
        <span className={eventTypeBadgeClass(event.type)}>{TYPE_LABELS[event.type]}</span>
        <span className="text-xs text-gray-500">{formatJourneyYear(event.year)}</span>
      </div>
      <p className="mt-1 text-base font-semibold text-cyan-200">{event.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-400 line-clamp-3">{event.description}</p>
      {event.importance >= 4 && (
        <p className="mt-1.5 text-[11px] text-cyan-600/80 font-medium tracking-wide">Click to expand</p>
      )}
    </div>
  )
}
