// Sagas: metadatos de cada saga del Cosmere.
// El campo "order" define el orden de lectura recomendado.

export interface Saga {
  /** Identificador único, ej. "mistborn-era-1" */
  id: string

  /** Nombre para mostrar */
  name: string

  /** Clase de color de Tailwind para el color de acento de la saga */
  color: string

  /** Posición en el orden de lectura sugerido (1 = leer primero) */
  order: number

  /** Descripción opcional */
  description?: string
}

export const SAGAS: Saga[] = [
  {
    id: "mistborn-era-1",
    name: "Mistborn Era 1",
    color: "red",
    order: 1,
    description: "La saga original de Mistborn: El Imperio Final, El Pozo de la Ascensión, El Héroe de las Eras.",
  },
  {
    id: "mistborn-era-2",
    name: "Mistborn Era 2",
    color: "amber",
    order: 5,
    description: "Wax & Wayne: una mezcla de western y steampunk en Scadrial.",
  },
  {
    id: "elantris",
    name: "Elantris",
    color: "teal",
    order: 2,
    description: "La primera novela publicada de Sanderson. Una ciudad maldita y un príncipe caído.",
  },
  {
    id: "warbreaker",
    name: "Warbreaker",
    color: "fuchsia",
    order: 3,
    description: "Dioses, alientos y espadas parlantes en el mundo de Nalthis.",
  },
  {
    id: "stormlight",
    name: "Archivo de las Tormentas",
    color: "cyan",
    order: 6,
    description: "La épica central del Cosmere. Caballeros Radiantes, tormentas y guerreros.",
  },
  {
    id: "white-sand",
    name: "Arena Blanca",
    color: "yellow",
    order: 4,
    description: "Novela gráfica ambientada en el planeta Taldain, lleno de desiertos.",
  },
  {
    id: "arcanum-unbounded",
    name: "Arcanum Ilimitado",
    color: "violet",
    order: 7,
    description: "Colección de relatos cortos del Cosmere, con información de cada sistema.",
  },
  {
    id: "secret-projects",
    name: "Proyectos Secretos",
    color: "sky",
    order: 8,
    description: "Las novelas secretas de Sanderson: Tress, Yumi, El Hombre Iluminado y más.",
  },
]
