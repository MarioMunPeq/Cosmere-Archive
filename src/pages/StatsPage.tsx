import { useMemo } from 'react'
import { BOOKS, PLANETS, SAGAS, ALL_CHARACTERS } from '@/data/static'
import { TIMELINE_EVENTS } from '@/data/static/timeline'
import { HERALDS } from '@/data/static/heralds'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { DiagramScene } from '@/components/diagram/DiagramScene'

const SAGA_LIST = (SAGAS as { id: string; name: string; color: string; order: number; description?: string }[]).filter(
  (s) => s.id !== 'pre-cosmere',
)

function useStatsData() {
  const bookCountBySaga = useMemo(() => {
    const map = new Map<string, number>()
    const sagaOrder = new Map(SAGA_LIST.map((s, i) => [s.id, i]))
    for (const saga of SAGA_LIST) map.set(saga.id, 0)
    for (const book of BOOKS) map.set(book.saga, (map.get(book.saga) ?? 0) + 1)
    return Array.from(map.entries())
      .filter(([, c]) => c > 0)
      .sort(([a], [b]) => (sagaOrder.get(a) ?? 0) - (sagaOrder.get(b) ?? 0))
  }, [])

  const charCountByPlanet = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of ALL_CHARACTERS) map.set(c.planet, (map.get(c.planet) ?? 0) + 1)
    const pnames = new Map(PLANETS.map((p) => [p.id, p.name]))
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([id, count]) => ({ name: pnames.get(id) ?? id, count, id }))
  }, [])

  const totalWords = useMemo(() => BOOKS.reduce((sum, b) => sum + (b.wordCount ?? 0), 0), [])

  const bookCount = BOOKS.length
  const charCount = ALL_CHARACTERS.length
  const planetCount = PLANETS.length
  const sagaCount = SAGA_LIST.length
  const eventCount = TIMELINE_EVENTS.length
  const heraldCount = HERALDS.length

  const pubYears = useMemo(() => [...new Set(BOOKS.map((b) => b.year).filter((y): y is number => !!y))].sort(), [])
  const pubMin = pubYears[0] ?? 2005
  const pubMax = pubYears[pubYears.length - 1] ?? 2024

  const maxSagaCount = Math.max(...bookCountBySaga.map(([, c]) => c), 1)

  return {
    bookCountBySaga,
    charCountByPlanet,
    totalWords,
    bookCount,
    charCount,
    planetCount,
    sagaCount,
    eventCount,
    heraldCount,
    pubYears,
    pubMin,
    pubMax,
    maxSagaCount,
  }
}

export default function StatsPage() {
  useSEOMeta({
    title: 'The Diagram — Cosmere Archive',
    description: 'The Diagram — an attempt to understand the Cosmere',
  })

  const data = useStatsData()

  return <DiagramScene {...data} />
}
