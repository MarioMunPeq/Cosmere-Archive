import { useMemo } from 'react'
import type { FamilyDefinition } from '@/types/family'
import type { Character } from '@/types/character'
import { bookIdToTitle } from '@/utils/book-title'

interface Props {
  family: FamilyDefinition
  families: FamilyDefinition[]
  charMap: Map<string, Character>
  onSwitchFamily: (id: string) => void
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

export function HouseArchiveEntry({ family, families, charMap, onSwitchFamily }: Props) {
  const color = family.color ?? '#b8964a'
  const initial = family.name.charAt(0)
  const displayName = family.name.slice(1)

  const meta = useMemo(() => {
    const bookSet = new Set<string>()
    let planet = ''
    let region = ''
    let count = 0
    let living = 0
    const placeholderIds = new Set(['kholin_house', 'survivor_circle', 'sel_crowns', 'lord_harms'])

    for (const m of family.members) {
      if (placeholderIds.has(m.id)) continue
      count++
      if (!m.isDeceased) living++
      if (!planet && m.characterId) {
        const c = charMap.get(m.characterId)
        if (c) {
          planet = c.planet
          const regionMatch = c.description.match(/(?:of|from|in) ([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/)
          if (regionMatch) region = regionMatch[1]!
        }
        if (!planet) {
          const regionMatch2 = family.description.match(/(?:of|from|in) ([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/)
          if (regionMatch2) region = regionMatch2[1]!
        }
      }
      if (m.characterId) {
        const c = charMap.get(m.characterId)
        if (c) for (const b of c.requiredBooks) bookSet.add(b)
      }
    }
    return { planet, region, count, living, books: [...bookSet] }
  }, [family, charMap])

  return (
    <div style={{ fontFamily: 'serif', color: '#3a2a1a', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ═══ TOP HALF — Bloodline Presentation ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 4px' }}>
        {/* Decorative initial + house title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 16 }}>
          <span
            style={{
              fontSize: 'clamp(56px, 7vw, 80px)',
              fontWeight: 700,
              lineHeight: 0.78,
              color,
              opacity: 0.35,
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {initial}
          </span>
          <div style={{ paddingTop: 4 }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 3.8vw, 42px)',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#2d1a0e',
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              {displayName}
            </h2>
          </div>
        </div>

        {/* Short description */}
        {family.description && (
          <p
            style={{
              fontSize: 'clamp(12.5px, 1.1vw, 15px)',
              color: '#5a4a3a',
              lineHeight: 1.8,
              margin: '0 0 16px',
              maxWidth: '90%',
              textIndent: 16,
            }}
          >
            {family.description}
          </p>
        )}

        {/* Compact metadata row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            gap: '3px 6px',
            fontSize: 'clamp(11px, 0.9vw, 13px)',
            color: '#8a7a5a',
            lineHeight: 1.6,
          }}
        >
          {meta.region && <span>{meta.region}</span>}
          {meta.region && meta.planet && <span style={{ opacity: 0.3 }}>·</span>}
          {meta.planet && <span>{meta.planet}</span>}
          {meta.planet && <span style={{ opacity: 0.3 }}>·</span>}
          <span>
            {meta.count} {meta.count === 1 ? 'member' : 'members'}
          </span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span>{meta.living} alive</span>
          {meta.books.length > 0 && (
            <>
              <span style={{ opacity: 0.3, marginLeft: 4 }}>·</span>
              <span style={{ fontStyle: 'italic', marginLeft: 4 }}>
                Appears in:{' '}
                {meta.books.map((b, i) => (
                  <span key={b}>
                    {i > 0 && i < meta.books.length - 1 ? ', ' : i > 0 ? ' & ' : ''}
                    {bookIdToTitle(b)}
                  </span>
                ))}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ═══ DIVIDER ═══ */}
      <div
        style={{
          height: 1,
          flexShrink: 0,
          background: `linear-gradient(90deg, ${color}25, ${color}10 50%, transparent)`,
          margin: '0 0 20px',
        }}
      />

      {/* ═══ BOTTOM HALF — Bloodlines Index ═══ */}
      <div style={{ flexShrink: 0, paddingBottom: 8 }}>
        <p
          style={{
            fontSize: 'clamp(9px, 0.72vw, 10.5px)',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: '#b8a080',
            margin: '0 0 14px',
            fontWeight: 600,
          }}
        >
          Bloodlines Index
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {families.map((f, idx) => {
            const isActive = f.id === family.id
            const fColor = f.color ?? '#b8964a'

            return (
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderBottom: '1px solid rgba(80,60,40,0.04)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(184,150,74,0.03)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {/* Left indicator */}
                {isActive && (
                  <span
                    style={{
                      width: 3,
                      height: 'clamp(16px, 1.8vw, 22px)',
                      borderRadius: 2,
                      flexShrink: 0,
                      background: fColor,
                      boxShadow: `0 0 8px ${fColor}40`,
                    }}
                  />
                )}

                {/* Roman numeral */}
                <span
                  style={{
                    fontSize: isActive ? 'clamp(16px, 1.4vw, 20px)' : 'clamp(13px, 1.1vw, 16px)',
                    fontWeight: 700,
                    color: isActive ? fColor : '#b8a080',
                    width: 28,
                    textAlign: 'right',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    textShadow: isActive ? `0 0 12px ${fColor}30` : 'none',
                  }}
                >
                  {ROMAN[idx]}
                </span>

                {/* Dot */}
                <span
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: isActive ? fColor : '#b8a080',
                    opacity: isActive ? 0.7 : 0.25,
                    transition: 'all 0.2s ease',
                  }}
                />

                {/* Family name */}
                <span
                  style={{
                    fontSize: isActive ? 'clamp(15px, 1.3vw, 18px)' : 'clamp(13px, 1.1vw, 15px)',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#2d1a0e' : '#8a7a5a',
                    flex: 1,
                    minWidth: 0,
                    transition: 'all 0.2s ease',
                    textShadow: isActive ? `0 0 20px ${fColor}15` : 'none',
                  }}
                >
                  {f.name}
                </span>

                {/* Member count */}
                <span
                  style={{
                    fontSize: 'clamp(10px, 0.82vw, 12px)',
                    color: isActive ? '#8a7a5a' : '#c8b8a0',
                    flexShrink: 0,
                  }}
                >
                  {
                    f.members.filter(
                      (m) => !['kholin_house', 'survivor_circle', 'sel_crowns', 'lord_harms'].includes(m.id),
                    ).length
                  }
                </span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
