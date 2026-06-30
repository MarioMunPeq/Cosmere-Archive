import { PLANETS } from '@/data/static'

export const planetMap = new Map(PLANETS.map((p) => [p.id, { x: p.x, y: p.y }]))
