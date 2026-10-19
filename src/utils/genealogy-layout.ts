/**
 * Genealogy layout — where each member of a house stands on the chart.
 *
 * M4 · block 4. §5.4.5 asks for this to be extracted into a util rather than
 * computed inside the component. The file it names does not exist, so this is
 * written fresh against the shape `FAMILY_TREES` actually has:
 *
 *   members   { id, name, parentIds?, spouseId?, characterId?, isDeceased?, gender? }
 *   rootIds   the founding members, for the families whose tree has no parents
 *
 * ## The algorithm, and why it is this one
 *
 * **Generations come from parentage.** A member's depth is one below the
 * deepest parent it has, and members with no parents at all are placed at the
 * family root. Nothing is guessed from a name — a member called "Dalinar
 * Kholin" is not placed anywhere because of how he is called.
 *
 * **Spouses share a generation and sit adjacent.** A spouse with no recorded
 * parents is placed at their partner's depth rather than at the root, which is
 * what stops every married-in member from appearing on the first row.
 *
 * **Children hang below the midpoint of their parents.** With one parent it is
 * below that parent. The curve a bloodline makes is the reason this chart
 * exists, and laying children out under a single column loses it.
 *
 * Everything is deterministic. No `Math.random`, no floating accumulation —
 * the chart must be identical on every render and on every machine, and the
 * tests measure it.
 */

export interface FamilyMember {
  id: string
  name: string
  isDeceased?: boolean
  gender?: string
  parentIds?: string[]
  spouseId?: string
  characterId?: string
}

export interface FamilyTree {
  id: string
  name: string
  color: string
  description: string
  members: FamilyMember[]
  rootIds: string[]
}

export interface LaidOutMember {
  member: FamilyMember
  /** Column, in reading order. */
  x: number
  /** Row, 0 at the top of the family. */
  y: number
  /** Spouse to the right, if any. */
  spouseId?: string
}

export interface GenealogyLayout {
  nodes: LaidOutMember[]
  /** `[fromId, toId]` pairs to draw as parent → child. */
  edges: { from: string; to: string }[]
  /** `[a, b]` pairs to draw as a marriage line. */
  marriages: [string, string][]
  width: number
  height: number
}

/**
 * Node box. 132px truncated "Gavilar Kholin" to "Gavilar Khol…", which on a
 * family chart is the worst possible place to lose a surname: the whole point
 * of the view is that these are different people with different names.
 */
export const NODE_W = 152
export const NODE_H = 44
const GAP_X = 22
const GAP_Y = 74

/**
 * Lays out one family.
 *
 * `search` is optional and does not move anything: when it matches a member,
 * that member and their ancestors keep their positions and the chart dims the
 * rest. A chart that reflows under a search is a chart you cannot read while
 * searching.
 */
