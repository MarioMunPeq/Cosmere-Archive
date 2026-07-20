'use client'
import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

type CamMode = 'intro' | 'free' | 'fly_to' | 'focus' | 'return'

const PHI_MIN = 0.1
const PHI_MAX = 1.35
const DIST_MIN = 7
const DIST_MAX = 28
const FOV_DEFAULT = 48
const FOV_FOCUS = 38
const DAMP_BASE = 0.92
const INTRO_DURATION = 3.0
const FLY_DURATION = 1.6
const FLY_DURATION_SLOW = 3.2
const RETURN_DURATION = 1.2
const SETTLE_DELAY = 0.4
const IDLE_DELAY = 20
const IDLE_SPEED = 0.015
const MOUSE_SENSITIVITY = 0.006
const WHEEL_SENSITIVITY = 0.008
const SWAY_AMP = 0.003
const SWAY_FREQ = 0.3
const DBL_CLICK_MS = 350
const DBL_CLICK_DIST = 8

export interface FocusTarget {
  id: string
  position: [number, number, number]
  slow?: boolean
}

export interface SoundEvents {
  onFocusSword?: () => void
  onLeaveSword?: () => void
  onHoverSword?: () => void
  onReturnOverview?: () => void
}

interface Props {
  focusTarget: FocusTarget | null
  onFlySettled: () => void
  soundEvents?: SoundEvents
}

interface OrbitState {
  mode: CamMode
  theta: number
  phi: number
  dist: number
  target: THREE.Vector3
  fov: number
  vTheta: number
  vPhi: number
  vDist: number
  vTarget: THREE.Vector3
  introProgress: number
  flyStart: null | { theta: number; phi: number; dist: number; target: [number, number, number]; fov: number }
  flyEnd: null | { theta: number; phi: number; dist: number; target: [number, number, number]; fov: number }
  flyProgress: number
  flyDuration: number
  flySettleTimer: number
  flySettled: boolean
  returnStart: null | { theta: number; phi: number; dist: number; target: [number, number, number]; fov: number }
  returnProgress: number
  idleTimer: number
  activeTheta: number
  mouseDown: boolean
  rightDown: boolean
  lastX: number
  lastY: number
  prevDeltaX: number
  prevDeltaY: number
  doubleClickTimer: number
  doubleClickPos: { x: number; y: number }
}

