import type { FamilyDefinition, FamilyMember } from '@/types/family'
import type { Character } from '@/types/character'

/* ─── Generous manuscript proportions ─── */
export const NODE_R = 60
const SPOUSE_GAP = 64
const GEN_GAP = 300
const SIB_GAP = 140
const FAMILY_GAP_X = 480
const PAD = 240

export interface Position {
  x: number
  y: number
}

export interface ConnectionDef {
  from: string
  to: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  type: 'parent-child' | 'spouse'
}

export interface GenerationInfo {
  gen: number
  totalGens: number
}

export interface UnifiedLayout {
  positions: Map<string, Position>
  connections: ConnectionDef[]
  worldW: number
  worldH: number
  familyBounds: Map<string, { x: number; y: number; w: number; h: number }>
  charToMember: Map<string, string>
  memberToFamily: Map<string, string>
  memberData: Map<string, FamilyMember>
  generations: Map<string, GenerationInfo>
  familyGenerations: Map<string, number>
}

/* ─── Name width estimate (proportional to portrait size) ─── */

function memberSpan(member: FamilyMember, chars: Map<string, Character>): number {
  const char = member.characterId ? chars.get(member.characterId) : undefined
  const name = (char?.name ?? member.name).toUpperCase()
  const textW = name.length * 15 * (name === name.toUpperCase() ? 0.55 : 0.45)
  return Math.max(NODE_R * 2 + 12, textW + 30)
}

function coupleSpan(a: FamilyMember, b: FamilyMember, chars: Map<string, Character>): number {
  return memberSpan(a, chars) + memberSpan(b, chars) + SPOUSE_GAP
}

function buildChildMap(members: FamilyMember[]): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>()
  for (const mb of members) {
    for (const pid of mb.parentIds ?? []) {
      if (!m.has(pid)) m.set(pid, new Set())
      m.get(pid)!.add(mb.id)
    }
  }
  for (const mb of members) {
    if (!mb.spouseId) continue
    const his = m.get(mb.id)
    const hers = m.get(mb.spouseId)
    if (his && hers) for (const c of hers) his.add(c)
    if (hers && his) for (const c of his) hers.add(c)
  }
  return m
}

/* ─── Family Layout ─── */

interface LayoutResult {
  positions: Map<string, Position>
  connections: ConnectionDef[]
  width: number
  height: number
  nodeGens: Map<string, number>
  totalGens: number
}