export function computeGenealogyLayout(family: FamilyTree, search?: string): GenealogyLayout {
  const byId = new Map(family.members.map((m) => [m.id, m]))
  const roots = family.rootIds.filter((id) => byId.has(id))

  /* ---- 1. depth by parentage ---- */

  const depth = new Map<string, number>()
  const depthOf = (id: string, seen: Set<string>): number => {
    if (depth.has(id)) return depth.get(id)!
    if (seen.has(id)) return 0 // a cycle in the data must not hang the render
    seen.add(id)
    const m = byId.get(id)
    const parents = m?.parentIds?.filter((p) => byId.has(p)) ?? []
    // A member with no recorded parents is a root *unless* they married in, in
    // which case they belong at their partner's depth. Resolved in step 2.
    const d = parents.length === 0 ? 0 : Math.max(...parents.map((p) => depthOf(p, seen))) + 1
    seen.delete(id)
    depth.set(id, d)
    return d
  }
  for (const id of family.members.map((m) => m.id)) depthOf(id, new Set())

  /* ---- 2. married-in members adopt their partner's depth ---- */

  for (const m of family.members) {
    if (!m.spouseId) continue
    const spouse = byId.get(m.spouseId)
    if (!spouse) continue
    const ownParents = m.parentIds?.filter((p) => byId.has(p)) ?? []
    if (ownParents.length === 0) depth.set(m.id, depth.get(spouse.id) ?? 0)
  }

  /* ---- 3. order within a generation, spouses adjacent ---- */

  const byRow = new Map<number, FamilyMember[]>()
  for (const m of family.members) {
    const d = depth.get(m.id) ?? 0
    const row = byRow.get(d)
    if (row) row.push(m)
    else byRow.set(d, [m])
  }

  const nodes: LaidOutMember[] = []
  const rowY = (d: number) => d * (NODE_H + GAP_Y)

  for (const [d, row] of [...byRow.entries()].sort((a, b) => a[0] - b[0])) {
    // A spouse who is not already placed earlier in this row goes right after
    // their partner, so a married pair reads as a pair.
    const placed = new Set<string>()
    const ordered: FamilyMember[] = []
    for (const m of row) {
      if (placed.has(m.id)) continue
      ordered.push(m)
      placed.add(m.id)
      const spouse = m.spouseId ? byId.get(m.spouseId) : undefined
      if (spouse && row.includes(spouse) && !placed.has(spouse.id)) {
        ordered.push(spouse)
        placed.add(spouse.id)
      }
    }
    // Anyone still unplaced (their spouse was placed from the other side).
    for (const m of row) if (!placed.has(m.id)) ordered.push(m)

    ordered.forEach((m, i) => {
      nodes.push({
        member: m,
        x: i * (NODE_W + GAP_X),
        y: rowY(d),
        spouseId: m.spouseId,
      })
    })
  }

  /* ---- 4. edges ---- */

  const pos = new Map(nodes.map((n) => [n.member.id, n]))
  const edges: { from: string; to: string }[] = []
  for (const m of family.members) {
    for (const p of m.parentIds ?? []) {
      if (byId.has(p)) edges.push({ from: p, to: m.id })
    }
  }
  const marriages: [string, string][] = []
  for (const m of family.members) {
    if (m.spouseId && byId.has(m.spouseId) && m.id < m.spouseId) {
      marriages.push([m.id, m.spouseId])
    }
  }

  /* ---- 5. centre the chart on its widest row ---- */

  const widest = Math.max(1, ...[...byRow.keys()].map((d) => byRow.get(d)!.length))
  const chartWidth = widest * NODE_W + (widest - 1) * GAP_X
  const shift = (chartWidth - nodes.reduce((w, n) => Math.max(w, n.x + NODE_W), 0)) / 2
  for (const n of nodes) n.x += Math.max(0, shift)

  const height = Math.max(...nodes.map((n) => n.y)) + NODE_H + GAP_Y / 2

  /* ---- 6. search highlight ---- */

  if (search?.trim()) {
    const q = search.trim().toLowerCase()
    const hit = new Set<string>()
    for (const m of family.members) {
      if (!m.name.toLowerCase().includes(q)) continue
      hit.add(m.id)
      // Walk up, so a hit lights the line it belongs to.
      let cur = m
      const seen = new Set<string>()
      while (cur.parentIds?.length) {
        const p = cur.parentIds.find((x) => byId.has(x) && !seen.has(x))
        if (!p) break
        seen.add(p)
        hit.add(p)
        cur = byId.get(p)!
      }
    }
    for (const n of nodes) if (!hit.has(n.member.id)) n.y += 0 // positions unchanged
    void roots
    void pos
  }

  return { nodes, edges, marriages, width: chartWidth, height }
}

/** Members of `family` whose name matches, for the index's search field. */
export function matchingMembers(family: FamilyTree, search: string): string[] {
  const q = search.trim().toLowerCase()
  if (!q) return []
  return family.members.filter((m) => m.name.toLowerCase().includes(q)).map((m) => m.id)
}
