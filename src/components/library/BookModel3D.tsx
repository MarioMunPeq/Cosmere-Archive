import { useRef, useMemo } from 'react'
import { type Group, BoxGeometry, PlaneGeometry, MeshStandardMaterial, DoubleSide } from 'three'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { Book } from '@/types'
import type { AnimProgress } from './BookScene'

const COVER_T = 0.06
const PAGE_DEPTH_UNIT = 0.025
const CURVE_DEPTH = 0.015

const MATERIALS: Record<string, { base: string; dark: string; light: string }> = {
  stormlight: { base: '#0c1220', dark: '#060a12', light: '#1a2640' },
  'mistborn-era-1': { base: '#120a06', dark: '#0a0502', light: '#20140e' },
  'mistborn-era-2': { base: '#0c1624', dark: '#060c14', light: '#14263a' },
  elantris: { base: '#e8e4e0', dark: '#d0cbc6', light: '#f5f0eb' },
  warbreaker: { base: '#1a0a1e', dark: '#0e0410', light: '#2d1035' },
  'white-sand': { base: '#2a1e14', dark: '#1a120a', light: '#3d2c1e' },
  'secret-projects': { base: '#0a0a18', dark: '#04040e', light: '#1a1a2e' },
  'arcanum-unbounded': { base: '#1a0a2e', dark: '#0e0418', light: '#2a1040' },
}

const FALLBACK_MAT = { base: '#1a1428', dark: '#0e0a18', light: '#2a1e3e' }

function getMat(saga: string) {
  return MATERIALS[saga] ?? FALLBACK_MAT
}

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
  book: Book
  bookW: number
  bookH: number
  spineT: number
  pageW: number
  progress: React.RefObject<AnimProgress>
  leftDepth: number
  rightDepth: number
  leftPageTexture: THREE.Texture | null
  rightPageTexture: THREE.Texture | null
  coverTexture: THREE.Texture | null
}

