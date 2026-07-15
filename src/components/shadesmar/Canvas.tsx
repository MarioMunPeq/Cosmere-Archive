import { useRef, useEffect, useCallback } from 'react'
import { generateSoulField, SpatialGrid } from './SoulField'
import { InteractionSystem } from './InteractionSystem'
import { InteractionModel } from './InteractionModel'
import { SelectionSystem } from './SelectionSystem'
import { PhysicsSystem } from './PhysicsSystem'
import { CameraController } from './Camera'
import {
  drawBackground,
  drawSouls,
  drawHoverLabel,
  drawSelectionInfo,
  drawConnectionLines,
  drawClusterLabels,
} from './Renderer'
import { CLUSTERS, LABEL_FADE_ZOOM } from './types'
import type { Soul } from './types'

const CLICK_DRAG_THRESHOLD = 4
const DBLCLICK_TIME = 400

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const soulsRef = useRef<Soul[]>([])
  const gridRef = useRef(new SpatialGrid(0.02))
  const physicsRef = useRef(new PhysicsSystem())
  const interactionRef = useRef(new InteractionSystem())
  const modelRef = useRef(new InteractionModel())
  const selectionRef = useRef(new SelectionSystem())
  const cameraRef = useRef(new CameraController())
  const focusActiveRef = useRef(false)

  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rAFRef = useRef(0)
  const lastTimeRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0 })

  const dragStateRef = useRef<{
    active: boolean
    startX: number
    startY: number
    moved: boolean
  }>({ active: false, startX: 0, startY: 0, moved: false })

  const clickStateRef = useRef<{
    lastClickTime: number
    lastClickX: number
    lastClickY: number
  }>({ lastClickTime: 0, lastClickX: 0, lastClickY: 0 })

  const clusterHoverRef = useRef<string | null>(null)

  function setFocusMode(clusterId: string | null) {
    const model = modelRef.current
    const camera = cameraRef.current
    if (clusterId) {
      model.enterFocus(clusterId)
      const { w, h } = sizeRef.current
      if (w > 0 && h > 0) camera.flyToFit(soulsRef.current, clusterId, w, h)
      focusActiveRef.current = true
    } else {
      model.exitFocus()
      camera.restoreState()
      focusActiveRef.current = false
    }
  }

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

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusActiveRef.current) {
        setFocusMode(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)

    function tick(time: number) {
      if (!running) return
      const dt = Math.min(0.05, (time - (lastTimeRef.current || time)) / 1000)
      lastTimeRef.current = time

      const souls = soulsRef.current
      const grid = gridRef.current
      const physics = physicsRef.current
      const model = modelRef.current
      const interaction = interactionRef.current
      const selection = selectionRef.current
      const camera = cameraRef.current
      if (!ctx) return

      const { w, h } = sizeRef.current
      if (w === 0 || h === 0) {
        rAFRef.current = requestAnimationFrame(tick)
        return
      }

      const mouse = mouseRef.current
      const hasMouse = mouse.x >= 0
      const worldMouse = hasMouse ? camera.screenToWorld(mouse.x, mouse.y, w, h) : { x: -9999, y: -9999 }

      interaction.updateMouse(mouse.x, mouse.y, worldMouse.x, worldMouse.y)

      model.updateFocusTransition(dt)

      model.applyClusterExpansion(souls)

      const frozenSet = model.focusPlanet ? new Set([model.focusPlanet]) : new Set<string>()
      physics.tick(dt, souls, worldMouse.x, worldMouse.y, grid, time, frozenSet)

      grid.rebuild(souls)

      if (hasMouse) {
        model.updateHoveredCluster(worldMouse.x, worldMouse.y)
        model.updateSmartHover(grid, worldMouse.x, worldMouse.y, souls)
      } else {
        model.hoveredId = null
        model.hoveredSoul = null
        model.hoveredCluster = null
      }
      model.updateHoverSoulDisplay(souls)
      model.updateHoverLabelOpacity(dt)
      model.updatePlanetDimming(souls)

      selection.tick(dt, souls)

      clusterHoverRef.current = model.hoveredCluster

      camera.tick(dt, w, h)

      // Render
      const dpr = window.devicePixelRatio || 1
      ctx.save()
      ctx.scale(dpr, dpr)

      drawBackground(ctx, w, h, selection.state.bgDim, time)
      drawSouls(ctx, souls, camera, w, h, time, dt, selection.state.soulId, model.hoveredId, 0)
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
        drawHoverLabel(ctx, model.hoveredSoul, model.hoverLabelOpacity)
      }

      ctx.restore()

      rAFRef.current = requestAnimationFrame(tick)
    }

    rAFRef.current = requestAnimationFrame(tick)
    return () => {
      running = false
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      cancelAnimationFrame(rAFRef.current)
    }
  }, [])

  function handleClick(mx: number, my: number) {
    const { w, h } = sizeRef.current
    if (w === 0 || h === 0) return
    const camera = cameraRef.current
    const selection = selectionRef.current
    const model = modelRef.current
    const souls = soulsRef.current
    const grid = gridRef.current

    const worldMouse = camera.screenToWorld(mx, my, w, h)

    // Cluster label click — enter focus mode
    for (const cluster of CLUSTERS) {
      if (cluster.planetRadius === 0) continue
      if (camera.zoom < LABEL_FADE_ZOOM * 0.5) continue
      const labelScreen = camera.worldToScreen(cluster.cx, cluster.cy, w, h)
      const labelY = labelScreen.y - cluster.planetRadius * Math.min(w, h) * camera.zoom - 6
      const dy = my - labelY
      const dx = mx - labelScreen.x
      if (dy > -20 && dy < 4 && Math.abs(dx) < 50) {
        if (model.focusPlanet === cluster.id) return
        setFocusMode(cluster.id)
        return
      }
    }

    // Empty space click while focused — exit focus
    if (focusActiveRef.current) {
      setFocusMode(null)
      return
    }

    if (selection.state.phase === 'displaying') {
      selection.deselect()
      return
    }
    if (selection.state.phase !== 'idle') return

    // Soul selection
    const clicked = findNearestSoul(grid, worldMouse.x, worldMouse.y)
    if (clicked) {
      selection.select(clicked, souls)
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
        cameraRef.current.moveDrag(mx, my, w, h)
      }
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

      if (!isDblClick) {
        handleClick(mx, my)
      }
    }

    dragStateRef.current = { active: false, startX: 0, startY: 0, moved: false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 }
    dragStateRef.current = { active: false, startX: 0, startY: 0, moved: false }
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const { w, h } = sizeRef.current
    if (w > 0 && h > 0) {
      const factor = e.deltaY > 0 ? 0.92 : 1.08
      cameraRef.current.zoomAt(mx, my, factor, w, h)
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

function findNearestSoul(grid: SpatialGrid, wx: number, wy: number): Soul | null {
  const CLICK_RADIUS = 0.08
  const candidates = grid.query(wx, wy, CLICK_RADIUS)
  let best: Soul | null = null
  let bestDist = CLICK_RADIUS
  for (const s of candidates) {
    const dx = s.x - wx
    const dy = s.y - wy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < bestDist) {
      bestDist = dist
      best = s
    }
  }
  return best
}
