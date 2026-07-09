import { useMemo } from 'react'
import { BoxGeometry, PlaneGeometry, MeshStandardMaterial, DoubleSide } from 'three'
import * as THREE from 'three'
import type { BookState } from './BookAnimator'

const PAGE_DEPTH_UNIT = 0.025
const CURVE_DEPTH = 0.015
const BLOCK_Z_OFFSET = CURVE_DEPTH + 0.003

function createCurvedPageGeo(w: number, h: number, curve: number, reverse: boolean): PlaneGeometry {
  const segW = 20
  const geo = new PlaneGeometry(w, h, segW, 1)
  const pos = geo.attributes.position
  if (!pos) return geo
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    let t: number
    if (reverse) {
      t = (x + w / 2) / w
    } else {
      t = (w / 2 - x) / w
    }
    t = Math.max(0, Math.min(1, t))
    const z = -curve * Math.sin((t * Math.PI) / 2)
    pos.setZ(i, z)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

interface Props {
  bookW: number
  bookH: number
  spineT: number
  pageW: number
  leftDepth: number
  rightDepth: number
  leftPageTexture: THREE.Texture | null
  rightPageTexture: THREE.Texture | null
  state: BookState
}

export default function BookModel3D({
  bookH,
  spineT,
  pageW,
  leftDepth,
  rightDepth,
  leftPageTexture,
  rightPageTexture,
  state,
}: Props) {
  const leftD = leftDepth * PAGE_DEPTH_UNIT
  const rightD = rightDepth * PAGE_DEPTH_UNIT
  const halfCenter = pageW / 2 + spineT / 2

  const leftPageGeo = useMemo(() => createCurvedPageGeo(pageW, bookH, CURVE_DEPTH, false), [pageW, bookH])
  const rightPageGeo = useMemo(() => createCurvedPageGeo(pageW, bookH, CURVE_DEPTH, true), [pageW, bookH])
  const spineSurfaceGeo = useMemo(() => new PlaneGeometry(spineT, bookH), [spineT, bookH])
  const leftBlockGeo = useMemo(() => new BoxGeometry(pageW, bookH, leftD), [pageW, bookH, leftD])
  const rightBlockGeo = useMemo(() => new BoxGeometry(pageW, bookH, rightD), [pageW, bookH, rightD])
  const spineSurfaceMat = useMemo(
    () => new MeshStandardMaterial({ color: '#f0e8dc', roughness: 0.9, metalness: 0 }),
    [],
  )
  const pageBlockMat = useMemo(() => new MeshStandardMaterial({ color: '#ede4d8', roughness: 0.9, metalness: 0 }), [])
  const pageEdgeMat = useMemo(
    () => new MeshStandardMaterial({ color: '#e8dcc8', roughness: 0.85, metalness: 0.02 }),
    [],
  )
  const pageEdgeMat2 = useMemo(
    () => new MeshStandardMaterial({ color: '#e4dac6', roughness: 0.85, metalness: 0.02 }),
    [],
  )

  return (
    <>
      <mesh position={[0, 0, 0.001]} geometry={spineSurfaceGeo} material={spineSurfaceMat} />

      {leftD > 0 && (
        <>
          <mesh
            position={[-halfCenter, 0, -leftD / 2 - BLOCK_Z_OFFSET]}
            geometry={leftBlockGeo}
            material={pageBlockMat}
          />
          <mesh position={[-halfCenter - pageW / 2, 0, -leftD / 2 - BLOCK_Z_OFFSET]}>
            <planeGeometry args={[leftD, bookH]} />
            <primitive object={pageEdgeMat} />
          </mesh>
          <mesh position={[-halfCenter, -bookH / 2, -leftD / 2 - BLOCK_Z_OFFSET]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[pageW, leftD]} />
            <primitive object={pageEdgeMat} />
          </mesh>
        </>
      )}

      <mesh position={[-halfCenter, 0, 0.003]} geometry={leftPageGeo}>
        <meshStandardMaterial
          map={leftPageTexture}
          color={leftPageTexture ? '#ffffff' : '#ede4d8'}
          side={DoubleSide}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {rightD > 0 && (
        <>
          <mesh
            position={[halfCenter, 0, -rightD / 2 - BLOCK_Z_OFFSET]}
            geometry={rightBlockGeo}
            material={pageBlockMat}
          />
          <mesh position={[halfCenter + pageW / 2, 0, -rightD / 2 - BLOCK_Z_OFFSET]}>
            <planeGeometry args={[rightD, bookH]} />
            <primitive object={pageEdgeMat} />
          </mesh>
          <mesh position={[halfCenter, -bookH / 2, -rightD / 2 - BLOCK_Z_OFFSET]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[pageW, rightD]} />
            <primitive object={pageEdgeMat2} />
          </mesh>
        </>
      )}

      <mesh position={[halfCenter, 0, 0.003]} geometry={rightPageGeo} visible={state !== 'turningPage'}>
        <meshStandardMaterial
          map={rightPageTexture}
          color={rightPageTexture ? '#ffffff' : '#ede4d8'}
          side={DoubleSide}
          roughness={0.85}
          metalness={0}
        />
      </mesh>
    </>
  )
}
