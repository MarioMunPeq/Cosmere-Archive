import type { PlanetBodyProps } from './types'

export default function FirstOfTheSunRenderer({ x, y, r }: PlanetBodyProps) {
  return <circle cx={x} cy={y} r={r} fill="url(#grad-first-of-the-sun)" />
}
