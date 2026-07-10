import { useMemo } from 'react'
import { CanvasTexture, RepeatWrapping } from 'three'

function createFloorTexture(): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#181410'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    const alpha = 0.01 + Math.random() * 0.03
    ctx.fillStyle = `rgba(60,50,40,${alpha})`
    ctx.fillRect(x, y, 2 + Math.random() * 6, 1)
  }
  const tex = new CanvasTexture(c)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(16, 16)
  return tex
}

export default function Floor() {
  const tex = useMemo(() => createFloorTexture(), [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial map={tex} color="#1a1410" roughness={0.95} metalness={0} />
    </mesh>
  )
}
