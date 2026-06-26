export interface Herald {
  id: string
  name: string
  title: string
  order: string
  surges: [string, string]
  sprenType: string
  sprenName?: string
  description: string
  characterId?: string
  color: string
  glyphSymbol?: string
}
