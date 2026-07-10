import type { FamilyDefinition } from '@/types/family'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const

interface Props {
  families: FamilyDefinition[]
  selectedId: string
  onSelect: (id: string) => void
}

export default function FamilyIndex({ families, selectedId, onSelect }: Props) {
  const selected = families.findIndex((f) => f.id === selectedId)

  return (
    <div className="animate-fade-in-up select-none" style={{ animationDelay: '100ms' }}>
      {/* Running head */}
      <div className="mb-12 text-center">
        <p
          className="text-xs tracking-[0.3em]"
          style={{
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            color: '#8a7a6a',
          }}
        >
          ARCHIVES OF BLOODLINES
        </p>
        <div className="mx-auto mt-3 flex items-center justify-center gap-2">
          <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, #8a7050)' }} />
          <svg width="6" height="6" viewBox="0 0 6 6" className="fill-[#8a7050]" opacity={0.3}>
            <polygon points="3,0 6,3 3,6 0,3" />
          </svg>
          <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, #8a7050, transparent)' }} />
        </div>
      </div>

      {/* Entries as printed lines */}
      {families.map((f, i) => {
        const isActive = f.id === selectedId
        return (
          <div
            key={f.id}
            onClick={() => onSelect(f.id)}
            className="relative cursor-pointer transition-opacity duration-500 hover:opacity-80"
          >
            {/* Active indicator — ink flourish beside the entry */}
            {isActive && (
              <div
                className="absolute left-0 top-0 bottom-0 flex items-center"
                style={{ transform: 'translateX(-20px)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" className="fill-[#8a7050]" opacity={0.3}>
                  <path d="M2,1 Q7,0 12,3 Q14,5 13,8 Q11,12 7,13 Q3,14 1,11 Q0,8 2,5 L2,1" />
                </svg>
              </div>
            )}

            <div className="flex items-start gap-3" style={{ padding: '8px 0' }}>
              {/* Roman numeral */}
              <span
                className="shrink-0 pt-0.5 text-sm tracking-widest"
                style={{
                  fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                  color: isActive ? '#8a7050' : '#a09080',
                  minWidth: 24,
                }}
              >
                {ROMAN[i] ?? `${i + 1}`}
              </span>

              {/* Name and description */}
              <div className="min-w-0">
                <h3
                  className="text-sm font-semibold tracking-[0.08em]"
                  style={{
                    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                    color: isActive ? '#1a0e06' : '#5a4a3a',
                    transition: 'color 0.5s',
                  }}
                >
                  {f.name.toUpperCase()}
                </h3>
                <p
                  className="mt-0.5 text-xs italic leading-snug"
                  style={{
                    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                    color: isActive ? '#6b5a4a' : '#8a7a6a',
                    transition: 'color 0.5s',
                  }}
                >
                  {f.description}
                </p>
                <p
                  className="mt-0.5 text-[10px] tracking-wider"
                  style={{
                    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                    color: '#a09080',
                  }}
                >
                  {f.members.length} RECORDED
                </p>
              </div>
            </div>

            {/* Separator line (not after last entry) */}
            {i < families.length - 1 && (
              <div
                className="ml-7"
                style={{
                  height: 1,
                  background: 'linear-gradient(90deg, #d4c8b0 0%, transparent 100%)',
                  marginTop: 4,
                  marginBottom: 4,
                }}
              />
            )}
          </div>
        )
      })}

      {/* Page number */}
      <div className="mt-16 text-center">
        <p
          className="text-xs tracking-[0.2em]"
          style={{
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            color: '#8a7a6a',
          }}
        >
          — {selected + 1} —
        </p>
      </div>
    </div>
  )
}
