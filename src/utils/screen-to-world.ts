import { Vector3 } from 'three'
import type { Camera } from 'three'

export interface ScreenRect {
  x: number
  y: number
  w: number
  h: number
}

export interface WorldTransform {
  x: number
  y: number
  scale: number
}

export function screenRectToWorld(
  rect: ScreenRect,
  viewW: number,
  viewH: number,
  camera: Camera,
  bookW: number,
): WorldTransform {
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h / 2
  const ndcX = (cx / viewW) * 2 - 1
  const ndcY = -(cy / viewH) * 2 + 1

  const near = new Vector3(ndcX, ndcY, 0).unproject(camera)
  const far = new Vector3(ndcX, ndcY, 1).unproject(camera)

  const dz = far.z - near.z
  const t = Math.abs(dz) < 0.0001 ? 0 : (0 - near.z) / dz
  const wx = near.x + t * (far.x - near.x)
  const wy = near.y + t * (far.y - near.y)

  const p1 = new Vector3(wx, wy, 0).project(camera)
  const p2 = new Vector3(wx + 1, wy, 0).project(camera)
  const screenDx = ((p2.x - p1.x) * viewW) / 2
  const scale = screenDx > 0 && bookW > 0 ? rect.w / (bookW * screenDx) : 0.01

  return { x: wx, y: wy, scale }
}
