export type RelationshipType =
  | 'spouse'
  | 'sibling'
  | 'mentor'
  | 'ally'
  | 'rival'
  | 'partner'
  | 'creator'
  | 'friend'
  | 'parent'

export interface CharacterRelationship {
  characters: [string, string]
  type: RelationshipType
  label?: string
}

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  spouse: 'Spouse',
  sibling: 'Sibling',
  mentor: 'Mentor',
  ally: 'Ally',
  rival: 'Rival',
  partner: 'Partner',
  creator: 'Creator',
  friend: 'Friend',
  parent: 'Parent',
}

export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  spouse: '#f472b6',
  sibling: '#a78bfa',
  mentor: '#34d399',
  ally: '#fbbf24',
  rival: '#f87171',
  partner: '#2dd4bf',
  creator: '#a3e635',
  friend: '#38bdf8',
  parent: '#60a5fa',
}
