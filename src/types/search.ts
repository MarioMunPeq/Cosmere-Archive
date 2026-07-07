export interface SearchResult {
  type: 'planet' | 'character' | 'worldhopper' | 'event' | 'book' | 'magic' | 'herald' | 'header'
  label: string
  sublabel: string
  action: () => void
}
