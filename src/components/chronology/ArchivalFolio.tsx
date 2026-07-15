import { formatJourneyYear } from '@/utils/journey'
import { TYPE_LABELS } from '@/data/static'
import type { TimelineEvent } from '@/data/static/timeline'

interface Props {
  event: TimelineEvent
  x: number
  y: number
  line: 'main' | 'fork'
  toViewport: (svgX: number, svgY: number) => { left: number; top: number }
}

export default function ArchivalFolio({ event, x, y, line, toViewport }: Props) {
  const vp = toViewport(x + 14, line === 'main' ? y - 72 : y - 56)
  let left = vp.left
  const top = vp.top
  const maxW = Math.min(340, window.innerWidth - 16)
  if (left + maxW > window.innerWidth - 8) left = window.innerWidth - maxW - 8
  if (left < 8) left = 8

  return (
    <div className="pointer-events-none fixed z-50" style={{ left, top, maxWidth: maxW }}>
      <div className="border border-gray-800 bg-gray-950/98 px-5 py-4 shadow-2xl shadow-black/60">
        {/* Type and year line */}
        <div className="flex items-center gap-3 border-b border-gray-800 pb-2.5">
          <span className="font-serif text-[11px] uppercase tracking-[0.15em] text-gray-500">
            {TYPE_LABELS[event.type]}
          </span>
          <span className="font-mono text-[11px] text-gray-600">{formatJourneyYear(event.year)}</span>
        </div>

        {/* Title */}
        <h3 className="mt-3 font-serif text-base leading-snug text-gray-200">{event.title}</h3>

        {/* Description */}
        <p className="mt-2 text-[13px] leading-relaxed text-gray-500 line-clamp-3">{event.description}</p>

        {/* Importance */}
        <div className="mt-2.5 flex items-center gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`text-[9px] ${i < event.importance ? 'text-gray-500' : 'text-gray-800'}`}>
              \u25C9
            </span>
          ))}
        </div>

        {/* Open indicator */}
        {event.importance >= 4 && (
          <p className="mt-2 font-serif text-[11px] italic text-gray-600">Click to examine this record</p>
        )}
      </div>
    </div>
  )
}
