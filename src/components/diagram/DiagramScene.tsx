import { useCallback, useState } from 'react'
import { DiagramCanvas } from './DiagramCanvas'
import { WallSurface } from './WallSurface'
import { Sheet } from './Sheet'
import { SheetBody } from './SheetBodies'
import { noteFor } from '@/data/static/diagram-notes'
import { WALL_NOTES, WallNote } from './WallNote'
import { WALL_DOCS, WALL_W, WALL_H, sheetSize, LARGE_SHEETS } from './wall-docs'

/** How far a sheet may be crooked: 5.6.2's ±6, down from ±18-±22. */
const MAX_ROTATION = 6

function clampRotation(deg: number): number {
  return Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, deg))
}

export function DiagramScene({
  /** Which sheet is being read, if any. */
  activeDoc = null,
  /** The wall chooses, the page listens. D-1/D-5. */
  onSelect,
  /** Hover previews a title without changing the selection. */
  onHover,
}: {
  activeDoc?: string | null
  onSelect?: (id: string) => void
  onHover?: (id: string | null) => void
}) {
  const [focusedDoc, setFocusedDoc] = useState<string | null>(null)

  /** Clicking a sheet brings it forward; clicking it again puts it back. */
  const handleDocClick = useCallback(
    (id: string) => {
      setFocusedDoc((prev) => (prev === id ? null : id))
      onSelect?.(id)
    },
    [onSelect],
  )

  const handleBackgroundClick = useCallback(() => {
    setFocusedDoc(null)
  }, [])

  const current = activeDoc ?? focusedDoc

  return (
    <DiagramCanvas>
      <WallSurface />

      {/* Pins and string: the sheet is held to the wall by both. */}
      <svg
        width={WALL_W}
        height={WALL_H}
        className="pointer-events-none absolute inset-0"
        style={{ left: 0, top: 0 }}
        aria-hidden
      >
        {WALL_DOCS.flatMap((d, i) => {
          const a = sheetSize(d.id)
          const b = sheetSize(WALL_DOCS[(i + 3) % WALL_DOCS.length]!.id)
          const e = WALL_DOCS[(i + 3) % WALL_DOCS.length]!
          const x1 = d.x + a.w / 2
          const y1 = d.y + 18
          const x2 = e.x + b.w / 2
          const y2 = e.y + 18
          const sag = 40 + ((i * 37) % 70)
          return [
            <path
              key={`s${i}`}
              d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}`}
              fill="none"
              stroke="rgba(24,14,8,0.55)"
              strokeWidth={3}
              strokeLinecap="round"
            />,
            <path
              key={`h${i}`}
              d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}`}
              fill="none"
              stroke="rgba(196,150,104,0.30)"
              strokeWidth={1.2}
              strokeLinecap="round"
            />,
          ]
        })}
      </svg>

      <div onClick={handleBackgroundClick}>
        {WALL_NOTES.map((n) => (
          <WallNote key={n.id} {...n} />
        ))}
        {WALL_DOCS.map((d) => {
          const size = sheetSize(d.id)
          const note = noteFor(d.id)
          const isCurrent = current === d.id
          return (
            <div
              key={d.id}
              style={{
                position: 'absolute',
                left: d.x,
                top: d.y,
                width: size.w,
                height: size.h,
                zIndex: isCurrent ? 20 : d.z,
                transition: 'all var(--dur-base) ease',
                transform: isCurrent ? 'translateY(-10px)' : undefined,
              }}
            >
              <Sheet
                id={d.id}
                w={size.w}
                h={size.h}
                large={LARGE_SHEETS.has(d.id)}
                rotation={clampRotation(d.rot)}
                label={`Sheet ${note.numeral}: ${note.title}`}
                raised={isCurrent}
                dimmed={current !== null && !isCurrent}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDocClick(d.id)
                }}
                onMouseEnter={() => onHover?.(d.id)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(d.id)}
                onBlur={() => onHover?.(null)}
              >
                <SheetBody id={d.id} />
              </Sheet>
            </div>
          )
        })}
      </div>
    </DiagramCanvas>
  )
}
