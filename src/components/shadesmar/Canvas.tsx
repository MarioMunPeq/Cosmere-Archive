import { useRef, useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateSoulField, SpatialGrid } from './SoulField'
import { InteractionSystem } from './InteractionSystem'
import { InteractionModel } from './InteractionModel'
import { SelectionSystem } from './SelectionSystem'
import { PhysicsSystem } from './PhysicsSystem'
import { CameraController } from './Camera'
import { createPointerTracker } from './Pointers'
import ShadesmarHud from './ShadesmarHud'
import ShadesmarOverlay from './ShadesmarOverlay'
import { drawBackground, drawSouls, drawConnectionLines, getScreenPos } from './Renderer'
import { shadesmarStore, describeSoul, registerRealms } from './store'
import type { SoulInfo } from './store'
import { CLUSTERS, CLUSTER_RADIUS, PINCH_ZOOM_MIN_STEP, WHEEL_ZOOM_IN, WHEEL_ZOOM_OUT } from './types'
import type { Soul } from './types'
import ALL_CHARACTERS from '@/data/generated/characters.json'

/** Souls that have a `/characters` record to open. */
const HAS_RECORD = new Set(ALL_CHARACTERS.map((c) => c.id))

const hasRecord = (id: string) => HAS_RECORD.has(id)

