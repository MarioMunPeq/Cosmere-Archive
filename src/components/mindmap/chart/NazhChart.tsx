import { useRef, useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PLANETS, SHARD_COLORS, FALLBACK_COLOR, ALL_CHARACTERS, BOOKS } from '@/data/static'
import type { Planet } from '@/types/planet'
import type { Character } from '@/types'
import type { Book } from '@/data/static/books'
import CodexObject from '@/components/codex/CodexObject'
import { PlanetSigil } from '@/components/records/RecordSpread'
import Monogram from '@/components/common/Monogram'
import { getCharacterPortrait } from '@/utils/character-portrait'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'

interface ChartPlanet {
  planet: Planet
  x: number
  y: number
  w: number
  h: number
}

interface Cam {
  x: number
  y: number
  z: number
  tx: number
  ty: number
  tz: number
  dragging: boolean
  lx: number
  ly: number
  moved: number
}

const WORLDHOPPER_LEGEND = ['hoid', 'vasher', 'khriss', 'nazh', 'kelsier']

const CHART_W = 2600
const CHART_H = 1800
const SHEET_PAD = 80

const WORLD_POS: Record<string, { x: number; y: number }> = {
  ashyn: { x: 520, y: 520 },
  braize: { x: 620, y: 720 },
  canticle: { x: 820, y: 620 },
  komashi: { x: 980, y: 820 },
  lumar: { x: 1120, y: 680 },
  nalthis: { x: 1380, y: 620 },
  roshar: { x: 1620, y: 820 },
  scadrial: { x: 1880, y: 720 },
  sel: { x: 2080, y: 620 },
  threnody: { x: 1520, y: 480 },
  yolen: { x: 400, y: 380 },
}

function rectsOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }, pad = 12) {
  const ax1 = a.x - a.w / 2 - pad
  const ay1 = a.y - a.h / 2 - pad
  const ax2 = a.x + a.w / 2 + pad
  const ay2 = a.y + a.h / 2 + pad
  const bx1 = b.x - b.w / 2 - pad
  const by1 = b.y - b.h / 2 - pad
  const bx2 = b.x + b.w / 2 + pad
  const by2 = b.y + b.h / 2 + pad
  return !(ax2 < bx1 || bx2 < ax1 || ay2 < by1 || by2 < ay1)
}

function resolvePlanets(items: ChartPlanet[]) {
  for (let iter = 0; iter < 80; iter++) {
    let moved = false
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i]
        const b = items[j]
        if (!a || !b) continue
        if (!rectsOverlap(a, b, 16)) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const ox = (a.w / 2 + b.w / 2 + 18 - Math.abs(dx)) * 0.5
        const oy = (a.h / 2 + b.h / 2 + 18 - Math.abs(dy)) * 0.5
        if (ox <= 0 || oy <= 0) continue
        a.x -= (dx / len) * ox
        a.y -= (dy / len) * oy
        b.x += (dx / len) * ox
        b.y += (dy / len) * oy
        moved = true
      }
    }
    if (!moved) break
  }
}

function CompassRose({ cx, cy }: { cx: number; cy: number }) {
  const points = 16
  return (
    <g>
      <circle cx={cx} cy={cy} r={46} fill="none" stroke="#241811" strokeWidth="1" opacity="0.5" />
      <circle cx={cx} cy={cy} r={38} fill="none" stroke="#241811" strokeWidth="0.8" opacity="0.4" />
      {Array.from({ length: points }).map((_, i) => {
        const ang = (i / points) * Math.PI * 2
        const long = i % 2 === 0
        const r1 = long ? 30 : 34
        const r2 = long ? 40 : 38
        const x1 = cx + Math.cos(ang) * r1
        const y1 = cy + Math.sin(ang) * r1
        const x2 = cx + Math.cos(ang) * r2
        const y2 = cy + Math.sin(ang) * r2
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#241811" strokeWidth={long ? 1.2 : 0.9} opacity="0.6" />
      })}
      <path d={`M ${cx} ${cy - 44} L ${cx - 4} ${cy - 34} L ${cx} ${cy - 38} L ${cx + 4} ${cy - 34} Z`} fill="none" stroke="#241811" strokeWidth="1" opacity="0.7" />
    </g>
  )
}

