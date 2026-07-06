import { memo, useRef, useEffect, useState } from 'react'
import { getPlanetVisual } from '@/data/static/planet-visuals'
import type { StormCloudLayer, HighstormConfig } from '@/types/planet-visuals'

function seeded(i: number, s: number): number {
  return Math.abs((Math.sin(i * 12.9898 + s * 78.233) * 43758.5453) % 1)
}

interface LayerProps {
  pid: string
  cx: number
  cy: number
  r: number
}

interface StormPuff {
  angle: number
  radius: number
  ew: number
  eh: number
  opacity: number
  color: string
}

interface Bolt {
  id: number
  points: string
  opacity: number
}

function gaussValue(i: number, count: number): number {
  const center = (count - 1) / 2
  const sigma = count * 0.22
  const x = i - center
  return Math.exp(-(x * x) / (2 * sigma * sigma))
}

function generatePuffs(r: number, config: HighstormConfig): StormPuff[] {
  const seed = 42
  const puffs: StormPuff[] = []
  const arcRad = (config.arcSpan * Math.PI) / 180

  config.layers.forEach((layer: StormCloudLayer, li: number) => {
    for (let i = 0; i < layer.count; i++) {
      const gauss = gaussValue(i, layer.count)
      const t = i / (layer.count - 1 || 1) - 0.5
      const angle = t * arcRad + (seeded(i + li * 50, seed) - 0.5) * 0.08
      const radial = r * config.orbitalRadius + (seeded(i + li * 50 + 10, seed) - 0.5) * r * layer.radialSpread * 2
      const ew = r * (layer.minSize + gauss * (layer.maxSize - layer.minSize))
      const eh = ew * layer.heightScale * (0.7 + seeded(i + li * 50 + 20, seed) * 0.6)
      const opacity = layer.opacity * (0.3 + gauss * 0.7) * (0.8 + seeded(i + li * 50 + 30, seed) * 0.2)
      const color = layer.color
      puffs.push({ angle, radius: radial, ew, eh, opacity, color })
    }
  })

  return puffs
}

function renderPuffs(puffs: StormPuff[], cx: number, cy: number, filterId: string) {
  const squash = 0.5
  return puffs.map((p, i) => {
    const x = cx + p.radius * Math.cos(p.angle)
    const y = cy + p.radius * Math.sin(p.angle) * squash
    return (
      <ellipse
        key={i}
        cx={x}
        cy={y}
        rx={p.ew}
        ry={p.eh}
        fill={p.color}
        opacity={p.opacity}
        filter={`url(#${filterId})`}
      />
    )
  })
}

const HighstormDefs = memo(function HighstormDefs({ pid }: { pid: string }) {
  const v = getPlanetVisual(pid)
  const hs = v.thematic?.highstorm
  if (!hs) return null

  const turbId = `hs-turb-${pid}`
  const turbSoftId = `hs-turb-soft-${pid}`
  const backMaskId = `hs-back-mask-${pid}`
  const frontMaskId = `hs-front-mask-${pid}`
  const glowGradId = `hs-glow-${pid}`

  return (
    <defs>
      <filter id={turbId} x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={hs.turbulenceFrequency}
          numOctaves={hs.turbulenceOctaves}
          seed={1}
          result="noise"
        >
          <animate
            attributeName="seed"
            values="1;25;50;75;100;125;150;175;200;225;250;1"
            dur="20s"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale={hs.displacementScale}
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        >
          <animate
            attributeName="scale"
            values={`${hs.displacementScale};${hs.displacementScale * 1.25};${hs.displacementScale * 0.85};${hs.displacementScale}`}
            dur="10s"
            repeatCount="indefinite"
          />
        </feDisplacementMap>
        <feGaussianBlur in="displaced" stdDeviation="1.5" result="blurred" />
        <feComposite in="blurred" in2="SourceGraphic" operator="in" />
      </filter>

      <filter id={turbSoftId} x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={hs.turbulenceFrequency * 0.6}
          numOctaves={2}
          seed={50}
          result="noise"
        >
          <animate attributeName="seed" values="50;75;100;125;150;50" dur="25s" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale={hs.displacementScale * 0.5}
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        <feGaussianBlur in="displaced" stdDeviation="3" />
      </filter>

      <radialGradient id={backMaskId} cx="50%" cy="50%" r="50%">
        <stop offset="62%" stopColor="black" stopOpacity="1" />
        <stop offset="78%" stopColor="black" stopOpacity="0.55" />
        <stop offset="90%" stopColor="white" stopOpacity="0.6" />
        <stop offset="100%" stopColor="white" stopOpacity="1" />
      </radialGradient>

      <radialGradient id={frontMaskId} cx="50%" cy="50%" r="50%">
        <stop offset="55%" stopColor="white" stopOpacity="1" />
        <stop offset="75%" stopColor="white" stopOpacity="0.85" />
        <stop offset="88%" stopColor="black" stopOpacity="0.45" />
        <stop offset="100%" stopColor="black" stopOpacity="1" />
      </radialGradient>

      <linearGradient id={glowGradId} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={hs.frontGlowColor} stopOpacity="0" />
        <stop offset="30%" stopColor={hs.frontGlowColor} stopOpacity={hs.frontGlowOpacity} />
        <stop offset="55%" stopColor={hs.frontGlowColor} stopOpacity={hs.frontGlowOpacity * 1.4} />
        <stop offset="80%" stopColor={hs.frontGlowColor} stopOpacity={hs.frontGlowOpacity} />
        <stop offset="100%" stopColor={hs.frontGlowColor} stopOpacity="0" />
      </linearGradient>
    </defs>
  )
})

