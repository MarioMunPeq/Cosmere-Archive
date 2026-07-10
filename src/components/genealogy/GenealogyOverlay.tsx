import { useMemo, useCallback } from 'react'
import { FAMILY_TREES } from '@/data/static/family-data'
import GenealogyTree from './GenealogyTree'
import CharacterPortrait from './CharacterPortrait'
import type { Character } from '@/types/character'
import type { FamilyDefinition } from '@/types/family'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const

interface Props {
  family: FamilyDefinition
  families: FamilyDefinition[]
  characters: Map<string, Character>
  charTitles: Map<string, string[]>
  detailId: string | null
  selectedId: string | null
  onSelectCharacter: (id: string) => void
  onSelectFamily: (id: string) => void
  onCloseDetail: () => void
  pageW: number
  totalW: number
}

export default function GenealogyOverlay({
  family,
  families,
  characters,
  charTitles,
  detailId,
  selectedId,
  onSelectCharacter,
  onSelectFamily,
  onCloseDetail,
  pageW,
  totalW,
}: Props) {
  const leftPct = (pageW / totalW) * 100
  const rightPct = (pageW / totalW) * 100
  const gutterPct = 100 - leftPct - rightPct

  const selectedIndex = families.findIndex((f) => f.id === family.id)

  const detailChar = detailId ? (characters.get(detailId) ?? null) : null
  const detailMember = detailId ? (family.members.find((m) => m.characterId === detailId) ?? null) : null

  const crossTrees = useMemo(() => {
    if (!detailId) return []
    const result: { id: string; name: string }[] = []
    for (const f of FAMILY_TREES) {
      if (f.id !== family.id && f.members.some((m) => m.characterId === detailId)) {
        result.push({ id: f.id, name: f.name })
      }
    }
    return result
  }, [detailId, family.id])

  const handleFamilySelect = useCallback(
    (id: string) => {
      onSelectFamily(id)
    },
    [onSelectFamily],
  )

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily: "'Cormorant Garamond','Georgia',serif",
        color: '#1a0e06',
        cursor: 'default',
        userSelect: 'text',
        lineHeight: 1.4,
      }}
    >
      {/* ── LEFT PAGE — ARCHIVE INDEX ── */}
      <div
        style={{
          width: `${leftPct}%`,
          height: '100%',
          padding: '56px 32px 40px 36px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '0.5px solid rgba(180,165,140,0.25)',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Running head */}
        <div style={{ textAlign: 'center', marginBottom: 40, flexShrink: 0 }}>
          <p style={{ fontSize: 16, letterSpacing: '0.3em', color: '#8a7a6a', textTransform: 'uppercase', margin: 0 }}>
            Archives of Bloodlines
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 5 }}>
            <span
              style={{
                height: 1,
                width: 16,
                background: 'linear-gradient(90deg, transparent, #8a7050)',
                opacity: 0.25,
              }}
            />
            <svg width="4" height="4" viewBox="0 0 4 4" style={{ fill: '#8a7050', opacity: 0.25 }}>
              <polygon points="2,0 4,2 2,4 0,2" />
            </svg>
            <span
              style={{
                height: 1,
                width: 16,
                background: 'linear-gradient(90deg, #8a7050, transparent)',
                opacity: 0.25,
              }}
            />
          </div>
        </div>

        {/* Family entries */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {families.map((f, i) => {
            const isActive = f.id === family.id
            return (
              <div
                key={f.id}
                onClick={() => handleFamilySelect(f.id)}
                style={{
                  padding: '10px 0',
                  cursor: 'pointer',
                  opacity: 1,
                  transition: 'opacity 0.3s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.opacity = '0.75'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.opacity = '1'
                }}
              >
                {/* Active flourish */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: -28,
                      top: 12,
                      bottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" style={{ fill: '#8a7050', opacity: 0.3 }}>
                      <path d="M1,1 Q5,0 9,3 Q10,5 8,8 Q5,10 2,8 Q0,6 1,3 L1,1" />
                    </svg>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                  <span
                    style={{
                      fontSize: 18,
                      letterSpacing: '0.15em',
                      color: isActive ? '#8a7050' : '#a09080',
                      minWidth: 16,
                      paddingTop: 1,
                      flexShrink: 0,
                    }}
                  >
                    {ROMAN[i] ?? `${i + 1}`}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 19,
                        fontWeight: 600,
                        letterSpacing: '0.07em',
                        color: isActive ? '#1a0e06' : '#5a4a3a',
                        margin: 0,
                        transition: 'color 0.3s',
                      }}
                    >
                      {f.name.toUpperCase()}
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        fontStyle: 'italic',
                        color: isActive ? '#6b5a4a' : '#8a7a6a',
                        margin: '1px 0 0 0',
                        transition: 'color 0.3s',
                        lineHeight: 1.3,
                      }}
                    >
                      {f.description}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        letterSpacing: '0.15em',
                        color: '#a09080',
                        margin: '2px 0 0 0',
                        textTransform: 'uppercase',
                      }}
                    >
                      {f.members.length} recorded
                    </p>
                  </div>
                </div>

                {/* Ink separator */}
                {isActive && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 8,
                      marginLeft: 42,
                    }}
                  >
                    <svg
                      width="6"
                      height="6"
                      viewBox="0 0 6 6"
                      style={{ fill: '#8a7050', opacity: 0.2, flexShrink: 0 }}
                    >
                      <path d="M1,1 Q4,0 5,3 Q5.5,4 4,5 Q2.5,6 1,5 Q0,4 1,2 L1,1" />
                    </svg>
                    <span
                      style={{
                        height: 1,
                        flex: 1,
                        background: 'linear-gradient(90deg, #8a7050 0%, transparent 100%)',
                        opacity: 0.15,
                      }}
                    />
                  </div>
                )}

                {!isActive && i < families.length - 1 && (
                  <div
                    style={{
                      height: 1,
                      background: 'linear-gradient(90deg, #d4c8b0 0%, transparent 100%)',
                      margin: '4px 0 4px 42px',
                      opacity: 0.35,
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Page number */}
        <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: 8, flexShrink: 0 }}>
          <p style={{ fontSize: 14, letterSpacing: '0.2em', color: '#8a7a6a', margin: 0 }}>— {selectedIndex + 1} —</p>
        </div>
      </div>

      {/* ── GUTTER ── */}
      <div
        style={{
          width: `${gutterPct}%`,
          height: '100%',
          background: 'linear-gradient(90deg, rgba(0,0,0,0.02), rgba(255,255,255,0.01), rgba(0,0,0,0.02))',
          flexShrink: 0,
        }}
      />

      {/* ── RIGHT PAGE — GENEALOGY ── */}
      <div
        style={{
          width: `${rightPct}%`,
          height: '100%',
          padding: '56px 32px 40px 32px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Heading ornament */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexShrink: 0 }}>
          <svg width="5" height="5" viewBox="0 0 5 5" style={{ fill: '#8a7050', opacity: 0.25, flexShrink: 0 }}>
            <polygon points="2.5,0 5,2.5 2.5,5 0,2.5" />
          </svg>
          <span
            style={{
              height: 1,
              flex: 1,
              background: 'linear-gradient(90deg, #8a7050 0%, transparent 100%)',
              opacity: 0.18,
            }}
          />
          <svg width="3" height="3" viewBox="0 0 3 3" style={{ fill: '#8a7050', opacity: 0.15, flexShrink: 0 }}>
            <polygon points="1.5,0 3,1.5 1.5,3 0,1.5" />
          </svg>
          <span
            style={{
              height: 1,
              flex: 1,
              background: 'linear-gradient(90deg, transparent 0%, #8a7050 100%)',
              opacity: 0.18,
            }}
          />
          <svg width="5" height="5" viewBox="0 0 5 5" style={{ fill: '#8a7050', opacity: 0.25, flexShrink: 0 }}>
            <polygon points="2.5,0 5,2.5 2.5,5 0,2.5" />
          </svg>
        </div>

        {/* Family title */}
        <h1
          style={{
            fontSize: 40,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textAlign: 'center',
            color: '#1a0e06',
            margin: 0,
            textShadow: '0 0.3px 0 #d4c8b0',
            flexShrink: 0,
          }}
        >
          {family.name.toUpperCase()}
        </h1>
        <p
          style={{
            fontSize: 16,
            textAlign: 'center',
            color: '#6b5a4a',
            margin: '1px 0 4px 0',
            fontStyle: 'italic',
            flexShrink: 0,
          }}
        >
          {family.description}
        </p>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexShrink: 0 }}>
          <span
            style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, #8a7050)', opacity: 0.12 }}
          />
          <svg width="3" height="3" viewBox="0 0 3 3" style={{ fill: '#8a7050', opacity: 0.2, flexShrink: 0 }}>
            <polygon points="1.5,0 3,1.5 1.5,3 0,1.5" />
          </svg>
          <span
            style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, #8a7050, transparent)', opacity: 0.12 }}
          />
        </div>

        {/* Genealogy tree */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }} key={family.id}>
          <GenealogyTree
            family={family}
            characters={characters}
            charTitles={charTitles}
            visible
            onSelectCharacter={onSelectCharacter}
            selectedId={selectedId}
          />
        </div>

        {/* Character annotation — ink writing effect */}
        {detailChar && detailMember && (
          <CharacterAnnotation
            key={detailId}
            character={detailChar}
            member={detailMember}
            charMap={characters}
            crossTrees={crossTrees}
            onClose={onCloseDetail}
            onSwitchFamily={onSelectFamily}
          />
        )}
      </div>
    </div>
  )
}

