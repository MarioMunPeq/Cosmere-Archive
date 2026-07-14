import { useRef, useEffect, useCallback } from 'react'
import { generateSoulField, SpatialGrid } from './SoulField'
import { InteractionSystem } from './InteractionSystem'
import { SelectionSystem } from './SelectionSystem'
import { CameraController } from './Camera'
import {
  drawBackground,
  drawSouls,
  drawHoverLabel,
  drawSelectionInfo,
  drawConnectionLines,
  drawClusterLabels,
} from './Renderer'
import { CLUSTERS, CLUSTER_HOVER_RADIUS_WORLD, LABEL_FADE_ZOOM, MIN_ZOOM } from './types'
import type { Soul } from './types'

const CLICK_DRAG_THRESHOLD = 4
const DBLCLICK_TIME = 400
const FLY_DURATION = 0.8

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const soulsRef = useRef<Soul[]>([])
  const gridRef = useRef(new SpatialGrid(0.02))
  const interactionRef = useRef(new InteractionSystem())
  const selectionRef = useRef(new SelectionSystem())
  const cameraRef = useRef(new CameraController())

  const mouseRef = useRef({ x: 0, y: 0 })
  const rAFRef = useRef(0)
  const lastTimeRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0 })

  const dragStateRef = useRef<{
    active: boolean
    startX: number
    startY: number
    moved: boolean
    lastX: number
    lastY: number
  }>({ active: false, startX: 0, startY: 0, moved: false, lastX: 0, lastY: 0 })

  const clickStateRef = useRef<{
    lastClickTime: number
    lastClickX: number
    lastClickY: number
  }>({ lastClickTime: 0, lastClickX: 0, lastClickY: 0 })

  const clusterHoverRef = useRef<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    soulsRef.current = generateSoulField()
    gridRef.current.rebuild(soulsRef.current)

    let running = true

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      sizeRef.current = { w: rect.width, h: rect.height }
    }
    resize()
    window.addEventListener('resize', resize)

    function tick(time: number) {
      if (!running) return
      const dt = Math.min(0.05, (time - (lastTimeRef.current || time)) / 1000)
      lastTimeRef.current = time

      const souls = soulsRef.current
      const grid = gridRef.current
      const interaction = interactionRef.current
      const selection = selectionRef.current
      const camera = cameraRef.current
      if (!ctx) return

      const { w, h } = sizeRef.current
      if (w === 0 || h === 0) {
        rAFRef.current = requestAnimationFrame(tick)
        return
      }

      camera.update(dt, w, h)

      const worldMouse = camera.screenToWorld(mouseRef.current.x, mouseRef.current.y, w, h)
      interaction.updateMouse(mouseRef.current.x, mouseRef.current.y, worldMouse.x, worldMouse.y)

      for (const s of souls) {
        const noiseAngle = Math.sin(time * 0.0004 + s.noisePhase) * Math.PI
        s.vx += Math.cos(noiseAngle) * s.noiseAmp * dt * 0.12
        s.vy += Math.sin(noiseAngle) * s.noiseAmp * dt * 0.12
        s.orbitAngle += s.orbitSpeed * dt * 0.6
        s.vx += Math.cos(s.orbitAngle) * s.orbitRadius * 0.005
        s.vy += Math.sin(s.orbitAngle) * s.orbitRadius * 0.005
        s.vx *= 0.995
        s.vy *= 0.995
        s.x += s.vx * dt * 2.5
        s.y += s.vy * dt * 2.5
      }

      interaction.updateCuriosity(souls, dt)
      grid.rebuild(souls)
      interaction.updateHover(grid)
      selection.tick(dt, souls)

      let nearestCluster: string | null = null
      let nearestDist = CLUSTER_HOVER_RADIUS_WORLD
      for (const cluster of CLUSTERS) {
        if (cluster.planetRadius === 0) continue
        const dx = worldMouse.x - cluster.cx
        const dy = worldMouse.y - cluster.cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < nearestDist) {
          nearestDist = dist
          nearestCluster = cluster.id
        }
      }
      clusterHoverRef.current = nearestCluster

      const dpr = window.devicePixelRatio || 1
      ctx.save()
      ctx.scale(dpr, dpr)

      drawBackground(ctx, w, h, selection.state.bgDim, time)
      drawSouls(ctx, souls, camera, w, h, time, selection.state.soulId, interaction.hoveredId, interaction.rippleRadius)
      drawClusterLabels(ctx, camera, w, h, clusterHoverRef.current)

      drawConnectionLines(ctx, selection.state, souls, time)

      const selectedSoul = selection.getSelectedSoul(souls)

      if (
        selection.state.phase === 'displaying' ||
        selection.state.phase === 'revealing' ||
        selection.state.phase === 'growing'
      ) {
        drawSelectionInfo(ctx, selection.state, selectedSoul)
      }

      if (!selectedSoul || selection.state.phase === 'idle') {
        drawHoverLabel(ctx, interaction.hoveredSoul, interaction.hoverLabelOpacity)
      }

      ctx.restore()

      rAFRef.current = requestAnimationFrame(tick)
    }

    rAFRef.current = requestAnimationFrame(tick)
    return () => {
      running = false
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rAFRef.current)
    }
  }, [])

  function flyToCluster(clusterId: string) {
    const cluster = CLUSTERS.find((c) => c.id === clusterId)
    if (!cluster) return
    const targetZoom = Math.max(1.2, MIN_ZOOM * 4)
    cameraRef.current.flyTo(cluster.cx, cluster.cy, targetZoom, FLY_DURATION)
  }

  function handleClick(mx: number, my: number) {
    const { w, h } = sizeRef.current
    if (w === 0 || h === 0) return
    const camera = cameraRef.current

    for (const cluster of CLUSTERS) {
      if (cluster.planetRadius === 0) continue
      if (camera.zoom < LABEL_FADE_ZOOM * 0.5) continue
      const labelScreen = camera.worldToScreen(cluster.cx, cluster.cy, w, h)
      const labelY = labelScreen.y - cluster.planetRadius * Math.min(w, h) * camera.zoom - 6
      const dy = my - labelY
      const dx = mx - labelScreen.x
      if (dy > -20 && dy < 4 && Math.abs(dx) < 50) {
        flyToCluster(cluster.id)
        return
      }
    }

    const selection = selectionRef.current
    const interaction = interactionRef.current
    const souls = soulsRef.current
    const grid = gridRef.current

    if (selection.state.phase === 'displaying') {
      selection.deselect()
      return
    }
    if (selection.state.phase !== 'idle') return

    const clicked = interaction.tryClick(souls, grid)
    if (clicked) {
      selection.select(clicked, souls)
    }
  }

  function handleDoubleClick(mx: number, my: number) {
    const { w, h } = sizeRef.current
    if (w === 0 || h === 0) return
    const camera = cameraRef.current
    const worldMouse = camera.screenToWorld(mx, my, w, h)

    let nearestCluster: string | null = null
    let nearestDist = 0.06
    for (const cluster of CLUSTERS) {
      if (cluster.planetRadius === 0) continue
      const dx = worldMouse.x - cluster.cx
      const dy = worldMouse.y - cluster.cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestCluster = cluster.id
      }
    }

    if (nearestCluster) {
      flyToCluster(nearestCluster)
    }
  }

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    mouseRef.current = { x: mx, y: my }

    dragStateRef.current = {
      active: true,
      startX: mx,
      startY: my,
      moved: false,
      lastX: mx,
      lastY: my,
    }
    cameraRef.current.startDrag(mx, my)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    mouseRef.current = { x: mx, y: my }

    const ds = dragStateRef.current
    if (ds.active) {
      const dx = mx - ds.startX
      const dy = my - ds.startY
      if (!ds.moved && Math.sqrt(dx * dx + dy * dy) > CLICK_DRAG_THRESHOLD) {
        ds.moved = true
      }
      const { w, h } = sizeRef.current
      if (w > 0 && h > 0) {
        cameraRef.current.drag(mx, my, w, h)
      }
      ds.lastX = mx
      ds.lastY = my
    }
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const ds = dragStateRef.current

    cameraRef.current.endDrag()

    if (!ds.moved) {
      const now = performance.now()
      const cs = clickStateRef.current
      const isDblClick =
        now - cs.lastClickTime < DBLCLICK_TIME && Math.abs(mx - cs.lastClickX) < 8 && Math.abs(my - cs.lastClickY) < 8

      cs.lastClickTime = now
      cs.lastClickX = mx
      cs.lastClickY = my

      if (isDblClick) {
        handleDoubleClick(mx, my)
      } else {
        handleClick(mx, my)
      }
    }

    dragStateRef.current = { active: false, startX: 0, startY: 0, moved: false, lastX: 0, lastY: 0 }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 }
    dragStateRef.current = { active: false, startX: 0, startY: 0, moved: false, lastX: 0, lastY: 0 }
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const { w, h } = sizeRef.current
    if (w > 0 && h > 0) {
      cameraRef.current.wheel(e.deltaY, mx, my, w, h)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full touch-none"
      style={{ background: '#050508', cursor: 'default' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onWheel={onWheel}
      onContextMenu={(e) => e.preventDefault()}
    />
  )
}
