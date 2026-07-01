import { useMemo, type ReactNode } from 'react'

interface Props {
  variant: string
  color: string
  displayName: string
  order: string
  index: number
  total: number
  isFallen: boolean
  isHovered: boolean
  isSelected: boolean
  cx: number
  cy: number
  radius: number
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}

interface BladeDesign {
  b: string
  bg: string
  guard: string
  features?: ReactNode
}

const DESIGNS: Record<string, BladeDesign> = {
  jezrien: {
    b: `M 0,-2 C -3,-6 -4,-15 -4,-22 Q -3.5,-42 0,-52 Q 3.5,-42 4,-22 C 4,-15 3,-6 0,-2 Z`,
    bg: `M 0,-2 C -4,-6 -5.5,-15 -5.5,-22 Q -5,-42 0,-55 Q 5,-42 5.5,-22 C 5.5,-15 4,-6 0,-2 Z`,
    guard: 'swept',
  },
  nale: {
    b: `M 0,-2 L -3.5,-18 L -3.2,-48 L 0,-55 L 3.2,-48 L 3.5,-18 L 0,-2 Z`,
    bg: `M 0,-2 L -5,-18 L -4.5,-48 L 0,-58 L 4.5,-48 L 5,-18 L 0,-2 Z`,
    guard: 'straight',
    features: (
      <>
        <path d="M -1.2,-6 L -1.2,-44" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" fill="none" />
        <path d="M 1.2,-6 L 1.2,-44" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" fill="none" />
      </>
    ),
  },
  chanarach: {
    b: `M 0,-2 L -2.8,-20 L -2.8,-48 L 0,-56 L 2.8,-48 L 2.8,-20 L 0,-2 Z`,
    bg: `M 0,-2 L -4,-20 L -4,-48 L 0,-60 L 4,-48 L 4,-20 L 0,-2 Z`,
    guard: 'ornate',
    features: (
      <>
        <path d="M 0,-6 L 0,-52" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" fill="none" />
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="-3.5"
            y1={-4 - i * 3}
            x2="3.5"
            y2={-4 - i * 3}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.5"
          />
        ))}
      </>
    ),
  },
  vedel: {
    b: `M 0,-2 C -2,-8 -2.8,-22 -2.8,-38 Q -2.5,-58 0,-68 Q 2.5,-58 2.8,-38 C 2.8,-22 2,-8 0,-2 Z`,
    bg: `M 0,-2 C -3.5,-8 -4,-22 -4,-38 Q -3.5,-58 0,-72 Q 3.5,-58 4,-38 C 4,-22 3.5,-8 0,-2 Z`,
    guard: 'curved',
  },
  pailiah: {
    b: `M 0,-2 C -2,-8 -3.8,-20 -4.5,-32 Q -3.5,-50 0,-58 Q 3.5,-50 3.2,-32 C 3,-20 1.8,-8 0,-2 Z`,
    bg: `M 0,-2 C -3.5,-8 -5,-20 -6,-32 Q -4.5,-50 0,-62 Q 4.5,-50 4.5,-32 C 4,-20 2.8,-8 0,-2 Z`,
    guard: 'flared',
    features: <circle cx="0" cy="-12" r="1.5" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />,
  },
  shalash: {
    b: `M 0,-2 C -2.5,-8 -3.5,-16 -3,-24 S -3.5,-38 -3,-46 Q -2,-54 0,-60 Q 3,-54 3,-46 C 3,-38 3.2,-30 3.2,-24 C 3.2,-16 2,-8 0,-2 Z`,
    bg: `M 0,-2 C -4,-8 -5,-16 -4.5,-24 S -5,-38 -4.5,-46 Q -3,-54 0,-64 Q 3,-54 4.5,-46 C 4.5,-38 4.8,-30 4.8,-24 C 4.8,-16 3.5,-8 0,-2 Z`,
    guard: 'swept',
    features: (
      <>
        {[-26, -34, -42].map((y) => (
          <path
            key={y}
            d={`M -3,${y} Q -4,${y + 2} -2,${y + 3}`}
            stroke="rgba(0,0,0,0.25)"
            strokeWidth="0.5"
            fill="none"
          />
        ))}
      </>
    ),
  },
  battar: {
    b: `M 0,-2 C -2,-8 -4.5,-18 -6.5,-28 Q -9,-40 -5,-50 Q -1,-55 3,-48 Q 5,-42 3,-36 C 4,-28 2.5,-16 0,-2 Z`,
    bg: `M 0,-2 C -3.5,-8 -6.5,-18 -9,-28 Q -12,-40 -7,-54 Q -2,-58 5,-50 Q 7,-42 5,-36 C 6,-28 4,-16 0,-2 Z`,
    guard: 'swept',
    features: <path d="M -5.5,-32 Q -5,-42 -3,-46" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" fill="none" />,
  },
  kalak: {
    b: `M 0,-2 L -9,-16 Q -9,-40 0,-48 Q 9,-40 9,-16 L 0,-2 Z`,
    bg: `M 0,-2 L -12,-16 Q -12,-40 0,-52 Q 12,-40 12,-16 L 0,-2 Z`,
    guard: 'wide',
    features: (
      <>
        <ellipse cx="0" cy="-22" rx="2.5" ry="3.5" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" />
        <ellipse cx="0" cy="-33" rx="1.8" ry="2.5" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" />
        <rect x="-7" y="-4" width="14" height="8" rx="1" fill="rgba(0,0,0,0.06)" />
      </>
    ),
  },
  talenel: {
    b: `M 0,-2 L -2.8,-22 Q -2.5,-48 0,-65 Q 2.5,-48 2.8,-22 L 0,-2 Z`,
    bg: `M 0,-2 L -4,-22 Q -3.5,-48 0,-70 Q 3.5,-48 4,-22 L 0,-2 Z`,
    guard: 'none',
    features: (
      <>
        <path d="M 0,-2 L 0,-62" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7" fill="none" />
        <path d="M -1,-8 L -1,-58" stroke="rgba(255,255,255,0.05)" strokeWidth="1.2" fill="none" />
        <path d="M 1,-8 L 1,-58" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" fill="none" />
      </>
    ),
  },
  ishar: {
    b: `M 0,-2 C -3.5,-8 -1,-16 -3.5,-24 C -6,-32 -2.5,-40 -4.5,-48 Q -2,-55 0,-58 Q 2,-55 4.5,-48 C 2.5,-40 6,-32 3.5,-24 C 1,-16 3.5,-8 0,-2 Z`,
    bg: `M 0,-2 C -5,-8 -2,-16 -5,-24 C -8,-32 -3.5,-40 -6,-48 Q -3,-58 0,-62 Q 3,-58 6,-48 C 3.5,-40 8,-32 5,-24 C 2,-16 5,-8 0,-2 Z`,
    guard: 'ornate',
    features: (
      <>
        {[-20, -28, -36, -44].map((y) => (
          <line key={y} x1="-1.5" y1={y} x2="1.5" y2={y} stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
        ))}
      </>
    ),
  },
}

