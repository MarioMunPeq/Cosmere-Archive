import { memo } from 'react'

const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center select-none"
      style={{
        background: `
          radial-gradient(ellipse 70% 60% at 50% 40%, transparent 0%, rgba(0,0,0,0.15) 100%),
          #dad2c4
        `,
      }}
    >
      {/* Masonry grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent 0px, transparent 199px, rgba(120,110,100,0.08) 199px, transparent 200px),
            repeating-linear-gradient(0deg, transparent 0px, transparent 139px, rgba(120,110,100,0.08) 139px, transparent 140px)
          `,
        }}
      />
      <div className="relative flex flex-col items-center gap-4">
        {/* Ink-styled loading ring */}
        <svg width="48" height="48" viewBox="0 0 48 48" className="animate-spin" style={{ animationDuration: '2s' }}>
          <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(42,26,10,0.08)" strokeWidth="2" />
          <path
            d="M 24 6 A 18 18 0 0 1 42 24"
            fill="none"
            stroke="#2a1a0a"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* Decorative dots at ends */}
          <circle cx="24" cy="6" r="2" fill="#2a1a0a" opacity="0.3" />
          <circle cx="42" cy="24" r="2" fill="#2a1a0a" opacity="0.3" />
        </svg>
        <p className="text-[13px] font-[Cormorant_Garamond,serif] italic text-[#2a1a0a]" style={{ opacity: 0.45 }}>
          Loading…
        </p>
      </div>
    </div>
  )
})

export default LoadingSpinner
