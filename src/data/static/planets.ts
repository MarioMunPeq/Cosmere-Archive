import type { Planet } from '@/types/planet'

export const PLANETS: Planet[] = [
  {
    id: 'yolen',
    name: 'Yolen',
    shard: 'Adonalsium (Shattered)',
    description:
      'The original world. Birthplace of Hoid and site of the Shattering of Adonalsium. Now lost and inaccessible.',
    x: 60,
    y: 60,
    color: '#a78bfa',
    size: 20,
    sagas: [],
    magicSystem: 'Unknown — the original investiture of Adonalsium, before the Shattering.',
    investiture: [
      {
        name: "Adonalsium's Investiture",
        description: 'The primeval investiture of Adonalsium, before the Shattering. Its nature is unknown.',
        shard: 'Adonalsium',
      },
    ],
    books: [],
  },
  {
    id: 'roshar',
    name: 'Roshar',
    shard: 'Honor, Cultivation & Odium',
    description:
      'Home of the Knights Radiant, the highstorms, and the Shattered Plains. The most active planet in the Cosmere today.',
    x: 580,
    y: 280,
    color: '#06b6d4',
    size: 60,
    sagas: ['stormlight', 'arcanum-unbounded'],
    magicSystem:
      'Surgebinding — using Stormlight to fuel the ten orders of Knights Radiant. Also Old Magic and Voidbinding.',
    investiture: [
      {
        name: 'Surgebinding',
        description: 'The ten orders of Knights Radiant use Stormlight to manipulate natural forces.',
        shard: 'Honor',
      },
      {
        name: 'Old Magic',
        description: 'Primitive investiture tied to the Nightwatcher and the boons/ curses she bestows.',
        shard: 'Cultivation',
      },
      {
        name: 'Voidbinding',
        description: 'Investiture fueled by Odium, associated with the Unmade and the Fused.',
        shard: 'Odium',
      },
    ],
    connectedPlanets: [],
    books: [
      'the_way_of_kings',
      'words_of_radiance',
      'oathbringer',
      'rhythm_of_war',
      'wind_and_truth',
      'arcanum_unbounded',
    ],
  },
  {
    id: 'scadrial',
    name: 'Scadrial',
    shard: 'Preservation, Ruin & Harmony',
    description: 'Birthplace of allomancy, feruchemy, and hemallurgy. A planet marked by ash, mists, and revolution.',
    x: 250,
    y: 340,
    color: '#ef4444',
    size: 55,
    sagas: ['mistborn-era-1', 'mistborn-era-2', 'arcanum-unbounded'],
    magicSystem:
      'The Metallic Arts — Allomancy (burning metals), Feruchemy (storing attributes), and Hemalurgy (stealing via spikes).',
    investiture: [
      {
        name: 'Allomancy',
        description: 'Burning metals ingested to grant physical or mental powers. Sixteen base metals.',
        shard: 'Preservation',
      },
      {
        name: 'Feruchemy',
        description: 'Storing attributes like strength, speed, or memory in metal minds for later use.',
        shard: 'Ruin',
      },
      {
        name: 'Hemalurgy',
        description: 'Stealing attributes from others via metal spikes driven through the body.',
        shard: 'Ruin',
      },
    ],
    books: [
      'the_final_empire',
      'the_well_of_ascension',
      'the_hero_of_ages',
      'the_alloy_of_law',
      'shadows_of_self',
      'the_bands_of_mourning',
      'the_lost_metal',
      'arcanum_unbounded',
    ],
  },
  {
    id: 'sel',
    name: 'Sel',
    shard: 'Devotion & Dominion',
    description: 'World of Elantris, where magic depends on geographic location and belief systems.',
    x: 400,
    y: 180,
    color: '#14b8a6',
    size: 45,
    sagas: ['elantris', 'arcanum-unbounded'],
    magicSystem:
      'Location-based Investiture — AonDor (Arelon), Dakhor (Fjordell), Forgery (MaiPon), ChayShan (Hrovell). Each tied to specific geography.',
    investiture: [
      {
        name: 'AonDor',
        description: 'Symbol-based magic tied to the geography of Arelon. Weakened after the Reod.',
        shard: 'Devotion',
      },
      {
        name: 'Dakhor',
        description: 'Bone-based magic used by the Fjordell priesthood. Powered by blood sacrifices.',
        shard: 'Dominion',
      },
      {
        name: 'Forgery',
        description: "Altering an object's past through seals. Most potent in MaiPon.",
        shard: 'Devotion',
      },
      {
        name: 'ChayShan',
        description: 'Martial-art-based investiture from Hrovell. Channeled through precise movements.',
        shard: 'Dominion',
      },
    ],
    books: ['elantris', 'arcanum_unbounded'],
  },
  {
    id: 'nalthis',
    name: 'Nalthis',
    shard: 'Endowment',
    description: 'Realm of BioChromatic Breath, where color gives power and gods walk among mortals.',
    x: 300,
    y: 120,
    color: '#d946ef',
    size: 40,
    sagas: ['warbreaker'],
    magicSystem:
      'Awakening — using BioChromatic Breath to animate objects and grant sentience. Color perception determines power.',
    investiture: [
      {
        name: 'Awakening',
        description:
          'Using BioChromatic Breath to animate objects and grant sentience. Color perception determines power.',
        shard: 'Endowment',
      },
    ],
    connectedPlanets: ['roshar'],
    books: ['warbreaker'],
  },
  {
    id: 'taldain',
    name: 'Taldain',
    shard: 'Autonomy',
    description: 'A world of two faces: a sun-baked desert and an ocean of darkness. Land of sand masters.',
    x: 180,
    y: 480,
    color: '#eab308',
    size: 35,
    sagas: ['white-sand'],
    magicSystem: 'Sand Mastery — manipulating sand using Investiture. Also Sand Toning, a lesser-known variant.',
    investiture: [
      {
        name: 'Sand Mastery',
        description: 'Manipulating sand using Investiture. Practiced by the Darksiders.',
        shard: 'Autonomy',
      },
      {
        name: 'Sand Toning',
        description: 'A lesser-known variant of Sand Mastery with different properties.',
        shard: 'Autonomy',
      },
    ],
    books: ['white_sand_vol_1', 'white_sand_vol_2', 'white_sand_vol_3'],
  },
  {
    id: 'threnody',
    name: 'Threnody',
    shard: 'Ambition',
    description: 'A world of silent forests where shadows lurk and silence is the only defense.',
    x: 460,
    y: 500,
    color: '#8b5cf6',
    size: 30,
    sagas: ['arcanum-unbounded'],
    magicSystem:
      'Shades — the cognitive shadows of the dead that inhabit the Forests of Hell. Simple Rules govern survival.',
    investiture: [
      {
        name: 'Shades',
        description: 'Cognitive shadows of the dead that inhabit the Forests of Hell. Governed by Simple Rules.',
        shard: 'Ambition',
      },
    ],
    books: ['arcanum_unbounded'],
  },
  {
    id: 'first-of-the-sun',
    name: 'First of the Sun',
    shard: 'Autonomy (Patji)',
    description: 'A tropical archipelago where hunters bond with magical aviar and the island of Patji prowls.',
    x: 740,
    y: 430,
    color: '#22c55e',
    size: 28,
    sagas: ['arcanum-unbounded', 'secret-projects'],
    magicSystem:
      'Aviar bonds — birds that bond with humans granting various abilities. Patji is a sentient perpendicularity.',
    investiture: [
      {
        name: 'Aviar Bond',
        description:
          'Birds that bond with humans granting various abilities such as mental shielding or enhanced senses.',
        shard: 'Autonomy',
      },
    ],
    books: ['arcanum_unbounded', 'the_sunlit_man'],
  },
  {
    id: 'komashi',
    name: 'Komashi',
    shard: 'Virtuosity',
    description: 'Split between a waking realm and a dream realm. Home of spirit summoners and nightmare painters.',
    x: 720,
    y: 100,
    color: '#0ea5e9',
    size: 32,
    sagas: ['secret-projects'],
    magicSystem:
      'Yoki-Hijo (spirit summoning) and Nightmare painting (trapping emotions in art). Powered by Hion lines.',
    investiture: [
      {
        name: 'Yoki-Hijo',
        description: 'Spirit summoning performed by yoki-hijo maidens. Summons spirits from the dream realm.',
        shard: 'Virtuosity',
      },
      {
        name: 'Nightmare Painting',
        description: 'Trapping emotions and experiences in art. Creates functional magical artifacts.',
        shard: 'Virtuosity',
      },
    ],
    books: ['yumi_and_the_nightmare_painter'],
  },
  {
    id: 'lumar',
    name: 'Lumar',
    shard: 'Mercy',
    description: 'An archipelago where the oceans are made of colored spores, ruled by witches and dragons.',
    x: 750,
    y: 520,
    color: '#f472b6',
    size: 28,
    sagas: ['secret-projects'],
    magicSystem:
      'Spores — twelve types of magical spores make up the seas. Each type has unique properties when activated by water.',
    investiture: [
      {
        name: 'Spore Magic',
        description:
          'Twelve types of magical spores make up the seas. Each type has unique properties when activated by water.',
        shard: 'Mercy',
      },
    ],
    books: ['tress_of_the_emerald_sea'],
  },
  {
    id: 'canticle',
    name: 'Canticle',
    shard: 'Ambition (remnant)',
    description: 'A planet dragged through space, scorched by its sun, where people live fleeing the dawn.',
    x: 850,
    y: 300,
    color: '#f97316',
    size: 25,
    sagas: ['secret-projects'],
    magicSystem:
      'Torment bonds — Investiture bonded to individuals grants heat resistance and other abilities. The planet itself is a trapped entity.',
    investiture: [
      {
        name: 'Torment Bond',
        description:
          'Investiture bonded to individuals grants heat resistance and other abilities. The planet itself is a trapped entity.',
        shard: 'Ambition',
      },
    ],
    books: ['the_sunlit_man'],
  },
]
