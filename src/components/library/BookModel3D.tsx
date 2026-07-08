import { useRef, useMemo } from 'react'
import { type Group, BoxGeometry, PlaneGeometry, MeshStandardMaterial, DoubleSide } from 'three'
import { useFrame } from '@react-three/fiber'
import type { Book } from '@/types'
import type { AnimProgress } from './BookScene'

const COVER_T = 0.06
const PAGE_DEPTH_UNIT = 0.025
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

interface Props {
  book: Book
  bookW: number
  bookH: number
  spineT: number
  pageW: number
  progress: React.RefObject<AnimProgress>
  leftDepth: number
  rightDepth: number
}

export default function BookModel3D({ book, bookW, bookH, spineT, pageW, progress, leftDepth, rightDepth }: Props) {
  const coverRef = useRef<Group>(null)
  const mat = getMat(book.saga)

  const leftD = leftDepth * PAGE_DEPTH_UNIT
  const rightD = rightDepth * PAGE_DEPTH_UNIT
  const totalPageD = leftD + rightD

  // Each half: left pages center at x = -(pageW/2 + spineT/2), right pages at x = (pageW/2 + spineT/2)
  const halfCenter = pageW / 2 + spineT / 2

  // Geometry instances
  const pageGeo = useMemo(() => new PlaneGeometry(pageW, bookH), [pageW, bookH])
  const spineSurfaceGeo = useMemo(() => new PlaneGeometry(spineT, bookH), [spineT, bookH])
  const leftBlockGeo = useMemo(() => new BoxGeometry(pageW, bookH, leftD), [pageW, bookH, leftD])
  const rightBlockGeo = useMemo(() => new BoxGeometry(pageW, bookH, rightD), [pageW, bookH, rightD])
  const backCoverGeo = useMemo(() => new BoxGeometry(bookW, bookH, COVER_T), [bookW, bookH])
  const frontCoverGeo = useMemo(() => new BoxGeometry(pageW, bookH, COVER_T), [pageW, bookH])

  // Materials
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

  useFrame(() => {
    if (!coverRef.current) return
    coverRef.current.rotation.y = (progress.current?.coverDeg ?? 0) * (Math.PI / 180)
  })

  return (
    <>
      {/* BACK COVER — full book width, centered, behind page block */}
      <mesh position={[0, 0, -totalPageD - COVER_T / 2]} geometry={backCoverGeo} material={coverMat} />

      {/* Inside back cover surface */}
      <mesh position={[0, 0, -totalPageD]}>
        <planeGeometry args={[bookW, bookH]} />
        <primitive object={insideCoverMat} />
      </mesh>

      {/* SPINE — connects both halves */}
      <mesh position={[0, 0, -totalPageD / 2 - COVER_T / 2]}>
        <boxGeometry args={[spineT, bookH, totalPageD + COVER_T]} />
        <primitive object={spineMat} />
      </mesh>

      {/* Spine surface */}
      <mesh position={[0, 0, 0.001]} geometry={spineSurfaceGeo} material={spineSurfaceMat} />

      {/* LEFT PAGE BLOCK */}
      {leftD > 0 && (
        <>
          <mesh position={[-halfCenter, 0, -leftD / 2]} geometry={leftBlockGeo} material={pageBlockMat} />
          {/* Page edges on outer face (left side) */}
          <mesh position={[-halfCenter - pageW / 2, 0, -leftD / 2]}>
            <planeGeometry args={[leftD, bookH]} />
            <primitive object={pageEdgeMat} />
          </mesh>
          {/* Page edges on bottom face */}
          <mesh position={[-halfCenter, -bookH / 2, -leftD / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[pageW, leftD]} />
            <primitive object={pageEdgeMat} />
          </mesh>
        </>
      )}

      {/* LEFT PAGE SURFACE */}
      <mesh position={[-halfCenter, 0, 0.002]} geometry={pageGeo} material={pageSurfaceMat} />

      {/* RIGHT PAGE BLOCK */}
      {rightD > 0 && (
        <>
          <mesh position={[halfCenter, 0, -rightD / 2]} geometry={rightBlockGeo} material={pageBlockMat} />
          {/* Page edges on outer face (right side) */}
          <mesh position={[halfCenter + pageW / 2, 0, -rightD / 2]}>
            <planeGeometry args={[rightD, bookH]} />
            <primitive object={pageEdgeMat} />
          </mesh>
          {/* Page edges on bottom face */}
          <mesh position={[halfCenter, -bookH / 2, -rightD / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[pageW, rightD]} />
            <primitive object={pageEdgeMat} />
          </mesh>
        </>
      )}

      {/* RIGHT PAGE SURFACE */}
      <mesh position={[halfCenter, 0, 0.002]} geometry={pageGeo} material={pageSurfaceMat} />

      {/* FRONT COVER — hinged at spine edge, pageW wide */}
      <group ref={coverRef} position={[spineT / 2, 0, 0]}>
        <mesh position={[pageW / 2, 0, -totalPageD - COVER_T / 2]} geometry={frontCoverGeo} material={coverMat} />
        {/* Inside front cover surface */}
        <mesh position={[pageW / 2, 0, -totalPageD]}>
          <planeGeometry args={[pageW, bookH]} />
          <primitive object={insideCoverMat} />
        </mesh>
      </group>
    </>
  )
}
