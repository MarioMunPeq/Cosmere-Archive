import { memo } from 'react'

export type FilterMode = 'all' | 'ancestors' | 'descendants' | 'immediate' | 'alive' | 'deceased'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  filter: FilterMode
  onFilterChange: (f: FilterMode) => void
}

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ancestors', label: 'Ancestors' },
  { key: 'descendants', label: 'Descendants' },
  { key: 'immediate', label: 'Immediate' },
  { key: 'alive', label: 'Alive' },
  { key: 'deceased', label: 'Deceased' },
]

export const SearchAndFilters = memo(function SearchAndFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        zIndex: 5,
      }}
    >
      {/* Search — manuscript annotation style */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: 0.6 }}>
        <span
          style={{ fontFamily: 'serif', fontSize: 9, color: '#6a5a4a', fontStyle: 'italic', letterSpacing: '0.04em' }}
        >
          find
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="name..."
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(58,42,26,0.12)',
            padding: '1px 4px',
            color: '#3a2a1a',
            fontFamily: 'serif',
            fontSize: 10.5,
            outline: 'none',
            width: 90,
            fontStyle: 'italic',
          }}
        />
        {search && (
          <span
            onClick={() => onSearchChange('')}
            style={{ fontFamily: 'serif', fontSize: 9, color: '#8a7a5a', cursor: 'pointer', fontStyle: 'italic' }}
          >
            clear
          </span>
        )}
      </div>

      {/* Filter pills — manuscript ink stamps */}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            style={{
              background: filter === f.key ? 'rgba(58,42,26,0.08)' : 'transparent',
              border: 'none',
              padding: '1px 6px',
              color: filter === f.key ? '#3a2a1a' : '#8a7a5a',
              fontFamily: 'serif',
              fontSize: 9,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              letterSpacing: '0.02em',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
})
