/**
 * The wall of the study, as one continuous surface.
 *
 * ## No tiles, no seam
 *
 * The previous wall painted two noise textures with `background-size` and a
 * separate base gradient. Where the tiles met, the gradient underneath changed
 * value and the seam became a vertical line down the room. This draws the whole
 * room as a **single SVG at wall size** — one mottle, one wash, one set of
 * boards — so there is nothing to repeat and therefore nothing to line up
 * badly. The only repeating layer is the codex grain, at 180px, which is fine
 * tooth rather than a patch and has no visible edge.
 *
 * Colour comes from the codex tokens: `--codex-desk` and friends for the room,
 * `--codex-page-block` for the chalk-dust, `--codex-foxing` for the damp. The
 * candle and the vignette are *not* here: they belong to the room, not to the
 * wall, so they are painted by `CodexObject` and stay put while the wall is
 * panned. See `DiagramCanvas`.
 */
import { WALL_H, WALL_W } from './wall-docs'

export function WallSurface() {
  return (
    <div
      data-diagram-bg
      aria-hidden
      className="absolute left-0 top-0 overflow-hidden"
      style={{
        width: WALL_W,
        height: WALL_H,
        background: 'var(--codex-desk)',
      }}
    >
      <svg
        width={WALL_W}
        height={WALL_H}
        viewBox={`0 0 ${WALL_W} ${WALL_H}`}
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, display: 'block' }}
        aria-hidden
      >
        <defs>
          <linearGradient id="diagram-plaster" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#32251a" />
            <stop offset="0.42" stopColor="#271c12" />
            <stop offset="0.78" stopColor="#1c130c" />
            <stop offset="1" stopColor="#140d08" />
          </linearGradient>

          {/* One mottle for the whole room. No repeat, so no seam. */}
          <filter id="diagram-mottle" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0045 0.0062" numOctaves="5" seed="17" />
            <feColorMatrix type="matrix" values="0.22 0 0 0 0.14  0.16 0 0 0 0.10  0 0.12 0 0 0.07  0 0 0 0.55 0" />
          </filter>

          <filter id="diagram-damp" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="26" />
          </filter>

          <linearGradient id="diagram-rail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a5834" />
            <stop offset="0.45" stopColor="#4a3120" />
            <stop offset="1" stopColor="#24160d" />
          </linearGradient>

          <linearGradient id="diagram-board" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2b1c11" />
            <stop offset="0.5" stopColor="#1a1009" />
            <stop offset="1" stopColor="#24160d" />
          </linearGradient>
        </defs>

        <rect width={WALL_W} height={WALL_H} fill="url(#diagram-plaster)" />
        <rect width={WALL_W} height={WALL_H} filter="url(#diagram-mottle)" opacity="0.85" />

        {/* Repaired patches: four soft blooms of lighter plaster. */}
        {PATCHES.map((p) => (
          <ellipse
            key={p.id}
            cx={p.x}
            cy={p.y}
            rx={p.rx}
            ry={p.ry}
            fill="#8a6a44"
            opacity={p.opacity}
            filter="url(#diagram-damp)"
          />
        ))}

        {/* Damp: where the plaster has drawn water out of the air. */}
        {STAINS.map((s) => (
          <g key={s.id} opacity={s.opacity}>
            <ellipse cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill="#241608" filter="url(#diagram-damp)" />
            <ellipse
              cx={s.x}
              cy={s.y}
              rx={s.rx * 0.82}
              ry={s.ry * 0.82}
              fill="none"
              stroke="#6b4a28"
              strokeWidth={2}
              opacity="0.25"
              filter="url(#diagram-damp)"
            />
          </g>
        ))}

        {/* The wainscot: boards, rail, and a shadow where the rail meets the plaster. */}
        <rect x="0" y={WAINSCOT_Y - 16} width={WALL_W} height="16" fill="#0b0704" opacity="0.45" />
        <rect x="0" y={WAINSCOT_Y} width={WALL_W} height="26" fill="url(#diagram-rail)" />
        <rect x="0" y={WAINSCOT_Y + 1} width={WALL_W} height="2" fill="#c39a60" opacity="0.18" />
        <rect x="0" y={WAINSCOT_Y + 26} width={WALL_W} height={WALL_H - WAINSCOT_Y - 26} fill="url(#diagram-board)" />
        {BOARD_SEAMS.map((x) => (
          <g key={x}>
            <line x1={x} y1={WAINSCOT_Y + 26} x2={x} y2={WALL_H} stroke="#080503" strokeWidth="3" opacity="0.55" />
            <line
              x1={x + 3}
              y1={WAINSCOT_Y + 26}
              x2={x + 3}
              y2={WALL_H}
              stroke="#a5794a"
              strokeWidth="1"
              opacity="0.12"
            />
          </g>
        ))}
        {/* Grain, drawn rather than tiled: thirty deterministic strokes. */}
        {BOARD_GRAIN.map((g, i) => (
          <path
            key={i}
            d={g.d}
            fill="none"
            stroke={g.light ? '#a5794a' : '#080503'}
            strokeWidth={g.w}
            opacity={g.light ? 0.1 : 0.28}
            strokeLinecap="round"
          />
        ))}

        {/* Cracks: hand-placed, each with its own character. */}
        {CRACKS.map((c) => (
          <g key={c.id}>
            <path d={c.d} fill="none" stroke="#080503" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path
              d={c.d}
              fill="none"
              stroke="#bd925e"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.1"
              transform="translate(1.4,1.4)"
            />
          </g>
        ))}

        {/* Where old papers were pinned and taken down. */}
        {NAIL_HOLES.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="3.4" fill="#070402" opacity="0.8" />
            <circle
              cx={n.x + 0.6}
              cy={n.y + 0.6}
              r="4.6"
              fill="none"
              stroke="#c39a60"
              strokeWidth="0.8"
              opacity="0.13"
            />
          </g>
        ))}

        {/* Chalk dust where a hand has rested. */}
        {DUST.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#e6d2ae" opacity={d.o} />
        ))}
      </svg>

      {/* Fine tooth. A repeat, but at hairline scale; it has no edge to see. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'var(--codex-grain)',
          backgroundSize: '180px 180px',
          opacity: 0.3,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  )
}

const WAINSCOT_Y = 1460

const BOARD_SEAMS = [0, 226, 468, 690, 924, 1150, 1382, 1618, 1846, 2074, 2304, 2538, 2762]

const BOARD_GRAIN = [
  { d: 'M 40 1520 C 90 1600 30 1700 90 1790', w: 1.4, light: true },
  { d: 'M 130 1488 C 120 1560 150 1640 128 1780', w: 1, light: false },
  { d: 'M 300 1500 C 340 1600 300 1690 350 1800', w: 1.6, light: false },
  { d: 'M 420 1490 C 400 1580 440 1660 410 1770', w: 1.1, light: true },
  { d: 'M 520 1540 C 560 1620 520 1710 570 1790', w: 1.2, light: false },
  { d: 'M 640 1495 C 620 1580 660 1680 630 1800', w: 1.5, light: false },
  { d: 'M 760 1520 C 800 1600 760 1700 805 1795', w: 1, light: true },
  { d: 'M 880 1488 C 860 1580 900 1660 870 1780', w: 1.3, light: false },
  { d: 'M 1000 1530 C 1040 1610 1000 1700 1045 1800', w: 1.1, light: false },
  { d: 'M 1100 1492 C 1080 1580 1120 1680 1090 1790', w: 1.6, light: true },
  { d: 'M 1220 1510 C 1260 1590 1220 1680 1265 1790', w: 1, light: false },
  { d: 'M 1340 1488 C 1320 1580 1360 1660 1330 1800', w: 1.4, light: false },
  { d: 'M 1470 1530 C 1510 1610 1470 1700 1515 1795', w: 1.2, light: true },
  { d: 'M 1590 1495 C 1570 1580 1610 1680 1580 1790', w: 1.3, light: false },
  { d: 'M 1710 1520 C 1750 1600 1710 1690 1755 1800', w: 1, light: false },
  { d: 'M 1840 1490 C 1820 1580 1860 1660 1830 1790', w: 1.5, light: true },
  { d: 'M 1960 1530 C 2000 1610 1960 1700 2005 1795', w: 1.1, light: false },
  { d: 'M 2080 1495 C 2060 1580 2100 1680 2070 1800', w: 1.4, light: false },
  { d: 'M 2210 1520 C 2250 1600 2210 1690 2255 1800', w: 1, light: false },
  { d: 'M 2340 1488 C 2320 1580 2360 1660 2330 1790', w: 1.6, light: true },
  { d: 'M 2460 1530 C 2500 1610 2460 1700 2505 1795', w: 1.2, light: false },
  { d: 'M 2590 1495 C 2570 1580 2610 1680 2580 1800', w: 1.3, light: false },
  { d: 'M 2710 1520 C 2750 1600 2710 1690 2755 1800', w: 1, light: true },
]

const PATCHES = [
  { id: 'p1', x: 520, y: 350, rx: 300, ry: 220, opacity: 0.08 },
  { id: 'p2', x: 1760, y: 300, rx: 360, ry: 240, opacity: 0.06 },
  { id: 'p3', x: 980, y: 1250, rx: 420, ry: 260, opacity: 0.05 },
  { id: 'p4', x: 2380, y: 820, rx: 260, ry: 300, opacity: 0.07 },
]

const STAINS = [
  { id: 's1', x: 250, y: 560, rx: 170, ry: 130, opacity: 0.55 },
  { id: 's2', x: 2480, y: 420, rx: 150, ry: 210, opacity: 0.42 },
  { id: 's3', x: 640, y: 1400, rx: 210, ry: 110, opacity: 0.4 },
  { id: 's4', x: 2050, y: 1420, rx: 260, ry: 120, opacity: 0.36 },
  { id: 's5', x: 1210, y: 120, rx: 190, ry: 90, opacity: 0.3 },
]

const CRACKS = [
  { id: 'c1', d: 'M 2600 60 C 2632 140 2610 196 2650 262 C 2680 316 2662 360 2698 430' },
  { id: 'c2', d: 'M 120 980 C 160 1006 178 970 218 996 C 250 1018 246 1060 286 1082' },
  { id: 'c3', d: 'M 1940 620 C 1972 590 2008 614 2040 586 C 2070 560 2100 580 2132 552' },
  { id: 'c4', d: 'M 2380 1260 C 2410 1290 2396 1330 2430 1356 C 2460 1380 2448 1410 2482 1430' },
  { id: 'c5', d: 'M 820 70 C 850 110 838 150 872 186 C 902 218 888 250 920 276' },
  { id: 'c6', d: 'M 1520 1420 C 1552 1444 1540 1476 1574 1498' },
]

const NAIL_HOLES = [
  { id: 'n1', x: 520, y: 640 },
  { id: 'n2', x: 1680, y: 190 },
  { id: 'n3', x: 2090, y: 620 },
  { id: 'n4', x: 1030, y: 720 },
  { id: 'n5', x: 380, y: 860 },
  { id: 'n6', x: 860, y: 830 },
  { id: 'n7', x: 1980, y: 1080 },
  { id: 'n8', x: 2240, y: 1420 },
  { id: 'n9', x: 1460, y: 1400 },
  { id: 'n10', x: 1120, y: 620 },
]

const DUST = [
  { x: 420, y: 470, r: 1.6, o: 0.16 },
  { x: 700, y: 560, r: 1.2, o: 0.12 },
  { x: 980, y: 430, r: 1.8, o: 0.14 },
  { x: 1230, y: 610, r: 1.3, o: 0.1 },
  { x: 1600, y: 470, r: 1.7, o: 0.15 },
  { x: 1880, y: 620, r: 1.2, o: 0.12 },
  { x: 2180, y: 860, r: 1.9, o: 0.14 },
  { x: 650, y: 1240, r: 1.4, o: 0.1 },
  { x: 1550, y: 1320, r: 1.6, o: 0.13 },
  { x: 2020, y: 1180, r: 1.2, o: 0.1 },
  { x: 2460, y: 1180, r: 1.7, o: 0.12 },
  { x: 320, y: 620, r: 1.3, o: 0.12 },
]
