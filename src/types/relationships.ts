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

/**
 * One recorded link between two people.
 *
 * ## What `label` means
 *
 * `label` states the **first** character's role in the link: in
 * `['vin', 'elend'], label: 'Wife'`, Vin is the wife and therefore Elend is the
 * husband. That invariant is what lets the Records card answer "what is this
 * person to *me*" without storing both directions of every relationship, and
 * `src/utils/relationships.ts` depends on it.
 *
 * It also means a single row is not enough to describe both cards. When the
 * reverse direction is not stated by another row, `inverseLabel` names the
 * second character's role, e.g. `['sarene', 'kiin'], label: 'Niece',
 * inverseLabel: 'Uncle'`. Use it only where the neutral type label would be
 * false — writing both directions for every row would put the table back where
 * it started.
 */
export interface CharacterRelationship {
  characters: [string, string]
  type: RelationshipType
  label?: string
  /** The second character's role, when no row states it. See above. */
  inverseLabel?: string
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
