import { useMemo } from 'react'
import { getPlanetById } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'
import PlanetMarble from '@/components/celestial-charts/PlanetMarble'
import FieldNoteLayer from '@/components/celestial-charts/FieldNoteLayer'

const INK = {
  title: '#2a1810',
  body: '#3d2818',
  label: '#4a3020',
  meta: '#5a3d28',
  subtle: '#7a6040',
  muted: '#9a8060',
}

const ATLAS_ORDER: string[] = [
  'roshar',
  'scadrial',
  'sel',
  'nalthis',
  'taldain',
  'lumar',
  'komashi',
  'canticle',
  'first-of-the-sun',
  'threnody',
  'yolen',
]

const PLANET_MOTIFS: Record<string, { glyph: string; color: string }> = {
  roshar: { glyph: '≈', color: 'rgba(60,100,160,0.15)' },
  scadrial: { glyph: '◈', color: 'rgba(160,80,60,0.15)' },
  sel: { glyph: '◇', color: 'rgba(80,140,80,0.15)' },
  nalthis: { glyph: '✦', color: 'rgba(140,100,160,0.15)' },
  taldain: { glyph: '◎', color: 'rgba(180,160,100,0.15)' },
  lumar: { glyph: '〜', color: 'rgba(80,140,140,0.15)' },
  canticle: { glyph: '⁂', color: 'rgba(180,120,60,0.15)' },
  komashi: { glyph: '□', color: 'rgba(60,120,140,0.15)' },
  'first-of-the-sun': { glyph: '⋆', color: 'rgba(80,160,120,0.15)' },
  threnody: { glyph: '∴', color: 'rgba(140,100,140,0.15)' },
  yolen: { glyph: '⚔', color: 'rgba(200,180,100,0.15)' },
}

const PLANET_ASTRO: Record<
  string,
  { distance: string; period: string; inclination: string; satellites: string; classification: string }
> = {
  roshar: {
    distance: '0.82 AU',
    period: '312 d',
    inclination: '3.2°',
    satellites: '1 (Salas)',
    classification: 'Telluric · Supercontinental',
  },
  scadrial: {
    distance: '1.00 AU',
    period: '365 d',
    inclination: '1.8°',
    satellites: '1',
    classification: 'Telluric · Terrestrial',
  },
  sel: {
    distance: '0.94 AU',
    period: '341 d',
    inclination: '5.1°',
    satellites: '1 (Oyn)',
    classification: 'Telluric · Opal',
  },
  nalthis: {
    distance: '1.12 AU',
    period: '401 d',
    inclination: '2.4°',
    satellites: '0',
    classification: 'Telluric · Biosphere',
  },
  taldain: {
    distance: '1.45 AU',
    period: '523 d',
    inclination: '8.7°',
    satellites: '0',
    classification: 'Telluric · Desert',
  },
  lumar: {
    distance: '1.78 AU',
    period: '689 d',
    inclination: '4.3°',
    satellites: '2',
    classification: 'Telluric · Oceanic',
  },
  canticle: {
    distance: '0.31 AU',
    period: '108 d',
    inclination: '12.5°',
    satellites: '0',
    classification: 'Telluric · Chaotic',
  },
  komashi: {
    distance: '0.67 AU',
    period: '244 d',
    inclination: '6.9°',
    satellites: "1 (Shin'a)",
    classification: 'Telluric · Sealed',
  },
  'first-of-the-sun': {
    distance: '1.55 AU',
    period: '562 d',
    inclination: '1.1°',
    satellites: '0',
    classification: 'Telluric · Archipelagic',
  },
  threnody: {
    distance: '1.89 AU',
    period: '724 d',
    inclination: '15.3°',
    satellites: '1',
    classification: 'Telluric · Haunted',
  },
  yolen: { distance: '—', period: '—', inclination: '—', satellites: '—', classification: 'Telluric · Mythic' },
}

function getPlanetIndex(planetId: string): number {
  return ATLAS_ORDER.indexOf(planetId) + 1
}

/* ───── INDEX SPREAD — Left Page ───── */

interface IndexLeftProps {
  onNavigate: (planetId: string) => void
}

