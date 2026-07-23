import { useState, useEffect } from 'react'
import type { Character } from '@/types/character'
import type { FamilyMember } from '@/types/family'
import { getCharacterPortrait } from '@/utils'

interface Props {
  member: FamilyMember
  character: Character | null
  familyName: string
}

export function PortraitLabel({ member, character, familyName }: Props) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  const name = character?.name ?? member.name
  const url = getCharacterPortrait(name)
  const [imgErr, setImgErr] = useState(false)

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 10px)',
        left: '50%',
        transform: `translateX(-50%) scale(${visible ? 1 : 0.92})`,
        transformOrigin: 'bottom center',
        zIndex: 50,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease, transform 200ms cubic-bezier(0.23,1,0.32,1)',
        width: 'clamp(140px, 14vw, 190px)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #f5ede0 0%, #ede4d2 60%, #e8dcc8 100%)',
          border: '1px solid rgba(184,150,74,0.18)',
          borderRadius: 5,
          padding: '7px 9px 6px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Paper texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 5,
            opacity: 0.02,
            pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Portrait + Name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, position: 'relative' }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid rgba(184,150,74,0.2)',
              background: '#ede4d2',
              flexShrink: 0,
            }}
          >
            {!imgErr ? (
              <img
                src={url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setImgErr(true)}
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
                    fontSize: 9,
                    fontWeight: 700,
                    color: 'transparent',
                    background: 'linear-gradient(145deg, #d4b060, #b8964a)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                  }}
                >
                  {name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 'clamp(9px, 0.8vw, 10.5px)',
                fontWeight: 600,
                color: '#2d1a0e',
                lineHeight: 1.15,
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: 'clamp(7px, 0.6vw, 8px)',
                color: '#8a7a5a',
                fontStyle: 'italic',
                lineHeight: 1.2,
                marginTop: 1,
              }}
            >
              {familyName}
            </div>
          </div>
        </div>

        {/* Gold separator */}
        <div
          style={{
            height: 1,
            margin: '0 0 3px',
            background:
              'linear-gradient(90deg, transparent, rgba(184,150,74,0.2) 20%, rgba(184,150,74,0.2) 80%, transparent)',
          }}
        />

        {/* Meta */}
        <div
          style={{
            fontSize: 'clamp(7px, 0.58vw, 8px)',
            color: '#6a5a4a',
            lineHeight: 1.3,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            position: 'relative',
          }}
        >
          {character?.planet && <span>{character.planet}</span>}
          {character?.planet && member.isDeceased !== undefined && <span style={{ opacity: 0.3 }}>·</span>}
          <span>{member.isDeceased ? 'Deceased' : 'Alive'}</span>
        </div>
      </div>
      {/* Arrow */}
      <div
        style={{
          width: 0,
          height: 0,
          margin: '0 auto',
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '4px solid #ede4d2',
        }}
      />
    </div>
  )
}
