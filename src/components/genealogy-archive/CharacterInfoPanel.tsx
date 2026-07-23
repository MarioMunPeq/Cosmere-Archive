import { useState } from 'react'
import type { Character } from '@/types/character'
import type { FamilyMember } from '@/types/family'
import { getCharacterPortrait } from '@/utils'
import { bookIdToTitle } from '@/utils/book-title'

interface Props {
  member: FamilyMember
  character: Character | null
  familyName: string
  parents: FamilyMember[]
  spouse: FamilyMember | null
  children: FamilyMember[]
  siblings: FamilyMember[]
  books: string[]
  onSelectMember: (memberId: string) => void
}

function InfoMedallion({ name, isDeceased, onClick }: { name: string; isDeceased?: boolean; onClick: () => void }) {
  const [err, setErr] = useState(false)
  const url = getCharacterPortrait(name)
  const initial = name
    .replace(/^(?:King|Queen|Lord|Lady|Prince|Princess|Highprince)\s+/i, '')
    .charAt(0)
    .toUpperCase()

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'transform 250ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #d4b060, #b8964a 40%, #9a7e3a 70%, #d4b060)',
          padding: 1.2,
        }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#ede4d2' }}>
          {!err ? (
            <img
              src={url}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setErr(true)}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 40% 35%, #ede4d2, #d4c8b6)',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'transparent',
                  background: 'linear-gradient(145deg, #d4b060, #b8964a)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                }}
              >
                {initial}
              </span>
            </div>
          )}
        </div>
      </div>
      {isDeceased && (
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.15 }} viewBox="0 0 100 100">
          <line x1="30" y1="30" x2="70" y2="70" stroke="#5a4a3a" strokeWidth="2" strokeLinecap="round" />
          <line x1="70" y1="30" x2="30" y2="70" stroke="#5a4a3a" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </div>
  )
}

function RelRow({
  label,
  members,
  onSelect,
}: {
  label: string
  members: FamilyMember[]
  onSelect: (id: string) => void
}) {
  if (members.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        <span style={labelStyle}>{label}</span>
        <span style={{ fontSize: 'clamp(9px, 0.8vw, 11px)', color: '#8a7a5a', fontStyle: 'italic' }}>—</span>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <span style={labelStyle}>{label}</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {members.map((m) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <InfoMedallion name={m.name} isDeceased={m.isDeceased} onClick={() => onSelect(m.id)} />
            <span
              style={{
                fontSize: 'clamp(9px, 0.8vw, 11px)',
                color: '#3a2a1a',
                textDecoration: m.isDeceased ? 'line-through' : 'none',
                opacity: m.isDeceased ? 0.45 : 0.75,
              }}
            >
              {m.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 'clamp(7px, 0.65vw, 9px)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#8a7a5a',
  fontWeight: 500,
  minWidth: 60,
  flexShrink: 0,
}

export function CharacterInfoPanel({
  member,
  character,
  familyName,
  parents,
  spouse,
  children,
  siblings,
  books,
  onSelectMember,
}: Props) {
  const displayName = character?.name ?? member.name

  return (
    <div
      style={{
        fontFamily: 'serif',
        color: '#3a2a1a',
        borderTop: '1px solid rgba(184,150,74,0.10)',
        paddingTop: 'clamp(8px, 1vh, 14px)',
      }}
    >
      {/* Ornament divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'clamp(6px, 0.6vh, 10px)' }}>
        <span style={{ color: '#b8964a', fontSize: 9, lineHeight: 1, opacity: 0.4 }}>❧</span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(184,150,74,0.12), transparent)' }} />
      </div>

      {/* Name */}
      <h3
        style={{
          fontSize: 'clamp(14px, 1.3vw, 17px)',
          fontWeight: 600,
          color: '#2d1a0e',
          margin: 0,
          letterSpacing: '0.01em',
          lineHeight: 1.2,
        }}
      >
        {displayName}
      </h3>

      {/* Meta line */}
      <div
        style={{
          fontSize: 'clamp(8px, 0.75vw, 10px)',
          color: '#8a7a5a',
          fontStyle: 'italic',
          marginTop: 2,
          marginBottom: 'clamp(6px, 0.6vh, 10px)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <span>{familyName}</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>{member.isDeceased ? 'Deceased' : 'Alive'}</span>
        {character?.planet && (
          <>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>{character.planet}</span>
          </>
        )}
      </div>

      {/* Description */}
      {character?.description ? (
        <p
          style={{
            fontSize: 'clamp(9.5px, 0.8vw, 11.5px)',
            lineHeight: 1.6,
            color: '#5a4a3a',
            margin: '0 0 6px 0',
            maxWidth: 460,
          }}
        >
          {character.description}
        </p>
      ) : (
        <p
          style={{ fontSize: 'clamp(9px, 0.75vw, 10.5px)', color: '#8a7a5a', fontStyle: 'italic', margin: '0 0 6px 0' }}
        >
          No archival record survives for this individual.
        </p>
      )}

      {/* Relationships */}
      <RelRow label="Parents" members={parents} onSelect={onSelectMember} />
      <RelRow label="Partner" members={spouse ? [spouse] : []} onSelect={onSelectMember} />
      <RelRow label="Children" members={children} onSelect={onSelectMember} />
      <RelRow label="Siblings" members={siblings} onSelect={onSelectMember} />

      {/* Books */}
      {books.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <div style={{ height: 1, background: 'rgba(58,42,26,0.04)', margin: '4px 0 5px' }} />
          <span style={labelStyle}>Appears in</span>
          <div style={{ fontSize: 'clamp(9px, 0.75vw, 10.5px)', color: '#5a4a3a', lineHeight: 1.7, paddingLeft: 68 }}>
            {books.map((b) => (
              <div key={b} style={{ fontStyle: 'italic' }}>
                {bookIdToTitle(b)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 8,
          fontSize: 'clamp(6px, 0.55vw, 7.5px)',
          color: 'rgba(58,42,26,0.08)',
          fontStyle: 'italic',
          letterSpacing: '0.05em',
          textAlign: 'center',
        }}
      >
        — Silverlight Catalogue —
      </div>
    </div>
  )
}
