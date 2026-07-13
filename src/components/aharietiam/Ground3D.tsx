'use client'
import { memo, useMemo } from 'react'
import * as THREE from 'three'

function createCanvas(w: number, h: number): CanvasRenderingContext2D {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D not available')
  return ctx
}

function createStoneTexture(): THREE.CanvasTexture {
  const ctx = createCanvas(1024, 1024)
  const canvas = ctx.canvas

  ctx.fillStyle = '#2d2219'
  ctx.fillRect(0, 0, 1024, 1024)

  const imgData = ctx.getImageData(0, 0, 1024, 1024)
  const d: number[] = Array.from(imgData.data)
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28
    d[i] = d[i]! + noise
    d[i + 1] = d[i + 1]! + noise * 0.9
    d[i + 2] = d[i + 2]! + noise * 0.7
  }
  imgData.data.set(d)
  ctx.putImageData(imgData, 0, 0)

  for (let i = 0; i < 120; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * 480 + 32
    const cx = 512 + Math.cos(angle) * dist
    const cy = 512 + Math.sin(angle) * dist
    ctx.strokeStyle = `rgba(60,45,30,${0.03 + Math.random() * 0.04})`
    ctx.lineWidth = 1 + Math.random() * 3
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + (Math.random() - 0.5) * 30, cy + (Math.random() - 0.5) * 30)
    ctx.stroke()
  }

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 1024
    const y = Math.random() * 1024
    const r = 10 + Math.random() * 60
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, `rgba(50,40,30,${0.05 + Math.random() * 0.08})`)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 3)
  tex.anisotropy = 4
  return tex
}

function createAOTexture(): THREE.CanvasTexture {
  const ctx = createCanvas(512, 512)
  const canvas = ctx.canvas

  const cx = 256, cy = 256
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 256)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(0.6, 'rgba(0,0,0,0)')
  grad.addColorStop(0.85, 'rgba(0,0,0,0.3)')
  grad.addColorStop(1, 'rgba(0,0,0,0.7)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, 256, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

function createNormalTexture(): THREE.CanvasTexture {
  const ctx = createCanvas(512, 512)
  const canvas = ctx.canvas

  const imgData = ctx.getImageData(0, 0, 512, 512)
  const d: number[] = Array.from(imgData.data)
  for (let i = 0; i < d.length; i += 4) {
    const nx = (Math.random() - 0.5) * 0.6
    const ny = (Math.random() - 0.5) * 0.6
    const nz = Math.sqrt(1 - nx * nx - ny * ny)
    d[i] = (nx * 0.5 + 0.5) * 255
    d[i + 1] = (ny * 0.5 + 0.5) * 255
    d[i + 2] = (nz * 0.5 + 0.5) * 255
    d[i + 3] = 255
  }
  imgData.data.set(d)
  ctx.putImageData(imgData, 0, 0)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  return tex
}

export default memo(function Ground3D() {
  const stoneMap = useMemo(() => createStoneTexture(), [])
  const aoMap = useMemo(() => createAOTexture(), [])
  const normalMap = useMemo(() => createNormalTexture(), [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <circleGeometry args={[2.8, 64]} />
      <meshStandardMaterial
        map={stoneMap}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.6, 0.6)}
        aoMap={aoMap}
        roughness={0.85}
        metalness={0}
        color="#3d3024"
      />
    </mesh>
  )
})
