import { useMemo } from 'react'
import type { Character } from '@/types/character'
import type { MagicSystem } from '@/data/static/magic-systems'
import { CHARACTER_SPANS } from '@/data/static/timeline'
import { CHARACTER_RELATIONSHIPS } from '@/data/static/static-data'
import { RELATIONSHIP_LABELS } from '@/types/relationships'
import { FAMILY_TREES } from '@/data/static/family-data'
import CharacterPortrait from './CharacterPortrait'
import { getPlanetById } from '@/data/static'

interface Props {
  character: Character
  magicSystems: MagicSystem[]
  onNavigatePlanet: (id: string) => void
  onNavigateMagic: (id: string) => void
  onNavigateBook: (id: string) => void
  onNavigateChapter: (chapter: 'bloodlines' | 'connections') => void
}

function SectionDivider({ motif }: { motif: { glyph: string; inkColor: string; accent: string } }) {
  return (
    <div className="flex items-center gap-3 my-7">
      <div className="h-px flex-1" style={{ background: motif.accent }} />
      <span className="font-serif text-[8px]" style={{ color: motif.inkColor }}>
        {motif.glyph}
      </span>
      <div className="h-px flex-1" style={{ background: motif.accent }} />
    </div>
  )
}

function SectionHeading({ children, motif }: { children: string; motif: { glyph: string; inkColor: string } }) {
  return (
    <h3
      className="font-serif text-[11px] uppercase tracking-[0.18em] mb-4 font-bold"
      style={{ color: 'rgba(60,45,30,0.45)' }}
    >
      <span className="mr-2" style={{ color: motif.inkColor }}>
        {motif.glyph}
      </span>
      {children}
    </h3>
  )
}