function BladeGlow({ index }: { index: number }) {
  const id = `hb-glow-${index}`
  return (
    <filter id={id} x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="2.5" result="g1" />
      <feGaussianBlur stdDeviation="6" result="g2" />
      <feMerge>
        <feMergeNode in="g2" />
        <feMergeNode in="g1" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  )
}

function Guard({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'straight':
      return (
        <>
          <path d="M -14,0 L 14,0 L 12,3 L -12,3 Z" fill={color} />
          <path d="M -12,1 L 12,1" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        </>
      )
    case 'curved':
      return (
        <>
          <path d="M -20,1 Q -14,-4 -10,-6 Q -5,-7 0,-6 Q 5,-7 10,-6 Q 14,-4 20,1 L 17,4 L -17,4 Z" fill={color} />
          <path d="M -18,2 Q -12,-3 -8,-5" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" fill="none" />
          <path d="M 18,2 Q 12,-3 8,-5" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" fill="none" />
        </>
      )
    case 'ornate':
      return (
        <>
          <path d="M -16,-2 C -12,-10 -6,-13 0,-11 C 6,-13 12,-10 16,-2 L 14,3 L -14,3 Z" fill={color} />
          <circle cx="-10" cy="-5" r="1.2" fill="rgba(255,255,255,0.15)" />
          <circle cx="10" cy="-5" r="1.2" fill="rgba(255,255,255,0.15)" />
          <circle cx="0" cy="-9" r="1" fill="rgba(255,255,255,0.1)" />
          <path d="M -8,-5 C -4,-10 4,-10 8,-5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" fill="none" />
        </>
      )
    case 'flared':
      return (
        <>
          <path d="M -22,1 Q -14,-8 -8,-10 Q -4,-11 0,-9 Q 4,-11 8,-10 Q 14,-8 22,1 L 18,4 L -18,4 Z" fill={color} />
          <circle cx="-13" cy="-4" r="1" fill="rgba(255,255,255,0.12)" />
          <circle cx="13" cy="-4" r="1" fill="rgba(255,255,255,0.12)" />
        </>
      )
    case 'wide':
      return (
        <>
          <path d="M -24,0 Q -20,-6 -12,-8 Q -6,-9 0,-7 Q 6,-9 12,-8 Q 20,-6 24,0 L 20,4 L -20,4 Z" fill={color} />
          <line x1="-18" y1="1" x2="18" y2="1" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          <circle cx="-14" cy="-3" r="1.5" fill="rgba(255,255,255,0.1)" />
          <circle cx="14" cy="-3" r="1.5" fill="rgba(255,255,255,0.1)" />
        </>
      )
    case 'none':
      return <rect x="-2.5" y="-1" width="5" height="3" rx="1" fill={color} opacity="0.6" />
    default:
      return (
        <>
          <path d="M -18,1 C -14,-7 -7,-12 0,-10 C 7,-12 14,-7 18,1 L 15,4 L -15,4 Z" fill={color} />
          <path
            d="M -15,2 C -12,-5 -6,-9 0,-8 C 6,-9 12,-5 15,2"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
            fill="none"
          />
        </>
      )
  }
}

