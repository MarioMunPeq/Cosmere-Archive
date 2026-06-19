export interface CosmicEra {
  id: string
  name: string
  startYear: number
  endYear: number
  color: string
  description: string
}

export const ERAS: CosmicEra[] = [
  {
    id: 'pre-shattering',
    name: 'Pre-Shattering',
    startYear: -20000,
    endYear: -10001,
    color: '#1e1b4b',
    description: 'Before the Shattering of Adonalsium. The original divine power existed undivided.',
  },
  {
    id: 'shattering',
    name: 'Shattering',
    startYear: -10000,
    endYear: -8001,
    color: '#4c1d95',
    description: 'Sixteen people unite to kill Adonalsium and divide their power into sixteen Shards.',
  },
  {
    id: 'settlement',
    name: 'Settlement of Shards',
    startYear: -8000,
    endYear: -5001,
    color: '#1e3a5f',
    description: 'The Shards arrive at their planets and begin shaping them and creating human life.',
  },
  {
    id: 'first-civilizations',
    name: 'First Civilizations',
    startYear: -5000,
    endYear: -2001,
    color: '#0f4c3a',
    description: 'Rise of Elantris on Sel. Recurring Desolations on Roshar. First civilizations on Scadrial.',
  },
  {
    id: 'age-of-legends',
    name: 'Age of Legends',
    startYear: -2000,
    endYear: -501,
    color: '#4a2c17',
    description: 'Fall of Elantris. The Betrayal of the Knights Radiant. Formation of the Final Empire.',
  },
  {
    id: 'classical-era',
    name: 'Classical Era',
    startYear: -500,
    endYear: 999,
    color: '#2d3748',
    description:
      'Ascension of the Lord Ruler. Millenium of the Final Empire. Development of cultures across the Cosmere.',
  },
  {
    id: 'final-empire',
    name: 'Final Empire',
    startYear: 1000,
    endYear: 1025,
    color: '#63171b',
    description:
      "Kelsier's rebellion against the Lord Ruler. The fall of the Final Empire and ascension of Elend Venture.",
  },
  {
    id: 'catacendre',
    name: 'Catacendre & Reconstruction',
    startYear: 1026,
    endYear: 1323,
    color: '#234e52',
    description: 'Harmony rebuilds Scadrial. Kelsier founds the Ghostbloods. Development of the Elendel Basin.',
  },
  {
    id: 'second-industrial',
    name: 'Industrial Era',
    startYear: 1324,
    endYear: 1499,
    color: '#744210',
    description: 'Technological boom on Scadrial. Mistborn Era 2. Scadrial slowly opens to the Cosmere.',
  },
  {
    id: 'radiant-return',
    name: 'Return of the Radiants',
    startYear: 1500,
    endYear: 1550,
    color: '#065666',
    description: 'The Stormlight Archive. The War for Roshar. The Everstorm. The Battle for Urithiru.',
  },
  {
    id: 'cosmere-awakening',
    name: 'Cosmere Awakening',
    startYear: 1551,
    endYear: 2000,
    color: '#3730a3',
    description: 'Secret Projects. Growing interplanetary connection. New worlds discovered and cosmic threats.',
  },
]
