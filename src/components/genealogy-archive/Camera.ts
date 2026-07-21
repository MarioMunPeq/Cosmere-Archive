/* ─── Pure camera state machine — Google Maps quality ─── */

export interface CameraState {
  x: number
  y: number
  scale: number
  vx: number
  vy: number
  targetX: number | null
  targetY: number | null
  targetScale: number | null
}

export function createCamera(x = 0, y = 0, scale = 1): CameraState {
  return { x, y, scale, vx: 0, vy: 0, targetX: null, targetY: null, targetScale: null }
}

const INERTIA_DECAY = 0.955
const FLY_LERP = 0.05
const MIN_SCALE = 0.12
const MAX_SCALE = 4.0

export function cameraTick(
  cam: CameraState,
  dt: number,
  bounds: { w: number; h: number },
  viewW: number,
  viewH: number,
): CameraState {
  let { x, y, scale, vx, vy, targetX, targetY, targetScale } = cam
  const damp = Math.pow(INERTIA_DECAY, dt * 60)

  if (targetX != null) {
    const dx = targetX - x
    if (Math.abs(dx) < 0.2) {
      x = targetX
      targetX = null
    } else x += dx * FLY_LERP * dt * 60
    vx = 0
  } else {
    vx *= damp
    x += vx * dt
  }

  if (targetY != null) {
    const dy = targetY - y
    if (Math.abs(dy) < 0.2) {
      y = targetY
      targetY = null
    } else y += dy * FLY_LERP * dt * 60
    vy = 0
  } else {
    vy *= damp
    y += vy * dt
  }

  if (targetScale != null) {
    const ds = targetScale - scale
    if (Math.abs(ds) < 0.0005) {
      scale = targetScale
      targetScale = null
    } else scale += ds * FLY_LERP * dt * 60
  }

  const pw = viewW / scale
  const ph = viewH / scale
  x = Math.max(-pw * 0.25, Math.min(bounds.w + pw * 0.25 - pw, x))
  y = Math.max(-ph * 0.25, Math.min(bounds.h + ph * 0.25 - ph, y))
  scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale))

  return { x, y, scale, vx, vy, targetX, targetY, targetScale }
}

export function cameraPan(cam: CameraState, dx: number, dy: number): CameraState {
  return { ...cam, x: cam.x - dx / cam.scale, y: cam.y - dy / cam.scale, vx: 0, vy: 0, targetX: null, targetY: null }
}

export function cameraPanInertia(cam: CameraState, dx: number, dy: number): CameraState {
  return { ...cam, vx: -dx / cam.scale, vy: -dy / cam.scale, targetX: null, targetY: null }
}

export function cameraZoom(cam: CameraState, dz: number, cx: number, cy: number): CameraState {
  const oldScale = cam.scale
  const factor = 1 - dz * 0.001
  const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * factor))
  const ratio = newScale / oldScale
  return {
    ...cam,
    scale: newScale,
    x: cam.x + (cx / oldScale) * (1 - ratio),
    y: cam.y + (cy / oldScale) * (1 - ratio),
    targetScale: null,
  }
}

export function cameraFlyTo(cam: CameraState, tx: number, ty: number, ts: number): CameraState {
  return { ...cam, targetX: tx, targetY: ty, targetScale: ts, vx: 0, vy: 0 }
}

export function cameraFitBounds(
  cam: CameraState,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  viewW: number,
  viewH: number,
  padding = 0.92,
): CameraState {
  const sx = (viewW * padding) / Math.max(bw, 1)
  const sy = (viewH * padding) / Math.max(bh, 1)
  const ts = Math.min(sx, sy, MAX_SCALE)
  return cameraFlyTo(cam, bx + bw / 2 - viewW / ts / 2, by + bh / 2 - viewH / ts / 2, ts)
}