function layoutFamily(family: FamilyDefinition, chars: Map<string, Character>): LayoutResult {
  const byId = new Map(family.members.map((m) => [m.id, m]))
  const childrenOf = buildChildMap(family.members)
  const widthCache = new Map<string, number>()

  /* ── Generation levels via BFS from roots ── */
  const nodeGen = new Map<string, number>()
  let maxGen = 0
  const queue: Array<{ id: string; gen: number }> = family.rootIds.map((r) => ({ id: r, gen: 0 }))
  for (const q of queue) nodeGen.set(q.id, q.gen)
  let qi = 0
  while (qi < queue.length) {
    const entry = queue[qi++]
    if (!entry) continue
    const { id, gen } = entry
    const sp = byId.get(id)?.spouseId
    if (sp && !nodeGen.has(sp) && byId.has(sp)) {
      nodeGen.set(sp, gen)
      queue.push({ id: sp, gen })
    }
    const kids = childrenOf.get(id)
    if (kids) {
      for (const cid of kids) {
        if (!nodeGen.has(cid)) {
          nodeGen.set(cid, gen + 1)
          queue.push({ id: cid, gen: gen + 1 })
          if (gen + 1 > maxGen) maxGen = gen + 1
        }
      }
    }
  }

  function subtreeWidth(id: string): number {
    if (widthCache.has(id)) return widthCache.get(id)!
    const m = byId.get(id)!
    const hasSp = m.spouseId != null && byId.has(m.spouseId)
    const kids = childrenOf.get(id)
    const unitW = hasSp
      ? Math.max(NODE_R * 2 + SPOUSE_GAP, coupleSpan(m, byId.get(m.spouseId!)!, chars))
      : memberSpan(m, chars)

    if (!kids || kids.size === 0) {
      widthCache.set(id, unitW)
      return unitW
    }

    const childArr = [...kids]
    const cw = childArr.map((c) => subtreeWidth(c))
    const gap = childArr.length <= 1 ? 0 : SIB_GAP
    const totalChildW = cw.reduce((a, b) => a + b, 0) + gap * (childArr.length - 1)
    const w = Math.max(unitW, totalChildW)
    widthCache.set(id, w)
    return w
  }

  for (const r of family.rootIds) subtreeWidth(r)

  /* ── Top-down positioning ── */
  const positions = new Map<string, Position>()
  const connections: ConnectionDef[] = []

  function layoutAt(id: string, x: number, y: number) {
    const m = byId.get(id)!
    const hasSp = m.spouseId != null && byId.has(m.spouseId)
    const kids = childrenOf.get(id)
    const w = widthCache.get(id)!

    if (hasSp) {
      const sid = m.spouseId!
      const uw = coupleSpan(m, byId.get(sid)!, chars)
      const sx = x + (w - uw) / 2
      positions.set(id, { x: sx + NODE_R, y: y + NODE_R })
      positions.set(sid, { x: sx + NODE_R * 2 + SPOUSE_GAP, y: y + NODE_R })
    } else {
      positions.set(id, { x: x + w / 2, y: y + NODE_R })
    }

    if (!kids || kids.size === 0) return

    const childArr = [...kids]
    const cw = childArr.map((c) => widthCache.get(c)!)
    const gap = childArr.length <= 1 ? 0 : SIB_GAP
    const totalW = cw.reduce((a, b) => a + b, 0) + gap * (childArr.length - 1)
    const cy = y + GEN_GAP
    let cx = x + (w - totalW) / 2

    for (const cid of childArr) {
      layoutAt(cid, cx, cy)
      cx += widthCache.get(cid)! + gap
    }

    const pPos = positions.get(id)!
    const sPos = hasSp ? positions.get(m.spouseId!) : undefined
    const pMidX = sPos ? (pPos.x + sPos.x) / 2 : pPos.x
    const topY = pPos.y + NODE_R
    for (const cid of childArr) {
      const cp = positions.get(cid)
      if (!cp) continue
      connections.push({
        from: id,
        to: cid,
        fromX: pMidX,
        fromY: topY,
        toX: cp.x,
        toY: cp.y - NODE_R,
        type: 'parent-child',
      })
    }
  }

  if (family.rootIds.length === 1) {
    layoutAt(family.rootIds[0]!, PAD, PAD)
  } else {
    let rx = PAD
    for (const r of family.rootIds) {
      layoutAt(r, rx, PAD)
      rx += widthCache.get(r)! + 180
    }
  }

  /* Spouse connections */
  for (const m of family.members) {
    if (!m.spouseId || !byId.has(m.spouseId)) continue
    const p1 = positions.get(m.id)
    const p2 = positions.get(m.spouseId)
    if (!p1 || !p2) continue
    connections.push({
      from: m.id,
      to: m.spouseId,
      fromX: p1.x + NODE_R,
      fromY: p1.y,
      toX: p2.x - NODE_R,
      toY: p2.y,
      type: 'spouse',
    })
  }

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity
  for (const [, p] of positions) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  const w = Math.max(maxX - minX + PAD * 2, 600)
  const h = Math.max(maxY - minY + PAD * 2, 600)

  const dx = -minX + PAD
  const dy = -minY + PAD
  if (dx !== 0 || dy !== 0) {
    for (const [, p] of positions) {
      p.x += dx
      p.y += dy
    }
    for (const c of connections) {
      c.fromX += dx
      c.fromY += dy
      c.toX += dx
      c.toY += dy
    }
  }

  return { positions, connections, width: w, height: h, nodeGens: nodeGen, totalGens: maxGen + 1 }
}

/* ─── Unified layout across families ─── */

export function computeUnifiedLayout(families: FamilyDefinition[], characters: Map<string, Character>): UnifiedLayout {
  const layouts = families.map((f) => ({ family: f, layout: layoutFamily(f, characters) }))

  const positions = new Map<string, Position>()
  const connections: ConnectionDef[] = []
  const familyBounds = new Map<string, { x: number; y: number; w: number; h: number }>()
  const charToMember = new Map<string, string>()
  const memberToFamily = new Map<string, string>()
  const memberData = new Map<string, FamilyMember>()
  const generations = new Map<string, GenerationInfo>()
  const familyGenerations = new Map<string, number>()

  let cursorX = PAD
  let maxH = 0

  for (const { family, layout } of layouts) {
    const ox = cursorX
    const oy = PAD
    for (const [mid, p] of layout.positions) positions.set(mid, { x: p.x + ox, y: p.y + oy })
    for (const c of layout.connections) {
      connections.push({
        ...c,
        fromX: c.fromX + ox,
        fromY: c.fromY + oy,
        toX: c.toX + ox,
        toY: c.toY + oy,
      })
    }
    familyBounds.set(family.id, { x: ox, y: oy, w: layout.width, h: layout.height })
    for (const m of family.members) {
      memberToFamily.set(m.id, family.id)
      memberData.set(m.id, m)
      if (m.characterId) charToMember.set(m.characterId, m.id)
      const g = layout.nodeGens.get(m.id) ?? 0
      generations.set(m.id, { gen: g, totalGens: layout.totalGens })
    }
    familyGenerations.set(family.id, layout.totalGens)
    cursorX += layout.width + FAMILY_GAP_X
    if (layout.height > maxH) maxH = layout.height
  }

  return {
    positions,
    connections,
    worldW: cursorX,
    worldH: maxH + PAD * 2,
    familyBounds,
    charToMember,
    memberToFamily,
    memberData,
    generations,
    familyGenerations,
  }
}
