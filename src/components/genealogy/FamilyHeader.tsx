import type { FamilyDefinition } from '@/types/family'

interface Props {
  family: FamilyDefinition
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center gap-2">
      <svg width="8" height="8" viewBox="0 0 8 8" className="fill-[#8a7050] shrink-0" opacity={0.35}>
        <polygon points="4,0 8,4 4,8 0,4" />
      </svg>
      <span
        className="h-px flex-1"
        style={{ background: 'linear-gradient(90deg, #8a7050 0%, transparent 100%)', opacity: 0.3 }}
      />
      <svg width="6" height="6" viewBox="0 0 6 6" className="fill-[#8a7050] shrink-0" opacity={0.25}>
        <polygon points="3,0 6,3 3,6 0,3" />
      </svg>
      <span
        className="h-px flex-1"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #8a7050 100%)', opacity: 0.3 }}
      />
      <svg width="8" height="8" viewBox="0 0 8 8" className="fill-[#8a7050] shrink-0" opacity={0.35}>
        <polygon points="4,0 8,4 4,8 0,4" />
      </svg>
    </div>
  )
}

export default function FamilyHeader({ family }: Props) {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
      <OrnamentalDivider />

      <h1
        className="mt-5 text-center text-4xl leading-tight tracking-[0.12em] sm:text-5xl"
        style={{
          fontFamily: "'Cormorant Garamond', 'Georgia', serif",
          color: '#1a0e06',
          textShadow: '0 0.5px 0 #d4c8b0',
        }}
      >
        {family.name.toUpperCase()}
      </h1>
      <p
        className="mt-2 text-center text-base tracking-wide"
        style={{
          fontFamily: "'Cormorant Garamond', 'Georgia', serif",
          color: '#6b5a4a',
        }}
      >
        {family.description}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <span
          className="h-px flex-1"
          style={{ background: 'linear-gradient(90deg, transparent, #8a7050)', opacity: 0.15 }}
        />
        <svg width="5" height="5" viewBox="0 0 5 5" className="fill-[#8a7050]" opacity={0.3}>
          <polygon points="2.5,0 5,2.5 2.5,5 0,2.5" />
        </svg>
        <span
          className="h-px flex-1"
          style={{ background: 'linear-gradient(90deg, #8a7050, transparent)', opacity: 0.15 }}
        />
      </div>
    </div>
  )
}