export function AtlasIndexLeft({ onNavigate }: IndexLeftProps) {
  return (
    <div className="flex flex-col justify-center h-full px-10 py-12 select-none">
      <div className="mb-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <span
          className="font-serif tracking-[0.3em]"
          style={{ color: INK.subtle, fontSize: 'clamp(9px, 0.9vw, 11px)' }}
        >
          SILVERLIGHT ARCHIVE · CODEX PRIMUS
        </span>
      </div>

      <h1
        className="font-serif leading-tight tracking-[0.02em] mb-3 animate-ink-write"
        style={{
          color: INK.title,
          fontSize: 'clamp(28px, 3.5vw, 48px)',
          fontWeight: 900,
          animationDelay: '0.3s',
        }}
      >
        ATLAS OF THE
        <br />
        COSMERE
      </h1>

      <div
        className="h-px w-3/4 my-5 animate-line-draw"
        style={{ background: `linear-gradient(90deg, ${INK.subtle}60, transparent)`, animationDelay: '0.6s' }}
      />

      <p
        className="font-serif italic leading-[1.8] mb-8 animate-fade-in-up"
        style={{ color: INK.meta, fontSize: 'clamp(11px, 1.1vw, 14px)', animationDelay: '0.7s' }}
      >
        A catalog of known celestial bodies,
        <br />
        compiled by Khrissalla of the Silverlight Cartographic Guild.
      </p>

      <div className="space-y-[3px] animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
        {ATLAS_ORDER.map((id, i) => {
          const p = getPlanetById(id)
          if (!p) return null
          const ch = String(i + 1).padStart(2, '0')
          const motif = PLANET_MOTIFS[id]
          return (
            <span
              key={id}
              role="button"
              tabIndex={0}
              onClick={() => onNavigate(id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onNavigate(id)
                }
              }}
              className="group flex items-baseline gap-4 py-[3px] cursor-pointer transition-opacity hover:opacity-60"
            >
              <span
                className="font-serif tabular-nums"
                style={{
                  color: INK.subtle,
                  fontSize: 'clamp(11px, 1.1vw, 14px)',
                  minWidth: '1.8em',
                  textAlign: 'right',
                }}
              >
                {ch}
              </span>
              {motif && <span style={{ color: motif.color, fontSize: 'clamp(10px, 1vw, 13px)' }}>{motif.glyph}</span>}
              <span
                className="font-serif"
                style={{ color: INK.body, fontSize: 'clamp(14px, 1.5vw, 20px)', letterSpacing: '0.01em' }}
              >
                {p.name}
              </span>
            </span>
          )
        })}
      </div>

      <div className="flex-1" />

      <p
        className="font-serif text-[9px] italic animate-fade-in-up"
        style={{ color: INK.muted, animationDelay: '1.5s' }}
      >
        Silverlight, Year 342 of the Ascendancy
      </p>
    </div>
  )
}

/* ───── INDEX SPREAD — Right Page (Astronomical Engraving) ───── */