export default function HonorbladeSVG({
  variant,
  color,
  displayName,
  order,
  index,
  total,
  isFallen,
  isHovered,
  isSelected,
  cx,
  cy,
  radius,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: Props) {
  const rad = (index / total) * Math.PI * 2 - Math.PI / 2
  const x = cx + radius * Math.cos(rad)
  const y = cy + radius * Math.sin(rad)
  const toCenter = Math.atan2(cy - y, cx - x) * (180 / Math.PI) + 90

  const design = (DESIGNS[variant] ?? DESIGNS.jezrien)!
  const glowId = useMemo(() => `hb-glow-${index}`, [index])
  const metalId = useMemo(() => `hb-metal-${index}`, [index])
  const swordOpacity = isFallen ? (isHovered || isSelected ? 0.75 : 0.4) : 1

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={displayName}
      style={{ cursor: 'pointer' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick()
      }}
    >
      <g transform={`translate(${x},${y}) rotate(${toCenter})`} opacity={swordOpacity}>
        <defs>
          <BladeGlow index={index} />
          <linearGradient id={metalId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="25%" stopColor="rgba(255,255,255,0)" />
            <stop offset="75%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>
        </defs>

        <path d={design.bg} fill={color} opacity={isHovered ? 0.2 : 0.08} filter={`url(#${glowId})`} />
        <path d={design.bg} fill={color} opacity={isHovered ? 0.35 : 0.15} filter={`url(#${glowId})`} />

        <path d={design.b} fill={color} />
        <path d={design.b} fill={`url(#${metalId})`} />

        <path d={design.b} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <path d={design.b} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.4" />

        {design.features}

        <Guard type={design.guard} color={color} />

        <rect x="-3.5" y="4" width="7" height="18" rx="1.5" fill="#1e293b" />
        {[7, 10, 13, 16, 19].map((gy) => (
          <line key={gy} x1="-3.5" y1={gy} x2="3.5" y2={gy} stroke="#334155" strokeWidth="0.7" />
        ))}
        <line x1="-3.5" y1="4" x2="3.5" y2="4" stroke={color} strokeWidth="0.4" opacity="0.4" />
        <line x1="-3.5" y1="22" x2="3.5" y2="22" stroke={color} strokeWidth="0.4" opacity="0.4" />

        <ellipse cx="0" cy="25" rx="3.2" ry="2.2" fill={color} opacity="0.7" />
        <circle cx="0" cy="25" r="2" fill={color} />
        <circle cx="-0.3" cy="24.7" r="0.6" fill="rgba(255,255,255,0.35)" />
      </g>

      {isHovered && (
        <g transform={`translate(${x + Math.cos(rad) * 55},${y + Math.sin(rad) * 55})`}>
          <rect
            x="-38"
            y="-12"
            width="76"
            height="24"
            rx="4"
            fill="#0f172a"
            stroke={color}
            strokeWidth="1"
            opacity="0.95"
          />
          <text x="0" y="3" textAnchor="middle" fill="#e5e7eb" fontSize="11" fontWeight="bold">
            {displayName}
          </text>
          <line x1="-36" y1="8" x2="36" y2="8" stroke={color} strokeWidth="0.5" opacity="0.3" />
          <text x="0" y="18" textAnchor="middle" fill={color} fontSize="8">
            {order}
          </text>
        </g>
      )}
    </g>
  )
}
