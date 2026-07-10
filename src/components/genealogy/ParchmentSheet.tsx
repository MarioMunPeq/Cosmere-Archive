import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, DoubleSide } from 'three'
import type { Group } from 'three'

const W = 0.45
const H = 0.35
const THICK = 0.003

interface Props {
  name: string
  position: [number, number, number]
  yaw: number
  index: number
  isDimmed: boolean
  hidden?: boolean
  onClick: () => void
}

function createLabelTexture(name: string): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 340
  const ctx = c.getContext('2d')!

  ctx.fillStyle = '#f5efe6'
  ctx.fillRect(0, 0, 512, 340)

  const vig = ctx.createRadialGradient(256, 170, 60, 256, 170, 256)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(0.7, 'rgba(0,0,0,0.005)')
  vig.addColorStop(1, 'rgba(60,40,20,0.06)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, 512, 340)

  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 340
    ctx.strokeStyle = `rgba(120,100,80,${0.005 + Math.random() * 0.015})`
    ctx.lineWidth = 0.3 + Math.random() * 0.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + (Math.random() * 6 + 2), y)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(139,119,90,0.2)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(120, 80)
  ctx.lineTo(392, 80)
  ctx.stroke()

  ctx.fillStyle = '#1a0e06'
  ctx.font = 'bold 22px "Cormorant Garamond", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(name.toUpperCase(), 256, 140)

  ctx.fillStyle = '#6b5a4a'
  ctx.font = '12px "Cormorant Garamond", Georgia, serif'
  ctx.fillText('ARCHIVES OF BLOODLINES', 256, 210)

  ctx.strokeStyle = 'rgba(139,119,90,0.15)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(180, 240)
  ctx.lineTo(332, 240)
  ctx.stroke()

  return new CanvasTexture(c)
}

export default function ParchmentSheet({ name, position, yaw, index, isDimmed, hidden, onClick }: Props) {
  const groupRef = useRef<Group>(null)
  const baseY = position[1]

  const labelTex = useMemo(() => createLabelTexture(name), [name])

  useFrame(({ clock }) => {
    if (!groupRef.current || hidden) return
    const float = Math.sin(clock.elapsedTime * 0.6 + index * 1.2) * 0.008
    groupRef.current.position.y = baseY + float
    const rot = Math.sin(clock.elapsedTime * 0.4 + index * 0.9) * 0.002
    groupRef.current.rotation.z = rot
  })

  return (
    <group ref={groupRef} position={position} rotation={[-1.1, yaw, 0]} visible={!hidden}>
      <mesh
        onClick={onClick}
        onPointerEnter={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerLeave={() => {
          document.body.style.cursor = ''
        }}
      >
        <boxGeometry args={[W, THICK, H]} />
        <meshStandardMaterial
          map={labelTex}
          color="#f5efe6"
          roughness={0.85}
          metalness={0}
          side={DoubleSide}
          transparent
          opacity={isDimmed ? 0.35 : 1}
        />
      </mesh>
      <mesh position={[0, 0, -H / 2]}>
        <planeGeometry args={[W, THICK]} />
        <meshStandardMaterial color="#ddd0c0" roughness={0.9} metalness={0} transparent opacity={isDimmed ? 0.35 : 1} />
      </mesh>
    </group>
  )
}
