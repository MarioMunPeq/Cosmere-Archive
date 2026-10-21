import { useMemo } from 'react'
import type { MagicSystem } from '@/data/static/magic-systems'

interface Props {
  systems: MagicSystem[]
  onSelectSystem: (system: MagicSystem) => void
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'] as const
const CHAPTER_ORDER = [
  'yolen',
  'roshar',
  'scadrial',
  'sel',
  'nalthis',
  'taldain',
  'threnody',
  'first-of-the-sun',
  'komashi',
  'lumar',
  'canticle',
]

function getChapterNum(planetId: string): string {
  const idx = CHAPTER_ORDER.indexOf(planetId)
  return idx >= 0 ? (ROMAN[idx] ?? '') : ''
}

export default function ArchivalIndex({ systems, onSelectSystem }: Props) {
  const alphabetical = useMemo(() => {
    const sorted = [...systems].sort((a, b) => a.name.localeCompare(b.name))
    const groups = new Map<string, MagicSystem[]>()
    for (const system of sorted) {
      const letter = system.name.charAt(0).toUpperCase()
      const existing = groups.get(letter) ?? []
      existing.push(system)
      groups.set(letter, existing)
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [systems])

  return (
    <div className="flex h-full flex-col">
      <h2
        className="mb-5 text-[12px] uppercase tracking-[0.15em] [font-family:var(--font-ui)]"
        style={{ color: 'var(--text-on-page-secondary)' }}
      >
        Alphabetical Index
      </h2>

      <div className="flex-1 space-y-3">
        {alphabetical.map(([letter, entries]) => (
          <div key={letter}>
            <span
              className="text-[11px] font-bold tracking-[0.04em] [font-family:var(--font-display)]"
              style={{ color: 'var(--text-on-page-tertiary)' }}
            >
              {letter}
            </span>
            {entries.map((system) => (
              <button
                key={system.id}
                type="button"
                onClick={() => onSelectSystem(system)}
                className="block w-full cursor-pointer border-0 bg-transparent p-0 py-[2px] text-left text-[12px] transition-colors duration-150 hover:text-[color:var(--text-on-page-link)] [font-family:var(--font-display)]"
                style={{ color: 'var(--text-on-page-secondary)' }}
              >
                {system.name}
                <span
                  className="ml-2 text-[11px] italic [font-family:var(--font-display)]"
                  style={{ color: 'var(--text-on-page-tertiary)' }}
                >
                  — Ch. {getChapterNum(system.planetId)}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
