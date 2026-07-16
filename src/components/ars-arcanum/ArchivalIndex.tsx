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
    for (const s of sorted) {
      const letter = s.name.charAt(0).toUpperCase()
      const existing = groups.get(letter) ?? []
      existing.push(s)
      groups.set(letter, existing)
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [systems])

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-serif text-xs uppercase tracking-[0.15em] mb-5" style={{ color: 'rgba(80,60,40,0.35)' }}>
        Alphabetical Index
      </h2>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {alphabetical.map(([letter, entries]) => (
          <div key={letter}>
            <span
              className="font-serif text-[11px] font-bold tracking-[0.04em]"
              style={{ color: 'rgba(60,40,25,0.4)' }}
            >
              {letter}
            </span>
            {entries.map((s) => (
              <span
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectSystem(s)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectSystem(s)
                  }
                }}
                className="block font-serif text-[12px] py-[2px] cursor-pointer transition-opacity hover:opacity-60"
                style={{ color: 'rgba(60,40,25,0.55)' }}
              >
                {s.name}
                <span className="ml-2 font-serif text-[9px] italic" style={{ color: 'rgba(80,60,40,0.2)' }}>
                  — Ch. {getChapterNum(s.planetId)}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
