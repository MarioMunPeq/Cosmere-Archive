import { memo, useRef, useCallback } from 'react'

interface Props {
  worldW: number
  worldH: number
  camX: number
  camY: number
  camScale: number
  viewW: number
  viewH: number
  nodePositions: Array<{ x: number; y: number; isSelected: boolean }>
  onNavigate: (x: number, y: number, scale: number) => void
}

const MAP_W = 130
const MAP_H = 90

export const ArchivalMiniMap = memo(function ArchivalMiniMap({
  worldW,
  worldH,
  camX,
  camY,
  camScale,
  viewW,
  viewH,
  nodePositions,
  onNavigate,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const s = Math.min(MAP_W / Math.max(worldW, 1), MAP_H / Math.max(worldH, 1))
  const ox = (MAP_W - worldW * s) / 2
  const oy = (MAP_H - worldH * s) / 2

  const vw = (viewW / camScale) * s
  const vh = (viewH / camScale) * s
  const vx = camX * s + ox
  const vy = camY * s + oy

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const mx = (e.clientX - r.left) / MAP_W
      const my = (e.clientY - r.top) / MAP_H
      onNavigate(mx * worldW, my * worldH, 1)
    },
    [worldW, worldH, onNavigate],
  )

  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: MAP_W,
        height: MAP_H,
        background: '#ede4d2',
        border: '1px solid rgba(58,42,26,0.1)',
        cursor: 'pointer',
        overflow: 'hidden',
        zIndex: 5,
        opacity: 0.55,
        transition: 'opacity 0.3s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.55')}
    >
      <svg width={MAP_W} height={MAP_H}>
        {nodePositions.map((np, i) => (
          <circle
            key={i}
            cx={np.x * s + ox}
            cy={np.y * s + oy}
            r={np.isSelected ? 2.5 : 1.5}
            fill={np.isSelected ? '#b8964a' : '#6a5a4a'}
            opacity={np.isSelected ? 1 : 0.4}
          />
        ))}
        <rect
          x={vx}
          y={vy}
          width={vw}
          height={vh}
          fill="rgba(58,42,26,0.04)"
          stroke="rgba(58,42,26,0.2)"
          strokeWidth={0.5}
        />
      </svg>
    </div>
  )
})
