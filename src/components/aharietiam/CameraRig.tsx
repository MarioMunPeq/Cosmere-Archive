'use client'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  light: boolean
  reducedMotion: boolean
  /** The blade the reader has opened, if any. */
  focus: { x: number; z: number } | null
  onInteract: () => void
}

interface Orbit {
  theta: number
  phi: number
  dist: number
  targetTheta: number
  targetPhi: number
  targetDist: number
  idle: number
  lastX: number
  lastY: number
  pointers: Map<number, { x: number; y: number }>
  pinch: number | null
  dragging: boolean
}

const TARGET_Y = 1.85
const PHI_MIN = 0.08
const PHI_MAX = 0.98
/** Kept inside half the vertical field of view so the horizon stays in shot. */
const PHI_START = 0.3
const IDLE_DELAY = 6
const IDLE_SPEED = 0.026
const DRAG_SPEED = 0.0034
const ZOOM_STEP = 0.0014
const POINTER_KEYS = new Set(['+', '=', '-', '_'])
const UP = new THREE.Vector3(0, 1, 0)

function createOrbit(light: boolean): Orbit {
  const dist = light ? 23 : 15.6
  return {
    theta: 0.38,
    phi: PHI_START,
    dist,
    targetTheta: 0.38,
    targetPhi: PHI_START,
    targetDist: dist,
    idle: IDLE_DELAY + 2,
    lastX: 0,
    lastY: 0,
    pointers: new Map(),
    pinch: null,
    dragging: false,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function shortestAngle(delta: number): number {
  return Math.atan2(Math.sin(delta), Math.cos(delta))
}

function limits(light: boolean) {
  return light ? { min: 16, max: 37 } : { min: 9.6, max: 27 }
}

function configureCamera(camera: THREE.PerspectiveCamera, light: boolean): void {
  camera.fov = light ? 50 : 48
  camera.near = 0.12
  camera.far = 240
  camera.updateProjectionMatrix()
}

/**
 * Keyboard, wheel, drag and pinch. Kept outside the component because the
 * canvas is a long-lived Three.js object: it is configured once, not re-rendered.
 */
function installControls(
  dom: HTMLCanvasElement,
  orbit: Orbit,
  light: boolean,
  locked: boolean,
  onInteract: () => void,
): () => void {
  const previousTabIndex = dom.getAttribute('tabindex')
  dom.tabIndex = 0
  dom.style.touchAction = 'none'
  dom.style.cursor = locked ? 'default' : 'grab'
  dom.setAttribute(
    'aria-label',
    'The rockbed at Aharietiam. Ten Honorblades stand in a circle. Drag to look around, scroll or pinch to move closer, and use plus or minus to zoom. Use the left and right arrow keys to choose a blade, Enter to open its record, and Escape to step back.',
  )

  const onPointerDown = (event: PointerEvent) => {
    if (locked || event.button !== 0) return
    orbit.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    orbit.lastX = event.clientX
    orbit.lastY = event.clientY
    orbit.dragging = orbit.pointers.size === 1
    orbit.idle = 0
    dom.style.cursor = 'grabbing'
    dom.focus({ preventScroll: true })
    onInteract()
  }

  const onPointerMove = (event: PointerEvent) => {
    if (locked) return
    const pointer = orbit.pointers.get(event.pointerId)
    if (!pointer) return
    pointer.x = event.clientX
    pointer.y = event.clientY

    if (orbit.pointers.size >= 2) {
      const values = [...orbit.pointers.values()]
      const first = values[0]
      const second = values[1]
      if (!first || !second) return
      const distance = Math.hypot(first.x - second.x, first.y - second.y)
      if (orbit.pinch && distance > 1) {
        orbit.targetDist = clamp(orbit.targetDist * (orbit.pinch / distance), limits(light).min, limits(light).max)
      }
      orbit.pinch = distance
      orbit.idle = 0
      return
    }

    if (!orbit.dragging) return
    const dx = event.clientX - orbit.lastX
    const dy = event.clientY - orbit.lastY
    orbit.lastX = event.clientX
    orbit.lastY = event.clientY
    orbit.targetTheta -= dx * DRAG_SPEED
    orbit.targetPhi = clamp(orbit.targetPhi - dy * DRAG_SPEED * 0.8, PHI_MIN, PHI_MAX)
    orbit.idle = 0
  }

  const releasePointer = (event: PointerEvent) => {
    if (locked) return
    orbit.pointers.delete(event.pointerId)
    if (orbit.pointers.size < 2) orbit.pinch = null
    if (orbit.pointers.size === 0) {
      orbit.dragging = false
      dom.style.cursor = 'grab'
    }
  }

  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    if (locked) return
    const range = limits(light)
    orbit.targetDist = clamp(orbit.targetDist * Math.exp(event.deltaY * ZOOM_STEP), range.min, range.max)
    orbit.idle = 0
    onInteract()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (locked || !POINTER_KEYS.has(event.key)) return
    event.preventDefault()
    const range = limits(light)
    switch (event.key) {
      case '+':
      case '=':
        orbit.targetDist = clamp(orbit.targetDist * 0.9, range.min, range.max)
        break
      case '-':
      case '_':
        orbit.targetDist = clamp(orbit.targetDist * 1.1, range.min, range.max)
        break
    }
    orbit.idle = 0
    onInteract()
  }

  const onContextMenu = (event: MouseEvent) => event.preventDefault()

  dom.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerup', releasePointer, { passive: true })
  window.addEventListener('pointercancel', releasePointer, { passive: true })
  dom.addEventListener('wheel', onWheel, { passive: false })
  dom.addEventListener('keydown', onKeyDown)
  dom.addEventListener('contextmenu', onContextMenu)

  return () => {
    dom.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', releasePointer)
    window.removeEventListener('pointercancel', releasePointer)
    dom.removeEventListener('wheel', onWheel)
    dom.removeEventListener('keydown', onKeyDown)
    dom.removeEventListener('contextmenu', onContextMenu)
    dom.style.cursor = ''
    dom.style.touchAction = ''
    if (previousTabIndex === null) dom.removeAttribute('tabindex')
    else dom.setAttribute('tabindex', previousTabIndex)
  }
}

/**
 * The camera rests in a slow orbit. Opening a blade blends it to an
 * inspection pose outside the ring, offset so the record can sit on the right.
 */
export default function CameraRig({ light, reducedMotion, focus, onInteract }: Props) {
  const { camera, gl } = useThree()
  const orbitRef = useRef<Orbit>(createOrbit(light))
  const interactRef = useRef(onInteract)
  const reducedRef = useRef(reducedMotion)
  const focusRef = useRef(focus)
  const lightRef = useRef(light)

  const stateRef = useRef<{
    theta: number
    radius: number
    height: number
    look: THREE.Vector3
    ready: boolean
  }>({
    theta: 0.38,
    radius: 15.6 * Math.cos(PHI_START),
    height: TARGET_Y + 15.6 * Math.sin(PHI_START),
    look: new THREE.Vector3(0, TARGET_Y, 0),
    ready: false,
  })
  const desiredLookRef = useRef(new THREE.Vector3(0, TARGET_Y, 0))
  const focusCamRef = useRef(new THREE.Vector3())
  const viewDirRef = useRef(new THREE.Vector3())
  const rightRef = useRef(new THREE.Vector3())

  useEffect(() => {
    interactRef.current = onInteract
  })

  useEffect(() => {
    reducedRef.current = reducedMotion
  })

  useEffect(() => {
    focusRef.current = focus
  }, [focus])

  useEffect(() => {
    lightRef.current = light
  }, [light])

  useEffect(() => {
    return installControls(gl.domElement, orbitRef.current, light, focus !== null, () => interactRef.current())
  }, [gl, light, focus])

  useEffect(() => {
    configureCamera(camera as THREE.PerspectiveCamera, light)
  }, [camera, light])

  useFrame(({ clock }, delta) => {
    const orbit = orbitRef.current
    const frameDelta = Math.min(delta, 0.2)
    const still = reducedRef.current
    const active = focusRef.current

    /*
     * The orbit is frozen while a blade is open. Its stored angle is the pose
     * the camera returns to when the reader steps back, so the field never
     * jumps to a different part of the ring.
     */
    if (!active) {
      if (orbit.dragging) orbit.idle = 0
      else orbit.idle += frameDelta
      if (orbit.idle > IDLE_DELAY && !still) orbit.targetTheta += IDLE_SPEED * frameDelta
    }

    const orbitDamping = 1 - Math.exp(-(still ? 12 : 6.5) * frameDelta)
    orbit.theta += (orbit.targetTheta - orbit.theta) * orbitDamping
    orbit.phi += (orbit.targetPhi - orbit.phi) * orbitDamping
    orbit.dist += (orbit.targetDist - orbit.dist) * orbitDamping

    const breath = !active && !still && orbit.idle > IDLE_DELAY ? Math.sin(clock.elapsedTime * 0.055) * 0.006 : 0
    const phi = orbit.phi + breath
    const overviewRadius = orbit.dist * Math.cos(phi)
    const overviewHeight = TARGET_Y + orbit.dist * Math.sin(phi)

    let desiredTheta = orbit.theta
    let desiredRadius = overviewRadius
    let desiredHeight = overviewHeight
    desiredLookRef.current.set(0, TARGET_Y, 0)

    if (active) {
      const mobile = lightRef.current
      const distance = mobile ? 5.8 : 6.2
      const cameraHeight = mobile ? 1.0 : 1.15
      const targetHeight = mobile ? 0.9 : 1.55
      const focusRadius = Math.hypot(active.x, active.z) + distance
      const focusTheta = Math.atan2(active.x, active.z)

      desiredTheta = focusTheta
      desiredRadius = focusRadius
      desiredHeight = cameraHeight
      desiredLookRef.current.set(active.x, targetHeight, active.z)

      /*
       * The record occupies the right third on desktop, so the blade is
       * composed into the left two thirds. On phones the sheet takes the
       * bottom, and the blade sits high in the remaining field.
       */
      if (!mobile) {
        focusCamRef.current.set(focusRadius * Math.sin(focusTheta), cameraHeight, focusRadius * Math.cos(focusTheta))
        viewDirRef.current.copy(desiredLookRef.current).sub(focusCamRef.current).normalize()
        rightRef.current.crossVectors(viewDirRef.current, UP).normalize()
        desiredLookRef.current.addScaledVector(rightRef.current, 0.62)
      }
    }

    /*
     * The camera lives in polar coordinates around the ring rather than being
     * blended along a straight line. Walking to the back of the ring therefore
     * arcs around the blades instead of diving between them.
     */
    const state = stateRef.current
    const followRate = still ? 18 : active ? 5.5 : 9
    const follow = 1 - Math.exp(-followRate * frameDelta)
    if (!state.ready || still) {
      state.theta = desiredTheta
      state.radius = desiredRadius
      state.height = desiredHeight
      state.look.copy(desiredLookRef.current)
      state.ready = true
    } else {
      state.theta += shortestAngle(desiredTheta - state.theta) * follow
      state.radius += (desiredRadius - state.radius) * follow
      state.height += (desiredHeight - state.height) * follow
      state.look.lerp(desiredLookRef.current, follow)
    }

    camera.position.set(state.radius * Math.sin(state.theta), state.height, state.radius * Math.cos(state.theta))
    camera.lookAt(state.look)
  })

  return null
}
