export interface InvestitureSystem {
  name: string
  description: string
  shard?: string
}

export interface Planet {
  id: string
  name: string
  shard?: string
  description?: string
  pronunciation?: string
  x: number
  y: number
  color: string
  size: number
  sagas?: string[]
  investiture?: InvestitureSystem[]
  connectedPlanets?: string[]
  books?: string[]
}
