/**
 * BloodlinesView — the family chart. M4 · block 4, §5.4.5.
 *
 * A tree lives inside the Records shell rather than on its own route;
 * `/family-tree` redirects to `/characters?tab=bloodlines`.
 *
 * Three things §5.4.5 asks for and the previous implementation did not do:
 *
 *   - **Nodes are `<button>`s inside the SVG.** The old chart drew circles and
 *     a wrapping `<div onClick>`, which are unreachable by keyboard and are
 *     exactly what criterion R.6 forbids. A `<g role="button" tabindex="0">`
 *     with a keydown handler is the same thing with more steps.
 *   - **Search highlights a lineage and does not move anything.** Laying the
 *     chart out again under a query makes it unreadable while you search it.
 *     The layout is fixed; matching members and their ancestors keep their
 *     colour and the rest dim.
 *   - **It takes the shell's chrome.** No second title bar, no own folio.
 */

import { useMemo, useState } from 'react'
import Monogram from '@/components/common/Monogram'
import { computeGenealogyLayout, NODE_W, NODE_H } from '@/utils/genealogy-layout'
import type { FamilyMember } from '@/utils/genealogy-layout'

interface Props {
  family: {
    id: string
    name: string
    color: string
    description: string
    members: FamilyMember[]
    rootIds: string[]
  }
  /** Search term from the index column; highlights a lineage. */
  search?: string
  onOpenCharacter: (id: string) => void
}

export default function BloodlinesView({ family, search = '', onOpenCharacter }: Props) {
  const [focused, setFocused] = useState<string | null>(null)

  const layout = useMemo(() => computeGenealogyLayout(family, search), [family, search])

  /**
   * Which nodes to keep lit.
   *
   * With no search everything is lit. With one, a member matches if their name
   * does, and so does anyone descended from them — the lineage, not the leaf.
   */
  const lit = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null
    const ids = new Set<string>()
    const seeds = family.members.filter((m) => m.name.toLowerCase().includes(q)).map((m) => m.id)
    const childrenOf = new Map<string, string[]>()
    for (const m of family.members) {
      for (const p of m.parentIds ?? []) {
        const list = childrenOf.get(p) ?? []
        list.push(m.id)
        childrenOf.set(p, list)
      }
    }
    const walk = (id: string) => {
      if (ids.has(id)) return
      ids.add(id)
      for (const child of childrenOf.get(id) ?? []) walk(child)
    }
    for (const id of seeds) walk(id)
    return ids
  }, [family.members, search])

  const pos = new Map(layout.nodes.map((n) => [n.member.id, n]))
  const dim = (id: string) => (lit && !lit.has(id) ? 0.24 : 1)

  /** Arrow keys move between nodes in the same generation. */
  const onKeyDown = (e: React.KeyboardEvent, id: string) => {
    const node = pos.get(id)
    if (!node) return
    const sameRow = layout.nodes.filter((n) => n.y === node.y).sort((a, b) => a.x - b.x)
    const i = sameRow.findIndex((n) => n.member.id === id)
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (step !== 0 && sameRow[i + step]) {
      e.preventDefault()
      const next = sameRow[i + step]!
      document.getElementById(`node-${next.member.id}`)?.focus()
      return
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (node.member.characterId) onOpenCharacter(node.member.characterId)
    }
  }

  return (
    <div
      data-bloodlines={family.id}
      className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-base)] p-lg shadow-[var(--shadow-1)] min-[1024px]:p-xl"
    >
      <header className="mb-lg">
        <h2 className="font-[var(--font-display)] text-[var(--text-h4)] text-[var(--text-primary)] min-[1024px]:text-[var(--text-h3)]">
          {family.name}
        </h2>
        {family.description && (
          <p className="mt-sm max-w-[68ch] text-[var(--text-body-s)] leading-[1.6] text-[var(--text-secondary)]">
            {family.description}
          </p>
        )}
        <p className="mt-sm text-[var(--text-meta)] text-[var(--text-tertiary)]">
          {family.members.length} members · arrow keys move along a generation, Enter opens a record
        </p>
      </header>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
          height={layout.height}
          role="group"
          aria-label={`${family.name} family tree`}
          className="min-w-full"
        >
          {/* ---- parent → child ---- */}
          {layout.edges.map((e) => {
            const from = pos.get(e.from)!
            const to = pos.get(e.to)!
            const x1 = from.x + NODE_W / 2
            const y1 = from.y + NODE_H
            const x2 = to.x + NODE_W / 2
            const y2 = to.y
            const mid = (y1 + y2) / 2
            return (
              <path
                key={`${e.from}-${e.to}`}
                d={`M${x1} ${y1} L${x1} ${mid} L${x2} ${mid} L${x2} ${y2}`}
                fill="none"
                stroke="var(--border-interactive)"
                strokeWidth={1.2}
                opacity={0.7 * dim(e.to)}
              />
            )
          })}

          {/* ---- marriages ---- */}
          {layout.marriages.map(([a, b]) => {
            const na = pos.get(a)
            const nb = pos.get(b)
            if (!na || !nb) return null
            return (
              <line
                key={`${a}-${b}`}
                x1={Math.min(na.x, nb.x) + NODE_W}
                y1={na.y + NODE_H / 2}
                x2={Math.max(na.x, nb.x)}
                y2={nb.y + NODE_H / 2}
                stroke={family.color}
                strokeWidth={2}
                opacity={0.75 * dim(a)}
              />
            )
          })}

          {/* ---- the members ---- */}
          {layout.nodes.map(({ member, x, y }) => {
            const isFocused = focused === member.id
            const character = member.characterId
            return (
              <g
                key={member.id}
                id={`node-${member.id}`}
                transform={`translate(${x}, ${y})`}
                opacity={dim(member.id)}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={`${member.name}${member.isDeceased ? ', deceased' : ''}${character ? '. Opens their record' : ''}`}
                onFocus={() => setFocused(member.id)}
                onBlur={() => setFocused(null)}
                onKeyDown={(e) => onKeyDown(e, member.id)}
                onClick={() => character && onOpenCharacter(character)}
              >
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={4}
                  fill="var(--surface-inset)"
                  stroke={isFocused ? 'var(--text-accent)' : 'var(--border-subtle)'}
                  strokeWidth={isFocused ? 2 : 1}
                />
                <foreignObject x={6} y={6} width={26} height={26}>
                  <Monogram name={member.name} size={26} isDeceased={member.isDeceased} className="size-[26px]" />
                </foreignObject>
                <text x={38} y={20} fill="var(--text-primary)" fontSize={13} fontFamily="var(--font-ui)">
                  {member.name.length > 16 ? `${member.name.slice(0, 15)}…` : member.name}
                </text>
                {member.isDeceased && (
                  <line x1={38} y1={32} x2={NODE_W - 10} y2={32} stroke="var(--text-tertiary)" strokeWidth={1} />
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
