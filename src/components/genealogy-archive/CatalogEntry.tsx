import { useEffect, useState } from 'react'
import type { FamilyMember } from '@/types/family'
import type { Character } from '@/types/character'
import { getCharacterPortrait } from '@/utils'

interface Props {
  member: FamilyMember
  character: Character | null
  familyName: string
  parents: FamilyMember[]
  spouse: FamilyMember | null
  children: FamilyMember[]
  books: string[]
  onClose: () => void
}

export function CatalogEntry({ member, character, familyName, parents, spouse, children, books, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const portraitUrl = character ? getCharacterPortrait(character.name) : null
  const displayName = character?.name ?? member.name

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [member.id])

  return (
    <div
      style={{
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(16px)',
        fontFamily: 'serif',
        color: '#3a2a1a',
        maxWidth: 300,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Manuscript annotation — no box, no border, just a marginal note */}
      {/* Decorative heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ color: '#b8964a', fontSize: 12, lineHeight: 1 }}>❧</span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(184,150,74,0.25), transparent)' }} />
      </div>

      {/* Portrait + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1.5px solid #b8964a',
            flexShrink: 0,
            background: '#ede4d2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {portraitUrl && !imgErr ? (
            <img
              src={portraitUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <span style={{ fontSize: 14, color: '#3a2a1a', fontWeight: 600 }}>{displayName.charAt(0)}</span>
          )}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#2d1a0e', letterSpacing: '0.015em', lineHeight: 1.2 }}>
            {displayName}
          </div>
          <div style={{ fontSize: 9.5, color: '#8a7a5a', fontStyle: 'italic', marginTop: 1 }}>
            {familyName}
            {member.isDeceased ? ' · deceased' : ''}
          </div>
        </div>
      </div>

      {/* Annotation content */}
      {character?.description && (
        <div style={{ fontSize: 10, lineHeight: 1.55, color: '#5a4a3a', marginBottom: 6 }}>{character.description}</div>
      )}

      {/* Inline relationships — compact, prose-like */}
      <div style={{ fontSize: 9.5, color: '#5a4a3a', lineHeight: 1.6, marginBottom: 4 }}>
        {character?.planet && <span>Origin: {character.planet}.</span>}
        {parents.length > 0 && <span> Children of {parents.map((p) => p.name).join(' and ')}.</span>}
        {spouse && <span> Bonded to {spouse.name}.</span>}
        {children.length > 0 && <span> Parent of {children.map((c) => c.name).join(', ')}.</span>}
      </div>

      {books.length > 0 && (
        <div style={{ fontSize: 9, color: '#6a5a4a', fontStyle: 'italic', marginTop: 2 }}>
          Recorded in: {books.join(', ')}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: 8,
          fontSize: 6.5,
          color: 'rgba(58,42,26,0.12)',
          fontStyle: 'italic',
          letterSpacing: '0.06em',
        }}
      >
        — Silverlight Catalogue —
      </div>

      {/* Close */}
      <span
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          cursor: 'pointer',
          color: '#8a7a5a',
          fontSize: 10,
          fontFamily: 'serif',
          lineHeight: 1,
          opacity: 0.4,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.4'
        }}
      >
        ✕
      </span>
    </div>
  )
}
