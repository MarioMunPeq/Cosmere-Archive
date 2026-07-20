import { useRef, useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import { PLANETS, ALL_CHARACTERS, BOOKS } from '@/data/static'
import { SHARD_COLORS, FALLBACK_COLOR, hexToRgb } from '@/data/static'

interface MindNode {
  id: string
  label: string
  type: 'planet' | 'shard' | 'character' | 'book'
  color: string
  x: number
  y: number
  z: number
  r: number
  link?: string
}

interface MindLink {
  source: string
  target: string
}

interface Camera {
  panX: number
  panY: number
  zoom: number
  rotX: number
  rotY: number
}

interface Star {
  x: number
  y: number
  r: number
  a: number
}

const NODE_TYPES: Record<string, { baseR: number; labelSize: number }> = {
  planet: { baseR: 14, labelSize: 11 },
  shard: { baseR: 10, labelSize: 10 },
  character: { baseR: 5, labelSize: 8 },
  book: { baseR: 6, labelSize: 8 },
}

const FOCAL = 500
const MIN_ZOOM = 0.2
const MAX_ZOOM = 8
const AUTO_ROTATE_DELAY = 4000
const LERP_SPEED = 0.06
const PAN_SPEED = 10
const ROT_SPEED = 0.035

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    r: Math.random() * 1.5 + 0.3,
    a: Math.random() * 0.5 + 0.1,
  }))
}

const STARS: Star[] = generateStars(800)

function projectNodeCSS(node: MindNode, cam: Camera) {
  const cosX = Math.cos(cam.rotX)
  const sinX = Math.sin(cam.rotX)
  const cosY = Math.cos(cam.rotY)
  const sinY = Math.sin(cam.rotY)
  const y1 = node.y * cosX - node.z * sinX
  const z1 = node.y * sinX + node.z * cosX
  const x1 = node.x * cosY + z1 * sinY
  const z2 = -node.x * sinY + z1 * cosY
  const persp = FOCAL / (FOCAL + z2)
  return {
    sx: x1 * persp * cam.zoom + cam.panX,
    sy: y1 * persp * cam.zoom + cam.panY,
    scale: persp * cam.zoom,
    depth: z2,
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r * 0.7, y)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r * 0.7, y)
  ctx.closePath()
}

function drawBookShape(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const w = r * 1.4
  const h = r * 1.1
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 2)
}

const DEFAULT_CAMERA: Camera = { panX: 0, panY: 0, zoom: 1, rotX: 0.3, rotY: 0 }

