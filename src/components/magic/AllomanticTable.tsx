import { useState } from 'react'
import { ALLOMANTIC_METALS, type AllomanticMetal } from '@/data/static/magic-systems'

const GROUP_ORDER: AllomanticMetal['group'][] = ['physical', 'mental', 'temporal', 'enhancement']
const GROUP_LABELS: Record<AllomanticMetal['group'], string> = {
  physical: 'Physical',
  mental: 'Mental',
  temporal: 'Temporal',
  enhancement: 'Enhancement',
}
const GROUP_COLORS: Record<AllomanticMetal['group'], string> = {
  physical: '#c47a3a',
  mental: '#3a8c6f',
  temporal: '#6a5a9a',
  enhancement: '#3a7a9a',
}

const METAL_ATTRS: { key: keyof AllomanticMetal; label: string }[] = [
  { key: 'allomanticPower', label: 'Allomantic' },
  { key: 'feruchemicalPower', label: 'Feruchemical' },
  { key: 'hemalurgicProperty', label: 'Hemalurgic' },
]

interface ExpandedState {
  [metalId: string]: boolean
}

export default function AllomanticTable() {
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div>
      <p className="font-serif text-[10px] italic mb-4" style={{ color: 'rgba(80,60,40,0.35)' }}>
        Each of the sixteen metals manifests three distinct properties — Allomantic, Feruchemical, and Hemalurgic.
      </p>

      <div className="space-y-4">
        {GROUP_ORDER.map((group) => {
          const metals = ALLOMANTIC_METALS.filter((m) => m.group === group)
          const color = GROUP_COLORS[group]
          return (
            <div key={group}>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-px flex-1" style={{ background: `rgba(80,60,40,0.08)` }} />
                <span className="font-serif text-[9px] uppercase tracking-[0.15em]" style={{ color: `${color}99` }}>
                  {GROUP_LABELS[group]}
                </span>
                <span className="h-px flex-1" style={{ background: `rgba(80,60,40,0.08)` }} />
              </div>
              {metals.map((metal) => {
                const isOpen = expanded[metal.id] ?? false
                return (
                  <div key={metal.id}>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleExpanded(metal.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleExpanded(metal.id)
                        }
                      }}
                      className="group flex items-baseline gap-2 py-[3px] cursor-pointer"
                      style={{ color: 'rgba(60,40,25,0.6)' }}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0 inline-block"
                        style={{ backgroundColor: metal.color }}
                      />
                      <span className="font-serif text-[13px] font-medium" style={{ color: '#2d1a0e' }}>
                        {metal.name}
                      </span>
                      <span className="font-serif text-[10px]" style={{ color: 'rgba(80,60,40,0.25)' }}>
                        / {metal.alloy}
                      </span>
                      <span
                        className="ml-auto font-serif text-[9px] transition-opacity"
                        style={{ color: 'rgba(80,60,40,0.15)' }}
                      >
                        {isOpen ? '△' : '▽'}
                      </span>
                    </span>
                    {isOpen && (
                      <div className="ml-5 mb-1 pb-1 border-l pl-3" style={{ borderColor: 'rgba(80,60,40,0.08)' }}>
                        {METAL_ATTRS.map(({ key, label }) => (
                          <p
                            key={key}
                            className="font-serif text-[11px] leading-relaxed"
                            style={{ color: 'rgba(60,40,25,0.6)' }}
                          >
                            <span
                              className="text-[9px] uppercase tracking-[0.08em]"
                              style={{ color: 'rgba(80,60,40,0.25)' }}
                            >
                              {label}
                            </span>
                            {' — '}
                            {metal[key]}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
