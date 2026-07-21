import { memo } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
}

export const MarginalSearch = memo(function MarginalSearch({ value, onChange }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        opacity: 0.6,
        transition: 'opacity 0.3s',
        zIndex: 5,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
    >
      <span
        style={{
          fontFamily: 'serif',
          fontSize: 10,
          color: '#6a5a4a',
          fontStyle: 'italic',
          letterSpacing: '0.04em',
        }}
      >
        find
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="name..."
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid rgba(58,42,26,0.15)',
          padding: '1px 4px',
          color: '#3a2a1a',
          fontFamily: 'serif',
          fontSize: 11,
          outline: 'none',
          width: 100,
          fontStyle: 'italic',
        }}
      />
      {value && (
        <span
          onClick={() => onChange('')}
          style={{
            fontFamily: 'serif',
            fontSize: 10,
            color: '#8a7a5a',
            cursor: 'pointer',
            fontStyle: 'italic',
          }}
        >
          clear
        </span>
      )}
    </div>
  )
})
