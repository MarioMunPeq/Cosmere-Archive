import type { CosmicEra } from '@/data/static/timeline'

interface Props {
  eras: CosmicEra[]
  selectedEra: string | null
  onSelect: (id: string | null) => void
}

export default function ChapterNav({ eras, selectedEra, onSelect }: Props) {
  return (
    <nav className="flex flex-nowrap items-center gap-6 overflow-x-auto px-6 py-4">
      {eras.map((era) => {
        const active = selectedEra === era.id
        return (
          <button
            key={era.id}
            data-era-button={era.id}
            data-active={active ? 'true' : 'false'}
            onClick={() => onSelect(active ? null : era.id)}
            className="group flex flex-col items-start whitespace-nowrap transition-all duration-300"
          >
            <span
              className="font-[var(--font-display)] text-[13px] tracking-[0.24em] uppercase"
              style={{ color: active ? '#2a1f14' : '#6b4a2a' }}
            >
              {era.name}
            </span>
            <span
              className="mt-1 h-px transition-all duration-300"
              style={{
                backgroundColor: era.color,
                width: active ? '100%' : '0%',
                opacity: active ? 0.6 : 0.25,
              }}
            />
          </button>
        )
      })}
    </nav>
  )
}
