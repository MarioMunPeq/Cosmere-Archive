/**
 * The Diagram of Taravangian — §5.6, under D-DIEG.
 *
 * ## Why this has its own route
 *
 * It did not have one. The nav entry called "Taravangian Diagram" pointed at
 * `/stats`, and the mural was one section of a statistics page — which makes
 * §5.6's own criteria impossible: a fixed 360px column has nothing to fix
 * itself against in a scrolling list of ten sections, and a panel at 88vh is
 * not 88vh of anything.
 *
 * The plan's objective for this screen is *"que el mural deje de ser decorativo
 * y pase a ser el índice del archivo"*. An index is a destination.
 *
 * ## What moved out of `/stats`
 *
 * Only the mural. `/stats` keeps its counts, its distributions and its
 * bookshelf — it stops being the place the Diagram happens to live. The tallies
 * on the wall draw from the same generated data it does, which is why they can
 * move without either page inventing a number.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { DiagramScene } from '@/components/diagram/DiagramScene'
import ReadingPanel from '@/components/diagram/ReadingPanel'
import { noteFor, type DiagramNote } from '@/data/static/diagram-notes'
import { BOOKS } from '@/data/static/books'
import { ALL_CHARACTERS } from '@/data/static'
import { PLANETS } from '@/data/static/planets'
import { MAGICS } from '@/data/static/diagram-totals'
import { HONORBLADES } from '@/data/static/aharietiam'

export default function TaravangianPage() {
  useSEOMeta({
    title: 'The Diagram — Cosmere Archive',
    description:
      'The shapes the Thirteenth Shard left behind: nine sheets of speculation, tally and correction, pinned to a wall.',
  })

  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const active: DiagramNote | null = useMemo(() => (activeId ? noteFor(activeId) : null), [activeId])
  const hovered: DiagramNote | null = useMemo(() => (hoveredId ? noteFor(hoveredId) : null), [hoveredId])

  /** The counts the wall shows, read from the same generated data as the site. */
  const totals = useMemo(() => {
    const bySaga = countBySaga()
    const pubYears = BOOKS.map((b) => b.year ?? 0).filter((y) => y > 0)
    return {
      bookCountBySaga: bySaga,
      charCountByPlanet: countByPlanet(),
      totalWords: BOOKS.reduce((a, b) => a + (b.wordCount ?? 0), 0),
      bookCount: BOOKS.length,
      charCount: ALL_CHARACTERS.length,
      planetCount: PLANETS.length,
      sagaCount: MAGICS.seriesCount,
      eventCount: MAGICS.eventCount,
      heraldCount: HONORBLADES.length,
      shardCount: MAGICS.shardCount,
      pubYears,
      pubMin: pubYears.length ? Math.min(...pubYears) : 0,
      pubMax: pubYears.length ? Math.max(...pubYears) : 0,
      maxSagaCount: Math.max(1, ...bySaga.map(([, n]) => n)),
    }
  }, [])

  const onPick = useCallback((id: string) => setActiveId((current) => (current === id ? null : id)), [])
  const onClose = useCallback(() => setActiveId(null), [])

  /*
   * `Esc` backs out of a sheet.
   *
   * On the window rather than on the page element, because the page element is
   * not focusable: a `keydown` handler on a `div` without `tabindex` only ever
   * sees a key that something *inside* it bubbled up from, and once a reader has
   * clicked a sheet the focus is in the canvas's own drag handling. The window
   * is the only listener that is always told.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      data-taravangian
      // Column on a phone — the panel is a sheet *below* the wall. Row from
      // `md`, where the panel becomes a bound column on the right.
      //
      // `relative z-10` on the panel matters as much as the direction: the
      // mural paints a 5000x5000 sheet of absolutely positioned paper, and
      // without a stacking context above it, every click on the index landed on
      // the wall instead.
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--surface-base)] md:flex-row"
    >
      <main className="relative min-h-0 flex-1">
        <DiagramScene {...totals} activeDoc={activeId} onSelect={onPick} onHover={setHoveredId} />
      </main>

      <ReadingPanel active={active} hovered={hovered} onPick={onPick} onHover={setHoveredId} onClose={onClose} />
    </div>
  )
}

function countBySaga(): [string, number][] {
  const tally = new Map<string, number>()
  for (const b of BOOKS) tally.set(b.saga, (tally.get(b.saga) ?? 0) + 1)
  return [...tally].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function countByPlanet(): { name: string; count: number; id: string }[] {
  const tally = new Map<string, number>()
  for (const c of ALL_CHARACTERS) {
    const id = c.planet ?? ''
    if (id) tally.set(id, (tally.get(id) ?? 0) + 1)
  }
  const byId = new Map(PLANETS.map((p) => [p.id, p]))
  return [...tally]
    .map(([id, count]) => ({ id, count, name: byId.get(id)?.name ?? id }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