export default function NazhChart() {
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)
  const navRef = useRef(useNavigate())
  const camRef = useRef<Cam>({ x: CHART_W / 2, y: CHART_H / 2, z: 1.0, tx: CHART_W / 2, ty: CHART_H / 2, tz: 1.0, dragging: false, lx: 0, ly: 0, moved: 0 })
  const itemsRef = useRef<ChartPlanet[]>([])
  const [items, setItems] = useState<ChartPlanet[]>([])
  const [hover, setHover] = useState<string | null>(null)
  const [hint, setHint] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [activeRoute, setActiveRoute] = useState<string | null>(null)
  const [announce, setAnnounce] = useState('')
  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const list: ChartPlanet[] = PLANETS.map((p: Planet) => {
      const pos = WORLD_POS[p.id] || { x: 1300, y: 900 }
      return { planet: p, x: pos.x, y: pos.y, w: 170, h: 170 }
    })
    resolvePlanets(list)
    itemsRef.current = list
    setItems(list)
    setTimeout(() => setHint(false), 4000)
  }, [])

  useEffect(() => {
    let raf = 0
    const loop = () => {
      if (gRef.current) {
        const c = camRef.current
        if (reduced) {
          c.x = c.tx
          c.y = c.ty
          c.z = c.tz
        } else {
          c.x += (c.tx - c.x) * 0.16
          c.y += (c.ty - c.y) * 0.16
          c.z += (c.tz - c.z) * 0.16
        }
        gRef.current.setAttribute('transform', `translate(${c.x},${c.y}) scale(${c.z})`)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const fitAll = useCallback(() => {
    const c = camRef.current
    c.tx = CHART_W / 2
    c.ty = CHART_H / 2
    c.tz = 1.0
    setSelected(null)
    setDrawer(false)
    setActiveRoute(null)
  }, [])

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = sx
    pt.y = sy
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const inv = ctm.inverse()
    const p = pt.matrixTransform(inv)
    const c = camRef.current
    return { x: (p.x - c.x) / c.z, y: (p.y - c.y) / c.z }
  }, [])

  const onDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current!
    svg.setPointerCapture(e.pointerId)
    const c = camRef.current
    c.dragging = true
    c.lx = e.clientX
    c.ly = e.clientY
    c.moved = 0
  }, [])

  const onMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const c = camRef.current
    if (c.dragging) {
      const dx = e.clientX - c.lx
      const dy = e.clientY - c.ly
      c.moved += Math.abs(dx) + Math.abs(dy)
      c.tx += dx / c.z
      c.ty += dy / c.z
      c.lx = e.clientX
      c.ly = e.clientY
      return
    }
    const w = screenToWorld(e.clientX, e.clientY)
    let best: ChartPlanet | null = null
    let bestd = 1e9
    for (let i = 0; i < itemsRef.current.length; i++) {
      const it = itemsRef.current[i]
      if (!it) continue
      const dx = it.x - w.x
      const dy = it.y - w.y
      const d = dx * dx + dy * dy
      if (d < (it.w * 0.55) ** 2 + (it.h * 0.55) ** 2 && d < bestd) {
        bestd = d
        best = it
      }
    }
    setHover(best ? best.planet.id : null)
  }, [screenToWorld])

  const selectWorld = useCallback((id: string) => {
    const it = itemsRef.current.find((x) => x.planet.id === id)
    if (!it) return
    const c = camRef.current
    c.tx = it.x
    c.ty = it.y
    c.tz = Math.max(c.tz, 1.3)
    setSelected(id)
    setDrawer(true)
    setActiveRoute(null)
    setAnnounce(`Selected ${it.planet.name}`)
  }, [])

  const onUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const c = camRef.current
    if (!c.dragging) return
    c.dragging = false
    if (c.moved > 18) return
    const w = screenToWorld(e.clientX, e.clientY)
    let best: ChartPlanet | null = null
    let bestd = 1e9
    for (let i = 0; i < itemsRef.current.length; i++) {
      const it = itemsRef.current[i]
      if (!it) continue
      const dx = it.x - w.x
      const dy = it.y - w.y
      const d = dx * dx + dy * dy
      if (d < (it.w * 0.6) ** 2 + (it.h * 0.6) ** 2 && d < bestd) {
        bestd = d
        best = it
      }
    }
    if (best) selectWorld(best.planet.id)
  }, [screenToWorld, selectWorld])

  const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const c = camRef.current
    const f = Math.pow(1.0018, -e.deltaY)
    c.tz = Math.max(0.7, Math.min(2.4, c.tz * f))
  }, [])

  const onKeyDown = useCallback((e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'Escape') {
      if (drawer) {
        setDrawer(false)
        return
      }
      if (selected) {
        setSelected(null)
        fitAll()
        return
      }
      fitAll()
      return
    }
    if (e.key === 'Enter') {
      if (hover) {
        selectWorld(hover)
      } else if (selected) {
        setDrawer(true)
      }
      return
    }
    if (e.key === '=' || e.key === '+') {
      camRef.current.tz = Math.min(2.5, camRef.current.tz * 1.1)
      return
    }
    if (e.key === '-') {
      camRef.current.tz = Math.max(0.7, camRef.current.tz / 1.1)
      return
    }
    if (e.key === '0') {
      fitAll()
      return
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const list = itemsRef.current.filter(Boolean)
      if (list.length === 0) return
      const idx = list.findIndex((it) => it.planet.id === (hover || selected))
      const next = list[(idx + 1 + list.length) % list.length]
      if (!next) return
      setHover(next.planet.id)
      setAnnounce(next.planet.name)
      return
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const list = itemsRef.current.filter(Boolean)
      if (list.length === 0) return
      const idx = list.findIndex((it) => it.planet.id === (hover || selected))
      const prev = list[(idx - 1 + list.length) % list.length]
      if (!prev) return
      setHover(prev.planet.id)
      setAnnounce(prev.planet.name)
      return
    }
  }, [hover, selected, drawer, selectWorld, fitAll])

  const shardMap = new Map<string, string[]>()
  items.forEach((it) => {
    if (!it.planet.shard) return
    const parts = String(it.planet.shard).split(/, | & /)
    const names = parts.map((x) => x.replace(/\s*\(.*?\)\s*/g, '').trim()).filter(Boolean)
    shardMap.set(it.planet.id, names)
  })

  const selectedPlanet = items.find((it) => it.planet.id === selected)?.planet
  const souls = ALL_CHARACTERS.filter((c: Character) => c.planet === selected)
  const volumes: Book[] = []
  if (selectedPlanet && selectedPlanet.books) {
    selectedPlanet.books.forEach((bid) => {
      const b = BOOKS.find((x: Book) => x.id === bid)
      if (b) volumes.push(b)
    })
  }

  const route = activeRoute ? WORLDHOPPER_MOVEMENTS.find((w) => w.id === activeRoute) : null
  const routePlanets = route ? new Set(route.planets) : new Set<string>()
  const routeTrack = route && route.movements ? route.movements : []

  const sortedItems = [...items].sort((a, b) => a.y - b.y)

  return (
    <CodexObject>
      <div className="relative h-full w-full overflow-hidden" style={{ background: '#170f07' }}>
        <svg
          ref={svgRef}
          className="block h-full w-full touch-none"
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="xMidYMid meet"
          tabIndex={0}
          role="application"
          aria-label="Nazh's Chart of the Cosmere"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => {
            camRef.current.dragging = false
          }}
          onWheel={onWheel}
          onKeyDown={onKeyDown}
        >
          <defs>
            <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#241811" strokeWidth="1" opacity="0.18" />
            </pattern>
            <filter id="fox">
              <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="2" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="table" tableValues="0 0.12" />
              </feComponentTransfer>
            </filter>
          </defs>
          <g ref={gRef}>
            <rect x={0} y={0} width={CHART_W} height={CHART_H} fill="#efe5d1" />
            <rect x={0} y={0} width={CHART_W} height={CHART_H} filter="url(#fox)" opacity="0.4" />
            <rect x={SHEET_PAD} y={SHEET_PAD} width={CHART_W - SHEET_PAD * 2} height={CHART_H - SHEET_PAD * 2} fill="none" stroke="#8c7a5c" strokeWidth="2" opacity="0.6" />
            <g stroke="#241811" opacity="0.12">
              {[...Array(24)].map((_, i) => (
                <line key={i} x1={SHEET_PAD + 40} y1={SHEET_PAD + 20 + i * 60} x2={CHART_W - SHEET_PAD - 40} y2={SHEET_PAD + 20 + i * 60} strokeWidth="0.8" />
              ))}
              {[...Array(36)].map((_, i) => (
                <line key={'v' + i} x1={SHEET_PAD + 40 + i * 60} y1={SHEET_PAD + 20} x2={SHEET_PAD + 40 + i * 60} y2={CHART_H - SHEET_PAD - 20} strokeWidth="0.8" />
              ))}
            </g>
            <g stroke="#241811" opacity="0.18">
              {[...Array(12)].map((_, i) => (
                <line key={'t' + i} x1={SHEET_PAD + i * 100} y1={SHEET_PAD} x2={SHEET_PAD + i * 100} y2={SHEET_PAD + 24} strokeWidth="1" />
              ))}
              {[...Array(12)].map((_, i) => (
                <line key={'b' + i} x1={SHEET_PAD + i * 100} y1={CHART_H - SHEET_PAD - 24} x2={SHEET_PAD + i * 100} y2={CHART_H - SHEET_PAD} strokeWidth="1" />
              ))}
              {[...Array(16)].map((_, i) => (
                <line key={'l' + i} x1={SHEET_PAD} y1={SHEET_PAD + i * 80} x2={SHEET_PAD + 24} y2={SHEET_PAD + i * 80} strokeWidth="1" />
              ))}
              {[...Array(16)].map((_, i) => (
                <line key={'r' + i} x1={CHART_W - SHEET_PAD - 24} y1={SHEET_PAD + i * 80} x2={CHART_W - SHEET_PAD} y2={SHEET_PAD + i * 80} strokeWidth="1" />
              ))}
            </g>
            <text x={CHART_W / 2} y={SHEET_PAD - 10} textAnchor="middle" fontFamily="'EB Garamond Variable', Georgia, serif" fontSize="22" letterSpacing="0.28em" style={{ textTransform: 'uppercase' }} fill="#241a12">
              Nazh's Chart of the Cosmere
            </text>
            <CompassRose cx={SHEET_PAD + 120} cy={CHART_H - SHEET_PAD - 120} />
            <CompassRose cx={CHART_W - SHEET_PAD - 120} cy={SHEET_PAD + 120} />
            <g stroke="#241811" opacity="0.14">
              {[...Array(36)].map((_, i) => {
                const ang = (i / 36) * Math.PI * 2
                const x1 = CHART_W / 2 + Math.cos(ang) * 200
                const y1 = CHART_H / 2 + Math.sin(ang) * 140
                const x2 = CHART_W / 2 + Math.cos(ang) * 900
                const y2 = CHART_H / 2 + Math.sin(ang) * 620
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.8" strokeDasharray="6 10" />
              })}
            </g>
            <line x1={SHEET_PAD + 60} y1={CHART_H / 2} x2={SHEET_PAD + 200} y2={CHART_H / 2} stroke="#241811" strokeWidth="1" opacity="0.5" />
            <text x={SHEET_PAD + 130} y={CHART_H / 2 - 8} textAnchor="middle" fontFamily="'EB Garamond Variable', Georgia, serif" fontSize="11" fill="#4a382a">
              1000 leagues
            </text>
            <g stroke="#241811" opacity="0.6" strokeDasharray="3 5">
              {items.map((a, i) =>
                items.map((b, j) => {
                  if (j <= i) return null
                  const sa = shardMap.get(a.planet.id) || []
                  const sb = shardMap.get(b.planet.id) || []
                  const shared = sa.filter((x) => sb.includes(x))
                  if (shared.length === 0) return null
                  const mx = (a.x + b.x) / 2
                  const my = (a.y + b.y) / 2 - 30
                  const dimLink = route ? !(routePlanets.has(a.planet.id) && routePlanets.has(b.planet.id)) : false
                  if (dimLink && route) return null
                  return <path key={i + '-' + j} d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`} fill="none" strokeWidth={route ? 1.6 : 1.2} opacity={dimLink ? 0.1 : route ? 0.9 : 0.5} />
                }),
              )}
            </g>
            {route && routeTrack.map((mv, idx) => {
              if (idx === 0) return null
              const prev = routeTrack[idx - 1]
              if (!prev) return null
              const a = items.find((it) => it.planet.id === prev.planet)
              const b = items.find((it) => it.planet.id === mv.planet)
              if (!a || !b) return null
              const mx = (a.x + b.x) / 2
              const my = (a.y + b.y) / 2 - 60
              return (
                <g key={'rt-' + idx}>
                  <path d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`} fill="none" stroke={route.color || '#8c2b1f'} strokeWidth="1.8" strokeDasharray="6 6" opacity="0.9" />
                  <text x={mx} y={my - 6} textAnchor="middle" fontFamily="'Caveat Variable', cursive" fontSize="11" fill="#4a382a">
                    {mv.year < 0 ? `${Math.abs(mv.year)}bca` : mv.year}
                  </text>
                </g>
              )
            })}
            {sortedItems.map((it) => {
              const isYolen = it.planet.id === 'yolen'
              const isH = hover === it.planet.id
              const isS = selected === it.planet.id
              const dimWorld = route ? !routePlanets.has(it.planet.id) : false
              return (
                <g key={it.planet.id} transform={`translate(${it.x},${it.y})`} style={{ cursor: 'pointer' }} opacity={dimWorld && route ? 0.25 : 1}>
                  {isS && <circle cx={0} cy={0} r={90} fill="none" stroke="#8c2b1f" strokeWidth="2.4" strokeDasharray="10 6" />}
                  {isH && !isS && <circle cx={0} cy={0} r={86} fill="none" stroke="#241811" strokeWidth="2" opacity="0.9" />}
                  <ellipse cx={0} cy={20} rx={62} ry={18} fill="#120c06" opacity="0.1" />
                  <circle cx={0} cy={0} r={72} fill="none" stroke="#241811" strokeWidth="1.6" opacity="0.8" />
                  <circle cx={0} cy={0} r={58} fill="none" stroke="#241811" strokeWidth="1" opacity="0.6" />
                  {[...Array(12)].map((_, i) => {
                    const ang = (i / 12) * Math.PI * 2
                    const x1 = Math.cos(ang) * 66
                    const y1 = Math.sin(ang) * 66
                    const x2 = Math.cos(ang) * 58
                    const y2 = Math.sin(ang) * 58
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#241811" strokeWidth="0.9" opacity="0.5" />
                  })}
                  <circle cx={0} cy={0} r={46} fill="url(#hatch)" opacity="0.18" />
                  <g opacity={isYolen ? 0.6 : 1}>
                    <PlanetSigil planet={it.planet} />
                  </g>
                  <g transform="translate(0, 82)">
                    <rect x={-78} y={-11} width={156} height={22} rx={2} fill="#f6efe2" stroke="#8c7a5c" strokeWidth="0.9" />
                    <text x={0} y={4} textAnchor="middle" fontFamily="'EB Garamond Variable', Georgia, serif" fontSize="16" letterSpacing="0.18em" style={{ textTransform: 'uppercase' }} fill="#241a12">
                      {it.planet.name.length > 16 ? it.planet.name.slice(0, 14) + '...' : it.planet.name}
                    </text>
                  </g>
                  {isYolen && (
                    <text x={0} y={-80} textAnchor="middle" fontFamily="'EB Garamond Variable', Georgia, serif" fontSize="12" fontStyle="italic" fill="#4a382a" opacity="0.8">
                      lost
                    </text>
                  )}
                  {(shardMap.get(it.planet.id) || []).map((s, idx) => {
                    const c = (SHARD_COLORS as any)[s] || FALLBACK_COLOR
                    const arr = shardMap.get(it.planet.id) || []
                    return (
                      <g key={s} transform={`translate(${(idx - (arr.length - 1) / 2) * 28}, 96)`}>
                        <polygon points="-6,-10 6,-10 8,0 6,10 -6,10 -8,0" fill="#f6efe2" stroke={c} strokeWidth="0.8" />
                        <text x={0} y={3} textAnchor="middle" fontFamily="'EB Garamond Variable', Georgia, serif" fontSize="8" fontStyle="italic" fill="#241a12">
                          {s.length > 10 ? s.slice(0, 8) + '...' : s}
                        </text>
                      </g>
                    )
                  })}
                </g>
              )
            })}
            <g fontFamily="'Caveat Variable', cursive" fill="#4a382a" opacity="0.85">
              <text x={SHEET_PAD + 200} y={SHEET_PAD + 200} fontSize="18">
                The shards do not lie where men first looked for them.
              </text>
              <text x={CHART_W - SHEET_PAD - 320} y={CHART_H / 2 + 40} fontSize="16">
                Measure twice. Chart once.
              </text>
              <text x={CHART_W / 2 - 160} y={CHART_H - SHEET_PAD - 200} fontSize="16">
                Some worlds answer to more than one name.
              </text>
            </g>
            <rect x={40} y={CHART_H - 80} width={180} height={1} fill="#241811" opacity="0.3" />
          </g>
        </svg>
        <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navRef.current('/')}
              className="px-3 py-1.5 text-[12px] tracking-[0.12em] uppercase"
              style={{
                fontFamily: "'EB Garamond Variable', Georgia, serif",
                background: '#f6efe2',
                color: '#241a12',
                border: '1px solid #8c7a5c',
                boxShadow: '0 4px 12px rgba(12,9,6,0.18)',
              }}
            >
              Archive
            </button>
            <button
              onClick={fitAll}
              className="px-2 py-1.5 text-[11px] tracking-[0.12em] uppercase"
              style={{
                fontFamily: "'EB Garamond Variable', Georgia, serif",
                background: '#f6efe2',
                color: '#241a12',
                border: '1px solid #8c7a5c',
                boxShadow: '0 4px 12px rgba(12,9,6,0.18)',
              }}
            >
              fit
            </button>
            <button
              onClick={() => {
                camRef.current.tz = Math.min(2.5, camRef.current.tz * 1.1)
              }}
              className="px-2 py-1.5 text-[11px]"
              style={{
                fontFamily: "'EB Garamond Variable', Georgia, serif",
                background: '#f6efe2',
                color: '#241a12',
                border: '1px solid #8c7a5c',
                boxShadow: '0 4px 12px rgba(12,9,6,0.18)',
              }}
            >
              +
            </button>
            <button
              onClick={() => {
                camRef.current.tz = Math.max(0.7, camRef.current.tz / 1.1)
              }}
              className="px-2 py-1.5 text-[11px]"
              style={{
                fontFamily: "'EB Garamond Variable', Georgia, serif",
                background: '#f6efe2',
                color: '#241a12',
                border: '1px solid #8c7a5c',
                boxShadow: '0 4px 12px rgba(12,9,6,0.18)',
              }}
            >
              -
            </button>
          </div>
          <div className="flex flex-wrap gap-1 max-w-[320px]">
            {WORLDHOPPER_LEGEND.map((id) => {
              const w = WORLDHOPPER_MOVEMENTS.find((x) => x.id === id)
              if (!w) return null
              const active = activeRoute === id
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (active) {
                      setActiveRoute(null)
                      return
                    }
                    setActiveRoute(id)
                    setDrawer(false)
                    setSelected(null)
                    fitAll()
                  }}
                  className="px-2 py-1 text-[11px]"
                  style={{
                    fontFamily: "'EB Garamond Variable', Georgia, serif",
                    background: active ? '#f6efe2' : '#e7dcc6',
                    color: '#241a12',
                    border: '1px solid #8c7a5c',
                    boxShadow: '0 4px 12px rgba(12,9,6,0.18)',
                  }}
                >
                  {w.name}
                </button>
              )
            })}
          </div>
        </div>
        {hint && (
          <div
            className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] transition-opacity duration-1000"
            style={{ fontFamily: "'Caveat Variable', cursive", color: '#4a382a', opacity: hint ? 0.9 : 0 }}
          >
            Drag to move the chart, wheel to look closer
          </div>
        )}
        {hover && !drawer && (
          <div
            className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 text-[12px]"
            style={{
              fontFamily: "'EB Garamond Variable', Georgia, serif",
              background: '#f6efe2',
              color: '#241a12',
              border: '1px solid #8c7a5c',
              boxShadow: '0 4px 12px rgba(12,9,6,0.18)',
            }}
          >
            {(items.find((i) => i.planet.id === hover)?.planet.name)}
          </div>
        )}
        {drawer && selectedPlanet && (
          <div
            className="absolute right-0 top-0 h-full w-full sm:w-[380px] overflow-y-auto p-4 sm:p-6"
            style={{
              fontFamily: "'EB Garamond Variable', Georgia, serif",
              background: '#f6efe2',
              borderLeft: '1px solid #8c7a5c',
              boxShadow: '-12px 0 40px rgba(12,9,6,0.22)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-[#6b5744]">World</div>
                <div className="text-[26px] text-[#241a12]">{selectedPlanet.name}</div>
              </div>
              <button
                onClick={() => setDrawer(false)}
                className="px-2 py-1 text-[11px] tracking-[0.12em] uppercase"
                style={{ border: '1px solid #8c7a5c', color: '#241a12' }}
              >
                Close
              </button>
            </div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[#6b5744] mb-2">Souls</div>
            <div className="h-px bg-[#c9bca4] mb-3" />
            <div className="space-y-2 mb-6">
              {souls.slice(0, 60).map((c: Character) => {
                const portrait = getCharacterPortrait(c.name)
                return (
                  <button
                    key={c.id}
                    onClick={() => navRef.current('/characters')}
                    className="w-full flex items-center gap-3 text-left min-h-[44px]"
                    style={{ border: '1px solid transparent' }}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#c9bca4] bg-[#e7dcc6]">
                      {portrait ? (
                        <img src={portrait} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Monogram name={c.name} planet={c.planet || selectedPlanet.id} size={48} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] text-[#241a12] truncate">{c.name}</div>
                      {c.titles && c.titles[0] && <div className="text-[12px] text-[#4a382a] truncate">{c.titles[0]}</div>}
                    </div>
                  </button>
                )
              })}
              {souls.length === 0 && <div className="text-[13px] text-[#4a382a]">No recorded souls.</div>}
            </div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[#6b5744] mb-2">Volumes</div>
            <div className="h-px bg-[#c9bca4] mb-3" />
            <div className="flex flex-wrap gap-2">
              {volumes.map((b: Book) => (
                <button
                  key={b.id}
                  onClick={() => navRef.current('/library?book=' + b.id)}
                  className="px-3 py-2 text-[13px] min-h-[44px]"
                  style={{ background: '#e7dcc6', border: '1px solid #8c7a5c', color: '#241a12' }}
                >
                  {b.title}
                </button>
              ))}
              {volumes.length === 0 && <div className="text-[13px] text-[#4a382a]">No recorded volumes.</div>}
            </div>
          </div>
        )}
        <div className="sr-only" aria-live="polite">
          {announce}
        </div>
        <ul className="sr-only">
          {items.map((it) => (
            <li key={it.planet.id}>
              {it.planet.name}
              <ul>
                {ALL_CHARACTERS.filter((c: Character) => c.planet === it.planet.id).map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
                {(it.planet.books || []).map((bid) => {
                  const b = BOOKS.find((x: Book) => x.id === bid)
                  return b ? <li key={b.id}>{b.title}</li> : null
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </CodexObject>
  )
}
