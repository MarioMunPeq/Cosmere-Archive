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
    setExpanded((previous) => ({ ...previous, [id]: !previous[id] }))
  }

  return (
    <div>
      <p
        className="mb-4 text-[12px] italic leading-relaxed [font-family:var(--font-display)]"
        style={{ color: 'var(--text-on-page-tertiary)' }}
      >
        Each of the sixteen metals manifests three distinct properties — Allomantic, Feruchemical, and Hemalurgic.
      </p>

      <div className="space-y-4">
        {GROUP_ORDER.map((group) => {
          const metals = ALLOMANTIC_METALS.filter((metal) => metal.group === group)
          return (
            <div key={group}>
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: GROUP_COLORS[group] }}
                  aria-hidden="true"
                />
                <span
                  className="text-[11px] uppercase tracking-[0.15em] [font-family:var(--font-ui)]"
                  style={{ color: 'var(--text-on-page-tertiary)' }}
                >
                  {GROUP_LABELS[group]}
                </span>
                <span className="h-px flex-1" style={{ background: 'rgba(80,60,40,0.14)' }} aria-hidden="true" />
              </div>

              {metals.map((metal) => {
                const isOpen = expanded[metal.id] ?? false
                const panelId = `metal-${metal.id}-properties`

                return (
                  <div key={metal.id}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={isOpen ? panelId : undefined}
                      onClick={() => toggleExpanded(metal.id)}
                      className="group flex w-full cursor-pointer items-baseline gap-2 border-0 bg-transparent py-[4px] text-left"
                    >
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: metal.color }}
                        aria-hidden="true"
                      />
                      <span
                        className="text-[13px] font-medium transition-colors duration-150 group-hover:text-[color:var(--text-on-page-link)] [font-family:var(--font-display)]"
                        style={{ color: 'var(--text-on-page-primary)' }}
                      >
                        {metal.name}
                      </span>
                      <span
                        className="text-[11px] [font-family:var(--font-display)]"
                        style={{ color: 'var(--text-on-page-tertiary)' }}
                      >
                        / {metal.alloy}
                      </span>
                      <span
                        className="ml-auto text-[11px] [font-family:var(--font-display)]"
                        style={{ color: 'var(--text-on-page-tertiary)' }}
                        aria-hidden="true"
                      >
                        {isOpen ? '△' : '▽'}
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        id={panelId}
                        className="mb-1 ml-5 border-l pb-1 pl-3"
                        style={{ borderColor: 'rgba(80,60,40,0.18)' }}
                      >
                        {METAL_ATTRS.map(({ key, label }) => (
                          <p
                            key={key}
                            className="text-[12px] leading-relaxed [font-family:var(--font-display)]"
                            style={{ color: 'var(--text-on-page-secondary)' }}
                          >
                            <span
                              className="text-[11px] uppercase tracking-[0.08em] [font-family:var(--font-ui)]"
                              style={{ color: 'var(--text-on-page-tertiary)' }}
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
