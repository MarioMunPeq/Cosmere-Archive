import { useMemo } from 'react'
import { getPlanetById, PLANETS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { CHARACTER_SPANS, WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'
import { BOOKS } from '@/data/static'
import PlanetMarble from './PlanetMarble'

const INK = {
  title: '#2a1810',
  body: '#3d2818',
  label: '#4a3020',
  meta: '#5a3d28',
  subtle: '#7a6040',
  muted: '#9a8060',
}

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

const PLANET_ASTRONOMICAL_DATA: Record<
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

const FOLD_OUT_WORLDS = ['roshar', 'scadrial', 'sel']

interface Props {
  planetId: string
  onBack: () => void
  onFoldOut?: (planetId: string) => void
  foldOutActive?: boolean
}

export default function PlanetDossier({ planetId, onBack, onFoldOut, foldOutActive }: Props) {
  const planet = getPlanetById(planetId)
  const motif = PLANET_MOTIFS[planetId] ?? { glyph: '·', color: INK.subtle }
  const astroData = PLANET_ASTRONOMICAL_DATA[planetId]

  const magicSystems = useMemo(() => MAGIC_SYSTEMS.filter((ms) => ms.planetId === planetId), [planetId])

  const characters = useMemo(
    () => CHARACTER_SPANS.filter((c) => c.planet.toLowerCase() === planetId.toLowerCase()),
    [planetId],
  )

  const worldhoppers = useMemo(
    () =>
      WORLDHOPPER_MOVEMENTS.filter((wh) => wh.movements.some((m) => m.planet.toLowerCase() === planetId.toLowerCase())),
    [planetId],
  )

  const books = useMemo(() => (planet ? BOOKS.filter((b) => planet.books?.includes(b.id)) : []), [planet])

  const connectedPlanets = useMemo(
    () =>
      PLANETS.filter(
        (p) =>
          p.id !== planetId &&
          worldhoppers.some((wh) => wh.movements.some((m) => m.planet.toLowerCase() === p.id.toLowerCase())),
      ),
    [planetId, worldhoppers],
  )

  const characterCount = useMemo(
    () => CHARACTER_SPANS.filter((c) => c.planet.toLowerCase() === planetId.toLowerCase()).length,
    [planetId],
  )

  const magicCount = useMemo(() => MAGIC_SYSTEMS.filter((ms) => ms.planetId === planetId).length, [planetId])

  if (!planet) return null

  return (
    <div className="w-full h-full min-h-0 flex flex-col">
      {/* Back link + controls */}
      <div className="shrink-0 flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: `1px solid ${INK.muted}40` }}>
        <span
          role="button"
          tabIndex={0}
          onClick={onBack}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onBack()
            }
          }}
          className="font-serif text-[9px] uppercase tracking-[0.1em] cursor-pointer transition-opacity hover:opacity-60"
          style={{ color: INK.subtle }}
        >
          ← Celestial Chart
        </span>
        <span className="flex-1" />
        <span className="font-serif text-[8px] italic" style={{ color: INK.muted }}>
          Fol. 14
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto manuscript-scrollbar pr-2">
        {/* Header with marble */}
        <div className="flex gap-6 mb-6">
          <div className="shrink-0" style={{ marginTop: '4px' }}>
            <PlanetMarble planetId={planetId} size={56} />
          </div>
          <div className="flex-1">
            <h2
              className="font-serif text-[22px] font-bold tracking-[0.04em] leading-tight"
              style={{ color: INK.title }}
            >
              {planet.name}
            </h2>
            <p className="font-serif text-[11px] italic mt-1" style={{ color: INK.meta }}>
              {motif.glyph} {astroData?.classification ?? 'Unknown'}
            </p>
            {planet.shard && (
              <p className="font-serif text-[10px] mt-2" style={{ color: INK.subtle }}>
                Shardic influence: {planet.shard}
              </p>
            )}
          </div>
        </div>

        {/* Astronomical Data Table */}
        {astroData && (
          <div className="mb-6">
            <PlateHeader motif={motif}>I. Astronomical Data</PlateHeader>
            <div className="ml-1 space-y-[1px]">
              <DataRow label="Semi-major axis" value={astroData.distance} />
              <DataRow label="Orbital period" value={astroData.period} />
              <DataRow label="Inclination" value={astroData.inclination} />
              <DataRow label="Satellites" value={astroData.satellites} />
              <DataRow label="Classification" value={astroData.classification} />
            </div>
          </div>
        )}

        {/* Scientific measurements */}
        <div className="mb-6">
          <PlateHeader motif={motif}>II. Physical Observations</PlateHeader>
          <div className="ml-1 space-y-[1px]">
            <DataRow label="Notable characters" value={String(characterCount)} />
            <DataRow label="Magic systems" value={String(magicCount)} />
            <DataRow label="Primary sources" value={String(books.length)} />
            <DataRow label="Known worldhoppers" value={String(worldhoppers.length)} />
          </div>
        </div>

        <SectionDivider motif={motif} />

        {/* Description */}
        {planet.description && (
          <div className="mb-6">
            <PlateHeader motif={motif}>III. Planetary Record</PlateHeader>
            <p
              className="font-serif leading-[1.8] ml-1"
              style={{ color: INK.body, fontSize: 'clamp(12px, 0.9vw, 14px)' }}
            >
              {planet.description}
            </p>
          </div>
        )}

        {/* Investiture */}
        {magicSystems.length > 0 && (
          <div className="mb-6">
            <PlateHeader motif={motif}>IV. Investiture Manifestations</PlateHeader>
            <div className="space-y-[2px] ml-1">
              {magicSystems.map((ms) => (
                <p key={ms.id} className="font-serif text-[12px]" style={{ color: INK.label }}>
                  {ms.name} —{' '}
                  <span className="italic text-[11px]" style={{ color: INK.subtle }}>
                    {ms.shard}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Primary Sources */}
        {books.length > 0 && (
          <div className="mb-6">
            <PlateHeader motif={motif}>V. Primary Sources</PlateHeader>
            <div className="space-y-[2px] ml-1">
              {books.map((b) => (
                <p key={b.id} className="font-serif text-[11px]" style={{ color: INK.label }}>
                  {b.title}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Notable Characters */}
        {characters.length > 0 && (
          <div className="mb-6">
            <PlateHeader motif={motif}>VI. Notable Figures</PlateHeader>
            <div className="space-y-[1px] ml-1">
              {characters.slice(0, 10).map((c) => (
                <p key={c.id} className="font-serif text-[11px]" style={{ color: INK.label }}>
                  {c.name}
                  {c.titles[0] && (
                    <span className="text-[10px] italic ml-2" style={{ color: INK.subtle }}>
                      {c.titles[0]}
                    </span>
                  )}
                </p>
              ))}
              {characters.length > 10 && (
                <p className="font-serif text-[9px] italic" style={{ color: INK.muted }}>
                  + {characters.length - 10} further entries
                </p>
              )}
            </div>
          </div>
        )}

        {/* Connected Worlds */}
        {connectedPlanets.length > 0 && (
          <div className="mb-6">
            <PlateHeader motif={motif}>VII. Connected Worlds</PlateHeader>
            <div className="flex flex-wrap gap-x-4 gap-y-1 ml-1">
              {connectedPlanets.map((cp) => {
                const cpMotif = PLANET_MOTIFS[cp.id] ?? { glyph: '·', color: INK.subtle }
                return (
                  <span key={cp.id} className="font-serif text-[11px]" style={{ color: INK.label }}>
                    <span style={{ color: cpMotif.color }}>{cpMotif.glyph}</span> {cp.name}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Fold-out map trigger */}
        {FOLD_OUT_WORLDS.includes(planetId) && (
          <div className="mb-6">
            <PlateHeader motif={motif}>VIII. Cartographic Plate</PlateHeader>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onFoldOut?.(planetId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onFoldOut?.(planetId)
                }
              }}
              className="flex items-center gap-3 py-3 px-4 cursor-pointer group transition-all duration-300"
              style={{
                border: `0.5px solid ${INK.muted}40`,
                background: foldOutActive ? 'rgba(160,140,100,0.04)' : `rgba(80,60,40,0.02)`,
              }}
            >
              <span className="font-serif text-[14px]" style={{ color: INK.subtle }}>
                🗺
              </span>
              <div className="flex-1">
                <p className="font-serif text-[11px]" style={{ color: INK.label }}>
                  {foldOutActive ? 'Close fold-out plate' : `Open fold-out map — ${planet.name} System`}
                </p>
                <p className="font-serif text-[8px] italic mt-0.5" style={{ color: INK.subtle }}>
                  Detailed cartographic plate with orbital mechanics and geographical survey
                </p>
              </div>
              <span
                className="font-serif text-[12px] transition-transform group-hover:translate-x-1"
                style={{ color: INK.subtle }}
              >
                {foldOutActive ? '▽' : '▷'}
              </span>
            </div>
          </div>
        )}

        <SectionDivider motif={motif} />

        {/* Metadata footer */}
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-serif uppercase tracking-[0.1em]" style={{ color: INK.muted }}>
              {motif.glyph} Silverlight Archives
            </span>
            <span className="flex-1" />
            <span className="text-[8px] font-serif italic" style={{ color: INK.muted }}>
              Record #{planet.id.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionDivider({ motif }: { motif: { glyph: string; color: string } }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${motif.color})` }} />
      <span className="font-serif text-[7px]" style={{ color: INK.muted }}>
        {motif.glyph}
      </span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, transparent, ${motif.color})` }} />
    </div>
  )
}

function PlateHeader({ children, motif }: { children: string; motif: { glyph: string; color: string } }) {
  return (
    <h3
      className="font-serif text-[10px] uppercase tracking-[0.15em] mb-3 font-bold flex items-center gap-2"
      style={{ color: INK.title }}
    >
      <span style={{ color: motif.color }}>{motif.glyph}</span>
      {children}
      <div className="flex-1 h-px ml-2" style={{ background: `linear-gradient(90deg, ${motif.color}, transparent)` }} />
    </h3>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-serif text-[10px] italic shrink-0" style={{ color: INK.subtle, minWidth: '100px' }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ borderBottom: `1px dotted ${INK.muted}40` }} />
      <span className="font-serif text-[11px]" style={{ color: INK.label }}>
        {value}
      </span>
    </div>
  )
}
