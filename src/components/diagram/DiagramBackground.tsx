import { useMemo } from 'react'

export function DiagramBackground() {
  const stonePattern = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160">
      <defs>
        <filter id="sg">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.06" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="matrix" values="0.12 0 0 0 0.08  0 0.12 0 0 0.06  0 0 0.12 0 0.04  0 0 0 0.18 0"/>
        </filter>
        <filter id="sr">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer>
        </filter>
      </defs>
      <rect width="240" height="160" fill="#140e0a"/>
      <g opacity="0.85">
        <rect x="1.5" y="1.5" width="108" height="52" rx="1" fill="#281e14" stroke="#0e0a06" stroke-width="0.5"/>
        <rect x="112.5" y="1.5" width="125" height="52" rx="1" fill="#2c2216" stroke="#0e0a06" stroke-width="0.5"/>
        <rect x="1.5" y="56.5" width="76" height="52" rx="1" fill="#2e2418" stroke="#0e0a06" stroke-width="0.5"/>
        <rect x="80.5" y="56.5" width="78" height="52" rx="1" fill="#261c12" stroke="#0e0a06" stroke-width="0.5"/>
        <rect x="161.5" y="56.5" width="76" height="52" rx="1" fill="#2a2016" stroke="#0e0a06" stroke-width="0.5"/>
        <rect x="1.5" y="111.5" width="92" height="46" rx="1" fill="#2c2218" stroke="#0e0a06" stroke-width="0.5"/>
        <rect x="96.5" y="111.5" width="68" height="46" rx="1" fill="#281e14" stroke="#0e0a06" stroke-width="0.5"/>
        <rect x="167.5" y="111.5" width="70" height="46" rx="1" fill="#2e2416" stroke="#0e0a06" stroke-width="0.5"/>
      </g>
      <rect width="240" height="160" filter="url(#sg)" opacity="0.55"/>
      <rect width="240" height="160" filter="url(#sr)" opacity="0.45"/>
    </svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }, [])

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        width: 5000,
        height: 5000,
        background: `
          radial-gradient(ellipse at 50% 50%, rgba(30,22,16,0.25) 0%, rgba(8,6,4,0.6) 60%, rgba(8,6,4,0.9) 100%),
          linear-gradient(180deg, rgba(12,8,6,0.3) 0%, transparent 40%, transparent 60%, rgba(12,8,6,0.4) 100%)
        `,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${stonePattern}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '240px 160px',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(90deg, transparent 0px, transparent 240px, rgba(60,40,30,0.03) 240px, rgba(60,40,30,0.03) 241px),
            repeating-linear-gradient(0deg, transparent 0px, transparent 160px, rgba(60,40,30,0.02) 160px, rgba(60,40,30,0.02) 161px)
          `,
          mixBlendMode: 'overlay',
        }}
      />

      <div
        className="absolute"
        style={{
          left: 80,
          top: 80,
          right: 80,
          bottom: 80,
          border: '1.5px solid rgba(80,60,40,0.08)',
          borderRadius: 6,
          pointerEvents: 'none',
        }}
      />

      <div
        className="absolute"
        style={{
          left: 100,
          top: 100,
          right: 100,
          bottom: 100,
          border: '2px solid rgba(80,60,40,0.04)',
          borderRadius: 3,
          pointerEvents: 'none',
        }}
      />

      {[260, 680, 1280, 1900, 2500, 3100, 3700, 4300].map((x, i) => (
        <div
          key={`cv${i}`}
          style={{
            position: 'absolute',
            left: x,
            top: 80,
            width: 1,
            height: 'calc(100% - 160px)',
            background: 'rgba(60,40,30,0.03)',
            pointerEvents: 'none',
          }}
        />
      ))}
      {[260, 680, 1280, 1900, 2500, 3100, 3700, 4300].map((y, i) => (
        <div
          key={`ch${i}`}
          style={{
            position: 'absolute',
            left: 80,
            top: y,
            height: 1,
            width: 'calc(100% - 160px)',
            background: 'rgba(60,40,30,0.02)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {[
        { x: 400, y: 400, r: 180 },
        { x: 4600, y: 400, r: 140 },
        { x: 400, y: 4600, r: 160 },
        { x: 4600, y: 4600, r: 120 },
        { x: 2500, y: 400, r: 200 },
        { x: 2500, y: 4600, r: 180 },
      ].map((m, i) => (
        <div
          key={`motif${i}`}
          style={{
            position: 'absolute',
            left: m.x - m.r,
            top: m.y - m.r,
            width: m.r * 2,
            height: m.r * 2,
            borderRadius: '50%',
            border: '1px solid rgba(80,60,40,0.04)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  )
}
