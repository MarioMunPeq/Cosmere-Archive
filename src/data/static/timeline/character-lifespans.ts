export interface CharacterSpan {
  id: string
  name: string
  planet: string
  color: string
  birthYear: number | null
  deathYear: number | null
  isAlive: boolean
  group: 'radiant' | 'scadrian' | 'elantrian' | 'nalthian' | 'taldaini' | 'other'
  titles: string[]
}

export const CHARACTER_SPANS: CharacterSpan[] = [
  // ═══ ROSHAR — Radiants ═══════════════════════════════
  { id: "kaladin",     name: "Kaladin",        planet: "Roshar",      color: "#06b6d4", birthYear: 1475, deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Corredor del Viento", "Hijo de Honor", "Capitán"] },
  { id: "shallan",     name: "Shallan Davar",  planet: "Roshar",      color: "#8b5cf6", birthYear: 1478, deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Tejedora de Luz", "Verdadera", "Iluminadora"] },
  { id: "dalinar",     name: "Dalinar Kholin", planet: "Roshar",      color: "#f59e0b", birthYear: 1460, deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Portador del Vínculo", "Alto Príncipe", "Campeón de Honor"] },
  { id: "adalinar",    name: "Adolin Kholin",  planet: "Roshar",      color: "#f97316", birthYear: 1476, deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Duelista", "Príncipe", "Portador de la Espada"] },
  { id: "jasnah",      name: "Jasnah Kholin",  planet: "Roshar",      color: "#a78bfa", birthYear: 1465, deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Tejedora de Luz", "Reina de Alezkar", "Erudita"] },
  { id: "szeth",       name: "Szeth",          planet: "Roshar",      color: "#9ca3af", birthYear: 1470, deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Asesino de Reyes", "Verdadero Corredor del Viento", "Shin"] },
  { id: "navani",      name: "Navani Kholin",  planet: "Roshar",      color: "#06b6d4", birthYear: 1440, deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Erudita", "Ingeniera de Luz", "Reina Viuda"] },
  { id: "sigzil",      name: "Sigzil (Nómada)", planet: "Roshar",     color: "#0ea5e9", birthYear: 1472, deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Corredor del Viento", "Nómada", "Portador del Amanesquirla"] },
  { id: "venli",       name: "Venli",          planet: "Roshar",      color: "#22c55e", birthYear: 1480, deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Portadora de la Ola", "Cantora", "Radiante"] },
  { id: "taravangian", name: "Taravangian",    planet: "Roshar",      color: "#dc2626", birthYear: 1445, deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Rey de Kharbranth", "Odium", "El Más Sabio"] },
  { id: "lift",        name: "Lift",           planet: "Roshar",      color: "#65a30d", birthYear: 1485, deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Rizada", "Radiante", "La que no envejece"] },
  { id: "taln",        name: "Taln",           planet: "Roshar",      color: "#d946ef", birthYear: null,  deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Heralde de la Guerra", "El Inquebrantable", "Portador del Dolor"] },
  { id: "asha",        name: "Ash",            planet: "Roshar",      color: "#a21caf", birthYear: null,  deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Heralde de la Belleza", "Shalash", "Destructora de Arte"] },
  { id: "nale",        name: "Nale",           planet: "Roshar",      color: "#1d4ed8", birthYear: null,  deathYear: null,  isAlive: true,  group: "radiant",    titles: ["Heralde de la Justicia", "Juez", "Portador de la Espada"] },

  // ═══ SCADRIAL ════════════════════════════════════════
  { id: "kelsier",     name: "Kelsier",             planet: "Scadrial",  color: "#ef4444", birthYear: 990,  deathYear: 1024, isAlive: false, group: "scadrian",  titles: ["Superviviente de Hathsin", "Ladrón", "Fundador de los Sangre Espectral"] },
  { id: "vin",         name: "Vin",                 planet: "Scadrial",  color: "#6366f1", birthYear: 1022, deathYear: 1026, isAlive: false, group: "scadrian",  titles: ["Nacida de la Bruma", "Héroe de las Eras", "Ascendiente"] },
  { id: "elend",       name: "Elend Venture",       planet: "Scadrial",  color: "#f59e0b", birthYear: 1021, deathYear: 1026, isAlive: false, group: "scadrian",  titles: ["Rey del Nuevo Imperio", "Ascendiente", "Visionario"] },
  { id: "sazed",       name: "Sazed",               planet: "Scadrial",  color: "#22c55e", birthYear: 150,  deathYear: null,  isAlive: true,  group: "scadrian",  titles: ["Guardián", "Armonía", "Héroe de las Eras"] },
  { id: "spook",       name: "Spook",               planet: "Scadrial",  color: "#a21caf", birthYear: 1020, deathYear: null,  isAlive: true,  group: "scadrian",  titles: ["Señor de la Bruma", "Superviviente", "Fundador de Elendel"] },
  { id: "marsh",       name: "Marsh",               planet: "Scadrial",  color: "#374151", birthYear: 988,  deathYear: null,  isAlive: true,  group: "scadrian",  titles: ["Inquisidor de Acero", "Hermano de Kelsier", "Espía de Armonía"] },
  { id: "rashek",      name: "Lord Legislador",     planet: "Scadrial",  color: "#dc2626", birthYear: -100, deathYear: 1024, isAlive: false, group: "scadrian",  titles: ["Lord Legislador", "Rashek", "Tirano de Scadrial"] },
  { id: "wax",         name: "Waxillium Ladrian",   planet: "Scadrial",  color: "#f97316", birthYear: 1300, deathYear: null,  isAlive: true,  group: "scadrian",  titles: ["Ley de la Fronza", "Nacido de la Bruma", "Defensor de la Cuenca"] },
  { id: "wayne",       name: "Wayne",               planet: "Scadrial",  color: "#eab308", birthYear: 1302, deathYear: 1328, isAlive: false, group: "scadrian",  titles: ["Maestro del Disfraz", "Negociador", "Mejor Amigo"] },
  { id: "marasi",      name: "Marasi Colms",        planet: "Scadrial",  color: "#06b6d4", birthYear: 1310, deathYear: null,  isAlive: true,  group: "scadrian",  titles: ["Gobernadora", "Abogada", "Líder"] },
  { id: "steris",      name: "Steris Harms",        planet: "Scadrial",  color: "#8b5cf6", birthYear: 1305, deathYear: null,  isAlive: true,  group: "scadrian",  titles: ["Estratega", "Esposa de Wax", "Planificadora"] },
  { id: "tenSoon",     name: "TenSoon",             planet: "Scadrial",  color: "#6b7280", birthYear: 200,  deathYear: null,  isAlive: true,  group: "scadrian",  titles: ["Kandra", "Libertad", "Amigo de Vin"] },
  { id: "ham",         name: "Hammond (Ham)",       planet: "Scadrial",  color: "#4b5563", birthYear: 995,  deathYear: 1026, isAlive: false, group: "scadrian",  titles: ["Brumoso de Peltre", "Soldado", "Filósofo"] },
  { id: "breeze",      name: "Breeze",              planet: "Scadrial",  color: "#9333ea", birthYear: 993,  deathYear: 1026, isAlive: false, group: "scadrian",  titles: ["Brumoso de Zinc", "Manipulador", "Noble Skaa"] },
  { id: "clubs",       name: "Clubs",               planet: "Scadrial",  color: "#78716c", birthYear: 980,  deathYear: 1025, isAlive: false, group: "scadrian",  titles: ["Brumoso de Cobre", "Líder de la Banda", "Tío de Spook"] },

  // ═══ SEL ═════════════════════════════════════════════
  { id: "raoden",      name: "Raoden",          planet: "Sel",       color: "#14b8a6", birthYear: -490, deathYear: null, isAlive: true,  group: "elantrian", titles: ["Príncipe de Arelon", "Restaurador de Elantris", "Elantrino"] },
  { id: "sarene",      name: "Sarene",          planet: "Sel",       color: "#0d9488", birthYear: -495, deathYear: null, isAlive: true,  group: "elantrian", titles: ["Princesa de Teod", "Estratega", "Esposa de Raoden"] },
  { id: "shai",        name: "Wan ShaiLu",      planet: "Sel",       color: "#a7f3d0", birthYear: -10,  deathYear: null, isAlive: true,  group: "elantrian", titles: ["Maestra del Alma", "Forjadora", "Ladrona"] },
  { id: "hrathen",     name: "Hrathen",         planet: "Sel",       color: "#991b1b", birthYear: -510, deathYear: 12,   isAlive: false, group: "elantrian", titles: ["Sumo Sacerdote de Dominio", "Gyorn", "Convertido"] },

  // ═══ NALTHIS ═════════════════════════════════════════
  { id: "vasher",      name: "Vasher",          planet: "Nalthis",   color: "#f472b6", birthYear: null,  deathYear: null,  isAlive: true,  group: "nalthian",  titles: ["El Siniestro", "Portador de Rompespadas", "Errante"] },
  { id: "nightblood",  name: "Rompespadas",     planet: "Nalthis",   color: "#dc2626", birthYear: 290,   deathYear: null,  isAlive: true,  group: "nalthian",  titles: ["Espada Consciente", "Devora Almas", "Destructora del Mal"] },
  { id: "siri",        name: "Siri",            planet: "Nalthis",   color: "#fbcfe8", birthYear: 270,   deathYear: null,  isAlive: true,  group: "nalthian",  titles: ["Princesa de Idris", "Reina de T'Telir", "Esposa del Dios-Rey"] },
  { id: "vivenna",     name: "Vivenna",         planet: "Nalthis",   color: "#db2777", birthYear: 265,   deathYear: null,  isAlive: true,  group: "nalthian",  titles: ["Princesa de Idris", "Despertadora", "Errante"] },
  { id: "susebron",    name: "Susebron",        planet: "Nalthis",   color: "#e9d5ff", birthYear: 260,   deathYear: null,  isAlive: true,  group: "nalthian",  titles: ["Dios-Rey de T'Telir", "Portador de la Voz", "Libertad"] },
  { id: "denth",       name: "Denth",           planet: "Nalthis",   color: "#7f1d1d", birthYear: null,  deathYear: 300,   isAlive: false, group: "nalthian",  titles: ["Mercenario", "Líder de los Saltamundos", "Asesino"] },

  // ═══ TALDAIN ═════════════════════════════════════════
  { id: "khriss",      name: "Khriss",          planet: "Taldain",   color: "#22c55e", birthYear: 70,    deathYear: null,  isAlive: true,  group: "taldaini",  titles: ["Erudita del Cosmere", "Autora del Ars Arcanum", "Noble"] },
  { id: "kenton",      name: "Kenton",          planet: "Taldain",   color: "#eab308", birthYear: 80,    deathYear: null,  isAlive: true,  group: "taldaini",  titles: ["Maestro de la Arena", "Último del Diario"] },
  { id: "baon",        name: "Baon",            planet: "Taldain",   color: "#84cc16", birthYear: 75,    deathYear: null,  isAlive: true,  group: "taldaini",  titles: ["Maestro de la Arena", "Guardián"] },

  // ═══ OTHER ═══════════════════════════════════════════
  { id: "silence",     name: "Silence Montane",       planet: "Threnody",      color: "#8b5cf6", birthYear: 130,  deathYear: null, isAlive: true,  group: "other", titles: ["Cazadora de Sombras", "Posadera", "Superviviente"] },
  { id: "tress",       name: "Tress",                 planet: "Lumar",         color: "#f472b6", birthYear: 1580, deathYear: null, isAlive: true,  group: "other", titles: ["Navegante", "Heroína de Lumar", "Capitana"] },
  { id: "hoid",        name: "Hoid (Portavoz)",       planet: "Roshar",        color: "#a78bfa", birthYear: null,  deathYear: null, isAlive: true,  group: "other", titles: ["Vagabundo Inmortal", "Narrador", "Rechazó la Esquirla"] },
  { id: "nazh",        name: "Nazh",                  planet: "Threnody",      color: "#eab308", birthYear: 700,  deathYear: null,  isAlive: true,  group: "other", titles: ["Cartógrafo", "Espía de Khriss"] },
]

export const CHARACTER_GROUPS: { id: string; label: string; color: string }[] = [
  { id: "radiant",   label: "Roshar — Radiantes",    color: "#06b6d4" },
  { id: "scadrian",  label: "Scadrial — Nacidos de la Bruma", color: "#ef4444" },
  { id: "elantrian", label: "Sel — Elantrinos",      color: "#14b8a6" },
  { id: "nalthian",  label: "Nalthis — Despertadores", color: "#f472b6" },
  { id: "taldaini",  label: "Taldain — Maestros de la Arena", color: "#eab308" },
  { id: "other",     label: "Otros Mundos",          color: "#8b5cf6" },
]
