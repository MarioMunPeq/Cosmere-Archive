'use client'
import { memo, useMemo } from 'react'
import { HONORBLADES } from '@/data/static/aharietiam'
import { BLADE_FORMS, bladeOutline, guardOutline, outlineToPath, type BladeForm } from './blade-forms'

interface Props {
  /** Shown in small type beneath the sketch. */
  reason?: string
}

const VIEW_WIDTH = 720
const VIEW_HEIGHT = 410
const CENTRE_X = 360
const CENTRE_Y = 252
const RADIUS_X = 252
const RADIUS_Y = 94
const METRES_TO_PIXELS = 32

interface SketchPoint {
  bladeId: string
  colour: string
  form: BladeForm
  x: number
  y: number
  scale: number
  tilt: number
}

function buildSketch(): SketchPoint[] {
  const sorted = [...HONORBLADES].sort((a, b) => a.positionIndex - b.positionIndex)
  const points = sorted.flatMap((blade, index) => {
    const form = BLADE_FORMS[blade.id]
    if (!form) return []
    const angle = (index / sorted.length) * Math.PI * 2 - Math.PI / 2
    return [
      {
        bladeId: blade.id,
        colour: blade.color,
        form,
        x: CENTRE_X + Math.cos(angle) * RADIUS_X,
        y: CENTRE_Y + Math.sin(angle) * RADIUS_Y,
        scale: METRES_TO_PIXELS,
        tilt: form.faceTurn * 0.22,
      },
    ]
  })
  /* Back of the ring first, so the front blades overlap them. */
  return points.sort((a, b) => a.y - b.y)
}

