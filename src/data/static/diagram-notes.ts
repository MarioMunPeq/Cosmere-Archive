/**
 * The sheets on the wall.
 *
 * ## Titles
 *
 * The titles are the real section names of the Diagram as recorded on the
 * Coppermind, not invented labels. A reader who has read the books will
 * recognise them; a reader who has not will read them as the names Taravangian
 * gave to the parts of his own work, which is what they are.
 *
 * ## Why the ids stay
 *
 * The ids are keys the prose and the wall are written against. They do not
 * change when a title is improved, because a URL should not change when a
 * title is improved. The id is the record; the title is what the wall says.
 *
 * ## Two kinds of paper
 *
 * Taravangian's notes (the speculations, the diagrams) and the tallies nailed
 * over them (how many books, how many words, how many people). Both are
 * legible, both are diegetic, and the numbers live inside the frame instead of
 * in a card with a trend arrow.
 */
export interface DiagramLink {
  to: string
  label: string
}

export interface DiagramNote {
  id: string
  title: string
  caption: string
  numeral: string
  links: DiagramLink[]
  tally: boolean
}

export const DIAGRAM_NOTES: DiagramNote[] = [
  {
    id: 'catalogue',
    title: 'Catechism of the Back of the Flowered Painting',
    caption: 'Q: For what essential must we strive? A: The essential of preservation.',
    numeral: 'I',
    tally: false,
    links: [
      { to: '/library', label: 'the library of Jasnah' },
      { to: '/characters', label: 'the register of persons' },
    ],
  },
  {
    id: 'chronology',
    title: 'Tenets of Instruction',
    caption: 'You must become king. Of Everything.',
    numeral: 'II',
    tally: false,
    links: [{ to: '/chronology', label: 'the chronology' }],
  },
  {
    id: 'worlds',
    title: 'Floorboard 17',
    caption: 'Ah, but they were left behind. It is obvious from the nature of the bond.',
    numeral: 'III',
    tally: false,
    links: [{ to: '/characters', label: 'the register of persons' }],
  },
  {
    id: 'shards',
    title: 'West Wall Psalm of Wonders',
    caption: 'But who is the wanderer, the wild piece, the one who makes no sense?',
    numeral: 'IV',
    tally: false,
    links: [{ to: '/magic', label: 'the Ars Arcanum' }],
  },
  {
    id: 'heralds',
    title: 'Writings upon the Bedstand Lamp',
    caption: 'Chaos in Alethkar is, of course, inevitable.',
    numeral: 'V',
    tally: false,
    links: [{ to: '/aharietiam', label: 'Aharietiam' }],
  },
  {
    id: 'connections',
    title: 'Book of the 2nd Desk Drawer',
    caption: 'The Unmade are a deviation, a flair, a conundrum.',
    numeral: 'VI',
    tally: false,
    links: [{ to: '/characters?tab=connections', label: 'who is known to whom' }],
  },
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
