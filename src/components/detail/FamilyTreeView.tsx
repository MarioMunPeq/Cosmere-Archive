import { memo, useMemo } from 'react'
import type { FamilyDefinition, FamilyMember } from '@/types/family'
import { FALLBACK_COLOR } from '@/data/static'

const CARD_W = 140
const CARD_H = 32
const SPOUSE_GAP = 10
const GEN_GAP = 56
const CHILD_GAP = 24
const PAD = 40

interface PosNode {
  id: string
  x: number
  y: number
  w: number
}

interface SubResult {
  nodes: PosNode[]
  connectors: { x1: number; y1: number; x2: number; y2: number }[]
  width: number
}

interface Props {
  family: FamilyDefinition
  onSelectCharacter?: (id: string) => void
}

const Card = memo(function Card({
  m,
  x,
  y,
  w,
  onClick,
}: {
  m: FamilyMember
  x: number
  y: number
  w: number
  onClick?: () => void
}) {
  const external = !m.characterId
  const fill = external ? (m.isDeceased ? '#1a1a2e' : '#1f2937') : '#1f2937'
  const stroke = external ? (m.isDeceased ? '#374151' : '#4b5563') : '#a78bfa'
  const txt = external ? (m.isDeceased ? FALLBACK_COLOR : '#9ca3af') : '#e5e7eb'
  const rx = 6

  return (
    <g
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick()
      }}
      className={onClick ? 'cursor-pointer' : ''}
      style={{ opacity: external ? 0.7 : 1 }}
    >
      <rect
        x={x - w / 2}
        y={y - CARD_H / 2}
        width={w}
        height={CARD_H}
        rx={rx}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text x={x} y={y + 1} textAnchor="middle" fill={txt} fontSize="11" fontWeight="600" dominantBaseline="central">
        {m.name.length > 16 ? m.name.slice(0, 15) + '…' : m.name}
      </text>
      {m.isDeceased && (
        <text
          x={x + w / 2 - 6}
          y={y - CARD_H / 2 + 4}
          textAnchor="end"
          fill={external ? FALLBACK_COLOR : '#9ca3af'}
          fontSize="8"
          fontStyle="italic"
        >
          dec.
        </text>
      )}
    </g>
  )
})

function layoutSubtree(
  pid: string,
  _memMap: Map<string, FamilyMember>,
  childMap: Map<string, string[]>,
  spouseMap: Map<string, string | undefined>,
  offsetY: number,
): SubResult {
  const spId = spouseMap.get(pid)
  const isCouple = spId !== undefined
  const unitW = isCouple ? CARD_W * 2 + SPOUSE_GAP : CARD_W

  const cids = [...new Set([...(childMap.get(pid) ?? []), ...(spId ? (childMap.get(spId) ?? []) : [])])]

  if (cids.length === 0) {
    return {
      nodes: [{ id: pid, x: unitW / 2, y: offsetY, w: unitW }],
      connectors: [],
      width: unitW,
    }
  }

  let cx = 0
  const kidResults: SubResult[] = []
  for (const cid of cids) {
    const r = layoutSubtree(cid, _memMap, childMap, spouseMap, offsetY + GEN_GAP)
    const shiftedNodes = r.nodes.map((n) => ({ ...n, x: n.x + cx }))
    const shiftedConns = r.connectors.map((c) => ({ ...c, x1: c.x1 + cx, x2: c.x2 + cx }))
    kidResults.push({ nodes: shiftedNodes, connectors: shiftedConns, width: r.width })
    cx += r.width + CHILD_GAP
  }
  const kidsTotalW = cx - CHILD_GAP
  const totalW = Math.max(unitW, kidsTotalW)

  const parentX = (totalW - unitW) / 2 + unitW / 2
  const ourNodes: PosNode[] = [{ id: pid, x: parentX, y: offsetY, w: unitW }]
  const parentBot = offsetY + CARD_H / 2
  const kidTop = offsetY + GEN_GAP - CARD_H / 2
  const midY = (parentBot + kidTop) / 2
  const conns: SubResult['connectors'] = []

  conns.push({ x1: parentX, y1: parentBot, x2: parentX, y2: midY })

  if (cids.length > 1) {
    const firstX = kidResults[0]!.nodes[0]!.x
    const lastX = kidResults[kidResults.length - 1]!.nodes[0]!.x
    conns.push({ x1: firstX, y1: midY, x2: lastX, y2: midY })
  }

  for (const kr of kidResults) {
    const cn = kr.nodes[0]!
    conns.push({ x1: cn.x, y1: midY, x2: cn.x, y2: kidTop })
    ourNodes.push(...kr.nodes)
    conns.push(...kr.connectors)
  }

  return { nodes: ourNodes, connectors: conns, width: totalW }
}

