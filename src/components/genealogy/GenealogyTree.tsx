import { useMemo } from 'react'
import type { FamilyDefinition, FamilyMember } from '@/types/family'
import type { Character } from '@/types/character'
import { getCharacterPortrait } from '@/utils'
import GenealogyConnections from './GenealogyConnections'

const NODE_D = 56
const SPOUSE_GAP = 24
const GEN_GAP = 130
const SIB_GAP = 56
const PAD = 60

const FONT_SIZE_NAME = 14
const FONT_SIZE_TITLE = 11

interface Position {
  x: number
  y: number
}

interface Props {
  family: FamilyDefinition
  characters: Map<string, Character>
  charTitles: Map<string, string[]>
  visible: boolean
  onSelectCharacter: (id: string) => void
  selectedId: string | null
}

function getTitle(titles: string[] | undefined): string {
  if (!titles || titles.length === 0) return ''
  const t = titles[0]!
  return t.length > 40 ? t.slice(0, 38) + '...' : t
}

function buildChildMap(members: FamilyMember[]): Map<string, string[]> {
  const m = new Map<string, string[]>()
  for (const mb of members) {
    for (const pid of mb.parentIds ?? []) {
      if (!m.has(pid)) m.set(pid, [])
      m.get(pid)!.push(mb.id)
    }
  }
  for (const [pid, kids] of m) {
    m.set(pid, [...new Set(kids)])
  }
  return m
}

/** Approximate SVG text width in the genealogy font. */
function estimateTextWidth(text: string, fontSize: number): number {
  if (!text) return 0
  const isUpper = text === text.toUpperCase()
  return text.length * fontSize * (isUpper ? 0.6 : 0.52)
}

/** Returns the minimum horizontal extent a single member needs (node + labels). */
function memberSpan(
  member: FamilyMember,
  characters: Map<string, Character>,
  charTitles: Map<string, string[]>,
): number {
  const charData = member.characterId ? characters.get(member.characterId) : undefined
  const name = (charData?.name ?? member.name).toUpperCase()
  const titles = member.characterId ? charTitles.get(member.characterId) : undefined
  const title = getTitle(titles)
  const maxTextW = Math.max(estimateTextWidth(name, FONT_SIZE_NAME), estimateTextWidth(title, FONT_SIZE_TITLE))
  return Math.max(NODE_D, maxTextW + 20)
}

