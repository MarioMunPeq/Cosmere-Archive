'use client'
import { memo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BASE = import.meta.env.BASE_URL

interface Props {
  id: string
  image: string
  position: [number, number, number]
  screenRotation: number
  hovered?: 'active' | 'dimmed' | null
  selected?: boolean
  onHover?: (id: string | null) => void
  onSelect?: (id: string | null) => void
}

export default memo(function BladeSprite3D({
  id,
  image,
  position,
  screenRotation,
  hovered,
  selected,
  onHover,
  onSelect,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isTaln = id === 'talenel'
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [texError, setTexError] = useState(false)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    const url = `${BASE}${image}`
    console.log(`[Blade3D] Loading ${id} from ${url}`)
    loader.load(
      url,
      (tex) => {
        console.log(`[Blade3D] OK ${id}: ${tex.image.width}x${tex.image.height}`)
        setTexture(tex)
      },
      undefined,
      (err) => {
        console.error(`[Blade3D] FAIL ${id}:`, err)
        setTexError(true)
      },
    )
  }, [id, image])

  const isDimmed = hovered === 'dimmed' && !selected
  const opacity = isDimmed ? 0.3 : 1

  useFrame(({ camera }) => {
    if (!meshRef.current) return
    const pos = meshRef.current.position
    const m = new THREE.Matrix4().lookAt(
      pos,
      camera.position,
      new THREE.Vector3(0, 1, 0),
    )
    meshRef.current.quaternion.setFromRotationMatrix(m)
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      screenRotation,
    )
    meshRef.current.quaternion.multiply(q)
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => {
        console.log(`[Blade3D] Click ${id}`)
        if (!isTaln) onSelect?.(id)
      }}
      onPointerEnter={() => onHover?.(id)}
      onPointerLeave={() => onHover?.(null)}
    >
      <planeGeometry args={[2, 8]} />
      {texError || !texture ? (
        <meshBasicMaterial
          color="red"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      ) : (
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
          opacity={opacity}
        />
      )}
    </mesh>
  )
})
