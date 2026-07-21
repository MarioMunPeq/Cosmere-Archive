import { memo, useState } from 'react'
import type { Position } from './LayoutEngine'
import { NODE_R } from './LayoutEngine'

interface Props {
  id: string
  pos: Position
  name: string
  imageUrl: string | null
  isDeceased?: boolean
  isSelected: boolean
  isHovered: boolean
  isDimmed: boolean
  importance: number
  onClick: (id: string) => void
  onHover: (id: string | null) => void
}

const GOLD = '#b8964a'
const GOLD_BRIGHT = '#d4b060'
const INK = '#3a2a1a'
const INK_MUTED = '#6a5a4a'
const PARCHMENT = '#ede4d2'

export const PortraitNode = memo(function PortraitNode({
  id,
  pos,
  name,
  imageUrl,
  isDeceased,
  isSelected,
  isHovered,
  isDimmed,
  onClick,
  onHover,
}: Props) {
  const [imgErr, setImgErr] = useState(false)
  const hasImg = imageUrl && !imgErr
  const cx = pos.x
  const cy = pos.y

  const rimColor = isSelected ? GOLD_BRIGHT : isHovered ? GOLD : GOLD
  const labelSize = 12
  const labelY = cy + NODE_R + labelSize + 6

  return (
    <g
      style={{ cursor: 'pointer', transition: 'opacity 0.4s ease' }}
      opacity={isDimmed ? 0.1 : 1}
      onClick={(e) => {
        e.stopPropagation()
        onClick(id)
      }}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Deep shadow */}
      <circle cx={cx + 2} cy={cy + 3} r={NODE_R + 2} fill="rgba(45,26,14,0.07)" />

      {/* Gold rim */}
      <circle cx={cx} cy={cy} r={NODE_R + 1.5} fill="none" stroke={rimColor} strokeWidth={2.5} />

      {/* Paper bed */}
      <circle cx={cx} cy={cy} r={NODE_R - 0.5} fill={PARCHMENT} />

      {/* Portrait */}
      {hasImg && (
        <g>
          <clipPath id={`clip-${id}`}>
            <circle cx={cx} cy={cy} r={NODE_R - 3} />
          </clipPath>
          <image
            href={imageUrl!}
            clipPath={`url(#clip-${id})`}
            x={cx - NODE_R + 3}
            y={cy - NODE_R + 3}
            width={(NODE_R - 3) * 2}
            height={(NODE_R - 3) * 2}
            preserveAspectRatio="xMidYMid slice"
            onError={() => setImgErr(true)}
          />
        </g>
      )}

      {/* Initial fallback */}
      {!hasImg && (
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill={INK}
          fontSize={NODE_R * 0.55}
          fontFamily="serif"
          fontWeight="600"
          style={{ fontVariant: 'small-caps' }}
        >
          {name.charAt(0).toUpperCase()}
        </text>
      )}

      {/* Deceased mark */}
      {isDeceased && (
        <g opacity={0.35}>
          <line
            x1={cx - NODE_R * 0.28}
            y1={cy - NODE_R * 0.28}
            x2={cx + NODE_R * 0.28}
            y2={cy + NODE_R * 0.28}
            stroke={INK_MUTED}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={cx + NODE_R * 0.28}
            y1={cy - NODE_R * 0.28}
            x2={cx - NODE_R * 0.28}
            y2={cy + NODE_R * 0.28}
            stroke={INK_MUTED}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Name */}
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fill={INK}
        fontSize={labelSize}
        fontFamily="serif"
        fontStyle={isDeceased ? 'italic' : 'normal'}
        fontWeight={isSelected ? '600' : '400'}
        opacity={0.8}
      >
        {name}
      </text>

      {/* Selection glow */}
      {isSelected && (
        <circle cx={cx} cy={cy} r={NODE_R + 6} fill="none" stroke={GOLD_BRIGHT} strokeWidth={1.5} opacity={0.3}>
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Hover shimmer */}
      {isHovered && !isSelected && (
        <circle cx={cx} cy={cy} r={NODE_R + 4} fill="none" stroke={GOLD} strokeWidth={1} opacity={0.2}>
          <animate
            attributeName="r"
            values={`${NODE_R + 3};${NODE_R + 7};${NODE_R + 3}`}
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  )
})