export function AtlasIndexRight() {
  return (
    <div className="flex items-center justify-center h-full px-8 py-12 select-none">
      <svg viewBox="0 0 500 600" className="w-full h-full" style={{ maxWidth: '440px', maxHeight: '540px' }}>
        {/* Large compass rose */}
        <g transform="translate(250, 280)" opacity="0.12">
          <circle cx="0" cy="0" r="180" fill="none" stroke="rgba(60,45,30,0.15)" strokeWidth="0.3" />
          <circle
            cx="0"
            cy="0"
            r="150"
            fill="none"
            stroke="rgba(60,45,30,0.08)"
            strokeWidth="0.3"
            strokeDasharray="2 4"
          />
          <circle cx="0" cy="0" r="100" fill="none" stroke="rgba(60,45,30,0.06)" strokeWidth="0.3" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2
            const isCardinal = i % 3 === 0
            const len = isCardinal ? 170 : 140
            const inner = 30
            return (
              <line
                key={i}
                x1={inner * Math.cos(a)}
                y1={inner * Math.sin(a)}
                x2={len * Math.cos(a)}
                y2={len * Math.sin(a)}
                stroke="rgba(60,45,30,0.12)"
                strokeWidth={isCardinal ? '0.6' : '0.3'}
              />
            )
          })}
          {['N', 'E', 'S', 'W'].map((d, i) => {
            const a = (i / 4) * Math.PI * 2 - Math.PI / 2
            return (
              <text
                key={d}
                x={115 * Math.cos(a)}
                y={115 * Math.sin(a) + 4}
                textAnchor="middle"
                fontSize="12"
                fill="rgba(60,45,30,0.06)"
                fontFamily="Georgia, serif"
                fontStyle="italic"
              >
                {d}
              </text>
            )
          })}
        </g>

        {/* Constellation arc */}
        <g opacity="0.04">
          {Array.from({ length: 6 }, (_, i) => {
            const pts: string[] = []
            const startY = 80 + i * 50
            for (let t = 0; t <= 8; t++) {
              const x = 80 + t * 45
              const y = startY + Math.sin(t * 0.8 + i) * 15
              pts.push(`${t === 0 ? 'M' : 'L'}${x},${y}`)
            }
            return (
              <path
                key={i}
                d={pts.join(' ')}
                fill="none"
                stroke="rgba(60,45,30,0.06)"
                strokeWidth="0.3"
                strokeDasharray="2 3"
              />
            )
          })}
          {Array.from({ length: 20 }, (_, i) => {
            const h = (i * 0.618033988749895) % 1
            const v = (i * 0.381966011250105) % 1
            const px = 60 + h * 380
            const py = 40 + v * 520
            const pr = 0.3 + ((i * 0.23606797749979) % 1) * 0.5
            return <circle key={i} cx={px} cy={py} r={pr} fill="rgba(60,45,30,0.03)" />
          })}
        </g>

        {/* Orbital geometry diagram */}
        <g transform="translate(250, 380)" opacity="0.06">
          <ellipse cx="0" cy="0" rx="120" ry="50" fill="none" stroke="rgba(60,45,30,0.15)" strokeWidth="0.4" />
          <ellipse
            cx="0"
            cy="0"
            rx="80"
            ry="33"
            fill="none"
            stroke="rgba(60,45,30,0.08)"
            strokeWidth="0.3"
            strokeDasharray="1.5 2"
          />
          <ellipse cx="0" cy="0" rx="150" ry="62" fill="none" stroke="rgba(60,45,30,0.05)" strokeWidth="0.3" />
          <circle cx="0" cy="0" r="5" fill="rgba(60,45,30,0.08)" />
          <circle cx="95" cy="20" r="3" fill="rgba(60,45,30,0.05)" />
          <circle cx="-70" cy="-25" r="2.5" fill="rgba(60,45,30,0.05)" />
          <circle cx="120" cy="-35" r="2" fill="rgba(60,45,30,0.04)" />
          <line x1="0" y1="0" x2="95" y2="20" stroke="rgba(60,45,30,0.04)" strokeWidth="0.2" strokeDasharray="1 2" />
          <text x="60" y="55" fontSize="6" fill="rgba(60,45,30,0.04)" fontFamily="Georgia, serif" textAnchor="middle">
            Orbital configuration
          </text>
        </g>

        {/* Title */}
        <text
          x="250"
          y="50"
          textAnchor="middle"
          fontSize="8"
          fill="rgba(60,45,30,0.05)"
          fontFamily="Georgia, serif"
          letterSpacing="4"
          fontStyle="italic"
        >
          ASTRONOMICAL FRONTISPIECE
        </text>

        {/* Decorative scale */}
        <g transform="translate(120, 540)">
          <line x1="0" y1="0" x2="120" y2="0" stroke="rgba(60,45,30,0.04)" strokeWidth="0.3" />
          {[0, 60, 120].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="-4" x2={x} y2="4" stroke="rgba(60,45,30,0.04)" strokeWidth="0.3" />
              <text
                x={x}
                y="12"
                fontSize="5"
                textAnchor="middle"
                fill="rgba(60,45,30,0.03)"
                fontFamily="Georgia, serif"
              >
                {i * 5}
              </text>
            </g>
          ))}
          <text
            x="60"
            y="22"
            fontSize="5"
            textAnchor="middle"
            fill="rgba(60,45,30,0.03)"
            fontFamily="Georgia, serif"
            fontStyle="italic"
          >
            arcminutes
          </text>
        </g>
      </svg>
    </div>
  )
}

/* ───── PLANET SPREAD — Left Page (Scientific Archive) ───── */

interface PlanetLeftProps {
  planetId: string
  onNavigate: (planetId: string) => void
}

