import { useMemo } from 'react'
import { BoxGeometry, PlaneGeometry, MeshStandardMaterial, DoubleSide } from 'three'
import * as THREE from 'three'
import type { BookState } from './BookAnimator'

const PAGE_DEPTH_UNIT = 0.025
const CURVE_DEPTH = 0.015
const BLOCK_Z_OFFSET = CURVE_DEPTH + 0.003
const COVER_THICKNESS = 0.008
const COVER_Z_OFFSET = 0.003

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
  const leftCoverGeo = useMemo(() => new BoxGeometry(pageW + 0.004, bookH + 0.004, COVER_THICKNESS), [pageW, bookH])
  const rightCoverGeo = useMemo(() => new BoxGeometry(pageW + 0.004, bookH + 0.004, COVER_THICKNESS), [pageW, bookH])

  const spineSurfaceMat = useMemo(
    () => new MeshStandardMaterial({ color: '#f0e8dc', roughness: 0.9, metalness: 0 }),
    [],
  )
  const pageBlockMat = useMemo(() => new MeshStandardMaterial({ color: '#ede4d8', roughness: 0.9, metalness: 0 }), [])
  const coverMat = useMemo(
    () => new MeshStandardMaterial({ color: '#f5edd6', roughness: 0.5, metalness: 0.05, side: DoubleSide }),
    [],
  )

  return (
    <group name="BookRoot">
      {/* Spine surface */}
      <mesh name="SpineSurface" position={[0, 0, 0.001]} geometry={spineSurfaceGeo} material={spineSurfaceMat} />

      {/* Spine spine block behind surface */}
      <mesh name="SpineBlock" position={[0, 0, -(spineT * 0.5 + BLOCK_Z_OFFSET)]}>
        <boxGeometry args={[spineT, bookH, spineT + 0.002]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.85} metalness={0.02} />
      </mesh>

      {/* Left cover — behind left pages */}
      <mesh
        name="LeftCover"
        position={[-halfCenter, 0, -leftD - BLOCK_Z_OFFSET - COVER_THICKNESS / 2 - COVER_Z_OFFSET]}
        geometry={leftCoverGeo}
        material={coverMat}
      />

      {/* Left page block */}
      {leftD > 0 && (
        <>
          <mesh
            name="LeftPageBlock"
            position={[-halfCenter, 0, -leftD / 2 - BLOCK_Z_OFFSET]}
            geometry={leftBlockGeo}
            material={pageBlockMat}
          />
          <mesh name="LeftPageForeEdge" position={[-halfCenter - pageW / 2, 0, -leftD / 2 - BLOCK_Z_OFFSET]}>
            <planeGeometry args={[leftD, bookH]} />
            <meshStandardMaterial color="#e8dcc8" roughness={0.85} metalness={0.02} />
          </mesh>
          <mesh
            name="LeftPageBottomEdge"
            position={[-halfCenter, -bookH / 2, -leftD / 2 - BLOCK_Z_OFFSET]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[pageW, leftD]} />
            <meshStandardMaterial color="#e8dcc8" roughness={0.85} metalness={0.02} />
          </mesh>
        </>
      )}

      {/* Left page surface */}
      <mesh name="LeftPageSurface" position={[-halfCenter, 0, 0.003]} geometry={leftPageGeo}>
        <meshStandardMaterial
          map={leftPageTexture}
          color={leftPageTexture ? '#ffffff' : '#ede4d8'}
          side={DoubleSide}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {/* Right cover — behind right pages */}
      <mesh
        name="RightCover"
        position={[halfCenter, 0, -rightD - BLOCK_Z_OFFSET - COVER_THICKNESS / 2 - COVER_Z_OFFSET]}
        geometry={rightCoverGeo}
        material={coverMat}
      />

      {/* Right page block */}
      {rightD > 0 && (
        <>
          <mesh
            name="RightPageBlock"
            position={[halfCenter, 0, -rightD / 2 - BLOCK_Z_OFFSET]}
            geometry={rightBlockGeo}
            material={pageBlockMat}
          />
          <mesh name="RightPageForeEdge" position={[halfCenter + pageW / 2, 0, -rightD / 2 - BLOCK_Z_OFFSET]}>
            <planeGeometry args={[rightD, bookH]} />
            <meshStandardMaterial color="#e8dcc8" roughness={0.85} metalness={0.02} />
          </mesh>
          <mesh
            name="RightPageBottomEdge"
            position={[halfCenter, -bookH / 2, -rightD / 2 - BLOCK_Z_OFFSET]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[pageW, rightD]} />
            <meshStandardMaterial color="#e4dac6" roughness={0.85} metalness={0.02} />
          </mesh>
        </>
      )}

      {/* Right page surface */}
      <mesh
        name="RightPageSurface"
        position={[halfCenter, 0, 0.003]}
        geometry={rightPageGeo}
        visible={state !== 'turningPage'}
      >
        <meshStandardMaterial
          map={rightPageTexture}
          color={rightPageTexture ? '#ffffff' : '#ede4d8'}
          side={DoubleSide}
          roughness={0.85}
          metalness={0}
        />
      </mesh>
    </group>
  )
}
