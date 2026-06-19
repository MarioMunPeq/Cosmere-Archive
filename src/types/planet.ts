export interface Planet {
  id: string
  name: string
  shard?: string
  description?: string
  x: number
  y: number
  color: string
  size: number
  sagas?: string[]
  magicSystem?: string
  connectedPlanets?: string[]
  books?: string[]
}
