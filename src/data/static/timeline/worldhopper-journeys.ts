export interface WorldhopperMovement {
  id: string
  name: string
  color: string
  movements: { year: number; planet: string; description: string }[]
}

export const WORLDHOPPER_MOVEMENTS: WorldhopperMovement[] = [
  {
    id: "hoid",
    name: "Hoid",
    color: "#a78bfa",
    movements: [
      { year: -10000, planet: "roshar",   description: "Presente en la Fragmentación de Adonalsium. Rechaza la Esquirla." },
      { year: -9900,  planet: "roshar",   description: "Comienza su vagabundeo eterno por el Cosmere." },
      { year: -2500,  planet: "roshar",   description: "Observa la Traición de los Radiantes." },
      { year: -500,   planet: "sel",      description: "Visita Sel, observa la caída de Elantris." },
      { year: 12,     planet: "sel",      description: "En Elantris como informante del palacio de Teod." },
      { year: 100,    planet: "taldain",  description: "En Taldain durante los eventos de Arena Blanca." },
      { year: 290,    planet: "nalthis",  description: "Recolecta Alientos BioCromáticos en Nalthis." },
      { year: 300,    planet: "nalthis",  description: "Observa los eventos de Warbreaker." },
      { year: 1024,   planet: "scadrial", description: "En Scadrial durante la caída del Lord Legislador." },
      { year: 1328,   planet: "scadrial", description: "Observa la derrota de Autonomía." },
      { year: 1499,   planet: "roshar",   description: "Tutor de historias del rey Elhokar en Roshar." },
      { year: 1500,   planet: "roshar",   description: "Participa en la guerra de Roshar como Portavoz." },
      { year: 1504,   planet: "roshar",   description: "Taravangian le roba sus Alientos." },
      { year: 1600,   planet: "lumar",    description: "Narra la historia de Tress." },
      { year: 1610,   planet: "komashi",  description: "Visita Komashi, observa a Yumi y Nikaro." },
      { year: 1620,   planet: "canticle", description: "Ayuda a Nómada (Sigzil) en su huida." },
    ],
  },
  {
    id: "vasher",
    name: "Vasher",
    color: "#f472b6",
    movements: [
      { year: 290,  planet: "nalthis", description: "Crea Rompespadas con Shashara." },
      { year: 300,  planet: "nalthis", description: "Participa en los eventos de Warbreaker." },
      { year: 400,  planet: "roshar",  description: "Viaja a Roshar con Rompespadas, adopta identidad secreta." },
      { year: 1500, planet: "roshar",  description: "Vive en Roshar oculto, entrena a Kaladin como Zen." },
      { year: 1503, planet: "roshar",  description: "Ayuda en la defensa de Urithiru." },
    ],
  },
  {
    id: "khriss",
    name: "Khriss",
    color: "#22c55e",
    movements: [
      { year: 100,  planet: "taldain",  description: "Como erudita, investiga la Arena Blanca." },
      { year: 110,  planet: "scadrial", description: "Comienza a documentar la alomancia y feruquimia." },
      { year: 120,  planet: "taldain",  description: "Publica sus primeros hallazgos." },
      { year: 500,  planet: "roshar",   description: "Investigación temprana sobre Roshar." },
      { year: 1100, planet: "scadrial", description: "Estudia los efectos del Catacendro." },
      { year: 1500, planet: "roshar",   description: "Documenta el retorno de los Radiantes." },
      { year: 1620, planet: "canticle", description: "Ayuda a Nómada y estudia Cántico." },
    ],
  },
  {
    id: "nazh",
    name: "Nazh",
    color: "#eab308",
    movements: [
      { year: 800,  planet: "threnody",  description: "Nace en Threnody." },
      { year: 850,  planet: "taldain",  description: "Conoce a Khriss y comienza a cartografiar." },
      { year: 1000, planet: "scadrial", description: "Mapa de Scadrial durante el Imperio Final." },
      { year: 1200, planet: "sel",      description: "Cartografía Sel post-Elantris." },
      { year: 1400, planet: "roshar",   description: "Mapas detallados de Roshar." },
      { year: 1504, planet: "roshar",   description: "Recolecta información de la guerra en Roshar." },
    ],
  },
  {
    id: "kelsier",
    name: "Kelsier",
    color: "#ef4444",
    movements: [
      { year: 990,  planet: "scadrial", description: "Nace en Scadrial." },
      { year: 1024, planet: "scadrial", description: "Muere luchando contra el Lord Legislador." },
      { year: 1028, planet: "scadrial", description: "Atrapado en el Reino Cognitivo, planea su regreso." },
      { year: 1030, planet: "scadrial", description: "Funda los Sangre Espectral." },
      { year: 1050, planet: "roshar",   description: "Los Sangre Espectral se expanden a Roshar." },
      { year: 1326, planet: "scadrial", description: "Se manifiesta ante Wax y Marasi." },
      { year: 1503, planet: "roshar",   description: "Los Sangre Espectral operan en las Llanuras Quebradas." },
    ],
  },
]
