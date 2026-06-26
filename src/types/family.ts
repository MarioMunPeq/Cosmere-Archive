export interface FamilyMember {
  id: string
  name: string
  characterId?: string
  spouseId?: string
  parentIds?: string[]
  isDeceased?: boolean
  gender?: 'male' | 'female'
}

export interface FamilyDefinition {
  id: string
  name: string
  color: string
  description: string
  members: FamilyMember[]
  rootIds: string[]
}
