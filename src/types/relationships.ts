export type RelationshipType =
  | 'spouse'
  | 'sibling'
  | 'mentor'
  | 'mentee'
  | 'ally'
  | 'rival'
  | 'creator'
  | 'creation'
  | 'parent'
  | 'bonded'
  | 'allegiance'
  | 'wielder'
  | 'wields'

export interface CharacterRelationship {
  characters: [string, string]
  type: RelationshipType
  label?: string
}

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  spouse: 'Spouse',
  sibling: 'Sibling',
  mentor: 'Mentor',
  mentee: 'Mentee',
  ally: 'Ally',
  rival: 'Rival',
  creator: 'Creator',
  creation: 'Creation',
  parent: 'Parent',
  bonded: 'Bonded',
  allegiance: 'Allegiance',
  wielder: 'Wielder',
  wields: 'Wields',
}

export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  spouse: '#f472b6',
  sibling: '#a78bfa',
  mentor: '#34d399',
  mentee: '#a78bfa',
  ally: '#fbbf24',
  rival: '#f87171',
  creator: '#a3e635',
  creation: '#a3e635',
  parent: '#60a5fa',
  bonded: '#60a5fa',
  allegiance: '#fbbf24',
  wielder: '#f472b6',
  wields: '#f472b6',
}
