import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { easeOutCubic, calculateFlyTarget } from '@/utils/fly-to'
import {
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_AUTO_THRESHOLD,
  ZOOM_DEBOUNCE_MS,
  FLY_DURATION_MS,
  MAP_VIEWBOX_W,
  MAP_VIEWBOX_H,
  MAP_VIEWBOX_CENTER_X,
  MAP_VIEWBOX_CENTER_Y,
} from '@/constants'

export function useMapInteraction(
  flyToTarget: { planetId: string; x: number; y: number } | null | undefined,
  onFlyToDone?: () => void,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const mapGroupRef = useRef<SVGGElement>(null)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const drag = useRef({ isDown: false, startX: 0, startY: 0, wasPan: false, x: 0, y: 0, z: 1 })
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
    const g = mapGroupRef.current
    if (g) g.setAttribute('transform', `translate(${drag.current.x}, ${drag.current.y}) scale(${drag.current.z})`)
  }

  useLayoutEffect(() => {
    drag.current.x = panX
    drag.current.y = panY
    drag.current.z = zoom
    syncTransform()
  }, [zoom, panX, panY])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      let target = e.target as HTMLElement | null
      while (target && target !== el) {
        const style = getComputedStyle(target)
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return
        }
        target = target.parentElement
      }
      e.preventDefault()
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  useEffect(() => {
    if (!flyToTarget) return
    const d = drag.current
    if (flyRafRef.current) {
      cancelAnimationFrame(flyRafRef.current)
      flyRafRef.current = null
    }

    const targetZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, d.z < ZOOM_AUTO_THRESHOLD ? 2 : d.z))
    const target = calculateFlyTarget(flyToTarget.x, flyToTarget.y, targetZoom)
    const startX = d.x
    const startY = d.y
    const startZ = d.z
    const duration = FLY_DURATION_MS
    const startTime = performance.now()
    isFlyingRef.current = true

    function tick(now: number) {
      if (!isFlyingRef.current) return
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      d.x = startX + (target.x - startX) * eased
      d.y = startY + (target.y - startY) * eased
      d.z = startZ + (targetZoom - startZ) * eased
      syncTransform()
      if (progress < 1) {
        flyRafRef.current = requestAnimationFrame(tick)
      } else {
        isFlyingRef.current = false
        flyRafRef.current = null
        setPanX(d.x)
        setPanY(d.y)
        setZoom(d.z)
        if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
        zoomTimerRef.current = null
        onFlyToDone?.()
      }
    }
    flyRafRef.current = requestAnimationFrame(tick)
  }, [flyToTarget, onFlyToDone])

  function resetView() {
    const d = drag.current
    d.x = 0
    d.y = 0
    d.z = 1
    syncTransform()
    setPanX(0)
    setPanY(0)
    setZoom(1)
  }

  function zoomToCenter(newZoom: number) {
    const d = drag.current
    const svgEl = svgRef.current
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom))
    if (clamped !== d.z) {
      const origX = (MAP_VIEWBOX_CENTER_X - d.x) / d.z
      const origY = (MAP_VIEWBOX_CENTER_Y - d.y) / d.z
      d.x = MAP_VIEWBOX_CENTER_X - origX * clamped
      d.y = MAP_VIEWBOX_CENTER_Y - origY * clamped
      d.z = clamped
      syncTransform()
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
      zoomTimerRef.current = setTimeout(() => {
        zoomTimerRef.current = null
        setPanX(d.x)
        setPanY(d.y)
        setZoom(d.z)
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
    const d = drag.current
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, d.z - e.deltaY * 0.001 * d.z))
    if (newZoom !== d.z) {
      const origX = (mouseVX - d.x) / d.z
      const origY = (mouseVY - d.y) / d.z
      d.x = mouseVX - origX * newZoom
      d.y = mouseVY - origY * newZoom
      d.z = newZoom
      syncTransform()
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
      zoomTimerRef.current = setTimeout(() => {
        zoomTimerRef.current = null
        setPanX(d.x)
        setPanY(d.y)
        setZoom(d.z)
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
        const scale = 900 / Math.min(rect.width, rect.height)
        d.x += (e.clientX - d.startX) * scale
        d.y += (e.clientY - d.startY) * scale
        d.startX = e.clientX
        d.startY = e.clientY
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
    setPanX(d.x)
    setPanY(d.y)
    setZoom(d.z)
  }, [])

  return {
    containerRef,
    svgRef,
    mapGroupRef,
    zoom,
    panX,
    panY,
    isPanning,
    drag,
    isFlyingRef,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetView,
    zoomToCenter,
  }
}
