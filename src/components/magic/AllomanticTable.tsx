import { useState } from 'react'
import { ALLOMANTIC_METALS, type AllomanticMetal } from '@/data/static/magic-systems'
import ColorDot from '@/components/ui/ColorDot'

const GROUP_ORDER: AllomanticMetal['group'][] = ['physical', 'mental', 'temporal', 'enhancement']
const GROUP_LABELS: Record<AllomanticMetal['group'], string> = {
  physical: 'Physical',
  mental: 'Mental',
  temporal: 'Temporal',
  enhancement: 'Enhancement',
}
const GROUP_COLORS: Record<AllomanticMetal['group'], string> = {
  physical: '#f97316',
  mental: '#10b981',
  temporal: '#8b5cf6',
  enhancement: '#06b6d4',
}

function MetalCard({
  metal,
  selected,
  onSelect,
}: {
  metal: AllomanticMetal
  selected: boolean
  onSelect: (m: AllomanticMetal | null) => void
}) {
  return (
    <button
      onClick={() => onSelect(selected ? null : metal)}
      className={`rounded-lg border p-3 text-left transition-all ${
        selected
          ? 'border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-900/20'
          : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: metal.color }} />
        <span className="text-sm font-semibold text-gray-200">{metal.name}</span>
        <span className="text-xxs text-gray-500">/ {metal.alloy}</span>
      </div>
      <p className="mt-1.5 text-xs text-gray-400">{metal.allomanticPower}</p>
    </button>
  )
}

const ALLOMANTIC_ATTRS: { key: keyof AllomanticMetal; label: string }[] = [
  { key: 'allomanticPower', label: 'Allomantic' },
  { key: 'feruchemicalPower', label: 'Feruchemical' },
  { key: 'hemalurgicProperty', label: 'Hemalurgic' },
]

export default function AllomanticTable() {
  const [selectedMetal, setSelectedMetal] = useState<AllomanticMetal | null>(null)

  return (
    <div>
      <p className="mb-3 text-xs text-gray-500">Each metal has Allomantic, Feruchemical, and Hemalurgic properties</p>

      <div className="space-y-4">
        {GROUP_ORDER.map((group) => {
          const metals = ALLOMANTIC_METALS.filter((m) => m.group === group)
          return (
            <div key={group}>
              <div className="mb-2 flex items-center gap-2">
                <ColorDot color={GROUP_COLORS[group]} />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {GROUP_LABELS[group]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {metals.map((metal) => (
                  <MetalCard
                    key={metal.id}
                    metal={metal}
                    selected={selectedMetal?.id === metal.id}
                    onSelect={setSelectedMetal}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedMetal && (
        <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedMetal.color }} />
            <h4 className="text-sm font-bold text-gray-200">
              {selectedMetal.name} / {selectedMetal.alloy}
            </h4>
          </div>
          <div className="mt-3 space-y-2">
            {ALLOMANTIC_ATTRS.map(({ key, label }) => (
              <div key={key}>
                <span className="text-xxs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
                <p className="mt-0.5 text-sm text-gray-300">{selectedMetal[key]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