function FamilyTreeView({ family, onSelectCharacter }: Props) {
  const svgW = useMemo(() => {
    const memMap = new Map(family.members.map((m) => [m.id, m]))
    const childMap = new Map<string, string[]>()
    const spouseMap = new Map<string, string | undefined>()
    for (const m of family.members) {
      if (m.spouseId) spouseMap.set(m.id, m.spouseId)
      if (m.parentIds)
        for (const p of m.parentIds) {
          if (p) {
            const arr = childMap.get(p) ?? []
            arr.push(m.id)
            childMap.set(p, arr)
          }
        }
    }
    let total = 0
    for (const rid of family.rootIds) {
      const r = layoutSubtree(rid, memMap, childMap, spouseMap, PAD + CARD_H / 2)
      total += r.width
      if (family.rootIds.length > 1) total += CHILD_GAP
    }
    return total - (family.rootIds.length > 1 ? CHILD_GAP : 0) + PAD * 2
  }, [family])

  const layout = useMemo(() => {
    const memMap = new Map(family.members.map((m) => [m.id, m]))
    const childMap = new Map<string, string[]>()
    const spouseMap = new Map<string, string | undefined>()
    for (const m of family.members) {
      if (m.spouseId) spouseMap.set(m.id, m.spouseId)
      if (m.parentIds)
        for (const p of m.parentIds) {
          if (p) {
            const arr = childMap.get(p) ?? []
            arr.push(m.id)
            childMap.set(p, arr)
          }
        }
    }

    const allNodes: PosNode[] = []
    const allConns: SubResult['connectors'] = []
    let ox = PAD
    for (const rid of family.rootIds) {
      const r = layoutSubtree(rid, memMap, childMap, spouseMap, PAD + CARD_H / 2)
      const shifted = r.nodes.map((n) => ({ ...n, x: n.x + ox }))
      const shiftedConns = r.connectors.map((c) => ({ ...c, x1: c.x1 + ox, x2: c.x2 + ox }))
      allNodes.push(...shifted)
      allConns.push(...shiftedConns)
      ox += r.width + CHILD_GAP
    }

    // deduplicate nodes by id (keep first occurrence)
    const seen = new Set<string>()
    const dedupedNodes = allNodes.filter((n) => {
      if (seen.has(n.id)) return false
      seen.add(n.id)
      return true
    })

    // find the deepest y
    const maxY = Math.max(...dedupedNodes.map((n) => n.y))

    return { nodes: dedupedNodes, connectors: allConns, svgH: maxY + PAD + CARD_H / 2 }
  }, [family])

  return (
    <svg
      viewBox={`0 0 ${svgW} ${layout.svgH}`}
      className="w-full"
      role="img"
      aria-label={`Family tree: ${family.name}`}
    >
      {layout.connectors.map((c, i) => (
        <line
          key={`c${i}`}
          x1={c.x1}
          y1={c.y1}
          x2={c.x2}
          y2={c.y2}
          stroke={family.color}
          strokeWidth="1.5"
          strokeOpacity="0.45"
        />
      ))}
      {layout.nodes.map((n) => {
        const m = family.members.find((x) => x.id === n.id)
        if (!m) return null
        const isCoupleNode = n.w > CARD_W + SPOUSE_GAP
        return (
          <g key={n.id}>
            {isCoupleNode ? (
              <>
                <Card
                  m={m}
                  x={n.x - CARD_W / 2 - SPOUSE_GAP / 2}
                  y={n.y}
                  w={CARD_W}
                  onClick={m.characterId && onSelectCharacter ? () => onSelectCharacter(m.characterId!) : undefined}
                />
                <line
                  x1={n.x - SPOUSE_GAP / 2 - 2}
                  y1={n.y}
                  x2={n.x - SPOUSE_GAP / 2 + CARD_W + 2}
                  y2={n.y}
                  stroke={family.color}
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  strokeDasharray="3 2"
                />
                {(() => {
                  const spId = family.members.find((x) => x.id === m.id)?.spouseId
                  const sp = spId ? family.members.find((x) => x.id === spId) : undefined
                  if (!sp) return null
                  return (
                    <Card
                      m={sp}
                      x={n.x + CARD_W / 2 + SPOUSE_GAP / 2}
                      y={n.y}
                      w={CARD_W}
                      onClick={
                        sp.characterId && onSelectCharacter ? () => onSelectCharacter(sp.characterId!) : undefined
                      }
                    />
                  )
                })()}
              </>
            ) : (
              <Card
                m={m}
                x={n.x}
                y={n.y}
                w={CARD_W}
                onClick={m.characterId && onSelectCharacter ? () => onSelectCharacter(m.characterId!) : undefined}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default memo(FamilyTreeView)
