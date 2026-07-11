import { useMemo, useCallback } from 'react'
import { Html } from '@react-three/drei'
import { DoubleSide } from 'three'
import type { Character } from '@/types/character'
import type { FamilyDefinition } from '@/types/family'
import { computeGenealogyLayout } from '@/utils/genealogy-layout'
import { getCharacterPortrait } from '@/utils/character-portrait'
import InteractiveGenealogyViewer from './InteractiveGenealogyViewer'
import GenealogySvgContent from './GenealogySvgContent'

const PAGE_W = 0.88
const PAGE_H = 0.52
const THICK = 0.003
const E = 0.001
const HTML_W = 960
const HTML_H = 650

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
}

function firstName(name: string): string {
  return name.split(' ')[0]!
}

export default function ParchmentModel3D({
  family,
  families,
  characters,
  charTitles,
  detailId,
  selectedId,
  onSelectCharacter,
  onSelectFamily,
}: Props) {
  const svgDimensions = useMemo(() => {
    const layout = computeGenealogyLayout(family, characters, charTitles)
    const rightW = Math.max(620, layout.svgW + 60)
    const docW = 300 + 28 + rightW + 24
    const treeH = Math.max(300, layout.svgH + 40) + 90
    const docH = treeH + 48
    return { w: docW, h: docH }
  }, [family, characters, charTitles])

  const handleCharacterClick = useCallback(
    (id: string) => {
      onSelectCharacter(id)
    },
    [onSelectCharacter],
  )

  const handleFamilyClick = useCallback(
    (id: string) => {
      onSelectFamily(id)
    },
    [onSelectFamily],
  )

  const distanceFactor = (400 * PAGE_W) / HTML_W

  // ── Annotation data ──
  const detailChar: Character | null = detailId ? (characters.get(detailId) ?? null) : null
  const detailMember = detailId ? (family.members.find((m) => m.characterId === detailId) ?? null) : null
  const shortName = detailMember ? firstName(detailMember.name) : null
  const descLines = useMemo(() => {
    if (!detailChar) return []
    const words = detailChar.description.split(' ')
    const lines: string[] = []
    let cur = ''
    const avgChar = 15 * 0.55
    const maxW = 500
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w
      if (test.length * avgChar > maxW && cur) {
        lines.push(cur)
        cur = w
      } else cur = test
    }
    if (cur) lines.push(cur)
    return lines
  }, [detailChar])
  const parentNames = detailMember?.parentIds ?? []
  const switchFamilies = useMemo(
    () =>
      detailId ? families.filter((f) => f.id !== family.id && f.members.some((m) => m.characterId === detailId)) : [],
    [detailId, families, family.id],
  )

  return (
    <group position={[0, 0.016, 0]}>
      {/* Single parchment page */}
      <mesh>
        <boxGeometry args={[PAGE_W, THICK, PAGE_H]} />
        <meshStandardMaterial color="#ddd0c0" roughness={0.9} metalness={0} side={DoubleSide} />
      </mesh>

      {/* Top surface */}
      <group position={[0, THICK / 2 + E, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[PAGE_W, PAGE_H]} />
          <meshStandardMaterial color="#e8dcc8" roughness={0.85} metalness={0} side={DoubleSide} />
        </mesh>
      </group>

      {/* Bottom edge */}
      <mesh position={[0, 0, -PAGE_H / 2]}>
        <planeGeometry args={[PAGE_W, THICK]} />
        <meshStandardMaterial color="#ddd0c0" roughness={0.9} metalness={0} />
      </mesh>

      {/* Right edge */}
      <mesh position={[PAGE_W / 2, 0, 0]}>
        <planeGeometry args={[THICK, PAGE_H]} />
        <meshStandardMaterial color="#ddd0c0" roughness={0.9} metalness={0} />
      </mesh>

      {/* ── HTML overlay with SVG + annotation ── */}
      <Html
        transform
        position={[0, THICK / 2 + 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        distanceFactor={distanceFactor}
        style={{ width: `${HTML_W}px`, height: `${HTML_H}px` }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#f5efe6',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <InteractiveGenealogyViewer contentWidth={svgDimensions.w} contentHeight={svgDimensions.h}>
            <GenealogySvgContent
              family={family}
              families={families}
              characters={characters}
              charTitles={charTitles}
              selectedId={selectedId}
              onCharacterClick={handleCharacterClick}
              onFamilyClick={handleFamilyClick}
            />
          </InteractiveGenealogyViewer>

          {/* ── Annotation overlay (right side only — never covers left index) ── */}
          {detailId && detailChar && detailMember && shortName && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '340px',
                right: '8px',
                background: 'rgba(248,243,234,0.96)',
                border: '0.5px solid rgba(196,184,160,0.3)',
                borderRadius: '2px',
                padding: '12px 16px',
                fontFamily: 'Georgia, serif',
                fontSize: '15px',
                color: '#6b5a4a',
                minHeight: '140px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {/* Portrait — initial letter behind image, only visible on error */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    border: '1.5px solid #c4a86a',
                    flexShrink: 0,
                    overflow: 'hidden',
                    background: '#f5efe6',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#8a7050' }}>
                    {detailChar.name.charAt(0).toUpperCase()}
                  </span>
                  <img
                    src={getCharacterPortrait(detailChar.name)}
                    alt=""
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 1,
                    }}
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#1a0e06', marginBottom: '4px' }}>
                    {shortName.toUpperCase()}
                    {detailMember.isDeceased && (
                      <span style={{ fontSize: '12px', color: '#8a7050', marginLeft: '6px' }}>†</span>
                    )}
                  </div>
                  {descLines.map((line, i) => (
                    <div key={i} style={{ marginBottom: '2px', lineHeight: 1.45 }}>
                      {line}
                    </div>
                  ))}
                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#7a6a5a' }}>
                    {parentNames.length > 0 && <div>{parentNames.join(' & ')} — Progenitors</div>}
                    {detailMember.spouseId && <div>{detailMember.spouseId} — Bonded</div>}
                  </div>
                  {switchFamilies.length > 0 && (
                    <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {switchFamilies.map((sf) => (
                        <button
                          key={sf.id}
                          onClick={() => onSelectFamily(sf.id)}
                          style={{
                            background: 'none',
                            border: '0.5px solid rgba(196,184,160,0.5)',
                            borderRadius: '2px',
                            padding: '3px 10px',
                            fontFamily: 'Georgia, serif',
                            fontSize: '13px',
                            color: '#7a6a5a',
                            cursor: 'pointer',
                          }}
                        >
                          Also in {sf.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}