/* ── INK ANNOTATION ── */

interface AnnotationProps {
  character: Character
  member: { name: string; isDeceased?: boolean; parentIds?: string[]; spouseId?: string }
  charMap: Map<string, Character>
  crossTrees: { id: string; name: string }[]
  onClose: () => void
  onSwitchFamily: (id: string) => void
}

function CharacterAnnotation({ character, member, charMap, crossTrees, onClose, onSwitchFamily }: AnnotationProps) {
  const parentNames = member.parentIds ? member.parentIds.map((pid) => charMap.get(pid)?.name ?? pid) : []
  const spouseName = member.spouseId ? (charMap.get(member.spouseId)?.name ?? member.spouseId) : undefined

  return (
    <div
      style={{
        marginTop: 8,
        padding: '12px 16px',
        background: [
          'radial-gradient(ellipse 50% 30% at 20% 20%, rgba(139,119,90,0.02) 0%, transparent 60%)',
          'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139,119,90,0.006) 2px, rgba(139,119,90,0.006) 3px)',
          'linear-gradient(180deg, #f8f3ea 0%, #f0e8dc 100%)',
        ].join(', '),
        border: '0.5px solid rgba(196,184,160,0.35)',
        borderRadius: 1,
        fontSize: 7.5,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        flexShrink: 0,
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <CharacterPortrait name={member.name} size={64} isDeceased={member.isDeceased} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: '0.06em',
              color: '#1a0e06',
              animation: 'ink-reveal 400ms ease-out both',
            }}
          >
            {member.name.toUpperCase()}
            {member.isDeceased && <span style={{ color: '#8a7050', marginLeft: 3, fontSize: 8 }}>†</span>}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8a7a6a',
              fontSize: 16,
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <p
          style={{
            margin: '2px 0 0 0',
            color: '#5a4a3a',
            lineHeight: 1.5,
            fontSize: 14,
            animation: 'ink-reveal 500ms ease-out 150ms both',
          }}
        >
          {character.description}
        </p>
        <div
          style={{
            marginTop: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2px 12px',
            color: '#7a6a5a',
            fontSize: 13,
            animation: 'ink-reveal 600ms ease-out 300ms both',
          }}
        >
          {parentNames.length > 0 && <span>{parentNames.join(' & ')} — Progenitors</span>}
          {spouseName && <span>{spouseName} — Bonded</span>}
        </div>
        {crossTrees.length > 0 && (
          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {crossTrees.map((t, i) => (
              <button
                key={t.id}
                onClick={() => onSwitchFamily(t.id)}
                style={{
                  border: '0.5px solid #c4b8a0',
                  background: 'none',
                  padding: '2px 8px',
                  fontSize: 12,
                  letterSpacing: '0.05em',
                  color: '#6b5a4a',
                  cursor: 'pointer',
                  fontFamily: "'Cormorant Garamond','Georgia',serif",
                  animation: `ink-reveal 500ms ease-out ${450 + i * 100}ms both`,
                }}
              >
                Also in {t.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
