export type GlossaryCategory = 'shard' | 'magic' | 'concept' | 'group' | 'event' | 'phenomenon'

export interface GlossaryEntry {
  id: string
  term: string
  definition: string
  category: GlossaryCategory
  pronunciation?: string
  relatedTerms?: string[]
  planet?: string
}

export const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  shard: 'Shards',
  magic: 'Magic Systems',
  concept: 'Concepts',
  group: 'Groups & Organizations',
  event: 'Events',
  phenomenon: 'Phenomena',
}

export const CATEGORY_COLORS: Record<GlossaryCategory, string> = {
  shard: '#a78bfa',
  magic: '#34d399',
  concept: '#38bdf8',
  group: '#fbbf24',
  event: '#f87171',
  phenomenon: '#2dd4bf',
}
