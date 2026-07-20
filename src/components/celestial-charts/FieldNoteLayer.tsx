import { useState, useEffect } from 'react'
import { PLANET_NOTES, type FieldNoteData, type SketchKind } from '@/data/static/khriss-field-notes'

interface Props {
  planetId: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }
  return a
}

function pickCount(): number {
  const r = Math.random()
  if (r < 0.5) return 1
  if (r < 0.9) return 2
  return 3
}

function SketchSVG({ kind, size }: { kind: SketchKind; size: number }) {
  const s = size
  const c = s / 2
  switch (kind) {
    case 'moon':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={c} cy={c} r={s * 0.4} fill="none" stroke="rgba(60,45,30,0.2)" strokeWidth="0.5" />
          <circle cx={c + s * 0.12} cy={c - s * 0.08} r={s * 0.32} fill="rgba(60,45,30,0.08)" />
        </svg>
      )
    case 'question-mark':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <path
            d={`M${s * 0.3},${s * 0.25} C${s * 0.3},${s * 0.12} ${s * 0.7},${s * 0.12} ${s * 0.7},${s * 0.3} C${s * 0.7},${s * 0.45} ${s * 0.5},${s * 0.45} ${s * 0.5},${s * 0.55} L${s * 0.5},${s * 0.65}`}
            fill="none"
            stroke="rgba(60,45,30,0.15)"
            strokeWidth="0.5"
            strokeLinecap="round"
          />
          <circle cx={c} cy={s * 0.78} r={0.8} fill="rgba(60,45,30,0.12)" />
        </svg>
      )
    case 'bird':
      return (
        <svg width={s} height={s * 0.6} viewBox={`0 0 ${s} ${s * 0.6}`}>
          <path
            d={`M${s * 0.1},${s * 0.5} Q${s * 0.3},${s * 0.1} ${s * 0.5},${s * 0.3} Q${s * 0.7},${s * 0.1} ${s * 0.9},${s * 0.5}`}
            fill="none"
            stroke="rgba(60,45,30,0.12)"
            strokeWidth="0.4"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'geometric':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon
            points={`${c},${s * 0.1} ${s * 0.85},${s * 0.75} ${s * 0.15},${s * 0.75}`}
            fill="none"
            stroke="rgba(60,45,30,0.1)"
            strokeWidth="0.3"
          />
          <circle cx={c} cy={s * 0.55} r={s * 0.15} fill="none" stroke="rgba(60,45,30,0.08)" strokeWidth="0.3" />
          <line x1={c} y1={s * 0.55} x2={c} y2={s * 0.75} stroke="rgba(60,45,30,0.06)" strokeWidth="0.2" />
        </svg>
      )
    case 'sun-path':
      return (
        <svg width={s} height={s * 0.5} viewBox={`0 0 ${s} ${s * 0.5}`}>
          <path
            d={`M${s * 0.05},${s * 0.45} Q${s * 0.25},${s * 0.05} ${s * 0.5},${s * 0.25} T${s * 0.95},${s * 0.45}`}
            fill="none"
            stroke="rgba(60,45,30,0.1)"
            strokeWidth="0.3"
            strokeDasharray="1.5 1.5"
          />
          <circle cx={s * 0.15} cy={s * 0.35} r={s * 0.04} fill="rgba(60,45,30,0.08)" />
          <circle cx={s * 0.5} cy={s * 0.22} r={s * 0.06} fill="rgba(60,45,30,0.12)" />
          <circle cx={s * 0.85} cy={s * 0.35} r={s * 0.04} fill="rgba(60,45,30,0.08)" />
        </svg>
      )
    case 'allomantic':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={c} cy={c} r={s * 0.4} fill="none" stroke="rgba(60,45,30,0.12)" strokeWidth="0.3" />
          <circle cx={c} cy={c} r={s * 0.15} fill="none" stroke="rgba(60,45,30,0.08)" strokeWidth="0.3" />
          <line x1={c} y1={s * 0.1} x2={c} y2={s * 0.9} stroke="rgba(60,45,30,0.06)" strokeWidth="0.2" />
          <line x1={s * 0.1} y1={c} x2={s * 0.9} y2={c} stroke="rgba(60,45,30,0.06)" strokeWidth="0.2" />
        </svg>
      )
    case 'highstorm':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <path
            d={`M${s * 0.1},${s * 0.5} Q${s * 0.3},${s * 0.1} ${s * 0.5},${s * 0.3} T${s * 0.9},${s * 0.3}`}
            fill="none"
            stroke="rgba(60,45,30,0.12)"
            strokeWidth="0.3"
          />
          <path
            d={`M${s * 0.2},${s * 0.7} Q${s * 0.4},${s * 0.3} ${s * 0.6},${s * 0.5} T${s * 0.9},${s * 0.6}`}
            fill="none"
            stroke="rgba(60,45,30,0.08)"
            strokeWidth="0.2"
          />
          <path
            d={`M${s * 0.7},${s * 0.15} L${s * 0.75},${s * 0.05} L${s * 0.8},${s * 0.12}`}
            fill="none"
            stroke="rgba(60,45,30,0.08)"
            strokeWidth="0.2"
          />
        </svg>
      )
  }
}

