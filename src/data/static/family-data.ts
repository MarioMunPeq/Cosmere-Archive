import type { FamilyDefinition } from '@/types/family'

export const FAMILY_TREES: FamilyDefinition[] = [
  {
    id: 'kholin',
    name: 'Kholin Dynasty',
    color: '#fbbf24',
    description:
      'The ruling house of Alethkar on Roshar. Gavilar and Dalinar are brothers; after Gavilar\'s death, Navani later married Dalinar.',
    members: [
      { id: 'gavilar', name: 'Gavilar Kholin', spouseId: 'navani', isDeceased: true, gender: 'male' },
      { id: 'navani', name: 'Navani Kholin', spouseId: 'gavilar', characterId: 'navani', gender: 'female' },
      { id: 'dalinar', name: 'Dalinar Kholin', spouseId: 'evi', characterId: 'dalinar', gender: 'male' },
      { id: 'evi', name: 'Evi', spouseId: 'dalinar', isDeceased: true, gender: 'female' },

      { id: 'jasnah', name: 'Jasnah Kholin', parentIds: ['gavilar', 'navani'], characterId: 'jasnah', gender: 'female' },
      {
        id: 'elhokar',
        name: 'Elhokar Kholin',
        parentIds: ['gavilar', 'navani'],
        spouseId: 'aesudan',
        isDeceased: true,
        characterId: 'elhokar',
        gender: 'male',
      },
      { id: 'aesudan', name: 'Aesudan', spouseId: 'elhokar', isDeceased: true, gender: 'female' },

      { id: 'gavinor', name: 'Gavinor Kholin', parentIds: ['elhokar', 'aesudan'], gender: 'male' },

      {
        id: 'adolin',
        name: 'Adolin Kholin',
        parentIds: ['dalinar', 'evi'],
        spouseId: 'shallan',
        characterId: 'adolin',
        gender: 'male',
      },
      {
        id: 'renarin',
        name: 'Renarin Kholin',
        parentIds: ['dalinar', 'evi'],
        characterId: 'renarin',
        gender: 'male',
      },

      { id: 'shallan', name: 'Shallan Davar', spouseId: 'adolin', characterId: 'shallan', gender: 'female' },
    ],
    rootIds: ['gavilar', 'dalinar'],
  },
  {
    id: 'davar',
    name: 'Davar Family',
    color: '#34d399',
    description:
      'A minor lighteyed house of Jah Keved on Roshar. Shallan has four older brothers and a younger sister who died in childhood.',
    members: [
      { id: 'lin_davar', name: 'Lin Davar', spouseId: 'lady_davar', isDeceased: true, gender: 'male' },
      { id: 'lady_davar', name: 'Lady Davar', spouseId: 'lin_davar', isDeceased: true, gender: 'female' },

      {
        id: 'helaran_davar',
        name: 'Helaran Davar',
        parentIds: ['lin_davar', 'lady_davar'],
        isDeceased: true,
        gender: 'male',
      },
      { id: 'balat_davar', name: 'Balat Davar', parentIds: ['lin_davar', 'lady_davar'], gender: 'male' },
      { id: 'wikim_davar', name: 'Wikim Davar', parentIds: ['lin_davar', 'lady_davar'], gender: 'male' },
      { id: 'jushu_davar', name: 'Jushu Davar', parentIds: ['lin_davar', 'lady_davar'], gender: 'male' },
      {
        id: 'shallan',
        name: 'Shallan Davar',
        parentIds: ['lin_davar', 'lady_davar'],
        spouseId: 'adolin',
        characterId: 'shallan',
        gender: 'female',
      },

      { id: 'adolin', name: 'Adolin Kholin', spouseId: 'shallan', characterId: 'adolin', gender: 'male' },
    ],
    rootIds: ['lin_davar'],
  },
  {
    id: 'venture',
    name: 'Venture Dynasty',
    color: '#f87171',
    description:
      'The noble house that ruled the Final Empire on Scadrial. Straff\'s illegitimate son Zane was a Mistborn assassin.',
    members: [
      { id: 'straff', name: 'Straff Venture', isDeceased: true, gender: 'male' },

      {
        id: 'elend',
        name: 'Elend Venture',
        parentIds: ['straff'],
        spouseId: 'vin',
        characterId: 'elend',
        gender: 'male',
      },
      { id: 'vin', name: 'Vin', spouseId: 'elend', characterId: 'vin', gender: 'female' },

      { id: 'zane', name: 'Zane', parentIds: ['straff'], isDeceased: true, gender: 'male' },
    ],
    rootIds: ['straff'],
  },
  {
    id: 'survivor',
    name: "Survivor's Kin",
    color: '#a78bfa',
    description:
      'The found family bonded to Kelsier, the Survivor of Hathsin. Marsh is Kelsier\'s older brother; Spook is their distant cousin.',
    members: [
      { id: 'kelsier', name: 'Kelsier', spouseId: 'mare', characterId: 'kelsier', gender: 'male' },
      { id: 'mare', name: 'Mare', spouseId: 'kelsier', isDeceased: true, gender: 'female' },
      { id: 'marsh', name: 'Marsh', characterId: 'marsh', gender: 'male' },
      { id: 'spook', name: 'Spook', characterId: 'spook', gender: 'male' },
    ],
    rootIds: ['kelsier', 'marsh', 'spook'],
  },
  {
    id: 'idris',
    name: 'Idris Royal Family',
    color: '#38bdf8',
    description:
      'The ruling family of Idris on Nalthis. Princess Siri was sent to marry the God-King Susebron in Vivenna\'s place.',
    members: [
      { id: 'dedelin', name: 'King Dedelin', spouseId: 'idris_queen', isDeceased: true, gender: 'male' },
      { id: 'idris_queen', name: 'Queen of Idris', spouseId: 'dedelin', isDeceased: true, gender: 'female' },
      {
        id: 'vivenna',
        name: 'Vivenna',
        parentIds: ['dedelin', 'idris_queen'],
        characterId: 'vivenna',
        gender: 'female',
      },
      {
        id: 'siri',
        name: 'Siri',
        parentIds: ['dedelin', 'idris_queen'],
        spouseId: 'susebron',
        characterId: 'siri',
        gender: 'female',
      },
      { id: 'susebron', name: 'Susebron', spouseId: 'siri', characterId: 'susebron', gender: 'male' },
    ],
    rootIds: ['dedelin'],
  },
  {
    id: 'elantris',
    name: 'Arelon & Teod Royalty',
    color: '#f472b6',
    description:
      'The royal families of Arelon and Teod on Sel, united through the political marriage of Raoden and Sarene.',
    members: [
      { id: 'iadon', name: 'King Iadon', isDeceased: true, gender: 'male' },
      { id: 'eventeo', name: 'King Eventeo', isDeceased: true, gender: 'male' },
      {
        id: 'raoden',
        name: 'Raoden',
        parentIds: ['iadon'],
        spouseId: 'sarene',
        characterId: 'raoden',
        gender: 'male',
      },
      {
        id: 'sarene',
        name: 'Sarene',
        parentIds: ['eventeo'],
        spouseId: 'raoden',
        characterId: 'sarene',
        gender: 'female',
      },
    ],
    rootIds: ['iadon', 'eventeo'],
  },
  {
    id: 'era2_scadrial',
    name: 'Ladrian & Harms Family',
    color: '#2dd4bf',
    description:
      'Waxillium Ladrian, Steris Harms, and her half-sister Marasi Colms — the interconnected families of Scadrial\'s Era 2.',
    members: [
      { id: 'wax', name: 'Waxillium Ladrian', spouseId: 'steris', characterId: 'wax', gender: 'male' },
      { id: 'steris', name: 'Steris Harms', spouseId: 'wax', characterId: 'steris', gender: 'female' },
      { id: 'marasi', name: 'Marasi Colms', characterId: 'marasi', gender: 'female' },
    ],
    rootIds: ['wax', 'marasi'],
  },
]
