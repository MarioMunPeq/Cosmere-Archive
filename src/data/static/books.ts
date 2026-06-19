import type { Book } from '@/types'

export const BOOKS: Book[] = [
  // Mistborn Era 1
  {
    id: 'the_final_empire',
    title: 'The Final Empire',
    saga: 'mistborn-era-1',
    order: 1,
    year: 2006,
    description:
      'Vin, a young street urchin from the skaa class, discovers she has allomantic powers and joins the enigmatic Kelsier to overthrow the Lord Ruler.',
  },
  {
    id: 'the_well_of_ascension',
    title: 'The Well of Ascension',
    saga: 'mistborn-era-1',
    order: 2,
    year: 2007,
    description:
      "A year after the Lord Ruler's fall, Elend Venture struggles to hold the new government together while unknown forces approach.",
  },
  {
    id: 'the_hero_of_ages',
    title: 'The Hero of Ages',
    saga: 'mistborn-era-1',
    order: 3,
    year: 2008,
    description: 'Vin and Elend face the final threat as the Deepness approaches. The hero of ages must rise.',
  },

  // Mistborn Era 2 (Wax & Wayne)
  {
    id: 'the_alloy_of_law',
    title: 'The Alloy of Law',
    saga: 'mistborn-era-2',
    order: 1,
    year: 2011,
    description:
      'Three hundred years after Era 1, Waxillium Ladrian, a Mistborn, returns to the city to face a new threat.',
  },
  {
    id: 'shadows_of_self',
    title: 'Shadows of Self',
    saga: 'mistborn-era-2',
    order: 2,
    year: 2015,
    description:
      'Wax and Wayne investigate a series of murders in Elendel that may be connected to a figure from the past.',
  },
  {
    id: 'the_bands_of_mourning',
    title: 'The Bands of Mourning',
    saga: 'mistborn-era-2',
    order: 3,
    year: 2016,
    description:
      'Wax travels north in search of the mythical Bands of Mourning, artifacts of incredible allomantic power.',
  },
  {
    id: 'the_lost_metal',
    title: 'The Lost Metal',
    saga: 'mistborn-era-2',
    order: 4,
    year: 2022,
    description: "The finale of Wax and Wayne's era. Threats from beyond the Cosmere arrive on Scadrial.",
  },

  // Elantris
  {
    id: 'elantris',
    title: 'Elantris',
    saga: 'elantris',
    order: 1,
    year: 2005,
    description:
      'The city of Elantris, once a place of gods, is now a cursed ruin. Prince Raoden is transformed and must uncover the mystery.',
  },

  // Warbreaker
  {
    id: 'warbreaker',
    title: 'Warbreaker',
    saga: 'warbreaker',
    order: 1,
    year: 2009,
    description:
      "Two princesses from Idris travel to T'Telir. One to marry the god-king, the other to save her sister. Breaths and Awakening change everything.",
  },

  // The Stormlight Archive
  {
    id: 'the_way_of_kings',
    title: 'The Way of Kings',
    saga: 'stormlight',
    order: 1,
    year: 2010,
    description:
      'In a world of storms, battle medic Kaladin is enslaved, while Princess Jasnah investigates the secrets of the Knights Radiant.',
  },
  {
    id: 'words_of_radiance',
    title: 'Words of Radiance',
    saga: 'stormlight',
    order: 2,
    year: 2014,
    description: 'Kaladin and Shallan become Radiants as the Voidbringer threat grows on Roshar.',
  },
  {
    id: 'oathbringer',
    title: 'Oathbringer',
    saga: 'stormlight',
    order: 3,
    year: 2017,
    description:
      'Dalinar Kholin must face his dark past while the Everstorm ravages Roshar and armies prepare for the final war.',
  },
  {
    id: 'rhythm_of_war',
    title: 'Rhythm of War',
    saga: 'stormlight',
    order: 4,
    year: 2020,
    description:
      'The war continues. Scientists discover new dangers, and Radiant prisoners fight to survive in the depths.',
  },
  {
    id: 'wind_and_truth',
    title: 'Wind and Truth',
    saga: 'stormlight',
    order: 5,
    year: 2024,
    description: "The conclusion of the first Stormlight Archive arc. Roshar's heroes face the ultimate battle.",
  },

  // White Sand
  {
    id: 'white_sand_vol_1',
    title: 'White Sand Vol. 1',
    saga: 'white-sand',
    order: 1,
    year: 2016,
    description: 'Kenton, a young sand master, fights to survive in the merciless Taldain desert.',
  },
  {
    id: 'white_sand_vol_2',
    title: 'White Sand Vol. 2',
    saga: 'white-sand',
    order: 2,
    year: 2018,
    description: "Kenton continues his journey as Taldain's political factions compete for control.",
  },
  {
    id: 'white_sand_vol_3',
    title: 'White Sand Vol. 3',
    saga: 'white-sand',
    order: 3,
    year: 2019,
    description: 'The conclusion of the Taldain graphic novel story.',
  },

  // Arcanum Unbounded
  {
    id: 'arcanum_unbounded',
    title: 'Arcanum Unbounded',
    saga: 'arcanum-unbounded',
    order: 1,
    year: 2016,
    description:
      "Collection of Cosmere stories: The Sel System, The Hope of Elantris, The Emperor's Soul, The Eleventh Metal, Allomancer Jak, Shadows for Silence, and Edgedancer.",
  },

  // Secret Projects
  {
    id: 'tress_of_the_emerald_sea',
    title: 'Tress of the Emerald Sea',
    saga: 'secret-projects',
    order: 1,
    year: 2023,
    description:
      'Tress lives on a remote island. When her love is kidnapped, she embarks on a journey across seas of spores, witches, and dragons.',
  },
  {
    id: 'yumi_and_the_nightmare_painter',
    title: 'Yumi and the Nightmare Painter',
    saga: 'secret-projects',
    order: 2,
    year: 2023,
    description: 'A young spirit summoner and a nightmare painter mysteriously swap places.',
  },
  {
    id: 'the_sunlit_man',
    title: 'The Sunlit Man',
    saga: 'secret-projects',
    order: 3,
    year: 2023,
    description:
      'A man fleeing across a star system, pursued by relentless enemies on a world that approaches the sun.',
  },
]

export function getBookById(id: string): Book | undefined {
  return BOOKS.find((book) => book.id === id)
}
