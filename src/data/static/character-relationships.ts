import type { CharacterRelationship } from '@/types/relationships'

export const CHARACTER_RELATIONSHIPS: CharacterRelationship[] = [
  { characters: ['kelsier', 'marsh'], type: 'sibling' },
  { characters: ['kelsier', 'vin'], type: 'mentor' },
  { characters: ['vin', 'elend'], type: 'spouse' },
  { characters: ['kelsier', 'rashek'], type: 'rival' },
  { characters: ['vin', 'rashek'], type: 'rival' },
  { characters: ['vin', 'sazed'], type: 'friend' },
  { characters: ['sazed', 'vin'], type: 'mentor' },

  { characters: ['wax', 'wayne'], type: 'partner' },
  { characters: ['wax', 'steris'], type: 'spouse' },
  { characters: ['marasi', 'steris'], type: 'sibling', label: 'Half-sisters' },

  { characters: ['kaladin', 'dalinar'], type: 'ally' },
  { characters: ['kaladin', 'adolin'], type: 'friend' },
  { characters: ['kaladin', 'shallan'], type: 'friend' },
  { characters: ['kaladin', 'szeth'], type: 'rival' },
  { characters: ['kaladin', 'sigzil'], type: 'ally' },
  { characters: ['dalinar', 'navani'], type: 'spouse' },
  { characters: ['dalinar', 'adolin'], type: 'parent' },
  { characters: ['dalinar', 'jasnah'], type: 'parent' },
  { characters: ['adolin', 'shallan'], type: 'spouse' },
  { characters: ['adolin', 'jasnah'], type: 'sibling' },
  { characters: ['shallan', 'jasnah'], type: 'mentor' },
  { characters: ['taravangian', 'dalinar'], type: 'rival' },

  { characters: ['raoden', 'sarene'], type: 'spouse' },

  { characters: ['siri', 'vivenna'], type: 'sibling' },
  { characters: ['vasher', 'nightblood'], type: 'creator', label: 'Awakener' },
  { characters: ['vivenna', 'vasher'], type: 'ally' },
  { characters: ['siri', 'susebron'], type: 'spouse' },

  { characters: ['khriss', 'kenton'], type: 'ally' },
  { characters: ['khriss', 'nazh'], type: 'mentor' },

  { characters: ['hoid', 'dalinar'], type: 'ally' },
  { characters: ['hoid', 'kelsier'], type: 'rival' },
]