function createInitialState(): OrbitState {
  return {
    mode: 'intro',
    theta: 0,
    phi: 0.6,
    dist: 15,
    target: new THREE.Vector3(0, 0, 0),
    fov: FOV_DEFAULT,
    vTheta: 0,
    vPhi: 0,
    vDist: 0,
    vTarget: new THREE.Vector3(0, 0, 0),
    introProgress: 0,
    flyStart: null,
    flyEnd: null,
    flyProgress: 0,
    flyDuration: FLY_DURATION,
    flySettleTimer: 0,
    flySettled: false,
    returnStart: null,
    returnProgress: 0,
    idleTimer: 0,
    activeTheta: 0,
    mouseDown: false,
    rightDown: false,
    lastX: 0,
    lastY: 0,
    prevDeltaX: 0,
    prevDeltaY: 0,
    doubleClickTimer: 0,
    doubleClickPos: { x: -9999, y: -9999 },
  }
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function updateFree(ctrl: OrbitState, delta: number) {
  const damp = Math.pow(DAMP_BASE, delta * 60)
  ctrl.vTheta *= damp
  ctrl.vPhi *= damp
  ctrl.vDist *= damp
  ctrl.vTarget.multiplyScalar(damp)

  ctrl.theta += ctrl.vTheta * delta
  ctrl.phi += ctrl.vPhi * delta
  ctrl.dist += ctrl.vDist * delta
  ctrl.target.x += ctrl.vTarget.x * delta
  ctrl.target.y += ctrl.vTarget.y * delta
  ctrl.target.z += ctrl.vTarget.z * delta

  ctrl.phi = Math.max(PHI_MIN, Math.min(PHI_MAX, ctrl.phi))
  ctrl.dist = Math.max(DIST_MIN, Math.min(DIST_MAX, ctrl.dist))

  ctrl.idleTimer += delta
  if (ctrl.idleTimer > IDLE_DELAY) {
    ctrl.activeTheta += IDLE_SPEED * delta
    ctrl.theta += IDLE_SPEED * delta
    ctrl.phi += Math.sin(ctrl.activeTheta * SWAY_FREQ) * 0.001
    ctrl.phi = Math.max(PHI_MIN, Math.min(PHI_MAX, ctrl.phi))
  }
}

function updateIntro(ctrl: OrbitState, delta: number) {
  ctrl.introProgress += delta / INTRO_DURATION
  const p = Math.min(ctrl.introProgress, 1)
  const t = easeOutCubic(p)

  const startTheta = 0.8
  const startPhi = 1.3
  const startDist = 22

  ctrl.theta = startTheta + (0 - startTheta) * t
  ctrl.phi = startPhi + (0.6 - startPhi) * t
  ctrl.dist = startDist + (15 - startDist) * t
  ctrl.fov = FOV_DEFAULT

  if (p >= 1) {
    ctrl.mode = 'free'
    ctrl.theta = 0
    ctrl.phi = 0.6
    ctrl.dist = 15
  }
}

function startFlyTo(ctrl: OrbitState, target: FocusTarget, soundEvents?: SoundEvents) {
  soundEvents?.onFocusSword?.()
  const bx = target.position[0]
  const bz = target.position[2]
  const bladeR = Math.sqrt(bx * bx + bz * bz)

  const focusDist = target.slow ? 5 : 4
  const nx = bladeR > 0.001 ? bx / bladeR : 0
  const nz = bladeR > 0.001 ? bz / bladeR : 0
  const cx = bx + nx * focusDist
  const cy = 3.0
  const cz = bz + nz * focusDist

  const lx = bx
  const ly = 2.5
  const lz = bz

  const dx = cx - lx
  const dy = cy - ly
  const dz = cz - lz
  const d = Math.sqrt(dx * dx + dy * dy + dz * dz)

  const endTheta = Math.atan2(dx, dz)
  const endPhi = Math.asin(Math.max(-1, Math.min(1, dy / d)))

  ctrl.flyStart = {
    theta: ctrl.theta,
    phi: ctrl.phi,
    dist: ctrl.dist,
    target: [ctrl.target.x, ctrl.target.y, ctrl.target.z],
    fov: ctrl.fov,
  }

  ctrl.flyEnd = {
    theta: endTheta,
    phi: endPhi,
    dist: d,
    target: [lx, ly, lz],
    fov: FOV_FOCUS,
  }

  ctrl.flyProgress = 0
  ctrl.flyDuration = target.slow ? FLY_DURATION_SLOW : FLY_DURATION
  ctrl.flySettleTimer = 0
  ctrl.flySettled = false
  ctrl.mode = 'fly_to'
}

function updateFlyTo(ctrl: OrbitState, delta: number, onFlySettled: () => void) {
  ctrl.flyProgress += delta / ctrl.flyDuration
  const p = Math.min(ctrl.flyProgress, 1)
  const t = easeInOutQuad(p)

  const start = ctrl.flyStart!
  const end = ctrl.flyEnd!

  ctrl.theta = start.theta + (end.theta - start.theta) * t
  ctrl.phi = start.phi + (end.phi - start.phi) * t
  ctrl.dist = start.dist + (end.dist - start.dist) * t
  ctrl.target.set(
    start.target[0] + (end.target[0] - start.target[0]) * t,
    start.target[1] + (end.target[1] - start.target[1]) * t,
    start.target[2] + (end.target[2] - start.target[2]) * t,
  )
  ctrl.fov = start.fov + (end.fov - start.fov) * t

  if (p >= 1) {
    ctrl.theta = end.theta
    ctrl.phi = end.phi
    ctrl.dist = end.dist
    ctrl.target.set(end.target[0], end.target[1], end.target[2])
    ctrl.fov = end.fov

    ctrl.flySettleTimer += delta
    if (ctrl.flySettleTimer >= SETTLE_DELAY && !ctrl.flySettled) {
      ctrl.flySettled = true
      ctrl.mode = 'focus'
      onFlySettled()
    }
  }
}

function updateFocus(ctrl: OrbitState, delta: number) {
  const swayT = performance.now() / 1000
  ctrl.theta += Math.sin(swayT * SWAY_FREQ) * SWAY_AMP * delta * 60
  ctrl.phi += Math.cos(swayT * SWAY_FREQ * 0.7) * SWAY_AMP * 0.6 * delta * 60
  ctrl.phi = Math.max(PHI_MIN, Math.min(PHI_MAX, ctrl.phi))

  const damp = Math.pow(DAMP_BASE, delta * 60)
  ctrl.vTheta *= damp
  ctrl.vPhi *= damp
}

function startReturn(ctrl: OrbitState, soundEvents?: SoundEvents) {
  soundEvents?.onReturnOverview?.()
  ctrl.returnStart = {
    theta: ctrl.theta,
    phi: ctrl.phi,
    dist: ctrl.dist,
    target: [ctrl.target.x, ctrl.target.y, ctrl.target.z],
    fov: ctrl.fov,
  }
  ctrl.returnProgress = 0
  ctrl.mode = 'return'
}

function updateReturn(ctrl: OrbitState, delta: number) {
  ctrl.returnProgress += delta / RETURN_DURATION
  const p = Math.min(ctrl.returnProgress, 1)
  const t = easeInOutQuad(p)

  const endTheta = 0
  const endPhi = 0.6
  const endDist = 15
  const defaultTarget: [number, number, number] = [0, 0, 0]
  const defaultFov = FOV_DEFAULT

  const start = ctrl.returnStart!

  ctrl.theta = start.theta + (endTheta - start.theta) * t
  ctrl.phi = start.phi + (endPhi - start.phi) * t
  ctrl.dist = start.dist + (endDist - start.dist) * t
  ctrl.target.set(
    start.target[0] + (defaultTarget[0] - start.target[0]) * t,
    start.target[1] + (defaultTarget[1] - start.target[1]) * t,
    start.target[2] + (defaultTarget[2] - start.target[2]) * t,
  )
  ctrl.fov = start.fov + (defaultFov - start.fov) * t

  if (p >= 1) {
    ctrl.mode = 'free'
    ctrl.theta = endTheta
    ctrl.phi = endPhi
    ctrl.dist = endDist
    ctrl.target.set(0, 0, 0)
    ctrl.fov = defaultFov
  }
}

function applyCamera(camera: THREE.PerspectiveCamera, ctrl: OrbitState) {
  const target = ctrl.target
  camera.position.set(
    target.x + ctrl.dist * Math.cos(ctrl.phi) * Math.sin(ctrl.theta),
    target.y + ctrl.dist * Math.sin(ctrl.phi),
    target.z + ctrl.dist * Math.cos(ctrl.phi) * Math.cos(ctrl.theta),
  )
  camera.lookAt(target.x, target.y, target.z)
  camera.fov = ctrl.fov
  camera.updateProjectionMatrix()
}

export default function CameraRig({ focusTarget, onFlySettled, soundEvents }: Props) {
  const { camera, gl } = useThree()
  const cRef = useRef<OrbitState>(createInitialState())

  const onFlySettledRef = useRef(onFlySettled)
  useEffect(() => {
    onFlySettledRef.current = onFlySettled
  })

  const soundRef = useRef(soundEvents)
  useEffect(() => {
    soundRef.current = soundEvents
  })

  const settleCalled = useRef(false)

  /* Double-click detection — separate from blade click (handled in Scene) */
  const lastClickTime = useRef(0)
  const lastClickPos = useRef({ x: 0, y: 0 })

  /* Keyboard handler */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const c = cRef.current
      if (e.key === 'f' || e.key === 'F') {
        if (c.mode === 'focus' || c.mode === 'fly_to') {
          startReturn(c, soundRef.current)
          settleCalled.current = false
        }
      }
      if (e.key === 'Escape') {
        if (c.mode === 'focus' || c.mode === 'fly_to') {
          startReturn(c, soundRef.current)
          settleCalled.current = false
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  /* ----------------------- Event handlers ------------------------- */
  const handlePointerDown = useCallback((e: PointerEvent) => {
    const c = cRef.current
    if (e.button === 2) {
      c.rightDown = true
    } else {
      c.mouseDown = true
    }
    c.lastX = e.clientX
    c.lastY = e.clientY
    c.prevDeltaX = 0
    c.prevDeltaY = 0
    c.idleTimer = 0

    /* Double-click detection on LMB */
    if (e.button === 0) {
      const now = performance.now()
      const dx = e.clientX - lastClickPos.current.x
      const dy = e.clientY - lastClickPos.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (now - lastClickTime.current < DBL_CLICK_MS && dist < DBL_CLICK_DIST) {
        /* Double-click detected — emit event for Scene to handle focus */
        c.doubleClickTimer = now
        c.doubleClickPos = { x: e.clientX, y: e.clientY }
      }
      lastClickTime.current = now
      lastClickPos.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const c = cRef.current
    if (!c.mouseDown && !c.rightDown) return
    const dx = e.clientX - c.lastX
    const dy = e.clientY - c.lastY
    c.lastX = e.clientX
    c.lastY = e.clientY

    if (c.mode === 'intro') return

    if (c.mode === 'focus' || c.mode === 'fly_to') {
      if (c.mouseDown) {
        c.vTheta += dx * MOUSE_SENSITIVITY * 0.3
        c.vPhi += dy * MOUSE_SENSITIVITY * 0.3
      }
      return
    }

    if (c.mouseDown) {
      c.vTheta += dx * MOUSE_SENSITIVITY
      c.vPhi += dy * MOUSE_SENSITIVITY
      c.prevDeltaX = dx
      c.prevDeltaY = dy
    }
    if (c.rightDown) {
      c.vTarget.x -= dx * 0.015
      c.vTarget.y += dy * 0.015
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    const c = cRef.current
    c.mouseDown = false
    c.rightDown = false
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const c = cRef.current
    if (c.mode === 'intro') return
    c.vDist += e.deltaY * WHEEL_SENSITIVITY
    c.idleTimer = 0
  }, [])

  useEffect(() => {
    const dom = gl.domElement
    dom.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    dom.addEventListener('wheel', handleWheel, { passive: false })
    dom.addEventListener('contextmenu', (e) => e.preventDefault())
    return () => {
      dom.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      dom.removeEventListener('wheel', handleWheel)
    }
  }, [gl, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel])

  const prevTargetRef = useRef<FocusTarget | null>(null)

  useEffect(() => {
    const c = cRef.current
    const prev = prevTargetRef.current
    if (focusTarget && (!prev || prev.id !== focusTarget.id)) {
      startFlyTo(c, focusTarget, soundRef.current)
      settleCalled.current = false
    } else if (!focusTarget && prev) {
      startReturn(c, soundRef.current)
      settleCalled.current = false
    }
    prevTargetRef.current = focusTarget
  }, [focusTarget])

  useFrame((_state, dt) => {
    const delta = Math.min(dt, 0.05)
    const c = cRef.current

    switch (c.mode) {
      case 'intro':
        updateIntro(c, delta)
        break
      case 'free':
        updateFree(c, delta)
        break
      case 'fly_to':
        updateFlyTo(c, delta, onFlySettledRef.current)
        break
      case 'focus':
        updateFocus(c, delta)
        break
      case 'return':
        updateReturn(c, delta)
        break
    }

    applyCamera(camera as THREE.PerspectiveCamera, c)
  })

  return null
}
