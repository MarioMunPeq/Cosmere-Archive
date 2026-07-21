import { useMemo } from 'react'
import type { FamilyDefinition } from '@/types/family'
import type { Character } from '@/types/character'

interface Props {
  family: FamilyDefinition
  families: FamilyDefinition[]
  characters: Character[]
  charMap: Map<string, Character>
  onSwitchFamily: (id: string) => void
}

function familyProse(
  family: FamilyDefinition,
  chars: Map<string, Character>,
): {
  kingdom: string
  era: string
  notableCount: number
  books: string[]
  houseWords: string
} {
  const members = family.members
  const notable: string[] = []
  const bookSet = new Set<string>()
  let kingdom = ''

  for (const m of members) {
    if (!m.characterId) continue
    const c = chars.get(m.characterId)
    if (c) {
      if (c.description) {
        const match = c.description.match(/(?:king|queen|ruler|lord|lady|prince|princess|highprince|highprincess)/i)
        if (match && !notable.includes(c.name)) notable.push(c.name)
      }
      for (const b of c.requiredBooks) bookSet.add(b)
    }
  }

  const kingdomMatch = family.description.match(/(?:of|from) ([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/)
  if (kingdomMatch) kingdom = kingdomMatch[1]!

  return {
    kingdom,
    era: 'Era unknown',
    notableCount: notable.length,
    books: [...bookSet].slice(0, 4),
    houseWords: kingdom ? `the ${kingdom}` : 'distant lands',
  }
}

export function HouseArchiveEntry({ family, families, charMap, onSwitchFamily }: Props) {
  const prose = useMemo(() => familyProse(family, charMap), [family, charMap])
  const initial = family.name.charAt(0).toUpperCase()
  const color = family.color ?? '#b8964a'
  const memberCount = family.members.length
  const livingCount = family.members.filter((m) => !m.isDeceased).length

  const importantFigures = useMemo(() => {
    return family.members
      .filter((m) => m.characterId && charMap.has(m.characterId))
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        name: charMap.get(m.characterId!)?.name ?? m.name,
        isDeceased: m.isDeceased ?? false,
      }))
  }, [family, charMap])

  return (
    <div style={{ fontFamily: 'serif', color: '#3a2a1a', lineHeight: 1.7 }}>
      {/* Illuminated initial */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 0.85,
            fontFamily: 'serif',
            color,
            opacity: 0.7,
            float: 'left',
            marginRight: 6,
            marginTop: 2,
          }}
        >
          {initial}
        </span>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#2d1a0e',
              letterSpacing: '0.02em',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {family.name}
          </h2>
          {family.description && (
            <p
              style={{
                fontSize: 10.5,
                color: '#6a5a4a',
                fontStyle: 'italic',
                margin: '4px 0 0 0',
                lineHeight: 1.4,
              }}
            >
              {family.description}
            </p>
          )}
        </div>
      </div>

      {/* Decorative divider */}
      <div
        style={{
          width: '100%',
          height: 1,
          background: `linear-gradient(90deg, ${color}40, transparent)`,
          marginBottom: 16,
        }}
      />

      {/* Flowing prose — the archive entry */}
      <div style={{ fontSize: 11.5, color: '#4a3a2a', lineHeight: 1.75 }}>
        <p style={{ margin: '0 0 10px 0', textIndent: 12 }}>
          The house of <strong style={{ fontWeight: 600 }}>{family.name}</strong> is recorded in the Silverlight
          Archives as a lineage of {memberCount} souls, of whom {livingCount} yet draw breath in the mortal realm.
          {prose.kingdom && (
            <>
              {' '}
              Their dominion is known as <em>{prose.kingdom}</em>.
            </>
          )}{' '}
          Their bloodline spans the Cosmere, their name etched in the annals of history.
        </p>

        {prose.books.length > 0 && (
          <p style={{ margin: '0 0 10px 0', textIndent: 12 }}>
            References to this house appear in the volumes of{' '}
            {prose.books.map((b, i) => (
              <span key={b}>
                {i > 0 && i < prose.books.length - 1 ? ', ' : i > 0 ? ' and ' : ''}
                <em>{b}</em>
              </span>
            ))}
            , preserved within the archival collections of Silverlight.
          </p>
        )}

        {importantFigures.length > 0 && (
          <>
            <p style={{ margin: '0 0 8px 0', textIndent: 12 }}>Among its number are counted:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 20, marginBottom: 12 }}>
              {importantFigures.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: f.isDeceased ? 0.55 : 0.85,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `0.5px solid ${color}50`,
                      background: '#ede4d2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 8, fontWeight: 600, color: '#3a2a1a' }}>{f.name.charAt(0)}</span>
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#3a2a1a',
                      textDecoration: f.isDeceased ? 'line-through' : 'none',
                      fontStyle: f.isDeceased ? 'italic' : 'normal',
                    }}
                  >
                    {f.name}
                    {f.isDeceased && <span style={{ color: '#8a7a5a', marginLeft: 3 }}>†</span>}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <p style={{ margin: '12px 0 0 0', fontSize: 10, color: '#6a5a4a', fontStyle: 'italic', textIndent: 12 }}>
          This record is preserved within the genealogical archives of the Silverlight Athenaeum. The reader is directed
          to the opposite page, where the bloodline is rendered in full illustration.
        </p>
      </div>

      {/* Decorative divider */}
      <div
        style={{
          width: 48,
          height: 1,
          background: `linear-gradient(90deg, ${color}40, transparent)`,
          margin: '16px 0',
        }}
      />

      {/* Other houses — like a marginal cross-reference */}
      <div>
        <p
          style={{
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#8a7a5a',
            margin: '0 0 6px 0',
            fontWeight: 500,
          }}
        >
          Other houses recorded
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {families
            .filter((f) => f.id !== family.id)
            .map((f) => (
              <span
                key={f.id}
                role="button"
                tabIndex={0}
                onClick={() => onSwitchFamily(f.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSwitchFamily(f.id)
                  }
                }}
                style={{
                  fontSize: 10,
                  color: '#8a7a5a',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  fontStyle: 'italic',
                  padding: '1px 0',
                  display: 'inline-block',
                  width: 'fit-content',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#3a2a1a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8a7a5a'
                }}
              >
                {f.name} →
              </span>
            ))}
        </div>
      </div>

      {/* Subtle archive footer */}
      <div
        style={{
          marginTop: 20,
          fontSize: 7,
          color: 'rgba(58,42,26,0.1)',
          fontStyle: 'italic',
          letterSpacing: '0.05em',
        }}
      >
        — Silverlight Archives —
      </div>
    </div>
  )
}
