import { SAGAS, SAGA_BY_ID, TAILWIND_TO_HEX, FALLBACK_COLOR } from '@/data/static'
import { MAX_FORK_SAGAS } from '@/constants'

interface Props {
  selectedSagas: string[]
  onToggle: (id: string) => void
}

function getSagaColor(id: string): string {
  const saga = SAGA_BY_ID.get(id)
  return TAILWIND_TO_HEX[saga?.color ?? ''] ?? FALLBACK_COLOR
}

export default function SagaIndex({ selectedSagas, onToggle }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-px px-6 py-3">
      {SAGAS.map((saga) => {
        const active = selectedSagas.includes(saga.id)
        const maxed = !active && selectedSagas.length >= MAX_FORK_SAGAS
        const color = getSagaColor(saga.id)

        return (
          <button
            key={saga.id}
            onClick={() => onToggle(saga.id)}
            disabled={maxed}
            className={`relative flex items-center gap-2.5 px-4 py-2 text-xs transition-all duration-500 ${
              active ? 'text-gray-200' : 'text-gray-600 hover:text-gray-400'
            } ${maxed ? 'cursor-not-allowed opacity-25' : 'cursor-pointer'}`}
            style={active ? { backgroundColor: `${color}0c` } : undefined}
          >
            {active && (
              <span
                className="absolute inset-y-0 left-0 w-0.5 transition-all duration-500"
                style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
              />
            )}
            <span
              className="inline-block h-1.5 w-1.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: active ? color : '#374151',
                opacity: active ? 1 : 0.5,
              }}
            />
            <span className="font-serif tracking-wider">{saga.name}</span>
          </button>
        )
      })}
    </div>
  )
}