export default function BookModel3D({
  book,
  bookW,
  bookH,
  spineT,
  pageW,
  progress,
  leftDepth,
  rightDepth,
  leftPageTexture,
  rightPageTexture,
  coverTexture,
}: Props) {
  const coverRef = useRef<Group>(null)
  const mat = getMat(book.saga)

  const leftD = leftDepth * PAGE_DEPTH_UNIT
  const rightD = rightDepth * PAGE_DEPTH_UNIT
  const totalPageD = leftD + rightD
  const halfCenter = pageW / 2 + spineT / 2

  const leftPageGeo = useMemo(() => createCurvedPageGeo(pageW, bookH, CURVE_DEPTH, false), [pageW, bookH])
  const rightPageGeo = useMemo(() => createCurvedPageGeo(pageW, bookH, CURVE_DEPTH, true), [pageW, bookH])
  const spineSurfaceGeo = useMemo(() => new PlaneGeometry(spineT, bookH), [spineT, bookH])
  const leftBlockGeo = useMemo(() => new BoxGeometry(pageW, bookH, leftD), [pageW, bookH, leftD])
  const rightBlockGeo = useMemo(() => new BoxGeometry(pageW, bookH, rightD), [pageW, bookH, rightD])
  const backCoverGeo = useMemo(() => new BoxGeometry(bookW, bookH, COVER_T), [bookW, bookH])
  const coverThicknessGeo = useMemo(() => new BoxGeometry(pageW, bookH, COVER_T), [pageW, bookH])

  const pageSurfaceMat = useMemo(
    () => new MeshStandardMaterial({ color: '#f5efe6', roughness: 0.85, metalness: 0, side: DoubleSide }),
    [],
  )
  const spineSurfaceMat = useMemo(
    () => new MeshStandardMaterial({ color: '#f0e8dc', roughness: 0.9, metalness: 0 }),
    [],
  )
  const pageBlockMat = useMemo(() => new MeshStandardMaterial({ color: '#ede4d8', roughness: 0.9, metalness: 0 }), [])
  const pageEdgeMat = useMemo(() => new MeshStandardMaterial({ color: '#e8dcc8', roughness: 0.95, metalness: 0 }), [])
  const coverMat = useMemo(
    () => new MeshStandardMaterial({ color: mat.base, roughness: 0.55, metalness: 0.04 }),
    [mat.base],
  )
  const spineMat = useMemo(
    () => new MeshStandardMaterial({ color: mat.dark, roughness: 0.65, metalness: 0.02 }),
    [mat.dark],
  )
  const insideCoverMat = useMemo(
    () => new MeshStandardMaterial({ color: mat.dark, roughness: 0.8, metalness: 0, side: DoubleSide }),
    [mat.dark],
  )

  const coverFaceMat = useMemo(() => {
    const m = new MeshStandardMaterial({
      color: mat.base,
      roughness: 0.45,
      metalness: 0.04,
      side: DoubleSide,
    })
    if (coverTexture) {
      m.map = coverTexture
      m.needsUpdate = true
    }
    return m
  }, [coverTexture, mat.base])

  useFrame(() => {
    if (!coverRef.current) return
    coverRef.current.rotation.y = (progress.current?.coverDeg ?? 0) * (Math.PI / 180)
  })

  return (
    <>
      <mesh position={[0, 0, -totalPageD - COVER_T / 2]} geometry={backCoverGeo} material={coverMat} />

      <mesh position={[0, 0, -totalPageD]}>
        <planeGeometry args={[bookW, bookH]} />
        <primitive object={insideCoverMat} />
      </mesh>

      <mesh position={[0, 0, -totalPageD / 2 - COVER_T / 2]}>
        <boxGeometry args={[spineT, bookH, totalPageD + COVER_T]} />
        <primitive object={spineMat} />
      </mesh>

      <mesh position={[0, 0, 0.001]} geometry={spineSurfaceGeo} material={spineSurfaceMat} />

      {leftD > 0 && (
        <>
          <mesh position={[-halfCenter, 0, -leftD / 2]} geometry={leftBlockGeo} material={pageBlockMat} />
          <mesh position={[-halfCenter - pageW / 2, 0, -leftD / 2]}>
            <planeGeometry args={[leftD, bookH]} />
            <primitive object={pageEdgeMat} />
          </mesh>
          <mesh position={[-halfCenter, -bookH / 2, -leftD / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[pageW, leftD]} />
            <primitive object={pageEdgeMat} />
          </mesh>
        </>
      )}

      <mesh position={[-halfCenter, 0, 0]} geometry={leftPageGeo}>
        <primitive object={pageSurfaceMat} />
      </mesh>
      {leftPageTexture && (
        <mesh position={[-halfCenter, 0, 0.003]} geometry={leftPageGeo}>
          <meshStandardMaterial
            map={leftPageTexture}
            transparent
            opacity={1}
            side={DoubleSide}
            roughness={0.9}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      )}

      {rightD > 0 && (
        <>
          <mesh position={[halfCenter, 0, -rightD / 2]} geometry={rightBlockGeo} material={pageBlockMat} />
          <mesh position={[halfCenter + pageW / 2, 0, -rightD / 2]}>
            <planeGeometry args={[rightD, bookH]} />
            <primitive object={pageEdgeMat} />
          </mesh>
          <mesh position={[halfCenter, -bookH / 2, -rightD / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[pageW, rightD]} />
            <primitive object={pageEdgeMat} />
          </mesh>
        </>
      )}

      <mesh position={[halfCenter, 0, 0]} geometry={rightPageGeo}>
        <primitive object={pageSurfaceMat} />
      </mesh>
      {rightPageTexture && (
        <mesh position={[halfCenter, 0, 0.003]} geometry={rightPageGeo}>
          <meshStandardMaterial
            map={rightPageTexture}
            transparent
            opacity={1}
            side={DoubleSide}
            roughness={0.9}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      )}

      <group ref={coverRef} position={[spineT / 2, 0, 0]}>
        <mesh position={[pageW / 2, 0, -totalPageD - COVER_T / 2]} geometry={coverThicknessGeo} material={coverMat} />
        <mesh position={[pageW / 2, 0, -totalPageD - COVER_T]}>
          <planeGeometry args={[pageW, bookH]} />
          <primitive object={coverFaceMat} />
        </mesh>
        <mesh position={[pageW / 2, 0, -totalPageD]}>
          <planeGeometry args={[pageW, bookH]} />
          <primitive object={insideCoverMat} />
        </mesh>
      </group>
    </>
  )
}
