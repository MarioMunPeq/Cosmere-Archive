import { memo } from 'react'

interface Props {
  fromX: number
  fromY: number
  toX: number
  toY: number
  type: 'parent-child' | 'spouse'
  isHighlighted: boolean
  isAnimated?: boolean
  animationDelay?: number
}

const INK = '#4a3a2a'
const INK_LIGHT = '#8a7a5a'
const INK_HIGHLIGHT = '#3a2a1a'

function parentChildPath(fx: number, fy: number, tx: number, ty: number): string {
  const dy = ty - fy
  const cp = dy * 0.45
  return `M${fx},${fy} C${fx},${fy + cp} ${tx},${ty - cp} ${tx},${ty}`
}

/* Slight deterministic wobble for hand-drawn feel */
function wobbledPath(fx: number, fy: number, tx: number, ty: number): string {
  const dx = tx - fx
  const dy = ty - fy
  const dist = Math.sqrt(dx * dx + dy * dy)
  const wobble = Math.min(dist * 0.012, 4)
  const seed = (fx * 7 + fy * 13 + tx * 3 + ty * 11) % 100
  const wx1 = Math.sin(seed) * wobble
  const wy1 = Math.cos(seed * 1.3) * wobble
  const wx2 = Math.sin(seed * 2.7 + 1) * wobble * 0.8
  const wy2 = Math.cos(seed * 1.9 + 2) * wobble * 0.8
  const midX = (fx + tx) / 2 + (wx1 + wx2) * 0.3
  const midY = (fy + ty) / 2 + (wy1 + wy2) * 0.3
  return `M${fx},${fy} Q${midX},${midY} ${tx},${ty}`
}

export const InkLine = memo(function InkLine({
  fromX,
  fromY,
  toX,
  toY,
  type,
  isHighlighted,
  isAnimated,
  animationDelay = 0,
}: Props) {
  const path = type === 'spouse' ? wobbledPath(fromX, fromY, toX, toY) : parentChildPath(fromX, fromY, toX, toY)

  const strokeColor = isHighlighted ? INK_HIGHLIGHT : type === 'spouse' ? INK_LIGHT : INK
  const thickness = type === 'spouse' ? 0.7 : 1.3

  const style: React.CSSProperties | undefined = isAnimated
    ? {
        strokeDasharray: 800,
        strokeDashoffset: 800,
        animation: `genea-draw 1.2s ease-out ${animationDelay}s forwards`,
      }
    : undefined

  const cls = isAnimated ? undefined : ''

  return (
    <g>
      {/* Bleed shadow */}
      <path
        d={path}
        fill="none"
        stroke="rgba(58,42,26,0.04)"
        strokeWidth={thickness + 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        className={cls}
      />
      {/* Main ink with variable thickness feel via two strokes */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={thickness + 0.8}
        opacity={isHighlighted ? 0.9 : 0.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        className={cls}
      />
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={thickness}
        opacity={isHighlighted ? 0.6 : 0.18}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        className={cls}
      />
      {/* Highlight glow */}
      {isHighlighted && (
        <path
          d={path}
          fill="none"
          stroke={INK_HIGHLIGHT}
          strokeWidth={4}
          opacity={0.05}
          strokeLinecap="round"
          style={style}
          className={cls}
        />
      )}
    </g>
  )
})
