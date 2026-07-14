'use client'
import { memo, useRef, useState, useEffect, useMemo } from 'react'
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
    const url = `${BASE}${image}`
    const loader = new THREE.TextureLoader()
    let disposed = false
    loader.load(
      url,
      (tex) => {
        if (disposed) {
          tex.dispose()
          return
        }
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
        setTexture(tex.clone())
      },
      undefined,
      () => {
        if (!disposed) setTexError(true)
      },
    )
    return () => {
      disposed = true
    }
  }, [id, image])

  const quat = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), screenRotation)
    return q
  }, [screenRotation])

  const isDimmed = hovered === 'dimmed' && !selected
  const opacity = isDimmed ? 0.3 : 1

  useFrame(({ camera }) => {
    if (!meshRef.current) return
    const pos = meshRef.current.position
    const lookTarget = camera.position.clone()
    const up = new THREE.Vector3(0, 1, 0)
    const m = new THREE.Matrix4().lookAt(pos, lookTarget, up)
    meshRef.current.quaternion.setFromRotationMatrix(m)
    meshRef.current.quaternion.multiply(quat)
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => {
        if (!isTaln) onSelect?.(id)
      }}
      onPointerEnter={() => onHover?.(id)}
      onPointerLeave={() => onHover?.(null)}
    >
      <planeGeometry args={[2.5, 6]} />
      {texError || !texture ? (
        <meshBasicMaterial color="#ff6b35" transparent opacity={0.9} side={THREE.DoubleSide} depthWrite={false} />
      ) : (
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
          opacity={opacity}
        />
      )}
    </mesh>
  )
})
