// Libros: catálogo completo de libros del Cosmere con títulos en español.
// Esta es la fuente de verdad de qué libros existen y su metadata.
// En sesiones posteriores, el sistema de progreso de lectura comparará contra esta lista.

import type { Book } from '@/types'

export const BOOKS: Book[] = [
  // ═══════════════════════════════════════════
  // Mistborn Era 1
  // ═══════════════════════════════════════════
  {
    id: "the_final_empire",
    title: "El Imperio Final",
    saga: "mistborn-era-1",
    order: 1,
    year: 2006,
    description:
      "Vin, una joven ladrona de los suburbios, descubre que tiene poderes alománticos y se une al enigmático Kelsier para derrocar al Lord Legislador.",
  },
  {
    id: "the_well_of_ascension",
    title: "El Pozo de la Ascensión",
    saga: "mistborn-era-1",
    order: 2,
    year: 2007,
    description:
      "Un año después de la caída del Lord Legislador, Elend Venture lucha por mantener unido el nuevo gobierno mientras fuerzas desconocidas se acercan.",
  },
  {
    id: "the_hero_of_ages",
    title: "El Héroe de las Eras",
    saga: "mistborn-era-1",
    order: 3,
    year: 2008,
    description:
      "Vin y Elend se enfrentan a la amenaza final mientras la Profundidad se acerca. El héroe de las eras debe levantarse.",
  },

  // ═══════════════════════════════════════════
  // Mistborn Era 2 (Wax & Wayne)
  // ═══════════════════════════════════════════
  {
    id: "the_alloy_of_law",
    title: "Aleación de Ley",
    saga: "mistborn-era-2",
    order: 1,
    year: 2011,
    description:
      "Trescientos años después de los eventos de la Era 1, Waxillium Ladrian, un nacido de la bruma, regresa a la ciudad para enfrentarse a una nueva amenaza.",
  },
  {
    id: "shadows_of_self",
    title: "Sombras de Identidad",
    saga: "mistborn-era-2",
    order: 2,
    year: 2015,
    description:
      "Wax y Wayne investigan una serie de asesinatos en Elendel que podrían estar conectados con una figura del pasado.",
  },
  {
    id: "the_bands_of_mourning",
    title: "Brazales de Duelo",
    saga: "mistborn-era-2",
    order: 3,
    year: 2016,
    description:
      "Wax viaja al norte en busca de los míticos Brazales de la Lamentación, artefactos de increíble poder alomántico.",
  },
  {
    id: "the_lost_metal",
    title: "El Metal Perdido",
    saga: "mistborn-era-2",
    order: 4,
    year: 2022,
    description:
      "El final de la era de Wax y Wayne. Amenazas del más allá del Cosmere llegan a Scadrial.",
  },

  // ═══════════════════════════════════════════
  // Elantris
  // ═══════════════════════════════════════════
  {
    id: "elantris",
    title: "Elantris",
    saga: "elantris",
    order: 1,
    year: 2005,
    description:
      "La ciudad de Elantris, antaño un lugar de dioses, ahora es una ruina maldita. El príncipe Raoden es transformado y debe descubrir el misterio.",
  },

  // ═══════════════════════════════════════════
  // Warbreaker
  // ═══════════════════════════════════════════
  {
    id: "warbreaker",
    title: "Warbreaker",
    saga: "warbreaker",
    order: 1,
    year: 2009,
    description:
      "Dos princesas de Idris viajan a T'Telir. Una para casarse con el dios-rey, la otra para salvar a su hermana. Los alientos y el despertar cambian todo.",
  },

  // ═══════════════════════════════════════════
  // Archivo de las Tormentas (Stormlight Archive)
  // ═══════════════════════════════════════════
  {
    id: "the_way_of_kings",
    title: "El Camino de los Reyes",
    saga: "stormlight",
    order: 1,
    year: 2010,
    description:
      "En un mundo de tormentas, el médico de batalla Kaladin es esclavizado, mientras la princesa Jasnah investiga los secretos de los Caballeros Radiantes.",
  },
  {
    id: "words_of_radiance",
    title: "Palabras Radiantes",
    saga: "stormlight",
    order: 2,
    year: 2014,
    description:
      "Kaladin y Shallan se convierten en Radiantes mientras la amenaza de los Portadores del Vacío crece en Roshar.",
  },
  {
    id: "oathbringer",
    title: "Juramentada",
    saga: "stormlight",
    order: 3,
    year: 2017,
    description:
      "Dalinar Kholin debe enfrentar su oscuro pasado mientras la Tormenta Eterna asola Roshar y los ejércitos se preparan para la guerra final.",
  },
  {
    id: "rhythm_of_war",
    title: "El Ritmo de la Guerra",
    saga: "stormlight",
    order: 4,
    year: 2020,
    description:
      "La guerra continúa. Los científicos descubren nuevos peligros, y los prisioneros Radiantes luchan por sobrevivir en las profundidades.",
  },
  {
    id: "wind_and_truth",
    title: "Viento y Verdad",
    saga: "stormlight",
    order: 5,
    year: 2024,
    description:
      "La conclusión del primer arco del Archivo de las Tormentas. Los héroes de Roshar se enfrentan a la batalla definitiva.",
  },

  // ═══════════════════════════════════════════
  // Arena Blanca (White Sand)
  // ═══════════════════════════════════════════
  {
    id: "white_sand_vol_1",
    title: "Arena Blanca Vol. 1",
    saga: "white-sand",
    order: 1,
    year: 2016,
    description:
      "Kenton, un joven maestro de la arena, lucha por sobrevivir en el despiadado desierto de Taldain.",
  },
  {
    id: "white_sand_vol_2",
    title: "Arena Blanca Vol. 2",
    saga: "white-sand",
    order: 2,
    year: 2018,
    description:
      "Kenton continúa su viaje mientras las facciones políticas de Taldain compiten por el control.",
  },
  {
    id: "white_sand_vol_3",
    title: "Arena Blanca Vol. 3",
    saga: "white-sand",
    order: 3,
    year: 2019,
    description:
      "La conclusión de la historia gráfica de Taldain.",
  },

  // ═══════════════════════════════════════════
  // Arcanum Ilimitado
  // ═══════════════════════════════════════════
  {
    id: "arcanum_unbounded",
    title: "Arcanum Ilimitado",
    saga: "arcanum-unbounded",
    order: 1,
    year: 2016,
    description:
      "Colección de relatos del Cosmere: El Sistema de Sel, Esperanza de Elantris, El Alma del Emperador, El Onceno Metal, Alomancia Jak, Sombras por Silencio, y Danzante del Filo.",
  },

  // ═══════════════════════════════════════════
  // Proyectos Secretos
  // ═══════════════════════════════════════════
  {
    id: "tress_of_the_emerald_sea",
    title: "Tress del Mar Esmeralda",
    saga: "secret-projects",
    order: 1,
    year: 2023,
    description:
      "Tress vive en una isla remota. Cuando su amor es secuestrado, se embarca en un viaje a través de mares de escamas, brujas y dragones.",
  },
  {
    id: "yumi_and_the_nightmare_painter",
    title: "Yumi y el Pintor de Pesadillas",
    saga: "secret-projects",
    order: 2,
    year: 2023,
    description:
      "Una joven que invoca espíritus y un pintor que lucha contra pesadillas intercambian lugares misteriosamente.",
  },
  {
    id: "the_sunlit_man",
    title: "El Hombre Iluminado",
    saga: "secret-projects",
    order: 3,
    year: 2023,
    description:
      "Un hombre que huye a través de un sistema estelar, perseguido por enemigos implacables, en un mundo que se acerca al sol.",
  },
]

/**
 * Busca un libro por su ID.
 * Útil para el sistema anti-spoilers cuando necesitamos mirar metadatos de libros desde personajes.
 */
export function getBookById(id: string): Book | undefined {
  return BOOKS.find((book) => book.id === id)
}

/**
 * Devuelve todos los libros de una saga, ordenados por su orden dentro de ella.
 */
export function getBooksBySaga(sagaId: string): Book[] {
  return BOOKS.filter((book) => book.saga === sagaId).sort(
    (a, b) => a.order - b.order,
  )
}
