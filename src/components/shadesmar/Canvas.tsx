import { useRef, useEffect, useCallback } from 'react'
import { generateSoulField, SpatialGrid } from './SoulField'
import { InteractionSystem } from './InteractionSystem'
import { SelectionSystem } from './SelectionSystem'
import { drawBackground, drawSouls, drawHoverLabel, drawSelectionInfo, drawConnectionLines } from './Renderer'
import { VIEW_DRIFT_MAX, ZOOM_FACTOR } from './types'
import type { Soul } from './types'

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const soulsRef = useRef<Soul[]>([])
  const gridRef = useRef(new SpatialGrid(120))
  const interactionRef = useRef(new InteractionSystem())
  const selectionRef = useRef(new SelectionSystem())

  const viewXRef = useRef(0)
  const viewYRef = useRef(0)
  const driftPhaseRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const rAFRef = useRef(0)
  const lastTimeRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0 })

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
      if (!ctx) return

      const { w, h } = sizeRef.current
      if (w === 0 || h === 0) {
        rAFRef.current = requestAnimationFrame(tick)
        return
      }

      const z = ZOOM_FACTOR

      driftPhaseRef.current += dt * 0.12
      const targetX = Math.sin(driftPhaseRef.current * 0.7 + 1.3) * VIEW_DRIFT_MAX
      const targetY = Math.cos(driftPhaseRef.current * 0.5 + 0.7) * VIEW_DRIFT_MAX
      viewXRef.current += (targetX - viewXRef.current) * 0.02
      viewYRef.current += (targetY - viewYRef.current) * 0.02

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const cx = w / 2
      const cy = h / 2
      const wx = (mx - cx) / z + viewXRef.current
      const wy = (my - cy) / z + viewYRef.current

      interaction.updateMouse(mx, my, wx, wy)

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

      const dpr = window.devicePixelRatio || 1
      ctx.save()
      ctx.scale(dpr, dpr)

      drawBackground(ctx, w, h, viewXRef.current, viewYRef.current, selection.state.bgDim, time)
      drawSouls(
        ctx,
        souls,
        w,
        h,
        viewXRef.current,
        viewYRef.current,
        time,
        selection.state.soulId,
        interaction.hoveredId,
        interaction.rippleRadius,
      )

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

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const onPointerLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 }
  }, [])

  const onClick = useCallback(() => {
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
    if (clicked) selection.select(clicked, souls)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full touch-none"
      style={{ background: '#050508', cursor: 'default' }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
    />
  )
}
