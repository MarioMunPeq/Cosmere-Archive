import type { Character } from '@/types/character'
import type { FamilyDefinition, FamilyMember } from '@/types/family'

const NODE_D = 68
const SPOUSE_GAP = 30
const GEN_GAP = 150
const SIB_GAP = 64
const TREE_PAD = 40

interface Position {
  x: number
  y: number
}

export interface LayoutConnection {
  path: string
  isSpouse: boolean
}

export interface GenealogyLayoutResult {
  positions: Map<string, Position>
  connections: LayoutConnection[]
  svgW: number
  svgH: number
}

function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * (text === text.toUpperCase() ? 0.6 : 0.52)
}

function buildChildMap(members: FamilyMember[]): Map<string, string[]> {
  const m = new Map<string, string[]>()
  for (const mb of members) {
    for (const pid of mb.parentIds ?? []) {
      if (!m.has(pid)) m.set(pid, [])
      m.get(pid)!.push(mb.id)
    }
  }
  for (const [pid, kids] of m) m.set(pid, [...new Set(kids)])
  return m
}

function memberSpan(
  member: FamilyMember,
  characters: Map<string, Character>,
  charTitles: Map<string, string[]>,
): number {
  const charData = member.characterId ? characters.get(member.characterId) : undefined
  const name = (charData?.name ?? member.name).toUpperCase()
  const titles = member.characterId ? charTitles.get(member.characterId) : undefined
  const title = titles?.[0] ?? ''
  const titleStr = title.length > 40 ? title.slice(0, 38) + '...' : title
  return Math.max(NODE_D, Math.max(estimateTextWidth(name, 14), estimateTextWidth(titleStr, 11)) + 20)
}

export function computeGenealogyLayout(
  family: FamilyDefinition,
  characters: Map<string, Character>,
  charTitles: Map<string, string[]>,
): GenealogyLayoutResult {
  const byId = new Map(family.members.map((m) => [m.id, m]))
  const childOf = buildChildMap(family.members)
  const pos = new Map<string, Position>()
  const conns: LayoutConnection[] = []

  function layoutSubtree(id: string, x: number, y: number): number {
    const member = byId.get(id)!
    const spouseId = member.spouseId
    const hasSpouse = spouseId != null && byId.has(spouseId)
    const span1 = memberSpan(member, characters, charTitles)
    const unitW = hasSpouse
      ? Math.max(NODE_D * 2 + SPOUSE_GAP, span1 + memberSpan(byId.get(spouseId)!, characters, charTitles) + SPOUSE_GAP)
      : span1
    const cx = x + unitW / 2
    pos.set(id, { x: x + NODE_D / 2, y: y + NODE_D / 2 })
    if (hasSpouse) pos.set(spouseId!, { x: x + NODE_D + SPOUSE_GAP + NODE_D / 2, y: y + NODE_D / 2 })
    const childIds = [...(childOf.get(id) ?? [])]
    if (hasSpouse) {
      for (const cid of childOf.get(spouseId!) ?? []) {
        if (!childIds.includes(cid)) childIds.push(cid)
      }
    }
    if (childIds.length === 0) return unitW
    const childY = y + GEN_GAP
    const childLayouts = childIds.map((cid) => ({ id: cid, w: layoutSubtree(cid, 0, childY) }))

    let dynamicGap = SIB_GAP
    if (childLayouts.length >= 2) {
      let maxGap = SIB_GAP
      for (let i = 0; i < childLayouts.length - 1; i++) {
        const a = byId.get(childLayouts[i]!.id)!
        const b = byId.get(childLayouts[i + 1]!.id)!
        const needed = (memberSpan(a, characters, charTitles) + memberSpan(b, characters, charTitles)) / 2 + 12
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
      for (const [, p] of pos) p.x += shift
    }
    return overallW
  }

  for (const rootId of family.rootIds) layoutSubtree(rootId, TREE_PAD, TREE_PAD)

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
        isSpouse: false,
      })
    }
  }
  for (const member of family.members) {
    if (!member.spouseId) continue
    const p1 = pos.get(member.id)
    const p2 = pos.get(member.spouseId)
    if (!p1 || !p2) continue
    conns.push({
      path: `M${p1.x + NODE_D / 2},${p1.y} L${p2.x - NODE_D / 2},${p2.y}`,
      isSpouse: true,
    })
  }

  return {
    positions: pos,
    connections: conns,
    svgW: maxX - minX + TREE_PAD * 2,
    svgH: maxY - minY + TREE_PAD * 2,
  }
}
