import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContentsPage, { type ContentsPart } from '@/components/codex/ContentsPage'
import ThumbTabs, { type ThumbTab } from '@/components/codex/ThumbTabs'
import { ALL_CHARACTERS } from '@/data/static'
import { ARCANUM_CHAPTERS } from '@/utils/ars-arcanum'
import { RECORD_RANGE_COUNT, buildRecordRanges, buildRecordSections, recordSpreadId } from '@/utils/codex-records'
import { buildSpreads } from '@/utils/codex-pages'

function investiturePart(onOpen: (id: string) => void, onOpenIndex: () => void): ContentsPart {
  return {
    id: 'investiture',
    kicker: 'Part I',
    title: 'Investiture',
    total: ARCANUM_CHAPTERS.length,
    totalLabel: 'chapters',
    entries: ARCANUM_CHAPTERS.map(({ planet, systems, numeral }) => ({
      id: planet.id,
      label: planet.name,
      numeral,
      meta: `${systems.length} manifestation${systems.length === 1 ? '' : 's'}`,
      onOpen: () => onOpen(planet.id),
    })),
    indexLabel: 'Archival Index →',
    onOpenIndex,
  }
}

function recordsPart(onOpen: (id: string) => void): ContentsPart {
  const ranges = buildRecordRanges(ALL_CHARACTERS)
  return {
    id: 'records',
    kicker: 'Part II',
    title: 'Biographical Records',
    total: ALL_CHARACTERS.length,
    totalLabel: 'records',
    ranges: ranges.map((range) => ({
      id: range.id,
      label: range.label,
      count: range.count,
      firstRecordName: range.records[0]?.name,
      onOpen: () => onOpen(range.firstSpreadId),
      entries: range.records.map((record) => ({
        id: record.id,
        label: record.name,
        onOpen: () => onOpen(recordSpreadId(record.id)),
      })),
    })),
  }
}

describe('Codex · contents', () => {
  it('derives the eleven world chapters from the archive data', () => {
    expect(ARCANUM_CHAPTERS).toHaveLength(11)
    expect(ARCANUM_CHAPTERS.map((chapter) => chapter.numeral)).toEqual([
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
      'XI',
    ])
  })

  it('lists eleven world chapters and the ninety-three record companions', async () => {
    const onOpen = vi.fn()
    const { container } = render(
      <ContentsPage
        part={investiturePart(onOpen, vi.fn())}
        companion={{
          kicker: 'Part II',
          title: 'Biographical Records',
          count: 93,
          countLabel: 'records',
          onOpen: vi.fn(),
        }}
      />,
    )

    const worlds = container.querySelectorAll('[data-contents-kind="world"]')
    expect(worlds).toHaveLength(11)
    expect(screen.getByText('11 chapters')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /93 records — open Part II/ })).toBeInTheDocument()

    await userEvent.click(worlds[0] as HTMLElement)
    expect(onOpen).toHaveBeenCalledWith('yolen')
  })

  it('lists all ninety-three records in eight ranges', () => {
    const onOpen = vi.fn()
    const { container } = render(<ContentsPage part={recordsPart(onOpen)} />)

    expect(container.querySelectorAll('[data-contents-kind="record"]')).toHaveLength(93)
    expect(container.querySelectorAll('[data-contents-kind="range"]')).toHaveLength(8)
    expect(screen.getByText('93 records')).toBeInTheDocument()
  })

  it('opens the first record of a range from its range heading', async () => {
    const onOpen = vi.fn()
    const ranges = buildRecordRanges(ALL_CHARACTERS)
    const { container } = render(<ContentsPage part={recordsPart(onOpen)} />)
    const rangeButtons = container.querySelectorAll('[data-contents-kind="range"]')
    const firstRange = ranges[0]!

    expect(rangeButtons[0]).toHaveAccessibleName(
      new RegExp(`^${firstRange.label}: ${firstRange.count} records, starting with`),
    )
    await userEvent.click(rangeButtons[0] as HTMLElement)
    expect(onOpen).toHaveBeenLastCalledWith(firstRange.firstSpreadId)

    const firstRecord = container.querySelector('[data-contents-kind="record"]') as HTMLElement
    await userEvent.click(firstRecord)
    expect(onOpen).toHaveBeenLastCalledWith(recordSpreadId(firstRange.records[0]!.id))
  })
})

describe('Codex · thumb index', () => {
  it('renders one 26 x 38 slip per world and opens a chapter', async () => {
    const onSelect = vi.fn()
    const tabs: ThumbTab[] = ARCANUM_CHAPTERS.map(({ planet, systems, numeral }) => ({
      id: planet.id,
      label: numeral,
      ariaLabel: `${numeral} — ${planet.name}, ${systems.length} manifestation${systems.length === 1 ? '' : 's'}`,
      onSelect: () => onSelect(planet.id),
    }))
    const { container } = render(<ThumbTabs label="World chapters" tabs={tabs} />)

    expect(container.querySelectorAll('[data-thumb]')).toHaveLength(11)
    expect(container.querySelector('.codex-thumb')).toHaveClass('codex-thumb')

    const first = ARCANUM_CHAPTERS[0]!
    await userEvent.click(
      screen.getByRole('button', {
        name: new RegExp(`^${first.numeral} — ${first.planet.name}`),
      }),
    )
    expect(onSelect).toHaveBeenCalledWith(first.planet.id)
  })

  it('marks the active world and renders eight record ranges', async () => {
    const onSelect = vi.fn()
    const ranges = buildRecordRanges(ALL_CHARACTERS)
    const tabs: ThumbTab[] = ranges.map((range) => ({
      id: range.id,
      label: range.label,
      ariaLabel: `${range.label} — ${range.count} records, starting with ${range.records[0]?.name}`,
      onSelect: () => onSelect(range.firstSpreadId),
    }))

    const activeTabs = tabs.map((tab, index) => (index === 0 ? { ...tab, active: true } : tab))
    const { container } = render(<ThumbTabs label="Record ranges" tabs={activeTabs} />)

    expect(container.querySelectorAll('[data-thumb]')).toHaveLength(RECORD_RANGE_COUNT)
    expect(screen.getByRole('button', { name: new RegExp(`^${ranges[0]!.label}`) })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${ranges[0]!.label}`) }))
    expect(onSelect).toHaveBeenCalledWith(ranges[0]!.firstSpreadId)
  })
})

describe('Codex · record pagination', () => {
  it('keeps all ninety-three records and gives each one a spread', () => {
    expect(ALL_CHARACTERS).toHaveLength(93)

    const ranges = buildRecordRanges(ALL_CHARACTERS)
    expect(ranges).toHaveLength(RECORD_RANGE_COUNT)
    expect(ranges[0]?.label).toBe('A–C')
    expect(ranges[RECORD_RANGE_COUNT - 1]?.label).toBe('W–Z')
    expect(ranges.reduce((total, range) => total + range.count, 0)).toBe(93)

    const spreads = buildSpreads(buildRecordSections(ALL_CHARACTERS))
    expect(spreads).toHaveLength(93)
    expect(spreads[0]?.id).toBe(ranges[0]?.firstSpreadId)
    expect(spreads[0]?.characterIds).toEqual([ranges[0]?.records[0]?.id])
  })
})
