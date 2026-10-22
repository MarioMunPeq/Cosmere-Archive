import { useCallback, useState } from 'react'
import { DiagramCanvas } from './DiagramCanvas'
import { WallSurface } from './WallSurface'
import { Sheet } from './Sheet'
import { SheetBody } from './SheetBodies'
import { Chalk, Clipping } from './WallMarks'
import { noteFor } from '@/data/static/diagram-notes'
import {
  WALL_ANNOTATIONS,
  WALL_CLIPPINGS,
  WALL_DOCS,
  WALL_H,
  WALL_THREADS,
  WALL_W,
  docFor,
  sheetSize,
  threadPath,
} from './wall-docs'

/** How far a sheet may be crooked: 5.6.2's ±6, and no further. */
const MAX_ROTATION = 6

function clampRotation(deg: number): number {
  return Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, deg))
}

export function DiagramScene({
  onSelect,
  activeDoc = null,
  onHover,
}: {
  onSelect?: (id: string, element: HTMLElement) => void
  /** The sheet whose document is open; it stays raised while the panel is up. */
  activeDoc?: string | null
  onHover?: (id: string | null) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  const handleHover = useCallback(
    (id: string | null) => {
      setHovered(id)
      onHover?.(id)
    },
    [onHover],
  )

  return (
    <DiagramCanvas onActivate={(id, element) => onSelect?.(id, element)}>
      <WallSurface />

      {/* String: dark ink under the sheets, with a warm catchlight so it reads. */}
      <svg width={WALL_W} height={WALL_H} className="pointer-events-none absolute left-0 top-0" aria-hidden>
        {WALL_THREADS.map((thread, i) => {
          const from = docFor(thread.from)
          const to = docFor(thread.to)
          if (!from || !to) return null
          const d = threadPath(from, to, thread.sag)
          return (
            <g key={`${thread.from}-${thread.to}-${i}`}>
              <path d={d} fill="none" strokeWidth={3} strokeLinecap="round" style={{ stroke: 'var(--codex-thread)' }} />
              <path
                d={d}
                fill="none"
                strokeWidth={1}
                strokeLinecap="round"
                transform="translate(0.7, -0.7)"
                style={{ stroke: 'rgb(196 150 104 / 0.22)' }}
              />
            </g>
          )
        })}
      </svg>

      {WALL_CLIPPINGS.map((clip) => (
        <Clipping key={clip.id} clip={clip} />
      ))}

      {WALL_ANNOTATIONS.map((note) => (
        <Chalk key={note.id} note={note} />
      ))}

      {WALL_DOCS.map((doc) => {
        const size = sheetSize(doc.id)
        const note = noteFor(doc.id)
        const isHovered = hovered === doc.id || activeDoc === doc.id
        return (
          <div
            key={doc.id}
            style={{
              position: 'absolute',
              left: doc.x,
              top: doc.y,
              width: size.w,
              height: size.h,
              zIndex: isHovered ? 30 : doc.z,
            }}
            onMouseEnter={() => handleHover(doc.id)}
            onMouseLeave={() => handleHover(null)}
            onFocus={() => handleHover(doc.id)}
            onBlur={() => handleHover(null)}
          >
            <Sheet
              id={doc.id}
              w={size.w}
              h={size.h}
              large={size.w > 300}
              rotation={clampRotation(doc.rot)}
              label={`Sheet ${note.numeral}: ${note.title}`}
              raised={isHovered}
            >
              <SheetBody id={doc.id} large={size.w > 300} />
            </Sheet>
          </div>
        )
      })}
    </DiagramCanvas>
  )
}
