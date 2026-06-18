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
    id: "pre-shattering",
    name: "Pre-Fragmentación",
    startYear: -20000,
    endYear: -10001,
    color: "#1e1b4b",
    description: "Antes de la Fragmentación de Adonalsium. El poder divino original existía sin ser dividido.",
  },
  {
    id: "shattering",
    name: "Fragmentación",
    startYear: -10000,
    endYear: -8001,
    color: "#4c1d95",
    description: "Dieciséis personas se unen para matar a Adonalsium y repartir su poder en dieciséis Esquirlas.",
  },
  {
    id: "settlement",
    name: "Asentamiento de Esquirlas",
    startYear: -8000,
    endYear: -5001,
    color: "#1e3a5f",
    description: "Las Esquirlas llegan a sus planetas y comienzan a moldearlos y crear vida humana.",
  },
  {
    id: "first-civilizations",
    name: "Primeras Civilizaciones",
    startYear: -5000,
    endYear: -2001,
    color: "#0f4c3a",
    description: "Auge de Elantris en Sel. Desolaciones recurrentes en Roshar. Primeras civilaciones en Scadrial.",
  },
  {
    id: "age-of-legends",
    name: "Era de Leyendas",
    startYear: -2000,
    endYear: -501,
    color: "#4a2c17",
    description: "Caída de Elantris. La Traición de los Caballeros Radiantes. Formación del Imperio Final.",
  },
  {
    id: "classical-era",
    name: "Era Clásica",
    startYear: -500,
    endYear: 999,
    color: "#2d3748",
    description: "Ascensión del Lord Legislador. Milenio del Imperio Final. Desarrollo de culturas en todo el Cosmere.",
  },
  {
    id: "final-empire",
    name: "Imperio Final",
    startYear: 1000,
    endYear: 1025,
    color: "#63171b",
    description: "La rebelión de Kelsier contra el Lord Legislador. La caída del Imperio Final y ascensión de Elend Venture.",
  },
  {
    id: "catacendre",
    name: "Catacendro y Reconstrucción",
    startYear: 1026,
    endYear: 1323,
    color: "#234e52",
    description: "Armonía reconstruye Scadrial. Kelsier funda los Sangre Espectral. Desarrollo de la Cuenca de Elendel.",
  },
  {
    id: "second-industrial",
    name: "Era Industrial",
    startYear: 1324,
    endYear: 1499,
    color: "#744210",
    description: "Auge tecnológico en Scadrial. Nacidos de la Bruma Era 2. Scadrial se abre lentamente al Cosmere.",
  },
  {
    id: "radiant-return",
    name: "Retorno de los Radiantes",
    startYear: 1500,
    endYear: 1550,
    color: "#065666",
    description: "El Archivo de las Tormentas. La Guerra por Roshar. La Tormenta Eterna. La Batalla por Urithiru.",
  },
  {
    id: "cosmere-awakening",
    name: "Despertar del Cosmere",
    startYear: 1551,
    endYear: 2000,
    color: "#3730a3",
    description: "Secret Projects. Conexión interplanetaria creciente. Nuevos mundos descubiertos y amenazas cósmicas.",
  },
]