const INK = 'rgba(61, 40, 24, 0.78)'
const INK_HOVER = 'rgba(36, 22, 12, 0.90)'

function FieldNote({ data, delay }: { data: FieldNoteData; delay: number }) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const isNazh = data.style === 'nazh'

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  if (!visible) return null

  return (
    <div
      className="absolute pointer-events-auto select-none"
      style={{
        left: data.left,
        top: data.top,
        transform: `rotate(${data.rotation ?? '0deg'})`,
        maxWidth: data.maxWidth ?? '140px',
        zIndex: hovered ? 10 : 6,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          filter: hovered ? 'brightness(0.85)' : 'brightness(1)',
          transition: 'filter 0.4s ease',
          opacity: 0,
          animation: 'note-fade-in 0.6s ease-out forwards',
        }}
      >
        {data.sketch && (
          <div className="mb-1" style={{ opacity: 0.35, transition: 'opacity 0.4s ease' }}>
            <SketchSVG kind={data.sketch} size={data.sketchSize ?? 22} />
          </div>
        )}

        {data.text.map((line, i) => (
          <p
            key={i}
            className="font-serif leading-[1.5]"
            style={{
              color: isNazh ? 'rgba(60, 40, 28, 0.70)' : INK,
              fontSize: 'clamp(10px, 1.05vw, 13px)',
              letterSpacing: '0.005em',
              textAlign: 'left',
              fontWeight: 400,
              fontStyle: isNazh ? 'normal' : 'italic',
              textDecoration: data.crossedOut && i === 0 ? 'line-through' : 'none',
              textDecorationColor: 'rgba(60,40,25,0.30)',
              textDecorationThickness: '1px',
              transition: 'color 0.4s ease',
            }}
          >
            {line}
          </p>
        ))}

        {data.correction && (
          <p
            className="font-serif italic leading-[1.5]"
            style={{
              color: hovered ? INK_HOVER : INK,
              fontSize: 'clamp(10px, 1.05vw, 13px)',
              marginTop: '3px',
              transition: 'color 0.4s ease',
            }}
          >
            {data.correction}
          </p>
        )}
      </div>
    </div>
  )
}

export default function FieldNoteLayer({ planetId }: Props) {
  const [notes] = useState<readonly FieldNoteData[]>(() => {
    const pool = PLANET_NOTES[planetId]
    if (!pool || pool.length === 0) return []
    return shuffle(pool).slice(0, pickCount())
  })

  if (notes.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {notes.map((note, i) => (
        <FieldNote key={note.id} data={note} delay={1800 + i * 2800} />
      ))}
    </div>
  )
}
