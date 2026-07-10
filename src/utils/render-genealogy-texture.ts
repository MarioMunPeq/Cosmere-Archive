import { CanvasTexture, RepeatWrapping } from 'three'
import type { Character } from '@/types/character'
import type { FamilyDefinition, FamilyMember } from '@/types/family'

const W = 1024
const H = 1280

const NODE_D = 56
const SPOUSE_GAP = 24
const GEN_GAP = 130
const SIB_GAP = 56
const TREE_PAD = 40

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const

interface Position {
  x: number
  y: number
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
  return Math.max(
    NODE_D,
    Math.max(
      estimateTextWidth(name, 14),
      estimateTextWidth(title.length > 40 ? title.slice(0, 38) + '...' : title, 11),
    ) + 20,
  )
}

function computeLayout(
  family: FamilyDefinition,
  characters: Map<string, Character>,
  charTitles: Map<string, string[]>,
) {
  const byId = new Map(family.members.map((m) => [m.id, m]))
  const childOf = buildChildMap(family.members)
  const pos = new Map<string, Position>()
  const conns: { path: string; isSpouse: boolean }[] = []

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
    conns.push({ path: `M${p1.x + NODE_D / 2},${p1.y} L${p2.x - NODE_D / 2},${p2.y}`, isSpouse: true })
  }

  return { positions: pos, connections: conns, svgW: maxX - minX + TREE_PAD * 2, svgH: maxY - minY + TREE_PAD * 2 }
}

export interface GenealogyClickRegion {
  type: 'family' | 'character' | 'switchFamily'
  id: string
  rect: { x: number; y: number; w: number; h: number }
  page: 'left' | 'right'
}

export interface GenealogyTextureResult {
  leftTexture: CanvasTexture
  rightTexture: CanvasTexture
  regions: GenealogyClickRegion[]
}

function makeCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  return [c, c.getContext('2d')!]
}

function makeTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const tex = new CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(1, 1)
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

