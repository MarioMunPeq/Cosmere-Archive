/**
 * The wall — Taravangian's study.
 *
 * ## What this replaces
 *
 * A tiled brick pattern on a repeating 240x160 grid. It looked like brickwork
 * because brickwork is a *grid*, and a grid behind nine sheets reads as a
 * spreadsheet with a texture filter over it. It was the single biggest reason
 * the wall looked like a diagram tool rather than a room.
 *
 * ## What a wall in a study actually looks like
 *
 * Plaster, not brick. Patched, unevenly lit, and — this is the part that matters
 * — **lit from one side**. A single warm source low and to the left throws the
 * sheets' shadows to the right, and shadows are the only thing that tells the
 * eye these papers are *off* the wall rather than painted on it.
 *
 * Everything here is procedural: gradients, two noise fields and an SVG
 * turbulence. No image files, so it costs nothing to load and nothing to keep.
 *
 * ## The palette
 *
 * Not black. A dark room at night lit by a candle is a **warm brown-black**,
 * and the difference matters: against pure black, cream paper floats and looks
 * pasted on. Against warm dark, it sits in the same light.
 */

export function WallSurface() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden" style={{ width: 5000, height: 5000 }}>
      {/* The base: warm dark, not black. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(160deg, #241a12 0%, #1b130d 38%, #140e09 72%, #0d0906 100%)',
        }}
      />

      {/* Plaster: two noise fields. The coarse one is the patching, the fine one
          is the tooth of the surface. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.5,
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(plasterSvg())}")`,
          backgroundSize: '520px 520px',
        }}
      />

      {/* Where the candlelight is. A pool low and left, falling off fast. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(120% 90% at 8% 88%, rgba(226,168,96,0.20) 0%, rgba(196,132,64,0.10) 26%, rgba(0,0,0,0) 62%)',
        }}
      />
      {/* A second, much weaker source from upper right: a window, or a lamp
          across the room. One source reads as a photograph; two read as a room. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(80% 70% at 88% 12%, rgba(140,160,190,0.07) 0%, rgba(0,0,0,0) 55%)',
        }}
      />

      {/* A wainscot rail across the wall: the horizontal that tells you the
          room has a floor and that you are looking at it head-on. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 2900,
          height: 22,
          background:
            'linear-gradient(180deg, rgba(74,48,28,0.85) 0%, rgba(46,29,16,0.9) 55%, rgba(20,12,7,0.95) 100%)',
          boxShadow: '0 10px 26px rgba(0,0,0,0.5), inset 0 1px 0 rgba(190,150,100,0.14)',
        }}
      />
      {/* And the panelling below it, in shadow — but *wood* in shadow, not a
          hole. Pure black under the rail reads as the wall stopping, and the
          eye stops with it. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 2922,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(58,38,21,0.97) 0%, rgba(38,24,13,0.98) 40%, rgba(24,15,8,1) 100%)',
        }}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${i * 1000 + 120}px`,
            top: 2960,
            width: 760,
            height: 2400,
            border: '1px solid rgba(150,110,64,0.14)',
            borderRadius: 3,
            boxShadow: 'inset 0 0 90px rgba(0,0,0,0.45), inset 0 1px 0 rgba(180,132,74,0.10)',
          }}
        />
      ))}

      {/* Plaster cracks. Four, irregular, seeded off position — not a pattern. */}
      {CRACKS.map((c, i) => (
        <svg
          key={i}
          className="absolute"
          style={{ left: c.x, top: c.y, width: c.len, height: 300 }}
          viewBox={`0 0 ${c.len} 300`}
          fill="none"
        >
          <path d={c.d} stroke="rgba(10,6,4,0.5)" strokeWidth={1.6} strokeLinecap="round" />
          <path
            d={c.d}
            stroke="rgba(190,150,105,0.07)"
            strokeWidth={1.2}
            strokeLinecap="round"
            transform="translate(0,1.4)"
          />
        </svg>
      ))}

      {/* Candle-wax drips near the light, and the damp stain in the corner. */}
      <div
        style={{
          position: 'absolute',
          left: 240,
          top: 3240,
          width: 120,
          height: 46,
          borderRadius: '0 0 60px 60px',
          background: 'linear-gradient(180deg, rgba(232,206,158,0.16), rgba(232,206,158,0))',
          filter: 'blur(3px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 180,
          top: 220,
          width: 620,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(48,30,16,0.5), rgba(0,0,0,0))',
          filter: 'blur(24px)',
        }}
      />

      {/* Finally: the vignette. A room has edges that fall away. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(140% 120% at 42% 52%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.42) 78%, rgba(0,0,0,0.72) 100%)',
        }}
      />
    </div>
  )
}

/** Coarse patching plus fine tooth. Tiled, but the tile is large enough not to read. */
function plasterSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520">
  <defs>
    <filter id="patch">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.013" numOctaves="5" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0.16 0 0 0 0.10  0.13 0 0 0 0.08  0 0.10 0 0 0.06  0 0 0 0.55 0"/>
    </filter>
    <filter id="tooth">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.10"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="520" height="520" fill="transparent"/>
  <rect width="520" height="520" filter="url(#patch)"/>
  <rect width="520" height="520" filter="url(#tooth)" opacity="0.55"/>
</svg>`
}

/**
 * Four cracks, written out rather than generated.
 *
 * Procedural cracks from a hash look like the same crack tiled, which is worse
 * than none. Four hand-placed paths with different characters — one long
 * hairline, one short and branching, one that fades, one near a corner — read
 * as a wall that has been in a room for years.
 */
const CRACKS = [
  {
    x: 3120,
    y: 260,
    len: 420,
    d: 'M6 0 C40 60 22 96 58 148 C88 190 70 232 104 296',
  },
  {
    x: 820,
    y: 620,
    len: 240,
    d: 'M0 40 C50 52 62 18 112 30 C150 40 148 84 196 96 M150 42 L176 8',
  },
  {
    x: 2260,
    y: 900,
    len: 330,
    d: 'M10 300 C46 250 30 196 78 150 C118 112 100 70 148 20 C176 -8 168 24 204 34',
  },
  {
    x: 4180,
    y: 760,
    len: 190,
    d: 'M0 120 C40 108 62 140 108 118 C140 104 158 132 186 150',
  },
]
