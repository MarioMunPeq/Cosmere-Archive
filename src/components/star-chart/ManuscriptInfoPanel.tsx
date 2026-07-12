import { useMemo } from 'react'
import type { Planet } from '@/types'
import { ALL_CHARACTERS, SAGAS, getPlanetById } from '@/data/static'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'

interface Props {
  planet: Planet
  onClose: () => void
  onSelectPlanet: (id: string) => void
}

export default function ManuscriptInfoPanel({ planet, onClose, onSelectPlanet }: Props) {
  const planetChars = useMemo(() => ALL_CHARACTERS.filter((c) => c.planet.toLowerCase() === planet.id), [planet.id])
  const worldhoppers = useMemo(() => WORLDHOPPER_MOVEMENTS.filter((w) => w.planets.includes(planet.id)), [planet.id])
  const sagaNames = (planet.sagas ?? []).map((sid) => {
    const saga = (SAGAS as { id: string; name: string }[]).find((s) => s.id === sid)
    return saga?.name ?? sid
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(8,6,4,0.75)' }}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative flex w-full max-w-3xl animate-fade-in-up overflow-hidden rounded-sm"
        style={{
          animationDuration: '600ms',
          animationFillMode: 'backwards',
          boxShadow: '0 20px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(120,100,80,0.12)',
        }}
      >
        {/* Left page */}
        <div
          className="w-1/2 relative p-8 pr-6"
          style={{
            background: `
              linear-gradient(135deg, #e4d8c4 0%, #dcd0bc 40%, #d4c4a8 100%),
              repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(100,80,60,0.03) 24px, rgba(100,80,60,0.03) 25px)
            `,
            borderRight: '1px solid rgba(80,60,40,0.1)',
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-4 rounded-full"
              style={{
                width: 90,
                height: 90,
                background: `radial-gradient(circle at 35% 30%, ${planet.color}cc, ${planet.color}66, ${planet.color}22)`,
                boxShadow: `0 0 30px ${planet.color}30, inset 0 0 15px rgba(255,255,255,0.04)`,
              }}
            />

            <div
              className="text-lg tracking-wide mb-1"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: 'rgba(42,26,10,0.75)' }}
            >
              {planet.name.toUpperCase()}
            </div>

            <div
              className="w-12 h-px mb-3"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(42,26,10,0.15), transparent)' }}
            />

            {planet.shard && (
              <div
                className="text-xs italic mb-4 leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", color: 'rgba(80,60,40,0.45)' }}
              >
                {planet.shard
                  .split(/[,&]/)
                  .map((s) => s.trim())
                  .join(' · ')}
              </div>
            )}

            {planet.description && (
              <p
                className="text-xs leading-relaxed mb-4"
                style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", color: 'rgba(42,26,10,0.5)' }}
              >
                {planet.description}
              </p>
            )}

            {sagaNames.length > 0 && (
              <div className="mt-1">
                <div
                  className="text-[8px] uppercase tracking-widest mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(42,26,10,0.3)' }}
                >
                  Recorded Cycles
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  {sagaNames.map((name) => (
                    <span
                      key={name}
                      className="text-[9px] italic px-2 py-0.5"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: 'rgba(80,60,40,0.4)',
                        border: '1px solid rgba(42,26,10,0.07)',
                        borderRadius: 1,
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ink annotation */}
          <div
            className="absolute text-[8px] italic pointer-events-none select-none"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'rgba(120,100,80,0.15)',
              left: '20%',
              bottom: '15%',
              transform: 'rotate(-1.5deg)',
            }}
          >
            System entry verified
          </div>

          {/* Page number */}
          <div
            className="absolute bottom-4 left-0 right-0 text-center text-[8px] italic"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'rgba(80,60,40,0.15)' }}
          >
            — 1 —
          </div>
        </div>

        {/* Right page */}
        <div
          className="w-1/2 relative p-8 pl-6 overflow-y-auto"
          style={{
            background: `
              linear-gradient(135deg, #e8dcc8 0%, #e0d4c0 40%, #d8c8b0 100%),
              repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(100,80,60,0.03) 24px, rgba(100,80,60,0.03) 25px)
            `,
            maxHeight: 520,
          }}
        >
          <div
            className="text-sm mb-4"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: 'rgba(42,26,10,0.6)' }}
          >
            Research Notes
          </div>

          {planet.investiture && planet.investiture.length > 0 && (
            <div className="mb-4">
              <div
                className="text-[8px] uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(42,26,10,0.3)' }}
              >
                Investiture Systems
              </div>
              <div className="space-y-2">
                {planet.investiture.map((inv) => (
                  <div key={inv.name}>
                    <div
                      className="text-[10px]"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: 'rgba(42,26,10,0.6)' }}
                    >
                      {inv.name}
                      {inv.shard && (
                        <span className="ml-1 text-[8px] italic" style={{ color: 'rgba(80,60,40,0.35)' }}>
                          — {inv.shard}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[9px] leading-relaxed"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: 'rgba(42,26,10,0.35)' }}
                    >
                      {inv.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {planetChars.length > 0 && (
            <div className="mb-4">
              <div
                className="text-[8px] uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(42,26,10,0.3)' }}
              >
                Known Individuals ({planetChars.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {planetChars.slice(0, 8).map((c) => (
                  <span
                    key={c.id}
                    className="text-[9px] italic px-1.5 py-0.5"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: 'rgba(80,60,40,0.4)',
                      border: '1px solid rgba(42,26,10,0.05)',
                      borderRadius: 1,
                    }}
                  >
                    {c.name}
                  </span>
                ))}
                {planetChars.length > 8 && (
                  <span className="text-[8px] italic self-center" style={{ color: 'rgba(80,60,40,0.2)' }}>
                    +{planetChars.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {worldhoppers.length > 0 && (
            <div className="mb-4">
              <div
                className="text-[8px] uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(42,26,10,0.3)' }}
              >
                Worldhoppers ({worldhoppers.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {worldhoppers.slice(0, 5).map((w) => (
                  <span
                    key={w.id}
                    className="text-[9px] italic px-1.5 py-0.5"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: 'rgba(80,60,40,0.4)',
                      border: '1px solid rgba(42,26,10,0.05)',
                      borderRadius: 1,
                    }}
                  >
                    {w.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {planet.connectedPlanets && planet.connectedPlanets.length > 0 && (
            <div className="mb-4">
              <div
                className="text-[8px] uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(42,26,10,0.3)' }}
              >
                Connected Worlds
              </div>
              <div className="flex flex-wrap gap-1">
                {planet.connectedPlanets.slice(0, 6).map((cpId) => {
                  const cp = getPlanetById(cpId)
                  return cp ? (
                    <button
                      key={cpId}
                      onClick={() => onSelectPlanet(cpId)}
                      className="text-[9px] italic px-1.5 py-0.5 transition-all"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: 'rgba(80,60,40,0.5)',
                        border: '1px solid rgba(42,26,10,0.08)',
                        borderRadius: 1,
                        textDecoration: 'underline',
                        textUnderlineOffset: 2,
                        textDecorationColor: 'rgba(42,26,10,0.12)',
                      }}
                    >
                      {cp.name}
                    </button>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Page number */}
          <div
            className="absolute bottom-4 left-0 right-0 text-center text-[8px] italic"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'rgba(80,60,40,0.15)' }}
          >
            — 2 —
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-black/5"
          style={{ color: 'rgba(42,26,10,0.3)' }}
          aria-label="Close manuscript"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <line x1="2" y1="2" x2="10" y2="10" />
            <line x1="10" y1="2" x2="2" y2="10" />
          </svg>
        </button>
      </div>
    </div>
  )
}