export default function CosmereMindMap3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0, shift: false, moved: false })
  const animRef = useRef(0)
  const simRef = useRef<{ stop: () => void } | null>(null)
  const nodesRef = useRef<MindNode[]>([])
  const linksRef = useRef<MindLink[]>([])
  const hoveredRef = useRef<string | null>(null)
  const cameraRef = useRef<Camera>({ ...DEFAULT_CAMERA })
  const targetCameraRef = useRef<Camera>({ ...DEFAULT_CAMERA })
  const lastInputRef = useRef(0)
  const keysRef = useRef(new Set<string>())
  const helpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showHelp, setShowHelp] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowHelp(false), 4000)
    helpTimerRef.current = t
    return () => {
      clearTimeout(t)
      if (helpTimerRef.current) clearTimeout(helpTimerRef.current)
    }
  }, [])

  const showHelpTemporarily = useCallback(() => {
    setShowHelp(true)
    if (helpTimerRef.current) clearTimeout(helpTimerRef.current)
    helpTimerRef.current = setTimeout(() => setShowHelp(false), 4000)
  }, [])

  useEffect(() => {
    const shardNames = new Set<string>()
    const planetShardMap = new Map<string, string[]>()
    for (const p of PLANETS) {
      if (!p.shard) continue
      const parts = p.shard.split(/, | & /)
      const names = parts.map((r) => r.replace(/\s*\(.*?\)\s*/g, '').trim()).filter(Boolean)
      planetShardMap.set(p.id, names)
      for (const n of names) shardNames.add(n)
    }

    const nodes: MindNode[] = []
    const links: MindLink[] = []

    for (const p of PLANETS) {
      nodes.push({
        id: `planet-${p.id}`,
        label: p.name,
        type: 'planet',
        color: p.color,
        x: (p.x / 900) * 600 - 300,
        y: (p.y / 600) * 400 - 200,
        z: (Math.random() - 0.5) * 100,
        r: NODE_TYPES.planet!.baseR,
        link: `/celestial-charts?focus=planet&id=${p.id}`,
      })
    }

    for (const name of shardNames) {
      nodes.push({
        id: `shard-${name}`,
        label: name,
        type: 'shard',
        color: SHARD_COLORS[name] ?? FALLBACK_COLOR,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 80,
        r: NODE_TYPES.shard!.baseR,
      })
    }

    const displayed = ALL_CHARACTERS.slice(0, 40)
    for (const c of displayed) {
      nodes.push({
        id: `char-${c.id}`,
        label: c.name,
        type: 'character',
        color: '#9ca3af',
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 120,
        r: NODE_TYPES.character!.baseR,
        link: `/characters`,
      })
    }

    for (const b of BOOKS) {
      nodes.push({
        id: `book-${b.id}`,
        label: b.title,
        type: 'book',
        color: '#6b7280',
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 100,
        r: NODE_TYPES.book!.baseR,
        link: `/books/${b.id}`,
      })
    }

    for (const p of PLANETS) {
      const shards = planetShardMap.get(p.id) ?? []
      for (const s of shards) links.push({ source: `planet-${p.id}`, target: `shard-${s}` })
      const chars = displayed.filter((c) => c.planet === p.id).slice(0, 5)
      for (const c of chars) links.push({ source: `char-${c.id}`, target: `planet-${p.id}` })
      for (const b of BOOKS) {
        if (b.saga && p.sagas?.includes(b.saga)) links.push({ source: `book-${b.id}`, target: `planet-${p.id}` })
      }
    }

    nodesRef.current = nodes
    linksRef.current = links

    const sim = forceSimulation(nodes)
      .force(
        'link',
        forceLink(links as { source: string; target: string }[])
          .id((d: unknown) => (d as MindNode).id)
          .distance(80),
      )
      .force('charge', forceManyBody().strength(-80))
      .force('center', forceCenter(0, 0))
      .force('collide', forceCollide(8))
      .alphaDecay(0.02)

    sim.on('tick', () => {
      nodesRef.current = [...nodes]
    })

    simRef.current = sim

    return () => {
      sim.stop()
    }
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keysRef.current.add(key)
      lastInputRef.current = Date.now()
      showHelpTemporarily()

      const blockers = [' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
      if (blockers.includes(e.key) || 'wasdqerf'.includes(key)) {
        e.preventDefault()
      }
    }

    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [showHelpTemporarily])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = Math.pow(1.0006, -e.deltaY)
      targetCameraRef.current.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetCameraRef.current.zoom * factor))
      lastInputRef.current = Date.now()
      showHelpTemporarily()
    }

    canvas.addEventListener('wheel', wheel, { passive: false })
    return () => canvas.removeEventListener('wheel', wheel)
  }, [showHelpTemporarily])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio

    const resize = () => {
      const parent = canvas.parentElement!
      const w = parent.clientWidth
      const h = parent.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }

    resize()
    window.addEventListener('resize', resize)

    const loop = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animRef.current = requestAnimationFrame(loop)
        return
      }

      const w = canvas.width
      const h = canvas.height
      const now = Date.now()
      const cam = cameraRef.current
      const target = targetCameraRef.current
      const keys = keysRef.current
      const shift = keys.has('shift')
      const mult = shift ? 2.5 : 1
      const speed = PAN_SPEED / Math.max(0.5, cam.zoom)

      if (keys.has('w') || keys.has('arrowup')) target.panY += speed * mult
      if (keys.has('s') || keys.has('arrowdown')) target.panY -= speed * mult
      if (keys.has('a') || keys.has('arrowleft')) target.panX += speed * mult
      if (keys.has('d') || keys.has('arrowright')) target.panX -= speed * mult
      if (keys.has('q')) target.rotY -= ROT_SPEED * mult
      if (keys.has('e')) target.rotY += ROT_SPEED * mult
      if (keys.has('r')) target.rotX -= ROT_SPEED * mult
      if (keys.has('f')) target.rotX += ROT_SPEED * mult
      if (keys.has(' ')) {
        target.panX = DEFAULT_CAMERA.panX
        target.panY = DEFAULT_CAMERA.panY
        target.zoom = DEFAULT_CAMERA.zoom
        target.rotX = DEFAULT_CAMERA.rotX
        target.rotY = DEFAULT_CAMERA.rotY
        keysRef.current.delete(' ')
      }

      target.rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, target.rotX))
      target.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, target.zoom))

      if (now - lastInputRef.current > AUTO_ROTATE_DELAY) {
        target.rotY += 0.0012
      }

      cam.panX += (target.panX - cam.panX) * LERP_SPEED
      cam.panY += (target.panY - cam.panY) * LERP_SPEED
      cam.zoom += (target.zoom - cam.zoom) * LERP_SPEED
      cam.rotX += (target.rotX - cam.rotX) * LERP_SPEED
      cam.rotY += (target.rotY - cam.rotY) * LERP_SPEED

      // — Background —
      ctx.fillStyle = '#08080e'
      ctx.fillRect(0, 0, w, h)

      const neb1 = ctx.createRadialGradient(w * 0.3, h * 0.25, 0, w * 0.3, h * 0.25, w * 0.7)
      neb1.addColorStop(0, 'rgba(70, 15, 140, 0.15)')
      neb1.addColorStop(0.5, 'rgba(25, 0, 60, 0.07)')
      neb1.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = neb1
      ctx.fillRect(0, 0, w, h)

      const neb2 = ctx.createRadialGradient(w * 0.72, h * 0.75, 0, w * 0.72, h * 0.75, w * 0.55)
      neb2.addColorStop(0, 'rgba(15, 40, 100, 0.12)')
      neb2.addColorStop(0.5, 'rgba(5, 15, 50, 0.06)')
      neb2.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = neb2
      ctx.fillRect(0, 0, w, h)

      const starScale = Math.max(0.5, cam.zoom * 0.25 + 0.75)
      for (const star of STARS) {
        const twinkle = 0.6 + 0.4 * Math.sin(now * 0.0008 + star.x * 13 + star.y * 11)
        const sz = star.r * starScale
        const sa = star.a * twinkle * Math.min(1, cam.zoom * 0.35 + 0.65)
        ctx.globalAlpha = sa
        ctx.fillStyle = star.r > 1.2 ? '#c8d0ff' : '#fff'
        ctx.beginPath()
        ctx.arc(star.x * w * 0.5 + w * 0.5, star.y * h * 0.5 + h * 0.5, sz, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // — Graph —
      ctx.save()
      ctx.translate(w / 2, h / 2)
      ctx.scale(dpr, dpr)

      const projected = nodesRef.current.map((n) => ({ node: n, proj: projectNodeCSS(n, cam) }))
      projected.sort((a, b) => a.proj.depth - b.proj.depth)

      const hoveredId = hoveredRef.current

      // — Links —
      for (const link of linksRef.current) {
        const srcAny = link.source as { id: string } | string | undefined
        const tgtAny = link.target as { id: string } | string | undefined
        const sId = typeof srcAny === 'string' ? srcAny : (srcAny as { id: string } | undefined)?.id
        const tId = typeof tgtAny === 'string' ? tgtAny : (tgtAny as { id: string } | undefined)?.id
        if (!sId || !tId) continue
        const src = nodesRef.current.find((n) => n.id === sId)
        const tgt = nodesRef.current.find((n) => n.id === tId)
        if (!src || !tgt) continue
        const ps = projectNodeCSS(src, cam)
        const pt = projectNodeCSS(tgt, cam)

        const connected = !!hoveredId && (hoveredId === sId || hoveredId === tId)
        const baseOpacity = Math.max(0.04, Math.min(0.25, (ps.depth + 200) / 400))

        const linkRgb =
          src.type === 'planet' ? hexToRgb(src.color) : tgt.type === 'planet' ? hexToRgb(tgt.color) : [107, 114, 128]
        const opacity = connected ? Math.min(0.6, baseOpacity * 3) : baseOpacity
        ctx.beginPath()
        ctx.moveTo(ps.sx, ps.sy)
        ctx.lineTo(pt.sx, pt.sy)
        ctx.strokeStyle = connected
          ? `rgba(167, 139, 250, ${opacity})`
          : `rgba(${linkRgb[0]}, ${linkRgb[1]}, ${linkRgb[2]}, ${opacity * 0.6})`
        ctx.lineWidth = connected ? 1.2 : 0.4
        ctx.stroke()
      }

      // — Nodes —
      for (const { node, proj } of projected) {
        const { sx, sy, scale, depth } = proj
        const r = Math.max(2, node.r * scale)
        const alpha = Math.max(0.2, Math.min(1, (depth + 250) / 300))
        const isHovered = hoveredId === node.id
        const rgb = hexToRgb(node.color)

        // Subtle colored glow
        const glowR = isHovered ? r * 5 : r * 2.5
        const glowO = isHovered ? 0.25 : 0.07
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR)
        glow.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${glowO * alpha})`)
        glow.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(sx, sy, glowR, 0, Math.PI * 2)
        ctx.fill()

        // Extra hover glow
        if (isHovered) {
          const hg = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 7)
          hg.addColorStop(0, `rgba(167, 139, 250, 0.2)`)
          hg.addColorStop(1, `rgba(167, 139, 250, 0)`)
          ctx.fillStyle = hg
          ctx.beginPath()
          ctx.arc(sx, sy, r * 7, 0, Math.PI * 2)
          ctx.fill()
        }

        // — Shape —
        ctx.globalAlpha = alpha

        if (node.type === 'shard') {
          // Diamond with glow
          ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha * 0.5})`
          ctx.shadowBlur = 8
          drawDiamond(ctx, sx, sy, r)
          ctx.fillStyle = node.color
          ctx.fill()
          ctx.shadowBlur = 0
        } else if (node.type === 'book') {
          // Rounded rect with thin border
          drawBookShape(ctx, sx, sy, r)
          ctx.fillStyle = node.color
          ctx.fill()
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.2})`
          ctx.lineWidth = 1
          drawBookShape(ctx, sx, sy, r)
          ctx.stroke()
        } else {
          // Circle (planet or character)
          ctx.beginPath()
          ctx.arc(sx, sy, r, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.fill()

          if (node.type === 'planet') {
            // Highlight spot
            ctx.beginPath()
            ctx.arc(sx - r * 0.25, sy - r * 0.25, r * 0.45, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.12})`
            ctx.fill()

            // Atmosphere ring
            ctx.beginPath()
            ctx.arc(sx, sy, r + 2, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha * 0.2})`
            ctx.lineWidth = 1
            ctx.stroke()
          }

          if (node.type === 'character') {
            // Subtle character dot ring
            ctx.beginPath()
            ctx.arc(sx, sy, r + 1.5, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.06})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }

        ctx.globalAlpha = 1
        ctx.shadowBlur = 0

        if (isHovered) {
          ctx.beginPath()
          ctx.arc(sx, sy, r + 3, 0, Math.PI * 2)
          ctx.strokeStyle = '#a78bfa'
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // — Label —
        if (scale > 0.25) {
          ctx.fillStyle = `rgba(229, 231, 235, ${alpha})`
          const nt = NODE_TYPES[node.type]
          ctx.font = `${Math.max(7, (nt?.labelSize ?? 8) * scale)}px ui-monospace, monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.shadowColor = `rgba(0, 0, 0, ${alpha * 0.9})`
          ctx.shadowBlur = 4
          ctx.shadowOffsetY = 1
          ctx.fillText(node.label, sx, sy + r + 3)
          ctx.shadowBlur = 0
          ctx.shadowOffsetY = 0
        }
      }

      // — Tooltip —
      if (hoveredId) {
        const hoveredNode = nodesRef.current.find((n) => n.id === hoveredId)
        const hovProj = projected.find((p) => p.node.id === hoveredId)
        if (hoveredNode && hovProj) {
          const { sx, sy } = hovProj.proj
          const typeLabel =
            hoveredNode.type === 'planet'
              ? 'Planet'
              : hoveredNode.type === 'shard'
                ? 'Shard'
                : hoveredNode.type === 'book'
                  ? 'Book'
                  : 'Character'
          const tipText = `${hoveredNode.label}  ·  ${typeLabel}`
          ctx.font = '11px ui-monospace, monospace'
          const tw = ctx.measureText(tipText).width
          const pad = 10
          const tipW = tw + pad * 2
          const tipH = 24
          const tipX = sx - tipW / 2
          const tipY = sy - hoveredNode.r * hovProj.proj.scale - tipH - 6

          ctx.fillStyle = 'rgba(17, 17, 27, 0.92)'
          roundRect(ctx, tipX, tipY, tipW, tipH, 6)
          ctx.fill()

          ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)'
          ctx.lineWidth = 1
          roundRect(ctx, tipX, tipY, tipW, tipH, 6)
          ctx.stroke()

          ctx.fillStyle = '#e5e7eb'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(tipText, sx, tipY + tipH / 2)
        }
      }

      ctx.restore()

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current.dragging = true
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
      dragRef.current.shift = e.shiftKey
      dragRef.current.moved = false
      showHelpTemporarily()
    },
    [showHelpTemporarily],
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left - rect.width / 2
    const my = e.clientY - rect.top - rect.height / 2

    if (dragRef.current.dragging) {
      const dx = e.clientX - dragRef.current.lastX
      const dy = e.clientY - dragRef.current.lastY
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        dragRef.current.moved = true
      }
      const target = targetCameraRef.current
      if (dragRef.current.shift || e.shiftKey) {
        target.panX += dx
        target.panY += dy
      } else {
        target.rotY += dx * 0.005
        target.rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, target.rotX + dy * 0.005))
      }
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
      lastInputRef.current = Date.now()
      return
    }

    const cam = cameraRef.current
    const projected = nodesRef.current.map((n) => ({ node: n, proj: projectNodeCSS(n, cam) }))
    const hit = projected.find(({ node, proj }) => {
      const r = Math.max(2, node.r * proj.scale)
      return Math.hypot(proj.sx - mx, proj.sy - my) < r + 4
    })
    hoveredRef.current = hit?.node.id ?? null
    canvas.style.cursor = hit ? 'pointer' : 'grab'
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.dragging) return
      const wasDrag = dragRef.current.moved
      dragRef.current.dragging = false

      if (wasDrag) return

      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left - rect.width / 2
      const my = e.clientY - rect.top - rect.height / 2

      const cam = cameraRef.current
      const projected = nodesRef.current.map((n) => ({ node: n, proj: projectNodeCSS(n, cam) }))
      const hit = projected.find(({ node, proj }) => {
        const r = Math.max(2, node.r * proj.scale)
        return Math.hypot(proj.sx - mx, proj.sy - my) < r + 4
      })

      if (hit?.node.link) {
        navigate(hit.node.link)
      }
    },
    [navigate],
  )

  return (
    <div className="relative h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-grab"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          dragRef.current.dragging = false
          hoveredRef.current = null
        }}
      />
      <div
        className="pointer-events-none absolute bottom-3 left-3 z-10 transition-opacity duration-700 ease-in-out"
        style={{ opacity: showHelp ? 1 : 0 }}
      >
        <div className="rounded-lg border border-gray-700/30 bg-gray-950/60 px-3 py-2 text-[11px] text-gray-400 shadow-lg backdrop-blur-sm">
          <div className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-gray-500">Controls</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
            <span className="text-purple-400/80">W A S D</span>
            <span>Pan</span>
            <span className="text-purple-400/80">Q / E</span>
            <span>Yaw</span>
            <span className="text-purple-400/80">R / F</span>
            <span>Tilt</span>
            <span className="text-purple-400/80">Scroll</span>
            <span>Zoom</span>
            <span className="text-purple-400/80">Drag</span>
            <span>Rotate</span>
            <span className="text-purple-400/80">⇧+Drag</span>
            <span>Pan</span>
            <span className="text-purple-400/80">Space</span>
            <span>Reset</span>
          </div>
        </div>
      </div>
    </div>
  )
}
