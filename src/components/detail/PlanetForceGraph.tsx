import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import type { Planet } from '@/types'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return (h >>> 0) / 0xffffffff
}

interface GraphNode {
  id: string
  name: string
  color: string
  size: number
  x: number
  y: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

interface GraphLink {
  source: string
  target: string
}

interface Props {
  planets: Planet[]
  selectedId?: string
  onSelectPlanet: (id: string) => void
}

const W = 900
const H = 560

interface Particle {
  cx: number
  cy: number
  r: number
  opacity: number
}

const PARTICLES = Array.from(
  { length: 50 },
  (): Particle => ({
    cx: Math.random() * W,
    cy: Math.random() * H,
    r: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.4 + 0.1,
  }),
)

export default function PlanetForceGraph({ planets, selectedId, onSelectPlanet }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const transformStart = useRef({ x: 0, y: 0 })
  const simRef = useRef<ReturnType<typeof forceSimulation<GraphNode>> | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const { nodes, links } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>()
    const linkSet = new Set<string>()

    for (const p of planets) {
      nodeMap.set(p.id, {
        id: p.id,
        name: p.name,
        color: p.color,
        size: Math.max(20, (p.size ?? 20) * 1.2),
        x: p.x ?? hashSeed(p.id + 'x') * W,
        y: p.y ?? hashSeed(p.id + 'y') * H,
      })
    }

    for (const p of planets) {
      for (const c of p.connectedPlanets ?? []) {
        if (nodeMap.has(c)) {
          const key = [p.id, c].sort().join('-')
          if (!linkSet.has(key)) {
            linkSet.add(key)
          }
        }
      }
    }

    const planetIdSet = new Set(planets.map((p) => p.id))
    for (const wh of WORLDHOPPER_MOVEMENTS) {
      const onPlanets = wh.planets.filter((pl) => planetIdSet.has(pl))
      for (let i = 0; i < onPlanets.length; i++) {
        for (let j = i + 1; j < onPlanets.length; j++) {
          const key = [onPlanets[i], onPlanets[j]].sort().join('-')
          if (!linkSet.has(key)) {
            linkSet.add(key)
          }
        }
      }
    }

    return {
      nodes: Array.from(nodeMap.values()),
      links: Array.from(linkSet).map((key) => {
        const [a, b] = key.split('-')
        return { source: a, target: b } as GraphLink
      }),
    }
  }, [planets])

  useEffect(() => {
    if (nodes.length === 0) return

    const sim = forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(130),
      )
      .force('charge', forceManyBody().strength(-350))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide(35))

    sim.on('tick', () => {
      setTransform((prev) => ({ ...prev }))
    })

    simRef.current = sim
    return () => {
      sim.stop()
    }
  }, [nodes, links])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setTransform((prev) => ({
      ...prev,
      k: Math.max(0.3, Math.min(3, prev.k * delta)),
    }))
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === svgRef.current || (e.target as Element).tagName === 'svg') {
        setDragging(true)
        dragStart.current = { x: e.clientX, y: e.clientY }
        transformStart.current = { x: transform.x, y: transform.y }
      }
    },
    [transform],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      setTransform((prev) => ({
        ...prev,
        x: transformStart.current.x + dx,
        y: transformStart.current.y + dy,
      }))
    },
    [dragging],
  )

  const handleMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  const linkColor = useCallback(
    (sourceNode: GraphNode, targetNode: GraphNode) => {
      if (selectedId === sourceNode.id || selectedId === targetNode.id) return '#22d3ee'
      if (hoveredId === sourceNode.id || hoveredId === targetNode.id) return '#67e8f9'
      return '#1e293b'
    },
    [selectedId, hoveredId],
  )

  const linkWidth = useCallback(
    (sourceNode: GraphNode, targetNode: GraphNode) => {
      if (selectedId === sourceNode.id || selectedId === targetNode.id) return 2
      return 0.8
    },
    [selectedId],
  )

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full select-none"
      role="img"
      aria-label="Planet network graph"
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        <radialGradient id="graph-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.15" />
          <stop offset="60%" stopColor="#030712" stopOpacity="0" />
        </radialGradient>
        <filter id="planet-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="planet-glow-intense">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="edge-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#graph-bg)" rx="12" />

      {PARTICLES.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#94a3b8" opacity={p.opacity} />
      ))}

      <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
        {links.map((link) => {
          const sourceNode = typeof link.source === 'object' ? link.source : nodes.find((n) => n.id === link.source)
          const targetNode = typeof link.target === 'object' ? link.target : nodes.find((n) => n.id === link.target)
          if (!sourceNode || !targetNode) return null
          const isActive = selectedId === sourceNode.id || selectedId === targetNode.id
          return (
            <line
              key={`${sourceNode.id}-${targetNode.id}`}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke={linkColor(sourceNode, targetNode)}
              strokeWidth={linkWidth(sourceNode, targetNode)}
              strokeDasharray={isActive ? 'none' : '4 4'}
              opacity={isActive ? 0.7 : 0.35}
              filter={isActive ? 'url(#edge-glow)' : undefined}
              className="transition-all duration-500"
            />
          )
        })}
        {nodes.map((node) => {
          const isSelected = node.id === selectedId
          const isHovered = node.id === hoveredId
          return (
            <g
              key={node.id}
              onClick={() => onSelectPlanet(node.id)}
              className="transition-transform duration-200"
              role="button"
              aria-label={`View ${node.name}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectPlanet(node.id)
              }}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={(isSelected ? node.size * 1.3 : isHovered ? node.size * 1.15 : node.size) + 6}
                fill={node.color}
                opacity={isSelected ? 0.2 : isHovered ? 0.15 : 0.1}
                className="transition-all duration-300"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={isSelected ? node.size * 1.3 : node.size}
                fill="#0f172a"
                stroke={node.color}
                strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
                filter={isSelected ? 'url(#planet-glow-intense)' : 'url(#planet-glow)'}
                className="transition-all duration-300"
              />
              {isSelected && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size * 1.3}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={1}
                  opacity={0.4}
                  className="animate-glow-pulse"
                  style={{ '--glow-color': node.color } as React.CSSProperties}
                />
              )}
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                fill={isSelected ? '#22d3ee' : isHovered ? '#e5e7eb' : '#94a3b8'}
                fontSize={Math.max(9, node.size * 0.35)}
                fontWeight={isSelected ? '700' : '500'}
                dominantBaseline="central"
                className="transition-all duration-300 pointer-events-none"
              >
                {node.name.length > 10 ? node.name.slice(0, 9) + '\u2026' : node.name}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