export function Canvas() {
  const navigate = useNavigate()
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

  /* ------------------------------------------------------------------ input */

  const pointersRef = useRef(createPointerTracker())
  /**
   * The pinch midpoint on the previous move.
   *
   * A pinch zooms *and* travels: the fingers can come apart without moving and
   * can move without separating, and the camera has to follow both. The
   * midpoint's travel is measured against the last frame's, because by the
   * time a second finger lands the world may already have panned under it.
   */
  const pinchMidRef = useRef<{ x: number; y: number } | null>(null)
  const [focusedRealm, setFocusedRealm] = useState<string | null>(null)

  /**
   * Zoom about the canvas centre, for the HUD and the keyboard.
   *
   * A ref because the keydown listener is installed once, with `[]`, and would
   * otherwise close over the first render's props.
   */
  const hudZoomRef = useRef<(factor: number) => void>(() => {})

  /**
   * Every soul as the DOM describes it, built once.
   *
   * The soul list (S.3) needs all 95 with their names, realms and descriptions.
   * Building it from the same `Soul` objects the canvas draws means the list and
   * the ocean can never disagree about who exists.
   */
  const [soulList, setSoulList] = useState<SoulInfo[]>([])

  function setFocusMode(clusterId: string | null) {
    const model = modelRef.current
    const camera = cameraRef.current
    shadesmarStore.setFocusedRealm(clusterId)
    if (clusterId) {
      model.enterFocus(clusterId)
      const { w, h } = sizeRef.current
      if (w > 0 && h > 0) camera.flyToFit(soulsRef.current, clusterId, w, h)
      focusActiveRef.current = true
      setFocusedRealm(clusterId)
    } else {
      model.exitFocus()
      camera.restoreState()
      focusActiveRef.current = false
      setFocusedRealm(null)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    soulsRef.current = generateSoulField()
    gridRef.current.rebuild(soulsRef.current)
    cameraRef.current.resetToOverview()
    registerRealms(CLUSTERS)
    setSoulList(soulsRef.current.filter((s) => s.name).map((s) => describeSoul(s, hasRecord)))

    let running = true

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      // `Math.min(devicePixelRatio, 2)`: at 3x the same drawing costs 2.25x the
      // fill rate for detail nobody can see on a page of glowing dots.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      sizeRef.current = { w: rect.width, h: rect.height }
      cameraRef.current.resize(rect.width, rect.height)
    }
    resize()
    window.addEventListener('resize', resize)

    /*
     * The test surface for criterion S.1.
     *
     * S.1 asks for the realm grid to occupy a measured fraction of the viewport
     * at five resolutions. A screenshot cannot be measured that precisely, so the
     * camera exposes where it actually put things and the criterion reads it.
     * It reports the live camera rather than recomputing `realmBounds` and the
     * fit formula, because a test that re-derives the arithmetic it is checking
     * only proves that the arithmetic is self-consistent.
     */
    const probe = {
      bounds: () => {
        const { w, h } = sizeRef.current
        return cameraRef.current.bounds(w, h)
      },
      ratio: () => {
        const { w, h } = sizeRef.current
        return cameraRef.current.boundsRatio(w, h)
      },
      zoom: () => cameraRef.current.zoom,
      souls: () => soulsRef.current.length,
      clusters: () => CLUSTERS.map((c) => ({ id: c.id, cx: c.cx, cy: c.cy, radius: c.radius })),
      worldToScreen: (wx: number, wy: number, w: number, h: number) => cameraRef.current.worldToScreen(wx, wy, w, h),
      viewport: () => ({ ...sizeRef.current }),
      /* A zoom must hold the point under the cursor still, so the test needs to
       * ask where that point is in world terms before and after. */
      screenToWorld: (sx: number, sy: number) => {
        const { w, h } = sizeRef.current
        return cameraRef.current.screenToWorld(sx, sy, w, h)
      },
      /* Where the selected bead is, canvas-relative. S.6 measures the gap from
       * this and not from the click: the click lands near a bead, not on the
       * one that was selected, and the difference is larger than the 28px being
       * checked. */
      selectedScreen: () => {
        const id = selectionRef.current.state.soulId
        return id ? (getScreenPos(id) ?? null) : null
      },
      /* Which realm a screen point falls in, for S.5's tap-to-focus. */
      realmAt: (sx: number, sy: number) => {
        const { w, h } = sizeRef.current
        if (w === 0 || h === 0) return null
        const world = cameraRef.current.screenToWorld(sx, sy, w, h)
        return realmAtWorld(world.x, world.y)?.id ?? null
      },
      focused: () => focusActiveRef.current,
    }
    ;(window as unknown as { __shadesmar: typeof probe }).__shadesmar = probe

    const onKeyDown = (e: KeyboardEvent) => {
      // `+`, `-`, `0` as well as Escape: a keyboard is a third input device and
      // the HUD is its mouse equivalent.
      if (focusActiveRef.current && e.key === 'Escape') {
        setFocusMode(null)
        return
      }
      if (e.key === '+' || e.key === '=') hudZoomRef.current(WHEEL_ZOOM_IN)
      if (e.key === '-' || e.key === '_') hudZoomRef.current(WHEEL_ZOOM_OUT)
      if (e.key === '0') cameraRef.current.resetToOverview()
    }
    window.addEventListener('keydown', onKeyDown)

    function tick(time: number) {
      if (!running) return
      if (document.hidden) {
        rAFRef.current = requestAnimationFrame(tick)
        return
      }
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

      /*
       * §5.5.4: the grid is rebuilt only when a soul has actually changed cell,
       * not sixty times a second. `update` returns whether it rebuilt, which is
       * what the perf test in `scripts/perf-shadesmar.ts` reads.
       */
      grid.update(souls)

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

      camera.tick(dt, w, h)

      // Render
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      ctx.save()
      ctx.scale(dpr, dpr)

      drawBackground(ctx, w, h, selection.state.bgDim, time)
      drawSouls(ctx, souls, camera, w, h, time, dt, selection.state.soulId, model.hoveredId, 0)
      drawConnectionLines(ctx, selection.state, souls, time)

      /*
       * Publish to the DOM.
       *
       * This is the seam §5.5.3 draws: the canvas has finished drawing its
       * light, `getScreenPos` now knows where every visible soul landed this
       * frame, and the words about them belong in the document.
       *
       * Both updates are cheap and mostly no-ops. `setHovered` compares ids, and
       * `setSelected` only notifies when the selection changes rather than when
       * the bead drifts — a selection that re-rendered at 60Hz would remount its
       * own "View record" link sixty times a second.
       */
      const liveSelection = selection.state.soulId ? selection.getSelectedSoul(souls) : null
      shadesmarStore.setHovered(
        model.hoveredSoul && model.hoverLabelOpacity > 0.05 ? describeSoul(model.hoveredSoul, hasRecord) : null,
      )
      shadesmarStore.setSelected(
        liveSelection && liveSelection.name
          ? { ...describeSoul(liveSelection, hasRecord), ...(getScreenPos(liveSelection.id) ?? { x: 0, y: 0 }) }
          : null,
      )

      ctx.restore()

      rAFRef.current = requestAnimationFrame(tick)
    }

    rAFRef.current = requestAnimationFrame(tick)
    return () => {
      running = false
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      cancelAnimationFrame(rAFRef.current)
      delete (window as unknown as { __shadesmar?: unknown }).__shadesmar
      // The store is a module singleton. Leaving the route without clearing it
      // would leave the next visit showing the last soul you looked at, with
      // screen coordinates from a window that no longer exists.
      shadesmarStore.reset()
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

    /*
     * The order matters, and getting it wrong is invisible until you try it.
     *
     * A realm's name is the target §5.5.2 asks for, but the hit box is the
     * constellation rather than the drawn label: the label is a rectangle of
     * pixels whose size changes with zoom, and a reader aims at the cluster of
     * lights. `realmAtWorld`, not a screen-space wrapper — `worldMouse` is
     * already in world units.
     */
    const realm = realmAtWorld(worldMouse.x, worldMouse.y)
    const clicked = findNearestSoul(grid, worldMouse.x, worldMouse.y)

    // Already inside the realm you are in? Then this is not "leave the realm" —
    // it is a click on one of its souls. The previous order exited focus here,
    // so the second click inside a realm could never open its inspector.
    if (realm && model.focusPlanet !== realm.id) {
      setFocusMode(realm.id)
      return
    }

    if (clicked) {
      shadesmarStore.setSelected(null)
      selection.select(clicked, souls)
      return
    }

    // Nothing under the pointer: empty space. While focused, that means leave.
    if (focusActiveRef.current) {
      setFocusMode(null)
      return
    }

    if (selection.state.phase === 'displaying') {
      selection.deselect()
      shadesmarStore.setSelected(null)
      return
    }
  }

  /**
   * Open a soul's record. §5.5.2 routes double-click and double-tap here.
   *
   * Only records that exist are navigable. A herald is a soul with a name and a
   * surge list but no `/characters` entry, so the gesture on one of those does
   * nothing rather than routing to a 404 — the reader is looking at something
   * with no record behind it, and the page should say so by not pretending
   * otherwise. §5.5.3 replaces this with a "View record" link that only appears
   * when there is one.
   */
  function openRecord(mx: number, my: number) {
    const { w, h } = sizeRef.current
    if (w === 0 || h === 0) return
    const world = cameraRef.current.screenToWorld(mx, my, w, h)
    const soul = findNearestSoul(gridRef.current, world.x, world.y)
    const id = soul?.entityId?.replace(/^soul_/, '')
    if (!id || !HAS_RECORD.has(id)) return
    navigate(`/characters?character=${id}`)
  }

  /** Page coordinates to canvas-relative ones; the canvas is not at the origin. */
  const localPoint = useCallback((e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return null
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const p = localPoint(e)
      if (!p) return
      mouseRef.current = p

      pointersRef.current.down_(e.pointerId, p.x, p.y, performance.now())

      if (pointersRef.current.panning) {
        cameraRef.current.startDrag(p.x, p.y)
      } else if (pointersRef.current.pinching) {
        // A second finger landed. The drag started by the first has to be
        // abandoned, or its inertia fires the moment the pinch ends and throws
        // the world sideways.
        cameraRef.current.endDrag()
        cameraRef.current.stopInertia()
        pinchMidRef.current = null
      }
    },
    [localPoint],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const p = localPoint(e)
      if (!p) return
      mouseRef.current = p

      const gesture = pointersRef.current.move_(e.pointerId, p.x, p.y)
      const { w, h } = sizeRef.current
      if (w === 0 || h === 0) return

      if (gesture.kind === 'pan') {
        cameraRef.current.moveDrag(p.x, p.y, w, h)
        return
      }

      if (gesture.kind !== 'pinch') return

      // A pinch zooms about its own midpoint *and* travels with it. Both, and in
      // this order: the zoom first, so the midpoint's travel is measured against
      // the scale it is happening at.
      if (gesture.factor > PINCH_ZOOM_MIN_STEP) {
        cameraRef.current.zoomAt(gesture.cx, gesture.cy, gesture.factor, w, h)
      }
      const last = pinchMidRef.current
      if (last) cameraRef.current.panBy(gesture.cx - last.x, gesture.cy - last.y, w, h)
      pinchMidRef.current = { x: gesture.cx, y: gesture.cy }
    },
    [localPoint],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const p = localPoint(e)
    if (!p) return

    const gesture = pointersRef.current.up_(e.pointerId)
    cameraRef.current.endDrag()

    if (!pointersRef.current.pinching) pinchMidRef.current = null

    switch (gesture.kind) {
      case 'tap':
        handleClick(p.x, p.y)
        break
      case 'doubleTap':
        openRecord(p.x, p.y)
        break
      default:
        break
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 }
  }, [])

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    pointersRef.current.cancel(e.pointerId)
    cameraRef.current.endDrag()
    pinchMidRef.current = null
  }, [])

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const p = localPoint(e)
      if (!p) return
      const { w, h } = sizeRef.current
      if (w > 0 && h > 0) {
        const factor = e.deltaY > 0 ? WHEEL_ZOOM_OUT : WHEEL_ZOOM_IN
        cameraRef.current.zoomAt(p.x, p.y, factor, w, h)
      }
    },
    [localPoint],
  )

  /* ---- HUD and keyboard ------------------------------------------------- */

  const zoomAboutCentre = useCallback((factor: number) => {
    const { w, h } = sizeRef.current
    if (w === 0 || h === 0) return
    cameraRef.current.zoomAt(w / 2, h / 2, factor, w, h)
  }, [])

  /* The keydown listener is installed once with `[]`, so it reaches the zoom
   * through a ref rather than closing over the first render's closure. */
  useEffect(() => {
    hudZoomRef.current = zoomAboutCentre
  }, [zoomAboutCentre])

  const goToOverview = useCallback(() => {
    // Leave focus without scheduling the 600ms flight, then go to the
    // overview: doing both meant a flight to the exit state starting on the
    // same frame as the reset that was supposed to replace it.
    modelRef.current.exitFocus()
    focusActiveRef.current = false
    setFocusedRealm(null)
    shadesmarStore.setFocusedRealm(null)
    cameraRef.current.resetToOverview()
  }, [])

  const leaveFocus = useCallback(() => setFocusMode(null), [])

  /** The legend's `flyToFit`, and its own way back out. */
  const focusRealm = useCallback((id: string | null) => setFocusMode(id), [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="block w-full h-full touch-none"
        style={{ background: '#050508', cursor: 'default' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerCancel}
        onWheel={onWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
      <ShadesmarHud
        onZoom={zoomAboutCentre}
        onOverview={goToOverview}
        onBack={leaveFocus}
        focusedRealm={focusedRealm}
      />
      <ShadesmarOverlay
        souls={soulList}
        onFocusRealm={focusRealm}
        onCloseInspector={() => {
          selectionRef.current.deselect()
          shadesmarStore.setSelected(null)
        }}
      />
    </>
  )
}

/**
 * The realm whose constellation contains a world point, if any.
 *
 * Module-level and pure: it needs no camera, no souls and no state, so the tap
 * handler, the probe and any future keyboard path can all ask the same question
 * and get the same answer.
 */
export function realmAtWorld(wx: number, wy: number) {
  // The reach scales with the cluster, not the screen, so a tap keeps meaning
  // the same thing at every zoom: a fixed fraction of the constellation itself.
  const reach = CLUSTER_RADIUS * 1.6
  for (const cluster of CLUSTERS) {
    if (cluster.planetRadius === 0) continue
    const dx = wx - cluster.cx
    const dy = wy - cluster.cy
    if (dx * dx + dy * dy < reach * reach) return cluster
  }
  return null
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