/** The static fallback when WebGL is unavailable: an archivist's field sketch. */
export default memo(function SceneFallback({ reason }: Props) {
  const sketch = useMemo(buildSketch, [])
  const sortedNames = useMemo(() => [...HONORBLADES].sort((a, b) => a.positionIndex - b.positionIndex), [])

  return (
    <section
      data-aharietiam-scene="fallback"
      data-scene-fallback="true"
      className="relative flex min-h-full w-full flex-col overflow-y-auto bg-[var(--surface-void)] px-4 py-8 sm:px-8 sm:py-12"
    >
      <div
        className="mx-auto w-full max-w-6xl border p-6 sm:p-10"
        style={{
          background: 'var(--surface-page)',
          borderColor: 'var(--surface-page-edge)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
        }}
      >
        <p className="text-micro uppercase" style={{ color: 'var(--text-on-page-tertiary)', letterSpacing: '0.18em' }}>
          Field sketch &middot; the Rosharan rockbed
        </p>
        <h1
          className="mt-3 text-h1 leading-tight"
          style={{ color: 'var(--text-on-page-primary)', fontFamily: 'var(--font-display)', fontWeight: 400 }}
        >
          Aharietiam — The Ten Blades
        </h1>
        <p className="mt-3 max-w-2xl text-body" style={{ color: 'var(--text-on-page-secondary)', lineHeight: 1.65 }}>
          The living field could not be drawn in this browser. The blades were planted all the same, and the archive
          keeps their names.
        </p>
        {reason ? (
          <p className="mt-2 max-w-2xl text-meta italic" style={{ color: 'var(--text-on-page-tertiary)' }}>
            {reason}
          </p>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-12">
          <figure>
            <svg
              role="img"
              aria-label="Ink sketch of ten Honorblades standing in a circle on a cracked stone field"
              viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
              className="h-auto w-full"
            >
              <defs>
                <linearGradient id="aharietiam-steel" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#8f8a7e" />
                  <stop offset="0.45" stopColor="#c3bcac" />
                  <stop offset="0.55" stopColor="#a9a294" />
                  <stop offset="1" stopColor="#6e695f" />
                </linearGradient>
              </defs>

              <ellipse
                cx={CENTRE_X}
                cy={CENTRE_Y}
                rx={RADIUS_X + 26}
                ry={RADIUS_Y + 14}
                fill="none"
                stroke="#8a7a60"
                strokeOpacity="0.34"
                strokeDasharray="7 10 3 12"
                strokeWidth="1.2"
              />
              <path
                d={`M ${CENTRE_X - 300} ${CENTRE_Y + 104} C ${CENTRE_X - 130} ${CENTRE_Y + 86}, ${CENTRE_X - 40} ${CENTRE_Y + 118}, ${CENTRE_X + 90} ${CENTRE_Y + 98} S ${CENTRE_X + 250} ${CENTRE_Y + 90}, ${CENTRE_X + 310} ${CENTRE_Y + 108}`}
                fill="none"
                stroke="#7c6b52"
                strokeOpacity="0.22"
                strokeWidth="1.2"
              />
              <path
                d={`M ${CENTRE_X - 170} ${CENTRE_Y - 6} l 34 18 l 22 -9 l 28 26`}
                fill="none"
                stroke="#7c6b52"
                strokeOpacity="0.2"
                strokeWidth="1"
              />
              <path
                d={`M ${CENTRE_X + 60} ${CENTRE_Y + 62} l 42 -14 l 18 22 l 31 -12`}
                fill="none"
                stroke="#7c6b52"
                strokeOpacity="0.2"
                strokeWidth="1"
              />

              {sketch.map((point) => {
                const form = point.form
                const gripTop = form.length + 0.15 + form.gripLength
                return (
                  <g
                    key={point.bladeId}
                    transform={`translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${point.tilt.toFixed(2)}) scale(${point.scale} ${-point.scale})`}
                  >
                    <ellipse
                      cx="0"
                      cy="0.015"
                      rx={0.52 * form.moundScale}
                      ry={0.18 * form.moundScale}
                      fill="#4a3a2a"
                      opacity="0.28"
                    />
                    <path
                      d={outlineToPath(bladeOutline(form))}
                      fill="url(#aharietiam-steel)"
                      stroke="#4a4238"
                      strokeWidth="0.018"
                      strokeLinejoin="round"
                    />
                    <path
                      d={outlineToPath(guardOutline(form.guard, form.guardWidth))}
                      transform={`translate(0 ${form.length.toFixed(3)})`}
                      fill="#726b5e"
                      stroke="#4a4238"
                      strokeWidth="0.018"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="0"
                      y1={form.length + 0.15}
                      x2="0"
                      y2={gripTop}
                      stroke="#4b3729"
                      strokeWidth={form.gripRadius * 2}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="0"
                      cy={gripTop + form.pommelSize * 0.8}
                      r={form.pommelSize * 0.85}
                      fill="#6e6658"
                      stroke="#423a2e"
                      strokeWidth="0.018"
                    />
                    <path
                      d={`M ${-0.08} ${(form.glyphT * form.length).toFixed(3)} l 0.16 0`}
                      stroke={point.colour}
                      strokeWidth="0.02"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                  </g>
                )
              })}
            </svg>
            <figcaption className="mt-3 text-meta italic" style={{ color: 'var(--text-on-page-tertiary)' }}>
              Ten weapons, drawn from the same measurements that would have raised them in stone.
            </figcaption>
          </figure>

          <ol aria-label="The ten Honorblades" className="m-0 list-none p-0">
            {sortedNames.map((blade, index) => (
              <li
                key={blade.id}
                className="flex items-baseline gap-3 border-b py-3 last:border-b-0"
                style={{ borderColor: 'var(--surface-page-edge)' }}
              >
                <span className="w-5 shrink-0 text-meta tabular-nums" style={{ color: 'var(--text-on-page-tertiary)' }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body-s" style={{ color: 'var(--text-on-page-primary)', fontWeight: 600 }}>
                    {blade.name}
                  </span>
                  <span className="block text-meta" style={{ color: 'var(--text-on-page-tertiary)' }}>
                    {blade.order}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="h-0.5 w-5 shrink-0"
                  style={{ background: blade.color, opacity: 0.7 }}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
})
