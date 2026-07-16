import { useMemo } from 'react'
import type { Character } from '@/types/character'
import type { MagicSystem } from '@/data/static/magic-systems'
import PortraitMedallion from './PortraitMedallion'
import { getPlanetById } from '@/data/static'

interface Props {
  character: Character
  magicSystems: MagicSystem[]
  onNavigatePlanet: (id: string) => void
  onNavigateMagic: (id: string) => void
  onNavigateBook: (id: string) => void
}

export default function CharacterRecord({
  character,
  magicSystems,
  onNavigatePlanet,
  onNavigateMagic,
  onNavigateBook,
}: Props) {
  const planet = getPlanetById(character.planet)
  const systemMagicSystems = useMemo(
    () => magicSystems.filter((ms) => ms.planetId === character.planet),
    [magicSystems, character.planet],
  )
  const planetColor = planet?.color ?? 'rgba(80,60,40,0.3)'
  const planetName = planet?.name ?? character.planet

  return (
    <section id={`record-${character.id}`} className="mb-10">
      <div className="h-px w-full mb-5" style={{ background: 'rgba(80,60,40,0.06)' }} />

      <div className="flex gap-5 mb-4">
        <PortraitMedallion name={character.name} size={80} />

        <div className="flex-1 min-w-0">
          <h2
            className="font-serif text-[clamp(18px,2vw,28px)] font-bold tracking-[0.04em] leading-tight"
            style={{ color: '#2d1a0e' }}
          >
            {character.name}
          </h2>
          {character.pronunciation && (
            <p className="font-serif text-[10px] italic mt-0.5" style={{ color: 'rgba(80,60,40,0.3)' }}>
              {character.pronunciation}
            </p>
          )}
          <p className="font-serif text-[11px] mt-1" style={{ color: 'rgba(80,60,40,0.35)' }}>
            <span
              role="button"
              tabIndex={0}
              onClick={() => onNavigatePlanet(character.planet)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onNavigatePlanet(character.planet)
                }
              }}
              className="cursor-pointer transition-opacity hover:opacity-60"
              style={{
                textDecoration: 'underline',
                textDecorationColor: `${planetColor}40`,
                textUnderlineOffset: '2px',
                color: planetColor,
              }}
            >
              {planetName}
            </span>
          </p>
        </div>
      </div>

      <p
        className="font-serif text-[clamp(10px,0.85vw,13px)] leading-[1.9] mb-4"
        style={{ color: 'rgba(40,30,20,0.75)' }}
      >
        {character.description}
      </p>

      <div className="mb-3">
        <p className="font-serif text-[8px] uppercase tracking-[0.15em] mb-1.5" style={{ color: 'rgba(80,60,40,0.2)' }}>
          Archive Record
        </p>
        <div className="space-y-[1px]">
          <RecordField label="Origin">{planetName}</RecordField>
          <RecordField label="Archive ID">{character.id.toUpperCase()}</RecordField>
          <RecordField label="Classification">Biographical Record</RecordField>
        </div>
      </div>

      {systemMagicSystems.length > 0 && (
        <div className="mb-3">
          <p className="font-serif text-[8px] uppercase tracking-[0.15em] mb-1" style={{ color: 'rgba(80,60,40,0.2)' }}>
            Investiture
          </p>
          <div className="space-y-[1px]">
            {systemMagicSystems.map((ms) => (
              <span
                key={ms.id}
                role="button"
                tabIndex={0}
                onClick={() => onNavigateMagic(ms.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onNavigateMagic(ms.id)
                  }
                }}
                className="block font-serif text-[11px] italic cursor-pointer transition-opacity hover:opacity-60"
                style={{ color: 'rgba(60,40,25,0.5)' }}
              >
                → {ms.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-3">
        <p className="font-serif text-[8px] uppercase tracking-[0.15em] mb-1" style={{ color: 'rgba(80,60,40,0.2)' }}>
          Appears in
        </p>
        <p className="font-serif text-[11px]" style={{ color: 'rgba(60,40,25,0.55)' }}>
          {character.requiredBooks.length > 0 ? (
            character.requiredBooks.map((bookId, i) => (
              <span key={bookId}>
                {i > 0 && <span style={{ color: 'rgba(80,60,40,0.2)' }}>; </span>}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => onNavigateBook(bookId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onNavigateBook(bookId)
                    }
                  }}
                  className="cursor-pointer transition-opacity hover:opacity-60"
                  style={{
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(80,60,40,0.15)',
                    textUnderlineOffset: '2px',
                  }}
                >
                  {bookId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </span>
            ))
          ) : (
            <span style={{ color: 'rgba(80,60,40,0.2)' }}>Not specified</span>
          )}
        </p>
      </div>

      <p className="font-serif text-[9px] italic mt-4" style={{ color: 'rgba(80,60,40,0.2)' }}>
        Archive reference: {character.planet}/{character.id}
      </p>
    </section>
  )
}

function RecordField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span
        className="font-serif text-[9px] uppercase tracking-[0.1em] shrink-0 text-right"
        style={{ color: 'rgba(80,60,40,0.2)', minWidth: '80px' }}
      >
        {label}
      </span>
      <span className="font-serif text-[clamp(10px,0.8vw,12px)]" style={{ color: 'rgba(60,40,25,0.65)' }}>
        {children}
      </span>
    </div>
  )
}
