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
  const vp = toViewport(x + 12, line === 'main' ? y - 68 : y - 54)
  let left = vp.left
  const top = vp.top
  const maxW = Math.min(320, window.innerWidth - 16)
  if (left + maxW > window.innerWidth - 8) left = window.innerWidth - maxW - 8
  if (left < 8) left = 8

  return (
    <div className="pointer-events-none fixed z-50" style={{ left, top, maxWidth: maxW }}>
      <div
        className="relative overflow-hidden px-5 py-4 shadow-[0_18px_40px_-18px_rgba(30,20,12,0.7)]"
        style={{
          background: 'linear-gradient(152deg, #f6f0e3 0%, #eee4cc 100%)',
          border: '1px solid rgba(110,80,50,0.4)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(120,90,60,0.4) 0%, transparent 70%)' }} />
        <div className="relative">
          {/* Type and year line */}
          <div className="flex items-center gap-3 border-b pb-2.5" style={{ borderColor: 'rgba(90,70,45,0.18)' }}>
            <span className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.24em]" style={{ color: '#5a3d28' }}>
              {TYPE_LABELS[event.type]}
            </span>
            <span className="font-[var(--font-display)] text-[10px]" style={{ color: '#6b4a2a' }}>{formatJourneyYear(event.year)}</span>
          </div>

          {/* Title */}
          <h3 className="mt-3 font-[var(--font-display)] text-[15px] leading-snug" style={{ color: '#2a1f14' }}>{event.title}</h3>

          {/* Description */}
          <p className="mt-2 text-[12.5px] leading-relaxed line-clamp-3" style={{ color: '#3a2a1a' }}>{event.description}</p>

          {/* Open indicator */}
          {event.importance >= 4 && (
            <p className="mt-3 font-[var(--font-display)] text-[10px] italic tracking-[0.12em] uppercase" style={{ color: '#6b4a2a' }}>Examine record</p>
          )}
        </div>
      </div>
    </div>
  )
}
