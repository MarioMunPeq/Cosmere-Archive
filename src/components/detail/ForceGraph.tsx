import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force'
import type { Character } from '@/types'
import type { CharacterRelationship, RelationshipType } from '@/types/relationships'
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '@/types/relationships'
import { getPlanetById } from '@/data/static'
import { FALLBACK_COLOR } from '@/utils/constants'

interface GraphNode extends SimulationNodeDatum {
  id: string
  name: string
  color: string
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  type: RelationshipType
  label?: string
}

interface Props {
  characters: Character[]
  relationships: CharacterRelationship[]
  selectedId?: string
  onSelectCharacter: (id: string) => void
}

function getCharacterColor(char: Pick<Character, 'planet'>): string {
  const planet = getPlanetById(char.planet.toLowerCase())
  return planet?.color ?? FALLBACK_COLOR
}

const W = 900
const H = 560

export default function ForceGraph({ characters, relationships, selectedId, onSelectCharacter }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [cursor, setCursor] = useState<'grab' | 'grabbing'>('grab')
  const isPanning = useRef(false)
  const panDragStart = useRef({ x: 0, y: 0 })
  const panOffset = useRef({ x: 0, y: 0 })
  const nodeDrag = useRef<{ id: string; startX: number; startY: number; nodeX: number; nodeY: number } | null>(null)
  const simRef = useRef<ReturnType<typeof forceSimulation<GraphNode>> | null>(null)
  const tickId = useRef(0)

  const { nodes, links, hasRelationships } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>()
    const n: GraphNode[] = characters.map((c) => ({
      id: c.id,
      name: c.name,
      color: getCharacterColor(c),
    }))
    n.forEach((node) => nodeMap.set(node.id, node))

    const l: GraphLink[] = relationships
      .map((r) => {
        const source = nodeMap.get(r.characters[0])
        const target = nodeMap.get(r.characters[1])
        if (!source || !target) return null
        return { source, target, type: r.type, label: r.label }
      })
      .filter(Boolean) as GraphLink[]

    const relSet = new Set<string>()
    relationships.forEach((r) => {
      relSet.add(r.characters[0])
      relSet.add(r.characters[1])
    })

    return { nodes: n, links: l, hasRelationships: relSet }
  }, [characters, relationships])

  useEffect(() => {
    const sim = forceSimulation(nodes)
      .force('link', forceLink<GraphNode, GraphLink>(links).distance(80).strength(0.4))
      .force('charge', forceManyBody().strength(-180))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide(30))

    simRef.current = sim
    sim.alpha(1).restart()

    return () => {
      sim.stop()
    }
  }, [nodes, links])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const linkEls = Array.from(svg.querySelectorAll<SVGLineElement>('.graph-link'))
    const nodeEls = Array.from(svg.querySelectorAll<SVGCircleElement>('.graph-node'))
    const labelEls = Array.from(svg.querySelectorAll<SVGTextElement>('.graph-label'))
    const pulseEls = Array.from(svg.querySelectorAll<SVGCircleElement>('.graph-pulse'))

    const sim = simRef.current
    if (!sim) return

    let running = true

    function tick() {
      if (!running) return
      linkEls.forEach((el, i) => {
        const l = links[i]
        if (
          l &&
          typeof l.source !== 'string' &&
          typeof l.source !== 'number' &&
          typeof l.target !== 'string' &&
          typeof l.target !== 'number'
        ) {
          el.setAttribute('x1', String(l.source.x ?? 0))
          el.setAttribute('y1', String(l.source.y ?? 0))
          el.setAttribute('x2', String(l.target.x ?? 0))
          el.setAttribute('y2', String(l.target.y ?? 0))
        }
      })
      nodeEls.forEach((el, i) => {
        const n = nodes[i]
        if (n) {
          el.setAttribute('cx', String(n.x ?? 0))
          el.setAttribute('cy', String(n.y ?? 0))
        }
      })
      labelEls.forEach((el, i) => {
        const n = nodes[i]
        if (n) {
          el.setAttribute('x', String(n.x ?? 0))
          el.setAttribute('y', String((n.y ?? 0) + 4))
        }
      })
      pulseEls.forEach((el, i) => {
        const n = nodes[i]
        if (n) {
          el.setAttribute('cx', String(n.x ?? 0))
          el.setAttribute('cy', String(n.y ?? 0))
        }
      })
      tickId.current = requestAnimationFrame(tick)
    }

    tickId.current = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(tickId.current)
    }
  }, [nodes, links])

  const findNodeAtPoint = useCallback(
    (clientX: number, clientY: number): string | null => {
      const svg = svgRef.current
      if (!svg) return null
      const rect = svg.getBoundingClientRect()
      const svgX = (clientX - rect.left - pan.x) / zoom
      const svgY = (clientY - rect.top - pan.y) / zoom
      for (const n of nodes) {
        const nx = n.x ?? 0
        const ny = n.y ?? 0
        const r = hasRelationships.has(n.id) ? 20 : 14
        if (Math.abs(svgX - nx) <= r + 4 && Math.abs(svgY - ny) <= r + 4) {
          return n.id
        }
      }
      return null
    },
    [nodes, zoom, pan, hasRelationships],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const nodeId = findNodeAtPoint(e.clientX, e.clientY)
      if (nodeId) {
        const n = nodes.find((nd) => nd.id === nodeId)
        if (n) {
          nodeDrag.current = { id: nodeId, startX: e.clientX, startY: e.clientY, nodeX: n.x ?? 0, nodeY: n.y ?? 0 }
        }
        return
      }
      setCursor('grabbing')
      isPanning.current = true
      panDragStart.current = { x: e.clientX, y: e.clientY }
      panOffset.current = { x: pan.x, y: pan.y }
    },
    [findNodeAtPoint, nodes, pan],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (nodeDrag.current) {
        const sim = simRef.current
        if (!sim) return
        const dx = (e.clientX - nodeDrag.current.startX) / zoom
        const dy = (e.clientY - nodeDrag.current.startY) / zoom
        const n = nodes.find((nd) => nd.id === nodeDrag.current!.id)
        if (n) {
          n.fx = nodeDrag.current.nodeX + dx
          n.fy = nodeDrag.current.nodeY + dy
          sim.alpha(0.3).restart()
        }
        return
      }
      if (isPanning.current) {
        const dx = e.clientX - panDragStart.current.x
        const dy = e.clientY - panDragStart.current.y
        setPan({ x: panOffset.current.x + dx, y: panOffset.current.y + dy })
      }
    },
    [zoom, nodes],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      setCursor('grab')
      if (nodeDrag.current) {
        const sim = simRef.current
        if (sim) {
          const n = nodes.find((nd) => nd.id === nodeDrag.current!.id)
          if (n) {
            n.fx = null
            n.fy = null
            sim.alpha(0.3).restart()
          }
        }
        const threshold = 3
        const dist = Math.abs(e.clientX - nodeDrag.current.startX) + Math.abs(e.clientY - nodeDrag.current.startY)
        if (dist < threshold) {
          onSelectCharacter(nodeDrag.current.id)
        }
        nodeDrag.current = null
        return
      }
      isPanning.current = false
    },
    [nodes, onSelectCharacter],
  )

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((z) => Math.max(0.3, Math.min(3, z + delta)))
  }, [])

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Force-directed character relationship graph"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      style={{ cursor, touchAction: 'none' }}
    >
      <defs>
        <filter id="node-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
        {links.map((link, i) => {
          const s = link.source as GraphNode
          const t = link.target as GraphNode
          const mx = ((s.x ?? 0) + (t.x ?? 0)) / 2
          const my = ((s.y ?? 0) + (t.y ?? 0)) / 2
          const color = RELATIONSHIP_COLORS[link.type]
          return (
            <g key={`link-${i}`}>
              <line className="graph-link" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
              <rect
                x={mx - 24}
                y={my - 7}
                width={48}
                height={14}
                rx="3"
                fill="#111827"
                stroke={color}
                strokeWidth="0.5"
                opacity="0.85"
              />
              <text x={mx} y={my + 3} textAnchor="middle" fill={color} fontSize="7" fontWeight="600">
                {link.label ?? RELATIONSHIP_LABELS[link.type]}
              </text>
            </g>
          )
        })}

        {nodes.map((node) => {
          const isSelected = node.id === selectedId
          const hasRel = hasRelationships.has(node.id)
          return (
            <g key={`node-${node.id}`}>
              {isSelected && (
                <circle className="graph-pulse" r={24} fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.6" />
              )}
              <circle
                className="graph-node"
                r={hasRel ? 20 : 14}
                fill={isSelected ? '#a855f7' : '#1f2937'}
                stroke={node.color}
                strokeWidth={isSelected ? 3 : 2}
                filter="url(#node-glow)"
                opacity={hasRel ? 1 : 0.5}
              />
              <text
                className="graph-label"
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? '#fff' : '#d1d5db'}
                fontSize={isSelected ? '10' : '8'}
                fontWeight={isSelected ? '700' : '500'}
                pointerEvents="none"
                style={{ userSelect: 'none' }}
              >
                {node.name.length > 12 ? node.name.slice(0, 11) + '…' : node.name}
              </text>
            </g>
          )
        })}
      </g>

      {!selectedId && (
        <text
          x={W / 2}
          y={H - 20}
          textAnchor="middle"
          fill="#6b7280"
          fontSize="11"
          fontFamily="ui-monospace, monospace"
        >
          Drag to pan · Scroll to zoom · Click a character to explore connections
        </text>
      )}
    </svg>
  )
}
