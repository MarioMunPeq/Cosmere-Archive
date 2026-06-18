import type { PlanetBodyProps } from './types'

export default function KomashiRenderer({ x, y, r }: PlanetBodyProps) {
  return <circle cx={x} cy={y} r={r} fill="url(#grad-komashi)" />
}
