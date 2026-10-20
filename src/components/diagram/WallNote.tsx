/**
 * Small notes pinned to the wall — the apuntes.
 *
 * The text is drawn from the Diagram as recorded on the Coppermind:
 * epigraphs, predictions, and deviations. These are Taravangian's own words.
 */

export interface WallNoteData {
  id: string
  x: number
  y: number
  rot: number
  text: string
}

export function WallNote({ id, x, y, rot, text }: WallNoteData) {
  const seed = hash(id)
  const pinX = 14 + (seed % 9)
  return (
    <div
      data-diagram-note={id}
      className="absolute"
      style={{
        left: x,
        top: y,
        width: 150,
        transform: `rotate(${rot}deg)`,
        filter: 'drop-shadow(4px 6px 7px rgba(0,0,0,0.45))',
      }}
    >
      <div
        className="relative overflow-hidden px-3 py-2.5"
        style={{
          background: 'linear-gradient(152deg, #f6eed8 0%, #ece2c8 45%, #e2d6b4 100%)',
          clipPath: deckle(seed),
          fontFamily: 'var(--font-display)',
          fontSize: 12,
          lineHeight: 1.45,
          color: '#241a12',
          minHeight: 58,
        }}
      >
        {text}
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            left: pinX,
            top: -4,
            width: 9,
            height: 9,
            background: 'radial-gradient(circle at 34% 30%, #e8cf94 0%, #a8823c 52%, #4a3413 100%)',
            boxShadow: '0 2px 3px rgba(0,0,0,0.55), inset 0 -1px 1px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
  )
}

const NOTES: WallNoteData[] = [
  {
    id: 'n-ceiling',
    x: 300,
    y: 420,
    rot: -7,
    text: 'Obviously they are fools. The Desolation needs no usher. It can and will sit where it wishes.',
  },
  {
    id: 'n-desk',
    x: 1650,
    y: 380,
    rot: 4,
    text: 'Hold the secret that broke the Knights Radiant. You may need it to destroy the new orders when they return.',
  },
  {
    id: 'n-catechism',
    x: 2580,
    y: 460,
    rot: -3,
    text: 'Mankind must survive. Our burden is that of the species, and all other considerations are but dust.',
  },
  {
    id: 'n-coda',
    x: 3350,
    y: 900,
    rot: 6,
    text: 'They will come. You cannot stop their oaths. Look for those who survive when they should not.',
  },
  {
    id: 'n-floor27',
    x: 620,
    y: 1500,
    rot: 5,
    text: 'One danger in deploying such a potent weapon: the potential encouragement of those exploring the Nahel bond.',
  },
  {
    id: 'n-northwall',
    x: 1320,
    y: 1420,
    rot: -4,
    text: '1173090605 1173090801 1173090901 1173091001 — the last ten highstorms before the Everstorm.',
  },
  {
    id: 'n-westwall',
    x: 2100,
    y: 1600,
    rot: 3,
    text: 'But who is the wanderer, the wild piece, the one who makes no sense?',
  },
  {
    id: 'n-bedstand',
    x: 2920,
    y: 1520,
    rot: -6,
    text: 'The Blackthorn could become an ally or our greatest foe. If he seems likely to sue for peace, assassinate him.',
  },
  { id: 'n-tenets', x: 3700, y: 1680, rot: 4, text: 'You must become king. Of Everything.' },
  {
    id: 'n-predictions',
    x: 460,
    y: 2650,
    rot: -5,
    text: 'The fall of Dalinar to become the enemy\u2019s champion. This has turned out to be false.',
  },
  {
    id: 'n-deviation',
    x: 1200,
    y: 2850,
    rot: 2,
    text: 'Seven factions fighting in Jah Keved, rather than the six predicted. A deviation.',
  },
  {
    id: 'n-unmade',
    x: 2050,
    y: 2500,
    rot: -3,
    text: 'The Unmade are a deviation, a flair, a conundrum. One is almost certainly a traitor to the others.',
  },
  {
    id: 'n-words',
    x: 2780,
    y: 2720,
    rot: 5,
    text: '4,4 M words. The count does not change. My understanding of it does.',
  },
  {
    id: 'n-dead',
    x: 3520,
    y: 2600,
    rot: -4,
    text: 'All of them dead. This is an archive of the dead, and I am the one who keeps it.',
  },
  {
    id: 'n-moelach',
    x: 900,
    y: 2050,
    rot: 7,
    text: 'Moelach. His touch seeps into a soul as it breaks apart from the body.',
  },
  {
    id: 'n-honorblades',
    x: 2420,
    y: 2100,
    rot: -2,
    text: 'The Honorblades give their wielders powers. Can we craft a weapon?',
  },
  {
    id: 'n-shin',
    x: 3180,
    y: 2000,
    rot: 3,
    text: 'They are with the Shin. We must find one. Can we make to use a Truthless?',
  },
  {
    id: 'n-wanderer',
    x: 1500,
    y: 2350,
    rot: -5,
    text: 'The wanderer, the wild piece, the one who makes no sense. Impossible. Is it?',
  },
]

export const WALL_NOTES: WallNoteData[] = NOTES

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}

function deckle(seed: number): string {
  const j = (n: number) => (((seed >> n) % 7) - 3) / 2
  const top = `0% ${j(0).toFixed(2)}%, 30% ${(j(1) * 0.5).toFixed(2)}%, 65% ${j(2).toFixed(2)}%, 100% ${(j(3) * 0.6).toFixed(2)}%`
  const right = `100% ${(j(4) * 0.6).toFixed(2)}%, ${(100 + j(5) * 0.5).toFixed(2)}% 35%, ${(100 + j(6) * 0.4).toFixed(2)}% 70%, 100% ${(100 + j(7) * 0.4).toFixed(2)}%`
  const bottom = `100% ${(100 - j(8) * 0.5).toFixed(2)}%, 68% ${(100 - j(9)).toFixed(2)}%, 32% ${(100 - j(10) * 0.4).toFixed(2)}%, 0% ${(100 - j(11) * 0.6).toFixed(2)}%`
  const left = `0% ${(100 - j(12) * 0.6).toFixed(2)}%, ${j(13).toFixed(2)}% 65%, ${(j(14) * 0.5).toFixed(2)}% 32%, 0% ${(100 - j(15) * 0.5).toFixed(2)}%`
  return `polygon(${top}, ${right}, ${bottom}, ${left})`
}
