import type { PlanetBodyProps } from './types'

export default function ScadrialRenderer({ x, y, r }: PlanetBodyProps) {
  return <circle cx={x} cy={y} r={r} fill="url(#grad-scadrial)" />
}
