import { memo } from 'react'
import { MAP_VIEWBOX_W, MAP_VIEWBOX_H } from '@/constants'

const CX = MAP_VIEWBOX_W / 2
const CY = MAP_VIEWBOX_H / 2
const RADII = [80, 160, 240, 320]
const RADIAL_LINES = 12
const RING_STYLE = { stroke: 'rgba(255,255,255,0.08)', strokeWidth: 0.5, fill: 'none' } as const
const RADIAL_STYLE = { stroke: 'rgba(255,255,255,0.04)', strokeWidth: 0.5 } as const

const NavigationGrid = memo(function NavigationGrid() {
  return (
    <g className="animate-spin-slow" style={{ transformOrigin: `${CX}px ${CY}px` }}>
      {RADII.map((r) => (
        <circle key={`ring-${r}`} cx={CX} cy={CY} r={r} {...RING_STYLE} />
      ))}
      {Array.from({ length: RADIAL_LINES }, (_, i) => {
        const angle = (i * Math.PI * 2) / RADIAL_LINES
        const x2 = CX + Math.cos(angle) * 400
        const y2 = CY + Math.sin(angle) * 400
        return <line key={`rad-${i}`} x1={CX} y1={CY} x2={x2} y2={y2} {...RADIAL_STYLE} />
      })}
    </g>
  )
})

export default NavigationGrid