export default function GenealogyTree({
  family,
  characters,
  charTitles,
  visible,
  onSelectCharacter,
  selectedId,
}: Props) {
  const { positions, connections, svgW, svgH } = useMemo(() => {
    const byId = new Map(family.members.map((m) => [m.id, m]))
    const childOf = buildChildMap(family.members)

    const pos = new Map<string, Position>()
    const conns: { path: string }[] = []

    function layoutSubtree(id: string, x: number, y: number): number {
      const member = byId.get(id)!
      const spouseId = member.spouseId
      const hasSpouse = spouseId != null && byId.has(spouseId)

      // Compute minimum width this node needs
      const span1 = memberSpan(member, characters, charTitles)
      const unitW = hasSpouse
        ? Math.max(
            NODE_D * 2 + SPOUSE_GAP,
            span1 + memberSpan(byId.get(spouseId)!, characters, charTitles) + SPOUSE_GAP,
          )
        : span1
      const cx = x + unitW / 2

      pos.set(id, { x: x + NODE_D / 2, y: y + NODE_D / 2 })
      if (hasSpouse) {
        pos.set(spouseId!, { x: x + NODE_D + SPOUSE_GAP + NODE_D / 2, y: y + NODE_D / 2 })
      }

      const childIds = [...(childOf.get(id) ?? [])]
      if (hasSpouse) {
        for (const cid of childOf.get(spouseId!) ?? []) {
          if (!childIds.includes(cid)) childIds.push(cid)
        }
      }

      if (childIds.length === 0) return unitW

      const childY = y + GEN_GAP

      const childLayouts = childIds.map((cid) => {
        const w = layoutSubtree(cid, 0, childY)
        return { id: cid, w }
      })

      // Dynamic sibling gap based on adjacent label widths
      let dynamicGap = SIB_GAP
      if (childLayouts.length >= 2) {
        let maxGap = SIB_GAP
        for (let i = 0; i < childLayouts.length - 1; i++) {
          const a = byId.get(childLayouts[i]!.id)!
          const b = byId.get(childLayouts[i + 1]!.id)!
          const wA = memberSpan(a, characters, charTitles)
          const wB = memberSpan(b, characters, charTitles)
          const needed = (wA + wB) / 2 + 12
          if (needed > maxGap) maxGap = needed
        }
        dynamicGap = maxGap
      }

      const totalChildW = childLayouts.reduce((s, c) => s + c.w, 0) + dynamicGap * (childIds.length - 1)

      let childX = cx - totalChildW / 2
      for (const cl of childLayouts) {
        layoutSubtree(cl.id, childX, childY)
        childX += cl.w + dynamicGap
      }

      const overallW = Math.max(unitW, totalChildW)

      if (totalChildW > unitW) {
        const shift = (totalChildW - unitW) / 2
        for (const [, p] of pos) {
          p.x += shift
        }
      }

      return overallW
    }

    for (const rootId of family.rootIds) {
      layoutSubtree(rootId, PAD, PAD)
    }

    if (pos.size === 0) return { positions: pos, connections: conns, svgW: 200, svgH: 200 }

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity
    for (const [, p] of pos) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }

    // Connection paths — ink-style bezier curves
    for (const member of family.members) {
      const childIds = childOf.get(member.id) ?? []
      if (childIds.length === 0) continue

      const parentPos = pos.get(member.id)
      if (!parentPos) continue

      const spousePos = member.spouseId ? pos.get(member.spouseId) : undefined
      const parentMidX = spousePos ? (parentPos.x + spousePos.x) / 2 : parentPos.x
      const childPositions = childIds.map((cid) => pos.get(cid)).filter(Boolean) as Position[]
      if (childPositions.length === 0) continue

      const topY = parentPos.y + NODE_D / 2
      const bottomY = childPositions[0]!.y - NODE_D / 2

      for (const cp of childPositions) {
        const y1 = topY + (bottomY - topY) * 0.3
        const y2 = topY + (bottomY - topY) * 0.7
        conns.push({
          path: `M${parentMidX},${topY} C${parentMidX},${y1} ${cp.x},${y2} ${cp.x},${bottomY}`,
        })
      }
    }

    // Spouse connections
    for (const member of family.members) {
      if (!member.spouseId) continue
      const p1 = pos.get(member.id)
      const p2 = pos.get(member.spouseId)
      if (!p1 || !p2) continue
      conns.push({
        path: `M${p1.x + NODE_D / 2},${p1.y} L${p2.x - NODE_D / 2},${p2.y}`,
      })
    }

    const w = maxX - minX + PAD * 2
    const h = maxY - minY + PAD * 2

    return { positions: pos, connections: conns, svgW: w, svgH: h }
  }, [family, characters, charTitles])

  const entries = useMemo(() => [...positions.entries()], [positions])

  return (
    <div className="relative" style={{ minHeight: 300 }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="overflow-visible"
        style={{ minHeight: svgH }}
      >
        <defs>
          <radialGradient id="parchment" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f5f0e8" />
            <stop offset="60%" stopColor="#ede4d4" />
            <stop offset="100%" stopColor="#d8ccb8" />
          </radialGradient>
          <pattern id="grain" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M0,1 L4,1" stroke="rgba(100,80,60,0.04)" strokeWidth="0.3" fill="none" />
            <path d="M0,3 L4,3" stroke="rgba(100,80,60,0.025)" strokeWidth="0.3" fill="none" />
          </pattern>
          <marker id="conn-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M1,1 L9,5 L1,9" fill="none" stroke="#2a1a0e" strokeWidth="1.2" opacity="0.8" />
          </marker>
        </defs>

        {/* Connections drawn BEHIND nodes */}
        <GenealogyConnections connections={connections} visible={visible} />

        {entries.map(([id, p], idx) => {
          const member = family.members.find((m) => m.id === id)!
          const charData = member.characterId ? characters.get(member.characterId) : undefined
          const name = charData?.name ?? member.name
          const isSelected = selectedId === member.characterId
          const isDeceased = member.isDeceased
          const titles = member.characterId ? charTitles.get(member.characterId) : undefined
          const title = getTitle(titles)
          const avatarUrl = member.characterId ? getCharacterPortrait(name) : undefined

          return (
            <g
              key={id}
              className="cursor-pointer"
              style={{
                animation: visible ? `genea-node 500ms ease-out ${600 + idx * 60}ms both` : undefined,
                opacity: isDeceased ? 0.6 : 1,
              }}
              onClick={() => {
                if (member.characterId) onSelectCharacter(member.characterId)
              }}
            >
              {isDeceased && (
                <text
                  x={p.x}
                  y={p.y - NODE_D / 2 - 6}
                  textAnchor="middle"
                  fontSize="13"
                  fontFamily="'Cormorant Garamond', 'Georgia', serif"
                  fill="#8a7050"
                  opacity={0.7}
                >
                  {'\u2020'}
                </text>
              )}

              {/* Archival medallion */}
              <g opacity={isDeceased ? 0.55 : 1}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={NODE_D / 2 + 0.5}
                  fill="none"
                  stroke="rgba(0,0,0,0.04)"
                  strokeWidth={0.5}
                />
                <circle cx={p.x} cy={p.y} r={NODE_D / 2} fill="none" stroke="#c4a86a" strokeWidth={1.5} />
                <circle cx={p.x} cy={p.y} r={NODE_D / 2 - 1} fill="url(#parchment)" />

                {avatarUrl ? (
                  <>
                    <clipPath id={`clip-${id}`}>
                      <circle cx={p.x} cy={p.y} r={NODE_D / 2 - 3} />
                    </clipPath>
                    <image
                      href={avatarUrl}
                      x={p.x - NODE_D / 2 + 3}
                      y={p.y - NODE_D / 2 + 3}
                      width={NODE_D - 6}
                      height={NODE_D - 6}
                      clipPath={`url(#clip-${id})`}
                      preserveAspectRatio="xMidYMid slice"
                      style={isDeceased ? { filter: 'grayscale(1)' } : undefined}
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={NODE_D / 2 - 3}
                      fill="none"
                      stroke="#c4a86a"
                      strokeWidth={0.3}
                      opacity={0.25}
                    />
                  </>
                ) : (
                  <polygon
                    points={`${p.x},${p.y - 2} ${p.x + 2},${p.y} ${p.x},${p.y + 2} ${p.x - 2},${p.y}`}
                    fill="#c4a86a"
                    opacity={0.25}
                  />
                )}

                <circle cx={p.x} cy={p.y} r={NODE_D / 2 - 1} fill="url(#grain)" opacity={0.08} />
              </g>

              {isSelected && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={NODE_D / 2 + 3}
                  fill="none"
                  stroke="#c4a86a"
                  strokeWidth={1}
                  opacity={0.6}
                />
              )}

              <text
                x={p.x}
                y={p.y + NODE_D / 2 + 18}
                textAnchor="middle"
                fontSize={FONT_SIZE_NAME}
                fontWeight="600"
                fill={isDeceased ? '#8a7a6a' : '#1a0e06'}
                fontFamily="'Cormorant Garamond', 'Georgia', serif"
                style={{
                  animation: visible ? `genea-label 400ms ease-out ${800 + idx * 60}ms both` : undefined,
                }}
              >
                {name.toUpperCase()}
              </text>

              {title && (
                <text
                  x={p.x}
                  y={p.y + NODE_D / 2 + 32}
                  textAnchor="middle"
                  fontSize={FONT_SIZE_TITLE}
                  fill="#7a6a5a"
                  fontFamily="'Cormorant Garamond', 'Georgia', serif"
                  fontStyle="italic"
                >
                  {title}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
