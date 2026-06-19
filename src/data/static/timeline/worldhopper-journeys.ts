export interface WorldhopperMovement {
  id: string
  name: string
  color: string
  description: string
  planets: string[]
  sagas: string[]
  movements: { year: number; planet: string; description: string }[]
}

export const WORLDHOPPER_MOVEMENTS: WorldhopperMovement[] = [
  {
    id: "hoid",
    name: "Hoid",
    color: "#a78bfa",
    description: "Appears in almost every world. Storyteller, wanderer, seeker.",
    planets: ["yolen","roshar","scadrial","nalthis","sel","taldain","first-of-the-sun","lumar","komashi","canticle"],
    sagas: ["stormlight","mistborn-era-1","elantris","warbreaker","secret-projects"],
    movements: [
      { year: -10000, planet: "yolen",    description: "Present at the Shattering of Adonalsium. Refuses a Shard." },
      { year: -9900,  planet: "yolen",    description: "Begins his eternal wandering across the Cosmere." },
      { year: -2500,  planet: "roshar",   description: "Witnesses the betrayal of the Knights Radiant." },
      { year: -500,   planet: "sel",      description: "Visits Sel, observes the fall of Elantris." },
      { year: 12,     planet: "sel",      description: "In Elantris as an informant in the palace of Teod." },
      { year: 100,    planet: "taldain",  description: "On Taldain during the events of White Sand." },
      { year: 290,    planet: "nalthis",  description: "Collects BioChromatic Breaths on Nalthis." },
      { year: 300,    planet: "nalthis",  description: "Observes the events of Warbreaker." },
      { year: 1024,   planet: "scadrial", description: "On Scadrial during the fall of the Lord Ruler." },
      { year: 1328,   planet: "scadrial", description: "Observes the defeat of Autonomy." },
      { year: 1499,   planet: "roshar",   description: "Tutor of stories for King Elhokar on Roshar." },
      { year: 1500,   planet: "roshar",   description: "Participates in the war on Roshar as a messenger." },
      { year: 1504,   planet: "roshar",   description: "Taravangian takes his Breaths." },
      { year: 1600,   planet: "lumar",    description: "Narrates the story of Tress." },
      { year: 1610,   planet: "komashi",  description: "Visits Komashi, observes Yumi and Nikaro." },
      { year: 1620,   planet: "canticle", description: "Helps Nomad (Sigzil) in his escape." },
    ],
  },
  {
    id: "vasher",
    name: "Vasher",
    color: "#f472b6",
    description: "Kalad the Usurper. Wielder of Nightblood, expert in Awakening.",
    planets: ["nalthis","roshar"],
    sagas: ["warbreaker","stormlight","arcanum-unbounded"],
    movements: [
      { year: 290,  planet: "nalthis", description: "Creates Nightblood with Shashara." },
      { year: 300,  planet: "nalthis", description: "Participates in the events of Warbreaker." },
      { year: 400,  planet: "roshar",  description: "Travels to Roshar as Zahel." },
      { year: 1500, planet: "roshar",  description: "Lives hidden on Roshar, trains Kaladin as Zahel." },
      { year: 1503, planet: "roshar",  description: "Helps defend Urithiru." },
    ],
  },
  {
    id: "khriss",
    name: "Khriss",
    color: "#22c55e",
    description: "Scholar from Taldain. Documents investiture systems.",
    planets: ["taldain","scadrial","roshar","first-of-the-sun","canticle"],
    sagas: ["white-sand","arcanum-unbounded","secret-projects"],
    movements: [
      { year: 100,  planet: "taldain",  description: "As a scholar, investigates White Sand." },
      { year: 110,  planet: "scadrial", description: "Begins documenting allomancy and feruchemy." },
      { year: 120,  planet: "taldain",  description: "Publishes her first findings." },
      { year: 500,  planet: "roshar",   description: "Early research on Roshar." },
      { year: 1100, planet: "scadrial", description: "Studies the effects of the Catacendre." },
      { year: 1500, planet: "roshar",   description: "Documents the return of the Knights Radiant." },
      { year: 1620, planet: "canticle", description: "Helps Nomad and studies Canticle." },
    ],
  },
  {
    id: "nazh",
    name: "Nazh",
    color: "#eab308",
    description: "Cartographer and spy. Collects information for Khriss.",
    planets: ["threnody","taldain","scadrial","sel","roshar"],
    sagas: ["stormlight","arcanum-unbounded"],
    movements: [
      { year: 800,  planet: "threnody",  description: "Born on Threnody." },
      { year: 850,  planet: "taldain",  description: "Meets Khriss and begins cartography work." },
      { year: 1000, planet: "scadrial", description: "Maps Scadrial during the Final Empire." },
      { year: 1200, planet: "sel",      description: "Maps Sel post-Elantris." },
      { year: 1400, planet: "roshar",   description: "Detailed maps of Roshar." },
      { year: 1504, planet: "roshar",   description: "Gathers intelligence on the war in Roshar." },
    ],
  },
  {
    id: "kelsier",
    name: "Kelsier",
    color: "#ef4444",
    description: "The Survivor. Operates from the Cognitive Realm.",
    planets: ["scadrial","roshar"],
    sagas: ["mistborn-era-1","mistborn-era-2","stormlight"],
    movements: [
      { year: 990,  planet: "scadrial", description: "Born on Scadrial." },
      { year: 1024, planet: "scadrial", description: "Dies fighting the Lord Ruler." },
      { year: 1028, planet: "scadrial", description: "Trapped in the Cognitive Realm, plans his return." },
      { year: 1030, planet: "scadrial", description: "Founds the Ghostbloods." },
      { year: 1050, planet: "scadrial", description: "The Ghostbloods expand to Roshar via agents." },
      { year: 1326, planet: "scadrial", description: "Manifests before Wax and Marasi." },
      { year: 1503, planet: "scadrial", description: "The Ghostbloods operate in the Shattered Plains via agents." },
    ],
  },
]
