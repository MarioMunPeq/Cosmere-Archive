import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react'
import {
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_DEBOUNCE_MS,
  MAP_VIEWBOX_W,
  MAP_VIEWBOX_H,
  MAP_VIEWBOX_CENTER_X,
  MAP_VIEWBOX_CENTER_Y,
} from '@/constants'

export interface CameraState {
  x: number
  y: number
  zoom: number
  rot: number
  tilt: number
}

export function cameraMatrix(state: CameraState): string {
  const cosR = Math.cos(state.rot)
  const sinR = Math.sin(state.rot)
  return `matrix(${state.zoom * cosR}, ${state.zoom * sinR}, ${-state.zoom * sinR}, ${state.zoom * cosR}, ${state.x}, ${state.y})`
}

export function parallaxOffset(state: CameraState, factor: number): string {
  if (factor === 1 || state.zoom === 0) return ''
  const cx = (state.x * (factor - 1)) / state.zoom
  const cy = (state.y * (factor - 1)) / state.zoom
  return `translate(${cx}, ${cy})`
}

export function calculateFlyTarget(planetX: number, planetY: number, targetZoom: number): { x: number; y: number } {
  return {
    x: MAP_VIEWBOX_CENTER_X - planetX * targetZoom,
    y: MAP_VIEWBOX_CENTER_Y - planetY * targetZoom,
  }
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function cinematicEase(t: number): number {
  const base = easeInOutCubic(t)
  if (t > 0.9) {
    const phase = (t - 0.9) / 0.1
    const decay = 1 - phase
    return base + 0.02 * decay * Math.sin(phase * Math.PI)
  }
  return base
}

export function useCamera(
  flyToTarget: { planetId: string; x: number; y: number } | null | undefined,
  onFlyToDone?: () => void,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const cameraGroupRef = useRef<SVGGElement>(null)

  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, zoom: 1, rot: 0, tilt: 0 })
  const [isPanning, setIsPanning] = useState(false)

  const camRef = useRef<CameraState>({ x: 0, y: 0, zoom: 1, rot: 0, tilt: 0 })
  const drag = useRef({ isDown: false, startX: 0, startY: 0, wasPan: false })
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panRafRef = useRef<number | null>(null)
  const flyRafRef = useRef<number | null>(null)
  const isFlyingRef = useRef(false)

  useEffect(() => {
    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
      if (panRafRef.current) cancelAnimationFrame(panRafRef.current)
      if (flyRafRef.current) cancelAnimationFrame(flyRafRef.current)
    }
  }, [])

  function syncTransform() {
    const g = cameraGroupRef.current
    if (g) g.setAttribute('transform', cameraMatrix(camRef.current))
  }

  useLayoutEffect(() => {
    camRef.current = camera
    syncTransform()
  }, [camera])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      let target = e.target as HTMLElement | null
      while (target && target !== el) {
        const style = getComputedStyle(target)
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') return
        target = target.parentElement
      }
      e.preventDefault()
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  useEffect(() => {
    if (!flyToTarget) return
    const c = camRef.current
    if (flyRafRef.current) {
      cancelAnimationFrame(flyRafRef.current)
      flyRafRef.current = null
    }

    const targetZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, c.zoom < 1.5 ? 2 : c.zoom))
    const target = calculateFlyTarget(flyToTarget.x, flyToTarget.y, targetZoom)
    const startX = c.x
    const startY = c.y
    const startZoom = c.zoom
    const dist = Math.hypot(target.x - startX, target.y - startY)
    const duration = Math.max(700, Math.min(1400, dist * 2.5))
    const startTime = performance.now()
    isFlyingRef.current = true

    function tick(now: number) {
      if (!isFlyingRef.current) return
      const elapsed = now - startTime
      const rawProgress = Math.min(elapsed / duration, 1)
      const eased = cinematicEase(rawProgress)

      const pullBack = 1 - 0.15 * Math.sin(eased * Math.PI) * (1 - eased)

      c.x = startX + (target.x - startX) * eased
      c.y = startY + (target.y - startY) * eased
      c.zoom = startZoom + (targetZoom - startZoom) * eased * pullBack
      c.rot = 0.015 * Math.sin(eased * Math.PI * 2) * (1 - eased)
      c.tilt = 2.5 * Math.sin(eased * Math.PI) * (eased < 0.95 ? 1 : 1 - (eased - 0.95) / 0.05)

      syncTransform()

      if (rawProgress < 1) {
        flyRafRef.current = requestAnimationFrame(tick)
      } else {
        c.rot = 0
        c.tilt = 0
        c.x = target.x
        c.y = target.y
        c.zoom = targetZoom
        syncTransform()
        isFlyingRef.current = false
        flyRafRef.current = null
        if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
        zoomTimerRef.current = null
        setCamera({ ...c })
        onFlyToDone?.()
      }
    }
    flyRafRef.current = requestAnimationFrame(tick)
  }, [flyToTarget, onFlyToDone])

  function resetView() {
    const c = camRef.current
    c.x = 0
    c.y = 0
    c.zoom = 1
    c.rot = 0
    c.tilt = 0
    syncTransform()
    setCamera({ ...c })
  }

  function zoomToCenter(newZoom: number) {
    const c = camRef.current
    const svgEl = svgRef.current
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom))
    if (clamped !== c.zoom) {
      const origX = (MAP_VIEWBOX_CENTER_X - c.x) / c.zoom
      const origY = (MAP_VIEWBOX_CENTER_Y - c.y) / c.zoom
      c.x = MAP_VIEWBOX_CENTER_X - origX * clamped
      c.y = MAP_VIEWBOX_CENTER_Y - origY * clamped
      c.zoom = clamped
      syncTransform()
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
      zoomTimerRef.current = setTimeout(() => {
        zoomTimerRef.current = null
        setCamera({ ...c })
      }, ZOOM_DEBOUNCE_MS)
    }
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const svgEl = svgRef.current
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    const svgW = rect.width
    const svgH = rect.height
    if (svgW === 0 || svgH === 0) return
    const mouseVX = ((e.clientX - rect.left) / svgW) * MAP_VIEWBOX_W
    const mouseVY = ((e.clientY - rect.top) / svgH) * MAP_VIEWBOX_H
    const c = camRef.current
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, c.zoom - e.deltaY * 0.001 * c.zoom))
    if (newZoom !== c.zoom) {
      const origX = (mouseVX - c.x) / c.zoom
      const origY = (mouseVY - c.y) / c.zoom
      c.x = mouseVX - origX * newZoom
      c.y = mouseVY - origY * newZoom
      c.zoom = newZoom
      syncTransform()
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
      zoomTimerRef.current = setTimeout(() => {
        zoomTimerRef.current = null
        setCamera({ ...c })
      }, ZOOM_DEBOUNCE_MS)
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isFlyingRef.current) {
        isFlyingRef.current = false
        if (flyRafRef.current) {
          cancelAnimationFrame(flyRafRef.current)
          flyRafRef.current = null
        }
        onFlyToDone?.()
      }
      const d = drag.current
      d.isDown = true
      d.startX = e.clientX
      d.startY = e.clientY
      d.wasPan = false
    },
    [onFlyToDone],
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current
    if (!d.isDown || e.buttons !== 1) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.wasPan && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      d.wasPan = true
      setIsPanning(true)
    }
    if (d.wasPan) {
      if (panRafRef.current) return
      panRafRef.current = requestAnimationFrame(() => {
        panRafRef.current = null
        const svgEl = svgRef.current
        if (!svgEl) return
        const rect = svgEl.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return
        const scaleVal = MAP_VIEWBOX_W / Math.min(rect.width, rect.height)
        const c = camRef.current
        c.x += (e.clientX - drag.current.startX) * scaleVal
        c.y += (e.clientY - drag.current.startY) * scaleVal
        drag.current.startX = e.clientX
        drag.current.startY = e.clientY
        syncTransform()
      })
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    const d = drag.current
    d.isDown = false
    setIsPanning(false)
    if (panRafRef.current) {
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = null
    }
    setCamera({ ...camRef.current })
  }, [])

  return {
    containerRef,
    svgRef,
    cameraGroupRef,
    camera,
    isPanning,
    camRef,
    isFlyingRef,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetView,
    zoomToCenter,
  }
}