export function renderGenealogyTexture(
  family: FamilyDefinition,
  families: FamilyDefinition[],
  characters: Map<string, Character>,
  charTitles: Map<string, string[]>,
  detailId: string | null,
  selectedId: string | null,
): GenealogyTextureResult {
  const [leftCanvas, l] = makeCanvas()
  const [rightCanvas, r] = makeCanvas()
  const regions: GenealogyClickRegion[] = []

  const BG = '#f5efe6'
  const INK = '#1a0e06'

  // ═══ LEFT PAGE ═══
  l.fillStyle = BG
  l.fillRect(0, 0, W, H)
  l.fillStyle = INK
  l.font = 'bold 30px Georgia, serif'
  l.textAlign = 'center'
  l.textBaseline = 'top'
  l.fillText('ARCHIVES OF BLOODLINES', W / 2, 30)

  let y = 100

  for (let i = 0; i < families.length; i++) {
    const f = families[i]!
    const isActive = f.id === family.id
    const entryH = 50

    regions.push({
      type: 'family',
      id: f.id,
      rect: { x: 20, y: y - 4, w: W - 40, h: entryH + 8 },
      page: 'left' as const,
    })

    l.font = 'bold 20px Georgia, serif'
    l.textAlign = 'left'
    l.textBaseline = 'top'
    l.fillStyle = isActive ? INK : '#5a4a3a'
    l.fillText(`${ROMAN[i] ?? i + 1}. ${f.name.toUpperCase()}`, 40, y)

    l.font = '15px Georgia, serif'
    l.fillStyle = '#6b5a4a'
    l.fillText(f.description, 40, y + 26)

    l.font = '13px Georgia, serif'
    l.fillStyle = '#a09080'
    l.fillText(`${f.members.length} recorded`, 40, y + 44)

    if (isActive && i < families.length - 1) {
      l.strokeStyle = '#c4a86a'
      l.lineWidth = 0.5
      l.globalAlpha = 0.15
      l.beginPath()
      l.moveTo(40, y + entryH + 2)
      l.lineTo(W - 20, y + entryH + 2)
      l.stroke()
      l.globalAlpha = 1
    }
    y += entryH + 10
  }

  // ═══ RIGHT PAGE ═══
  r.fillStyle = BG
  r.fillRect(0, 0, W, H)
  r.fillStyle = INK
  r.font = 'bold 42px Georgia, serif'
  r.textAlign = 'center'
  r.textBaseline = 'top'
  r.fillText(family.name.toUpperCase(), W / 2, 20)

  r.font = 'italic 18px Georgia, serif'
  r.fillStyle = '#6b5a4a'
  r.fillText(family.description, W / 2, 70)

  // Tree
  const layout = computeLayout(family, characters, charTitles)
  const { positions, connections, svgW, svgH } = layout

  const availW = W - 40
  const availH = H - 160
  const scale = Math.min(availW / svgW, availH / svgH, 1.5)
  const offsetX = (W - svgW * scale) / 2
  const offsetY = 120 + (availH - svgH * scale) / 2

  function tx(x: number) {
    return x * scale + offsetX
  }
  function ty(y: number) {
    return y * scale + offsetY
  }

  if (positions.size > 0) {
    for (const conn of connections) {
      const parts = conn.path.split(/(?=[MC])/)
      r.beginPath()
      for (const part of parts) {
        const cmd = part[0]!
        const nums = part
          .slice(1)
          .trim()
          .split(/[\s,]+/)
          .map(Number)
        if (cmd === 'M' && nums.length >= 2) r.moveTo(tx(nums[0]!), ty(nums[1]!))
        else if (cmd === 'C' && nums.length >= 6)
          r.bezierCurveTo(tx(nums[0]!), ty(nums[1]!), tx(nums[2]!), ty(nums[3]!), tx(nums[4]!), ty(nums[5]!))
        else if (cmd === 'L' && nums.length >= 2) r.lineTo(tx(nums[0]!), ty(nums[1]!))
      }
      r.strokeStyle = conn.isSpouse ? 'rgba(42,26,14,0.4)' : 'rgba(42,26,14,0.7)'
      r.lineWidth = conn.isSpouse ? 1.2 : 2
      r.stroke()
    }

    for (const [id, p] of positions) {
      const member = family.members.find((m) => m.id === id)!
      const charData = member.characterId ? characters.get(member.characterId) : undefined
      const name = charData?.name ?? member.name
      const isDeceased = member.isDeceased
      const isSelected = selectedId === member.characterId

      const nx = tx(p.x)
      const ny = ty(p.y)
      const d = (NODE_D / 2) * scale

      regions.push({
        type: 'character',
        id: member.characterId ?? member.id,
        rect: { x: nx - d, y: ny - d, w: d * 2, h: d * 2 },
        page: 'right' as const,
      })

      r.beginPath()
      r.arc(nx, ny, d, 0, Math.PI * 2)
      r.strokeStyle = '#c4a86a'
      r.lineWidth = 1.5
      r.stroke()

      r.beginPath()
      r.arc(nx, ny, d - 1, 0, Math.PI * 2)
      r.fillStyle = '#f5efe6'
      r.fill()

      r.fillStyle = '#8a7050'
      r.font = `bold ${d * 0.7}px Georgia, serif`
      r.textAlign = 'center'
      r.textBaseline = 'middle'
      r.fillText(name.charAt(0).toUpperCase(), nx, ny + 1)

      r.font = `bold ${14 * scale}px Georgia, serif`
      r.fillStyle = isDeceased ? '#8a7a6a' : INK
      r.textAlign = 'center'
      r.textBaseline = 'top'
      r.fillText(name.toUpperCase(), nx, ny + d + 4 * scale)

      if (isSelected) {
        r.beginPath()
        r.arc(nx, ny, d + 3, 0, Math.PI * 2)
        r.strokeStyle = '#c4a86a'
        r.lineWidth = 1
        r.globalAlpha = 0.6
        r.stroke()
        r.globalAlpha = 1
      }
    }
  }

  // Annotation (if detailId)
  if (detailId) {
    const detailChar = characters.get(detailId) ?? null
    const detailMember = detailId ? (family.members.find((m) => m.characterId === detailId) ?? null) : null
    if (detailChar && detailMember) {
      const annY = H - 210

      r.fillStyle = '#f8f3ea'
      r.fillRect(20, annY, W - 40, 190)
      r.strokeStyle = 'rgba(196,184,160,0.35)'
      r.lineWidth = 0.5
      r.strokeRect(20, annY, W - 40, 190)

      // Portrait circle
      const portX = 48
      const portY = annY + 30
      r.beginPath()
      r.arc(portX, portY, 22, 0, Math.PI * 2)
      r.fillStyle = '#c4a86a'
      r.fill()
      r.fillStyle = '#f5efe6'
      r.font = 'bold 20px Georgia, serif'
      r.textAlign = 'center'
      r.textBaseline = 'middle'
      r.fillText(detailMember.name.charAt(0).toUpperCase(), portX, portY)

      // Name
      r.textAlign = 'left'
      r.textBaseline = 'top'
      r.font = 'bold 18px Georgia, serif'
      r.fillStyle = INK
      r.fillText(detailMember.name.toUpperCase(), 80, annY + 12)

      // Description
      r.font = '14px Georgia, serif'
      r.fillStyle = '#6b5a4a'
      const words = detailChar.description.split(' ')
      let line = ''
      let lineY = annY + 38
      for (const word of words) {
        const test = line ? line + ' ' + word : word
        if (r.measureText(test).width > W - 120 && line) {
          r.fillText(line, 80, lineY)
          line = word
          lineY += 20
        } else line = test
      }
      if (line) r.fillText(line, 80, lineY)
    }
  }

  const leftTexture = makeTexture(leftCanvas)
  const rightTexture = makeTexture(rightCanvas)

  return { leftTexture, rightTexture, regions }
}

export function findClickRegion(
  px: number,
  py: number,
  page: 'left' | 'right',
  regions: GenealogyClickRegion[],
): GenealogyClickRegion | null {
  for (const r of regions) {
    if (r.page !== page) continue
    if (px >= r.rect.x && px <= r.rect.x + r.rect.w && py >= r.rect.y && py <= r.rect.y + r.rect.h) return r
  }
  return null
}
