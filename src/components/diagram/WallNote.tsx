/**
 * Small notes pinned to the wall — the apuntes.
 *
 * ## What these are
 *
 * The nine sheets are the argument. These are the thoughts that occurred while
 * making it: shorter, less certain, written on whatever paper was to hand. They
 * are not an index of anything. They are the wall being a wall rather than a
 * gallery of finished pages.
 *
 * ## Why a separate component
 *
 * A note is not a sheet. A sheet has ruled lines, a margin, a tack at top
 * centre, and a title. A note is a scrap: torn on three sides, pinned with a
 * single tack, no margin, handwriting that runs to the edge. Making them the
 * same component with a size flag would have made the notes look like small
 * sheets, which is the one thing they must not look like.
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
    id: 'n-sel',
    x: 300,
    y: 420,
    rot: -7,
    text: 'Sel: el poder se volvió geografía. ¿Por qué allí y no en otro sitio?',
  },
  { id: 'n-kel', x: 1650, y: 380, rot: 4, text: 'Kelsier mintió. Lo sé. No sé sobre qué.' },
  { id: 'n-hoid', x: 2580, y: 460, rot: -3, text: 'Hoid estuvo en los tres. Siempre está en los tres.' },
  { id: 'n-taln', x: 3350, y: 900, rot: 6, text: 'Taln sostuvo. 4500 años. No entiendo qué sostuvo.' },
  { id: 'n-shards', x: 620, y: 1500, rot: 5, text: 'Las Esquirlas no saben que son fragmentos. Eso es lo peligroso.' },
  {
    id: 'n-time',
    x: 1320,
    y: 1420,
    rot: -4,
    text: 'El tiempo aquí no es lineal. Es una espiral que se muerde la cola.',
  },
  { id: 'n-elantris', x: 2100, y: 1600, rot: 3, text: 'Elantris fue antes de todo. O después. No lo sé.' },
  { id: 'n-roshar', x: 2920, y: 1520, rot: -6, text: 'Roshar: las tormentas recuerdan. ¿Qué recuerdan?' },
  { id: 'n-odium', x: 3700, y: 1680, rot: 4, text: 'Odium no destruye. Redirige. Eso es peor.' },
  { id: 'n-vin', x: 460, y: 2650, rot: -5, text: 'Vin confió en el Lord Ruler. Eso fue su error, y su acierto.' },
  { id: 'n-sazed', x: 1200, y: 2850, rot: 2, text: 'Sazed tiene los dieciséis. Los dieciséis no se ponen de acuerdo.' },
  { id: 'n-heralds', x: 2050, y: 2500, rot: -3, text: 'Los Heralds se conocen. Los Radiantes no. Eso significa algo.' },
  {
    id: 'n-words',
    x: 2780,
    y: 2720,
    rot: 5,
    text: '4,4 M palabras. La cuenta no cambia. La entiendo un poco más cada vez.',
  },
  { id: 'n-dead', x: 3520, y: 2600, rot: -4, text: 'Todos muertos. Archivo de muertos. Yo lo mantengo.' },
  { id: 'n-unknown', x: 900, y: 2050, rot: 7, text: 'Hay nombres que no sé de dónde vienen. Los dejo donde están.' },
  { id: 'n-gap', x: 2420, y: 2100, rot: -2, text: 'Lo que falta es lo que más me interesa. No sé todavía qué es.' },
  { id: 'n-start', x: 3180, y: 2000, rot: 3, text: 'No sé por dónde empezar. Empiezo por aquí.' },
  {
    id: 'n-end',
    x: 1500,
    y: 2350,
    rot: -5,
    text: 'Cada vez que cuento, entiendo un poco menos. Eso también es contar.',
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
