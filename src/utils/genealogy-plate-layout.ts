/**
 * Genealogy plate layout — the medallion tree used by Volume II.
 *
 * The older `genealogy-layout` utility positions rectangular record cards. A
 * plate is a different object: faces in a round well, names printed underneath,
 * and enough air between rows for the branches to be read. The generation
 * ordering is still the one genealogists expect, so this builds on the same
 * parentage pass rather than growing a second interpretation of the data.
 */

import { computeGenealogyLayout, type LaidOutMember } from './genealogy-layout'
import type { FamilyDefinition } from '@/types/family'

export const PLATE_MEDALLION = 72
export const PLATE_MEDALLION_COMPACT = 56
export const PLATE_NODE_WIDTH = 72
export const PLATE_NODE_WIDTH_COMPACT = 62
export const PLATE_NODE_HEIGHT = 124
export const PLATE_NODE_HEIGHT_COMPACT = 102
export const PLATE_COLUMN_GAP = 18
export const PLATE_COLUMN_GAP_COMPACT = 12
export const PLATE_ROW_GAP = 44
export const PLATE_ROW_GAP_COMPACT = 36

export interface PlateNode extends LaidOutMember {
  /** Centre of the portrait medallion, not the label box. */
  cx: number
  cy: number
  /** Zero-based generation, top to bottom. */
  row: number
  /** Zero-based position within that generation. */
  column: number
}

export interface PlateLayout {
  nodes: PlateNode[]
  width: number
  height: number
  medallion: number
  nodeWidth: number
  nodeHeight: number
  rowCount: number
}

export interface PlateLayoutOptions {
  /** Diameter of the portrait medallion. */
  medallion?: number
  /** Width reserved for the name under the medallion. */
  nodeWidth?: number
}

function byGeneration(nodes: readonly LaidOutMember[]): LaidOutMember[][] {
  const rows = new Map<number, LaidOutMember[]>()
  for (const node of nodes) {
    const row = rows.get(node.y)
    if (row) row.push(node)
    else rows.set(node.y, [node])
  }
  return [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, row]) => row)
}

/**
 * Lays out one house as a plate.
 *
 * Rows are generations. Within a row, the ancestry utility's left-to-right
 * order is kept, which is what places spouses beside one another and keeps
 * siblings in reading order. Each row is centred independently so a single
 * founder does not sit against the left margin of a wide dynasty.
 */
export function computePlateLayout(family: FamilyDefinition, options: PlateLayoutOptions = {}): PlateLayout {
  const medallion = options.medallion ?? PLATE_MEDALLION
  const compact = medallion <= PLATE_MEDALLION_COMPACT + 2
  const nodeWidth = options.nodeWidth ?? (compact ? PLATE_NODE_WIDTH_COMPACT : PLATE_NODE_WIDTH)
  const nodeHeight = compact ? PLATE_NODE_HEIGHT_COMPACT : PLATE_NODE_HEIGHT
  const columnGap = compact ? PLATE_COLUMN_GAP_COMPACT : PLATE_COLUMN_GAP
  const rowGap = compact ? PLATE_ROW_GAP_COMPACT : PLATE_ROW_GAP

  const base = computeGenealogyLayout(family)
  const rows = byGeneration(base.nodes)
  const widest = Math.max(1, ...rows.map((row) => row.length))
  const width = widest * nodeWidth + (widest - 1) * columnGap
  const height = rows.length * nodeHeight + Math.max(0, rows.length - 1) * rowGap

  const nodes: PlateNode[] = []
  rows.forEach((unordered, rowIndex) => {
    const row = [...unordered].sort((a, b) => a.x - b.x)
    const rowWidth = row.length * nodeWidth + Math.max(0, row.length - 1) * columnGap
    const left = (width - rowWidth) / 2
    row.forEach((node, column) => {
      const x = left + column * (nodeWidth + columnGap)
      const y = rowIndex * (nodeHeight + rowGap)
      nodes.push({
        ...node,
        x,
        y,
        cx: x + nodeWidth / 2,
        cy: y + medallion / 2,
        row: rowIndex,
        column,
      })
    })
  })

  return { nodes, width, height, medallion, nodeWidth, nodeHeight, rowCount: rows.length }
}

export function parentNodesOf(node: PlateNode, nodes: readonly PlateNode[]): PlateNode[] {
  const ids = new Set(node.member.parentIds ?? [])
  return ids.size === 0 ? [] : nodes.filter((candidate) => ids.has(candidate.member.id))
}

export function spouseNodeOf(node: PlateNode, nodes: readonly PlateNode[]): PlateNode | undefined {
  const spouseId = node.member.spouseId
  return spouseId ? nodes.find((candidate) => candidate.member.id === spouseId) : undefined
}