const HighstormBack = memo(function HighstormBack({ pid, cx, cy, r }: LayerProps) {
  const v = getPlanetVisual(pid)
  const hs = v.thematic?.highstorm
  if (!hs) return null

  const puffs = generatePuffs(r, hs)
  const backMaskId = `hs-back-mask-${pid}`
  const turbId = `hs-turb-${pid}`
  const turbSoftId = `hs-turb-soft-${pid}`

  return (
    <g mask={`url(#${backMaskId})`}>
      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `hs-orbit ${hs.orbitalPeriod}s linear infinite`,
        }}
      >
        {renderPuffs(puffs, cx, cy, turbId)}

        <g opacity={0.5}>{renderPuffs(puffs, cx, cy, turbSoftId)}</g>
      </g>
    </g>
  )
})

function LightningLayer({ pid, cx, cy, r }: LayerProps) {
  const v = getPlanetVisual(pid)
  const hs = v.thematic?.highstorm
  const [bolts, setBolts] = useState<Bolt[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const hsc = v.thematic?.highstorm
    if (!hsc) return

    const schedule = () => {
      const delay = hsc.lightningMinInterval + Math.random() * (hsc.lightningMaxInterval - hsc.lightningMinInterval)
      timerRef.current = setTimeout(() => {
        const segs = 2 + Math.floor(Math.random() * 4)
        const startX = (Math.random() - 0.5) * r * 1.6
        const startY = (Math.random() - 0.5) * r * 0.5
        let pts = `${startX.toFixed(1)},${startY.toFixed(1)}`
        for (let i = 0; i < segs; i++) {
          const nx = startX + (Math.random() - 0.5) * r * 0.6
          const ny = startY + ((i + 1) / segs) * r * 0.4 * (Math.random() > 0.5 ? 1 : -1)
          pts += ` ${nx.toFixed(1)},${ny.toFixed(1)}`
        }

        const bolt: Bolt = {
          id: Date.now() + Math.random(),
          points: pts,
          opacity: 0.3 + Math.random() * 0.7,
        }
        setBolts((prev) => [...prev.slice(-2), bolt])
        setTimeout(() => {
          setBolts((prev) => prev.filter((b) => b.id !== bolt.id))
        }, 350)
        schedule()
      }, delay * 1000)
    }
    schedule()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [v.thematic?.highstorm, r])

  if (bolts.length === 0) return null

  return (
    <g
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        animation: `hs-orbit ${hs!.orbitalPeriod}s linear infinite`,
      }}
    >
      {bolts.map((bolt) => (
        <polyline
          key={bolt.id}
          points={bolt.points}
          fill="none"
          stroke="#ffffff"
          strokeWidth={0.5}
          opacity={0}
          className="hs-lightning"
          style={{ '--bolt-opacity': bolt.opacity } as React.CSSProperties}
        />
      ))}
    </g>
  )
}

const StormlightParticles = memo(function StormlightParticles({ pid, cx, cy, r }: LayerProps) {
  const v = getPlanetVisual(pid)
  const hs = v.thematic?.highstorm
  if (!hs) return null

  const seed = pid.charCodeAt(0) + pid.charCodeAt(pid.length - 1)
  const arcRad = (hs.arcSpan * Math.PI) / 180
  const orbitR = r * hs.orbitalRadius

  const particles = Array.from({ length: hs.stormlightCount }, (_, i) => {
    const t = i / (hs.stormlightCount - 1 || 1) - 0.5
    const angle = t * arcRad
    const px = orbitR * Math.cos(angle) + (seeded(i * 3, seed) - 0.5) * r * 0.15
    const py = orbitR * Math.sin(angle) * 0.5 + (seeded(i * 3 + 1, seed) - 0.5) * r * 0.08
    const pr = seeded(i * 3 + 2, seed) * 0.8 + 0.3
    const delay = seeded(i * 5, seed) * hs.orbitalPeriod * 0.3
    return { px, py, pr, delay }
  })

  return (
    <g
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        animation: `hs-orbit ${hs.orbitalPeriod}s linear infinite`,
      }}
    >
      {particles.map((p, i) => (
        <circle
          key={i}
          cx={p.px}
          cy={p.py}
          r={p.pr}
          fill={hs.stormlightColor}
          opacity={0}
          className="hs-stormlight"
          style={{ '--sl-delay': `${p.delay}s` } as React.CSSProperties}
        />
      ))}
    </g>
  )
})

const HighstormFront = memo(function HighstormFront({ pid, cx, cy, r }: LayerProps) {
  const v = getPlanetVisual(pid)
  const hs = v.thematic?.highstorm
  if (!hs) return null

  const puffs = generatePuffs(r, hs)
  const frontMaskId = `hs-front-mask-${pid}`
  const glowGradId = `hs-glow-${pid}`
  const turbId = `hs-turb-${pid}`
  const turbSoftId = `hs-turb-soft-${pid}`

  return (
    <g mask={`url(#${frontMaskId})`}>
      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `hs-orbit ${hs.orbitalPeriod}s linear infinite`,
        }}
      >
        <g opacity={0.8}>{renderPuffs(puffs, cx, cy, turbId)}</g>

        <g opacity={0.35}>{renderPuffs(puffs, cx, cy, turbSoftId)}</g>

        <circle cx={cx} cy={cy} r={r} fill={`url(#${glowGradId})`} className="hs-glow" />

        <LightningLayer pid={pid} cx={cx} cy={cy} r={r} />
      </g>

      <StormlightParticles pid={pid} cx={cx} cy={cy} r={r} />
    </g>
  )
})

export { HighstormDefs, HighstormBack, HighstormFront }
