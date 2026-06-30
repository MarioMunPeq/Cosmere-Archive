export interface SearchResult {
  type: 'planet' | 'character' | 'worldhopper' | 'event' | 'book' | 'glossary' | 'magic' | 'herald' | 'header'
  label: string
  sublabel: string
  action: () => void
}
