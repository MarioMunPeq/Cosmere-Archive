import type { CosmicEra } from '@/data/static/timeline'

interface Props {
  eras: CosmicEra[]
  selectedEra: string | null
  onSelect: (id: string | null) => void
}

export default function ChapterNav({ eras, selectedEra, onSelect }: Props) {
  return (
    <nav className="flex flex-wrap items-baseline gap-x-10 gap-y-3 px-6 py-4">
      {eras.map((era) => {
        const active = selectedEra === era.id
        return (
          <button
            key={era.id}
            onClick={() => onSelect(active ? null : era.id)}
            className={`group text-left transition-all duration-500`}
          >
            <span
              className={`block font-serif text-xs tracking-[0.25em] uppercase transition-all duration-500 ${
                active ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'
              }`}
              style={{ letterSpacing: '0.25em' }}
            >
              {era.name}
            </span>
            <span
              className={`mt-1 block h-px transition-all duration-500 ${
                active ? 'w-full opacity-60' : 'w-0 group-hover:w-full opacity-20'
              }`}
              style={{ backgroundColor: era.color }}
            />
          </button>
        )
      })}
    </nav>
  )
}