export default function CharacterRecord({
  character,
  magicSystems,
  onNavigatePlanet,
  onNavigateMagic,
  onNavigateBook,
  onNavigateChapter,
}: Props) {
  const planet = getPlanetById(character.planet)
  const systemMagicSystems = useMemo(
    () => magicSystems.filter((ms) => ms.planetId === character.planet),
    [magicSystems, character.planet],
  )
  const planetColor = planet?.color ?? 'rgba(80,60,40,0.3)'
  const planetName = planet?.name ?? character.planet

  const planetMotif = useMemo(() => {
    const id = planet?.id ?? ''
    switch (id) {
      case 'roshar':
        return {
          accent: 'rgba(60,100,160,0.1)',
          label: 'Roshar Collection',
          inkColor: 'rgba(60,100,160,0.2)',
          glyph: '≈',
        }
      case 'scadrial':
        return {
          accent: 'rgba(160,80,60,0.1)',
          label: 'Scadrial Collection',
          inkColor: 'rgba(160,80,60,0.2)',
          glyph: '◈',
        }
      case 'sel':
        return { accent: 'rgba(80,140,80,0.1)', label: 'Sel Collection', inkColor: 'rgba(80,140,80,0.2)', glyph: '◇' }
      case 'nalthis':
        return {
          accent: 'rgba(140,100,160,0.1)',
          label: 'Nalthis Collection',
          inkColor: 'rgba(140,100,160,0.2)',
          glyph: '✦',
        }
      case 'taldain':
        return {
          accent: 'rgba(180,160,100,0.1)',
          label: 'Taldain Collection',
          inkColor: 'rgba(180,160,100,0.2)',
          glyph: '◎',
        }
      case 'lumar':
        return {
          accent: 'rgba(80,140,140,0.1)',
          label: 'Lumar Collection',
          inkColor: 'rgba(80,140,140,0.2)',
          glyph: '〜',
        }
      case 'canticle':
        return {
          accent: 'rgba(180,120,60,0.1)',
          label: 'Canticle Collection',
          inkColor: 'rgba(180,120,60,0.2)',
          glyph: '⁂',
        }
      case 'komashi':
        return {
          accent: 'rgba(60,120,140,0.1)',
          label: 'Komashi Collection',
          inkColor: 'rgba(60,120,140,0.2)',
          glyph: '□',
        }
      case 'first-of-the-sun':
        return {
          accent: 'rgba(80,160,120,0.1)',
          label: 'First of the Sun Collection',
          inkColor: 'rgba(80,160,120,0.2)',
          glyph: '⋆',
        }
      case 'threnody':
        return {
          accent: 'rgba(140,100,140,0.1)',
          label: 'Threnody Collection',
          inkColor: 'rgba(140,100,140,0.2)',
          glyph: '∴',
        }
      case 'yolen':
        return {
          accent: 'rgba(200,180,100,0.1)',
          label: 'Yolen Collection',
          inkColor: 'rgba(200,180,100,0.2)',
          glyph: '⚔',
        }
      default:
        return {
          accent: 'rgba(80,60,40,0.06)',
          label: 'General Collection',
          inkColor: 'rgba(80,60,40,0.12)',
          glyph: '·',
        }
    }
  }, [planet])

  const charSpan = CHARACTER_SPANS.find((s) => s.id === character.id)
  const titles = charSpan?.titles ?? []
  const isAlive = charSpan?.isAlive ?? true

  const connections = useMemo(() => {
    const rels = CHARACTER_RELATIONSHIPS.filter((r) => r.characters.includes(character.id))
    return rels.map((r) => {
      const otherId = r.characters.find((id) => id !== character.id)!
      const label = r.label ?? RELATIONSHIP_LABELS[r.type as keyof typeof RELATIONSHIP_LABELS] ?? r.type
      return { otherId, label }
    })
  }, [character.id])

  const families = useMemo(() => {
    return FAMILY_TREES.filter((f) => f.members.some((m) => m.characterId === character.id))
  }, [character.id])

  return (
    <section id={`record-${character.id}`} className="mb-16" style={{ breakInside: 'avoid' }}>
      {/* Top ornamental divider */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-[2]" style={{ background: planetMotif.accent }} />
        <div className="h-px flex-[1]" style={{ background: planetMotif.accent }} />
        <span className="font-serif text-[8px]" style={{ color: planetMotif.inkColor }}>
          {planetMotif.glyph}
        </span>
        <div className="h-px flex-[1]" style={{ background: planetMotif.accent }} />
        <div className="h-px flex-[2]" style={{ background: planetMotif.accent }} />
      </div>

      {/* Header with portrait */}
      <div className="flex gap-8 mb-8">
        <div className="flex flex-col items-center shrink-0">
          <CharacterPortrait
            name={character.name}
            size={120}
            isDeceased={!isAlive}
            showCaption
            caption={isAlive ? 'Living subject' : 'Deceased'}
          />
          {planet && (
            <span
              className="font-serif text-[11px] uppercase tracking-[0.15em] mt-2.5 font-medium"
              style={{ color: `${planetColor}C0` }}
            >
              {planetName}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2
            className="font-serif font-bold leading-[1.1] tracking-[0.02em]"
            style={{ color: '#2d1a0e', fontSize: 'clamp(32px, 3.5vw, 52px)' }}
          >
            {character.name.toUpperCase()}
          </h2>
          {titles.length > 0 && (
            <p
              className="font-serif italic mt-2 leading-relaxed"
              style={{ color: 'rgba(80,60,40,0.55)', fontSize: 'clamp(15px, 1.3vw, 19px)' }}
            >
              {titles.join(', ')}
            </p>
          )}
          {character.pronunciation && (
            <p
              className="font-serif mt-2"
              style={{ color: 'rgba(80,60,40,0.3)', fontSize: 'clamp(11px, 0.9vw, 13px)' }}
            >
              /{character.pronunciation}/
            </p>
          )}

          {/* Planet + Status stamps */}
          <div className="flex gap-4 mt-4">
            <span
              className="font-serif text-[10px] uppercase tracking-[0.12em] px-3 py-1"
              style={{
                color: `${planetColor}`,
                border: '1px solid',
                borderColor: `${planetColor}30`,
                background: `${planetColor}08`,
              }}
              role="button"
              tabIndex={0}
              onClick={() => onNavigatePlanet(character.planet)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onNavigatePlanet(character.planet)
                }
              }}
            >
              {planetName}
            </span>
            <span
              className="font-serif text-[10px] uppercase tracking-[0.12em] px-3 py-1"
              style={{
                color: isAlive ? 'rgba(60,140,80,0.6)' : 'rgba(140,60,60,0.6)',
                border: '1px solid',
                borderColor: isAlive ? 'rgba(60,140,80,0.2)' : 'rgba(140,60,60,0.2)',
                background: isAlive ? 'rgba(60,140,80,0.04)' : 'rgba(140,60,60,0.04)',
              }}
            >
              {isAlive ? 'Living' : 'Deceased'}
            </span>
          </div>
        </div>
      </div>

      {/* Biography */}
      <div className="max-w-[42em] mb-8">
        <p
          className="font-serif leading-[1.85]"
          style={{ color: 'rgba(40,30,20,0.82)', fontSize: 'clamp(15px, 1.2vw, 20px)' }}
        >
          {character.description}
        </p>
      </div>

      <SectionDivider motif={planetMotif} />

      {/* Archival Record */}
      <div className="mb-8">
        <SectionHeading motif={planetMotif}>Archival Record</SectionHeading>
        <div className="space-y-[4px] ml-1">
          <RecordField label="Origin">
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
              className="cursor-pointer transition-opacity hover:opacity-70"
              style={{
                textDecoration: 'underline',
                textDecorationColor: `${planetColor}30`,
                textUnderlineOffset: '2px',
                color: planetColor,
              }}
            >
              {planetName}
            </span>
          </RecordField>
          <RecordField label="Classification">Biographical Record</RecordField>
          <RecordField label="Repository">{planetMotif.label}</RecordField>
          <RecordField label="Archive ID">{character.id.toUpperCase()}</RecordField>
          {families.length > 0 && (
            <RecordField label="House">
              {families.map((f, i) => (
                <span key={f.id}>
                  {i > 0 && <span style={{ color: 'rgba(80,60,40,0.25)' }}>; </span>}
                  {f.name}
                </span>
              ))}
            </RecordField>
          )}
          {charSpan && charSpan.birthYear != null && (
            <RecordField label="Birth">
              {charSpan.birthYear < 0 ? `${Math.abs(charSpan.birthYear)} FS` : `${charSpan.birthYear} FE`}
            </RecordField>
          )}
          {charSpan && charSpan.deathYear != null && (
            <RecordField label="Death">
              {charSpan.deathYear < 0 ? `${Math.abs(charSpan.deathYear)} FS` : `${charSpan.deathYear} FE`}
            </RecordField>
          )}
        </div>
      </div>

      {/* Investiture */}
      {systemMagicSystems.length > 0 && (
        <div className="mb-8">
          <SectionHeading motif={planetMotif}>Investiture</SectionHeading>
          <div className="flex flex-wrap gap-2 ml-1">
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
                className="font-serif text-[12px] italic cursor-pointer transition-opacity hover:opacity-70 px-3 py-1"
                style={{
                  color: 'rgba(60,40,25,0.55)',
                  border: '1px solid rgba(80,60,40,0.08)',
                  background: 'rgba(80,60,40,0.03)',
                }}
              >
                {ms.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Known Associates */}
      {connections.length > 0 && (
        <div className="mb-8">
          <SectionHeading motif={planetMotif}>Known Associates</SectionHeading>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 ml-1">
            {connections.slice(0, 8).map((conn) => {
              const otherChar = CHARACTER_SPANS.find((s) => s.id === conn.otherId)
              return (
                <div
                  key={conn.otherId}
                  className="flex flex-col items-center gap-1 py-2 px-2"
                  style={{ background: 'rgba(80,60,40,0.02)', border: '1px solid rgba(80,60,40,0.04)' }}
                >
                  <CharacterPortrait name={conn.otherId} size={52} isDeceased={otherChar?.isAlive === false} />
                  <span
                    className="font-serif text-[11px] text-center leading-tight font-medium"
                    style={{ color: 'rgba(60,40,25,0.6)' }}
                  >
                    {conn.otherId.charAt(0).toUpperCase() + conn.otherId.slice(1)}
                  </span>
                  <span className="font-serif text-[9px] italic" style={{ color: 'rgba(80,60,40,0.35)' }}>
                    {conn.label}
                  </span>
                </div>
              )
            })}
          </div>
          {connections.length > 8 && (
            <p className="font-serif text-[10px] italic mt-3 ml-1" style={{ color: 'rgba(80,60,40,0.25)' }}>
              + {connections.length - 8} further associates recorded (see Connections, Fol. 31–32)
            </p>
          )}
        </div>
      )}

      <SectionDivider motif={planetMotif} />

      {/* Scholarly Notes */}
      <div className="mb-7">
        <SectionHeading motif={planetMotif}>Scholarly Notes</SectionHeading>
        <div className="space-y-[4px] ml-1">
          <p className="font-serif text-[11px] italic leading-relaxed" style={{ color: 'rgba(100,80,60,0.5)' }}>
            Record preserved and catalogued by the Silverlight Archives. Classification verified.
          </p>
          <span
            role="button"
            tabIndex={0}
            onClick={() => onNavigateChapter('bloodlines')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onNavigateChapter('bloodlines')
              }
            }}
            className="block font-serif text-[11px] italic cursor-pointer transition-opacity hover:opacity-70"
            style={{
              color: 'rgba(80,60,40,0.35)',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(80,60,40,0.15)',
              textUnderlineOffset: '2px',
            }}
          >
            See Bloodlines — Fol. 28–30
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => onNavigateChapter('connections')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onNavigateChapter('connections')
              }
            }}
            className="block font-serif text-[11px] italic cursor-pointer transition-opacity hover:opacity-70"
            style={{
              color: 'rgba(80,60,40,0.35)',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(80,60,40,0.15)',
              textUnderlineOffset: '2px',
            }}
          >
            See Connections — Fol. 31–32
          </span>
        </div>
      </div>

      {/* Primary Sources */}
      <div className="mb-7">
        <SectionHeading motif={planetMotif}>Primary Sources</SectionHeading>
        <p
          className="font-serif leading-relaxed ml-1"
          style={{ color: 'rgba(60,40,25,0.65)', fontSize: 'clamp(12px, 0.95vw, 14px)' }}
        >
          {character.requiredBooks.length > 0 ? (
            character.requiredBooks.map((bookId, i) => (
              <span key={bookId}>
                {i > 0 && <span style={{ color: 'rgba(80,60,40,0.15)' }}>; </span>}
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
                  className="cursor-pointer transition-opacity hover:opacity-70"
                  style={{
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(80,60,40,0.12)',
                    textUnderlineOffset: '2px',
                  }}
                >
                  {bookId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </span>
            ))
          ) : (
            <span style={{ color: 'rgba(80,60,40,0.25)' }}>Unspecified</span>
          )}
        </p>
      </div>

      {/* Collection stamp */}
      <SectionDivider motif={planetMotif} />
      <div className="flex items-center gap-3 ml-1">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-[9px] uppercase tracking-[0.12em]"
          style={{ border: '1px solid rgba(80,60,40,0.12)', color: 'rgba(80,60,40,0.2)' }}
        >
          SA
        </div>
        <div>
          <p className="font-serif text-[9px] uppercase tracking-[0.1em]" style={{ color: 'rgba(80,60,40,0.2)' }}>
            Silverlight Archives — {planetMotif.label} · No. {character.id.toUpperCase()}
          </p>
          <p className="font-serif text-[9px] italic" style={{ color: 'rgba(80,60,40,0.12)' }}>
            Fol. 25–32 · Biographical Record · Preserved
          </p>
        </div>
      </div>
    </section>
  )
}

function RecordField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span
        className="font-serif text-[9px] uppercase tracking-[0.12em] shrink-0 text-right font-semibold"
        style={{ color: 'rgba(80,60,40,0.35)', minWidth: '85px' }}
      >
        {label}
      </span>
      <span
        className="font-serif leading-relaxed"
        style={{ color: 'rgba(60,40,25,0.7)', fontSize: 'clamp(12px, 0.95vw, 14px)' }}
      >
        {children}
      </span>
    </div>
  )
}