export function PlanetLeftPage({ planetId, onNavigate }: PlanetLeftProps) {
  const planet = getPlanetById(planetId)
  const motif = PLANET_MOTIFS[planetId] ?? { glyph: '·', color: INK.subtle }
  const astro = PLANET_ASTRO[planetId]
  const chNum = String(getPlanetIndex(planetId)).padStart(2, '0')

  const magicSystems = useMemo(() => MAGIC_SYSTEMS.filter((ms) => ms.planetId === planetId), [planetId])

  const books = useMemo(() => (planet ? (planet.books ?? []) : []), [planet])

  const worldhoppers = useMemo(
    () =>
      WORLDHOPPER_MOVEMENTS.filter((wh) => wh.movements.some((m) => m.planet.toLowerCase() === planetId.toLowerCase())),
    [planetId],
  )

  const connectedPlanets = useMemo(
    () =>
      ATLAS_ORDER.filter(
        (id: string) =>
          id !== planetId &&
          worldhoppers.some((wh) => wh.movements.some((m) => m.planet.toLowerCase() === id.toLowerCase())),
      ),
    [planetId, worldhoppers],
  )

  if (!planet) return null

  return (
    <div className="flex flex-col h-full px-10 py-8 select-none">
      {/* Chapter number */}
      <div className="mb-1">
        <span className="font-serif tracking-[0.15em]" style={{ color: INK.subtle, fontSize: 'clamp(8px,0.8vw,10px)' }}>
          CHAPTER {chNum}
        </span>
      </div>

      {/* Planet name */}
      <h1
        className="font-serif leading-[1.1] font-bold tracking-[0.01em]"
        style={{ color: INK.title, fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 900 }}
      >
        {planet.name}
      </h1>

      {/* Classification */}
      <p className="font-serif italic mt-2 mb-5" style={{ color: INK.subtle, fontSize: 'clamp(11px, 1vw, 14px)' }}>
        {motif.glyph} {astro?.classification ?? 'Unknown'}
      </p>

      <div className="h-px w-full mb-5" style={{ background: `linear-gradient(90deg, ${motif.color}, transparent)` }} />

      {/* Metadata */}
      <div className="space-y-[3px] mb-5">
        <MetaRow label="System" value={`${planet.name} System`} />
        {planet.shard && <MetaRow label="Shardic Influence" value={planet.shard} />}
        {astro && (
          <>
            <MetaRow label="Semi-major axis" value={astro.distance} />
            <MetaRow label="Orbital period" value={astro.period} />
            <MetaRow label="Inclination" value={astro.inclination} />
            <MetaRow label="Satellites" value={astro.satellites} />
          </>
        )}
      </div>

      {/* Investiture */}
      {magicSystems.length > 0 && (
        <div className="mb-5">
          <SectionLabel>Investiture</SectionLabel>
          <div className="space-y-[1px]">
            {magicSystems.map((ms) => (
              <p
                key={ms.id}
                className="font-serif leading-[1.6]"
                style={{ color: INK.body, fontSize: 'clamp(9px,0.9vw,12px)' }}
              >
                <span className="italic" style={{ color: INK.subtle }}>
                  {ms.shard}
                </span>
                {' — '}
                {ms.name}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {planet.description && (
        <div className="mb-5">
          <p className="font-serif leading-[1.8]" style={{ color: INK.body, fontSize: 'clamp(10px, 1vw, 13px)' }}>
            {planet.description}
          </p>
        </div>
      )}

      {/* Primary Sources */}
      {books.length > 0 && (
        <div className="mb-5">
          <SectionLabel>Primary Sources</SectionLabel>
          <div className="space-y-[1px]">
            {books.slice(0, 8).map((bookId) => (
              <p key={bookId} className="font-serif" style={{ color: INK.meta, fontSize: 'clamp(9px,0.85vw,11px)' }}>
                • {bookId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            ))}
            {books.length > 8 && (
              <p className="font-serif italic" style={{ color: INK.muted, fontSize: 'clamp(8px,0.75vw,9px)' }}>
                + {books.length - 8} further entries
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recorded Expeditions */}
      {worldhoppers.length > 0 && (
        <div className="mb-5">
          <SectionLabel>Recorded Expeditions</SectionLabel>
          <div className="space-y-[2px]">
            {worldhoppers.slice(0, 5).map((wh) => (
              <p key={wh.id} className="font-serif" style={{ color: INK.meta, fontSize: 'clamp(8px,0.8vw,10px)' }}>
                <span style={{ color: wh.color }}>◉</span> {wh.name}
                <span className="italic" style={{ color: INK.muted }}>
                  {' — '}via {wh.planets.slice(0, 4).join(', ')}
                  {wh.planets.length > 4 ? '…' : ''}
                </span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Connected Worlds */}
      {connectedPlanets.length > 0 && (
        <div className="mb-5">
          <SectionLabel>Connected Worlds</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {connectedPlanets.map((cpId) => {
              const cp = getPlanetById(cpId)
              if (!cp) return null
              const cpCh = String(getPlanetIndex(cpId)).padStart(2, '0')
              return (
                <span
                  key={cpId}
                  role="button"
                  tabIndex={0}
                  onClick={() => onNavigate(cpId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onNavigate(cpId)
                    }
                  }}
                  className="font-serif italic cursor-pointer transition-opacity hover:opacity-60"
                  style={{ color: INK.subtle, fontSize: 'clamp(9px,0.85vw,11px)' }}
                >
                  → {cp.name} (Ch. {cpCh})
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Back to index */}
      <div className="mt-auto pt-3">
        <span
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('__index__')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onNavigate('__index__')
            }
          }}
          className="font-serif italic cursor-pointer transition-opacity hover:opacity-60"
          style={{ color: INK.muted, fontSize: 'clamp(8px,0.75vw,9px)' }}
        >
          ← Return to Atlas Index
        </span>
      </div>
    </div>
  )
}

/* ───── PLANET SPREAD — Right Page (Planet Render + Field Notes) ───── */

interface PlanetRightProps {
  planetId: string
}

export function PlanetRightPage({ planetId }: PlanetRightProps) {
  const planet = getPlanetById(planetId)
  const astro = PLANET_ASTRO[planetId]
  const chNum = String(getPlanetIndex(planetId)).padStart(2, '0')

  if (!planet) return null

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-12 select-none relative overflow-hidden">
      {/* Field notes anchored within the page */}
      <FieldNoteLayer planetId={planetId} />

      {/* Planet marble — dominant */}
      <div
        className="flex items-center justify-center mb-6"
        style={{
          width: 'clamp(140px, 18vw, 260px)',
          height: 'clamp(140px, 18vw, 260px)',
        }}
      >
        <PlanetMarble planetId={planetId} size={200} />
      </div>

      {/* Planet name caption */}
      <h2
        className="font-serif text-center tracking-[0.2em] mb-6"
        style={{ color: INK.label, fontSize: 'clamp(11px, 1.2vw, 16px)' }}
      >
        {planet.name.toUpperCase()}
      </h2>

      {/* Orbital data */}
      {astro && (
        <div className="flex gap-6 mb-2">
          <DataPill label="Distance" value={astro.distance} />
          <DataPill label="Period" value={astro.period} />
          <DataPill label="Inclination" value={astro.inclination} />
          <DataPill label="Satellites" value={astro.satellites} />
        </div>
      )}

      {/* Plate reference */}
      <p className="font-serif italic mt-8" style={{ color: INK.muted, fontSize: 'clamp(7px,0.7vw,9px)' }}>
        Plate {chNum} · Silverlight Archive
      </p>
    </div>
  )
}

/* ───── Small helper components ───── */

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="font-serif text-[9px] uppercase tracking-[0.15em] mb-2 font-bold" style={{ color: INK.title }}>
      {children}
    </h3>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="font-serif italic shrink-0"
        style={{ color: INK.muted, fontSize: 'clamp(8px,0.75vw,10px)', minWidth: '5.5em' }}
      >
        {label}
      </span>
      <span className="flex-1 h-px" style={{ borderBottom: `1px dotted ${INK.muted}30` }} />
      <span className="font-serif" style={{ color: INK.meta, fontSize: 'clamp(9px,0.85vw,11px)' }}>
        {value}
      </span>
    </div>
  )
}

function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-serif italic" style={{ color: INK.subtle, fontSize: 'clamp(6px,0.6vw,8px)' }}>
        {label}
      </p>
      <p className="font-serif" style={{ color: INK.label, fontSize: 'clamp(8px,0.8vw,11px)' }}>
        {value}
      </p>
    </div>
  )
}

export { ATLAS_ORDER }
export { PLANET_MOTIFS }
export { PLANET_ASTRO as PLANET_ASTRONOMICAL_DATA }
export { getPlanetIndex }
