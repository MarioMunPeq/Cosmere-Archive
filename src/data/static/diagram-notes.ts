/**
 * The nine sheets on the wall.
 *
 * ## Why these titles are not the ids
 *
 * The wall used to be labelled `catalogue`, `volumes`, `wordcount`,
 * `population`. Those are database column names. A reader standing in front of
 * a wall of someone's notes does not read a column name, and D-DIEG asks a
 * question of every label: *would this say the same thing on a wall in any
 * archive anywhere?* `wordcount` would. **"De las palabras contadas"** would
 * not.
 *
 * The ids stay, because they are the keys the 37 KB of prose in
 * `DiagramWritings.tsx` is written against and because a URL should not change
 * when a title is improved. The id is the record; the title is what the wall
 * says.
 *
 * ## Why the links point where they point
 *
 * D.5 asks for every sheet to reach at least one record in the archive. The
 * first draft of this tried to make `wordcount` link to a *character*, which
 * would have satisfied the criterion and ruined the wall. A tally sheet is not
 * a person.
 *
 * The better answer turned out to be that **a real wall has two kinds of
 * paper**. There are Taravangian's notes — the speculations, the diagrams, the
 * margins full of corrections — and there are the tallies nailed over them:
 * how many books, how many words, how many people. Both are legible, both are
 * diegetic, and the numbers live inside the frame instead of in a card with a
 * trend arrow. D.5 is satisfied by the notes; the tallies are why people kept
 * the wall.
 *
 * ## Rotations
 *
 * -6° to +6°, down from -18° to +22°. A wall pinned by someone in a hurry is
 * crooked; a wall pinned by someone who cared is straight enough to read. The
 * exaggeration was readable as *scenery* rather than as *a note someone wrote*.
 */

/** Where a sheet sends you, and what to call the destination in-world. */
export interface DiagramLink {
  to: string
  /** Diegetic label: "the archive of persons", not "View records". */
  label: string
}

export interface DiagramNote {
  /** The key `DiagramWritings.tsx` writes against. Never shown. */
  id: string
  /** As Taravangian would have written it on the sheet. */
  title: string
  /** One line under the title, in his hand. */
  caption: string
  /** Roman numeral in the reading panel's index. */
  numeral: string
  links: DiagramLink[]
  /** `true` for a tally sheet nailed over a note, rather than a note. */
  tally: boolean
}

export const DIAGRAM_NOTES: DiagramNote[] = [
  {
    id: 'catalogue',
    title: 'De lo que hay en este archivo',
    caption: 'Everything gathered, and the gaps left where something was missing.',
    numeral: 'I',
    tally: false,
    links: [
      { to: '/library', label: 'the library of Jasnah' },
      { to: '/characters', label: 'the register of persons' },
    ],
  },
  {
    id: 'chronology',
    title: 'El orden de las cosas, que no es el nuestro',
    caption: 'The order as it happened, not as it is remembered.',
    numeral: 'II',
    tally: false,
    links: [{ to: '/chronology', label: 'the chronology' }],
  },
  {
    id: 'worlds',
    title: 'Los mundos, y lo que hay dentro de cada uno',
    caption: 'Eleven places. Each with its own Shard, its own madness, its own weather.',
    numeral: 'III',
    tally: false,
    links: [{ to: '/characters', label: 'the register of persons' }],
  },
  {
    id: 'shards',
    title: 'De las Esquirlas, y de lo que proyectan',
    caption: 'Power, divided until it became a personality.',
    numeral: 'IV',
    tally: false,
    links: [{ to: '/magic', label: 'the Ars Arcanum' }],
  },
  {
    id: 'heralds',
    title: 'De los Heralds, y de los que ya no están',
    caption: 'Ten of them. The blades are on the wall where I left them.',
    numeral: 'V',
    tally: false,
    links: [{ to: '/aharietiam', label: 'Aharietiam' }],
  },
  {
    id: 'connections',
    title: 'Quién se conoce, y quién se guarda',
    caption: 'Most of it written down. Most.',
    numeral: 'VI',
    tally: false,
    links: [{ to: '/characters?tab=connections', label: 'who is known to whom' }],
  },
  // ---- the tallies ----
  {
    id: 'volumes',
    title: 'Los tomos',
    caption: 'Books, bound and shelved.',
    numeral: 'VII',
    tally: true,
    links: [{ to: '/library', label: 'the library of Jasnah' }],
  },
  {
    id: 'wordcount',
    title: 'De las palabras contadas',
    caption: 'Every word, tallied, which I know does not help and did anyway.',
    numeral: 'VIII',
    tally: true,
    links: [{ to: '/library', label: 'the library of Jasnah' }],
  },
  {
    id: 'population',
    title: 'Cuántos viven, y dónde',
    caption: 'Ninety-three named. There are more. There are always more.',
    numeral: 'IX',
    tally: true,
    links: [{ to: '/characters', label: 'the register of persons' }],
  },
]

export const NOTE_BY_ID = new Map(DIAGRAM_NOTES.map((n) => [n.id, n]))

/** A sheet whose id has no note record still has to render something. */
export function noteFor(id: string): DiagramNote {
  return (
    NOTE_BY_ID.get(id) ?? {
      id,
      title: id,
      caption: '',
      numeral: '?',
      tally: false,
      links: [],
    }
  )
}
