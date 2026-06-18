export interface Saga {
  id: string
  name: string
  color: string
  order: number
  description?: string
}

export const SAGAS: Saga[] = [
  {
    id: "mistborn-era-1",
    name: "Mistborn Era 1",
    color: "red",
    order: 1,
    description: "The original Mistborn trilogy: The Final Empire, The Well of Ascension, The Hero of Ages.",
  },
  {
    id: "mistborn-era-2",
    name: "Mistborn Era 2",
    color: "amber",
    order: 5,
    description: "Wax & Wayne: a mix of western and steampunk on Scadrial.",
  },
  {
    id: "elantris",
    name: "Elantris",
    color: "teal",
    order: 2,
    description: "Sanderson's first published novel. A cursed city and a fallen prince.",
  },
  {
    id: "warbreaker",
    name: "Warbreaker",
    color: "fuchsia",
    order: 3,
    description: "Gods, breaths, and talking swords on the world of Nalthis.",
  },
  {
    id: "stormlight",
    name: "The Stormlight Archive",
    color: "cyan",
    order: 6,
    description: "The central epic of the Cosmere. Knights Radiant, storms, and warriors.",
  },
  {
    id: "white-sand",
    name: "White Sand",
    color: "yellow",
    order: 4,
    description: "Graphic novel set on the planet Taldain, filled with deserts.",
  },
  {
    id: "arcanum-unbounded",
    name: "Arcanum Unbounded",
    color: "violet",
    order: 7,
    description: "Collection of Cosmere short stories with information about each system.",
  },
  {
    id: "secret-projects",
    name: "Secret Projects",
    color: "sky",
    order: 8,
    description: "Sanderson's secret novels: Tress, Yumi, The Sunlit Man, and more.",
  },
]
