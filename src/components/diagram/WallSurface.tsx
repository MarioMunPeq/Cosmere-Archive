/**
 * The wall — Taravangian's study.
 *
 * ## What this is now
 *
 * The first version was plaster with four cracks and a wainscot. It read as
 * a wall, but a clean one — the kind of wall a designer makes. This version
 * is the wall of a man who has been writing on it for years: patched plaster,
 * water stains, candle wax, nail holes from old papers, a darker band where
 * the light never reaches, and a strong vignette that pulls the eye to the
 * centre where the sheets hang.
 *
 * Everything is procedural. No image files.
 */
export function WallSurface() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden" style={{ width: 5000, height: 5000 }}>
      {/* The base: warm dark, not black. A room at night lit by candle. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(160deg, #2a1e14 0%, #1f160e 28%, #160f09 58%, #0d0906 82%, #080504 100%)',
        }}
      />

      {/* Coarse patching: the plaster has been repaired in places. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.55,
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(coarsePlaster())}")`,
          backgroundSize: '720px 720px',
        }}
      />

      {/* Fine tooth: the surface the plaster has. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(fineTooth())}")`,
          backgroundSize: '260px 260px',
        }}
      />

      {/* Age: a yellowing wash over the whole wall, stronger in the corners
          where the air is still. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(150% 130% at 50% 50%, rgba(180,130,70,0.0) 30%, rgba(120,80,40,0.12) 75%, rgba(80,50,24,0.22) 100%)',
        }}
      />

      {/* The candle, low and left: the warm pool everything is lit by. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(110% 85% at 6% 92%, rgba(232,172,96,0.26) 0%, rgba(196,132,64,0.14) 22%, rgba(140,88,40,0.06) 42%, rgba(0,0,0,0) 68%)',
        }}
      />
      {/* A second source, upper right: a window or a lamp across the room. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(70% 60% at 92% 8%, rgba(140,160,190,0.09) 0%, rgba(0,0,0,0) 58%)',
        }}
      />
      {/* A third, very faint, from below: the desk lamp or a brazier. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(90% 70% at 50% 108%, rgba(200,140,70,0.07) 0%, rgba(0,0,0,0) 55%)',
        }}
      />

      {/* Candle wax drips near the light. */}
      <div
        style={{
          position: 'absolute',
          left: 260,
          top: 1580,
          width: 110,
          height: 60,
          borderRadius: '0 0 50px 50px',
          background: 'linear-gradient(180deg, rgba(232,206,158,0.18), rgba(232,206,158,0))',
          filter: 'blur(3px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 310,
          top: 1560,
          width: 18,
          height: 40,
          borderRadius: '0 0 9px 9px',
          background: 'linear-gradient(180deg, rgba(232,206,158,0.22), rgba(232,206,158,0))',
          filter: 'blur(2px)',
        }}
      />

      {/* Water stains: where the plaster has been damp. */}
      {WATER_STAINS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.w,
            height: s.h,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(60,40,20,0.35), rgba(60,40,20,0))',
            filter: 'blur(18px)',
          }}
        />
      ))}

      {/* Nail holes: where old papers were pinned and removed. */}
      {NAIL_HOLES.map((n, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: n.x,
            top: n.y,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(10,6,4,0.7) 0%, rgba(10,6,4,0.2) 60%, transparent 100%)',
            boxShadow: '0 0 0 1px rgba(190,150,105,0.08)',
          }}
        />
      ))}

      {/* The wainscot rail. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 2900,
          height: 24,
          background:
            'linear-gradient(180deg, rgba(90,60,32,0.9) 0%, rgba(58,38,20,0.95) 50%, rgba(30,18,10,0.98) 100%)',
          boxShadow:
            '0 12px 30px rgba(0,0,0,0.55), inset 0 1px 0 rgba(190,150,100,0.16), inset 0 -1px 0 rgba(0,0,0,0.4)',
        }}
      />
      {/* Panelling below the rail. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 2924,
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

      {/* Cracks: hand-placed, each with its own character. */}
      {CRACKS.map((c, i) => (
        <svg
          key={i}
          className="absolute"
          style={{ left: c.x, top: c.y, width: c.len, height: 300 }}
          viewBox={`0 0 ${c.len} 300`}
          fill="none"
        >
          <path d={c.d} stroke="rgba(10,6,4,0.55)" strokeWidth={1.6} strokeLinecap="round" />
          <path
            d={c.d}
            stroke="rgba(190,150,105,0.08)"
            strokeWidth={1.2}
            strokeLinecap="round"
            transform="translate(0,1.4)"
          />
        </svg>
      ))}

      {/* Dust motes on the surface. */}
      {DUST.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: d.x,
            top: d.y,
            width: d.s,
            height: d.s,
            borderRadius: '50%',
            background: 'rgba(190,150,105,0.18)',
            filter: 'blur(0.5px)',
          }}
        />
      ))}

      {/* The vignette: a room has edges that fall away. Strong. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(130% 110% at 42% 48%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.45) 72%, rgba(0,0,0,0.78) 100%)',
        }}
      />
      {/* Top darkening: the ceiling above. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 18%)',
        }}
      />
    </div>
  )
}

function coarsePlaster(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720">
  <defs>
    <filter id="patch">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.010" numOctaves="6" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0.18 0 0 0 0.11  0.14 0 0 0 0.09  0 0.11 0 0 0.07  0 0 0 0.6 0"/>
    </filter>
  </defs>
  <rect width="720" height="720" fill="transparent"/>
  <rect width="720" height="720" filter="url(#patch)"/>
</svg>`
}

function fineTooth(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260">
  <defs>
    <filter id="tooth">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.12"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="260" height="260" fill="transparent"/>
  <rect width="260" height="260" filter="url(#tooth)" opacity="0.7"/>
</svg>`
}

const CRACKS = [
  { x: 3120, y: 260, len: 420, d: 'M6 0 C40 60 22 96 58 148 C88 190 70 232 104 296' },
  { x: 820, y: 620, len: 240, d: 'M0 40 C50 52 62 18 112 30 C150 40 148 84 196 96 M150 42 L176 8' },
  { x: 2260, y: 900, len: 330, d: 'M10 300 C46 250 30 196 78 150 C118 112 100 70 148 20 C176 -8 168 24 204 34' },
  { x: 4180, y: 760, len: 190, d: 'M0 120 C40 108 62 140 108 118 C140 104 158 132 186 150' },
  { x: 1700, y: 1800, len: 280, d: 'M0 0 C30 40 15 80 55 120 C90 160 70 200 110 240 C140 270 120 290 160 300' },
  { x: 3800, y: 2100, len: 160, d: 'M0 80 C25 60 50 90 80 70 C110 50 130 85 160 65' },
]

const WATER_STAINS = [
  { x: 540, y: 380, w: 320, h: 240 },
  { x: 3900, y: 1200, w: 400, h: 300 },
  { x: 1200, y: 2600, w: 260, h: 200 },
  { x: 2800, y: 3400, w: 340, h: 260 },
]

const NAIL_HOLES = [
  { x: 420, y: 380 },
  { x: 1680, y: 420 },
  { x: 2760, y: 520 },
  { x: 3520, y: 460 },
  { x: 620, y: 1480 },
  { x: 1280, y: 1380 },
  { x: 2100, y: 1560 },
  { x: 3100, y: 1480 },
  { x: 560, y: 2040 },
  { x: 1580, y: 2320 },
  { x: 2420, y: 2060 },
  { x: 3200, y: 2240 },
]

const DUST = [
  { x: 600, y: 800, s: 2 },
  { x: 1400, y: 600, s: 1.5 },
  { x: 2200, y: 700, s: 2 },
  { x: 3000, y: 500, s: 1.5 },
  { x: 3800, y: 900, s: 2 },
  { x: 900, y: 1600, s: 1.5 },
  { x: 1800, y: 1800, s: 2 },
  { x: 2600, y: 1700, s: 1.5 },
  { x: 3400, y: 1900, s: 2 },
  { x: 1200, y: 2400, s: 1.5 },
  { x: 2000, y: 2600, s: 2 },
  { x: 2800, y: 2500, s: 1.5 },
  { x: 3600, y: 2700, s: 2 },
  { x: 700, y: 3200, s: 1.5 },
  { x: 1600, y: 3100, s: 2 },
  { x: 2400, y: 3000, s: 1.5 },
  { x: 3200, y: 3300, s: 2 },
  { x: 4000, y: 3000, s: 1.5 },
]
