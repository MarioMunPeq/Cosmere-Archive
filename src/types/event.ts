export interface CosmereEvent {
  id: string
  title: string
  description: string
  year: number
  endYear?: number
  type: 'historical' | 'book' | 'cataclysm' | 'discovery' | 'character_birth'
  saga: string
  planets: string[]
  importance: number
}
