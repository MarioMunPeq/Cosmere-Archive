import { useRef, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  type Group,
  type PerspectiveCamera as PC,
  type Points as Pts,
  type Sprite as SpriteImpl,
  type Mesh as TurnMesh,
  BufferGeometry,
  Float32BufferAttribute,
  CanvasTexture,
  NearestFilter,
  MeshStandardMaterial,
  DoubleSide,
  PlaneGeometry,
} from 'three'
import { type BookState, type BookEvent, ANIM_TIMING } from './BookAnimator'
import BookModel3D from './BookModel3D'
import { createPageTexture } from '@/utils/page-texture'
import type { PageData } from './BookContent'

interface Props {
  spineRect: { x: number; y: number; w: number; h: number }
  dim: { bookW: number; bookH: number; spineT: number; pageW: number }
  state: BookState
  dispatch: (event: BookEvent) => void
  leftDepth: number
  rightDepth: number
  pages: PageData[]
  curPage: number
}

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function easeOutQuad(t: number): number {
  return t * (2 - t)
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

// Hermite smoothstep: 0 at 0, 1 at 1, zero derivative at both ends
function smoothstep01(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

const CAM_VEC: [number, number, number] = [0, 0.15, 3.0]

export interface AnimProgress {
  groupPos: [number, number, number]
  groupScale: [number, number, number]
  groupRotY: number
  groupRotX: number
  groupRotZ: number
}

function createGlowTexture(): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.15, 'rgba(200,230,255,0.8)')
  g.addColorStop(0.4, 'rgba(150,200,255,0.3)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = new CanvasTexture(c)
  tex.minFilter = NearestFilter
  tex.magFilter = NearestFilter
  return tex
}

export default function BookScene({
  spineRect: _spineRect,
  dim,
  state,
  dispatch,
  leftDepth,
  rightDepth,
  pages,
  curPage,
}: Props) {
  const { bookW, bookH, spineT, pageW } = dim
  const groupRef = useRef<Group>(null)
  const glowRef = useRef<SpriteImpl>(null)
  const animTime = useRef(0)
  const prevState = useRef<BookState>('idle')
  const camera = useThree((s) => s.camera) as PC
  const { size } = useThree()

  const camDist = Math.sqrt(CAM_VEC[0] ** 2 + CAM_VEC[1] ** 2 + CAM_VEC[2] ** 2)

  const fittedScale = useMemo(() => {
    const fovRad = (camera.fov * Math.PI) / 360
    const aspect = size.width / size.height
    const vh = 2 * Math.tan(fovRad) * camDist
    const vw = vh * aspect
    const margin = 0.8
    const maxW = vw * margin
    const maxH = vh * margin
    const s = Math.min(maxW / bookW, maxH / bookH)
    return Math.min(s, 1.2)
  }, [bookW, bookH, camera, size, camDist])

  // ── Turned page mesh (rigid rotation around spine) ──────
  const TURN_SEG_W = 48 // more segments = smoother spine bend
  const TURN_SEG_H = 6
  const BEND_FRACTION = 0.18 // 18% of page width near spine is flexible
  const turnedRef = useRef<TurnMesh>(null)
  const turnedGeo = useMemo(() => {
    const geo = new BufferGeometry()
    const base = new PlaneGeometry(pageW, bookH, TURN_SEG_W, TURN_SEG_H)
    const srcPos = base.attributes.position
    if (!srcPos) {
      base.dispose()
      return geo
    }
    const pos = new Float32Array(srcPos.count * 3)
    for (let i = 0; i < srcPos.count; i++) {
      pos[i * 3] = srcPos.getX(i)
      pos[i * 3 + 1] = srcPos.getY(i)
      pos[i * 3 + 2] = 0
    }
    geo.userData.origPos = pos
    geo.setAttribute('position', new Float32BufferAttribute(pos, 3))
    geo.setIndex(base.index ? base.index.clone() : null)
    base.dispose()
    return geo
  }, [pageW, bookH])

  const progress = useRef<AnimProgress>({
    groupPos: [0, 0, 0],
    groupScale: [fittedScale, fittedScale, fittedScale],
    groupRotY: 0,
    groupRotX: 0,
    groupRotZ: 0,
  })

  // ── Dust particles ─────────────────────────────────────────
  const DUST_COUNT = 30
  const [dustGeo] = useState(() => new BufferGeometry())
  const dustPosRef = useRef<number[]>([])
  const dustRef = useRef<Pts>(null)
  useLayoutEffect(() => {
    const pos: number[] = []
    for (let i = 0; i < DUST_COUNT; i++) {
      pos.push((Math.random() - 0.5) * 1.8)
      pos.push((Math.random() - 0.5) * 1.2 + 0.05)
      pos.push((Math.random() - 0.5) * 1.2 - 0.2)
    }
    dustPosRef.current = pos
    dustGeo.setAttribute('position', new Float32BufferAttribute(pos, 3))
  }, [dustGeo])

  // ── Glow sprite texture — stable reference ─────────────────
  const glowTex = useMemo(() => createGlowTexture(), [])

  useEffect(() => {
    camera.position.set(...CAM_VEC)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  const spreadIndex = Math.floor(curPage / 2) * 2
  const leftPage: PageData | undefined = pages[spreadIndex]
  const rightPage: PageData | undefined = pages[spreadIndex + 1]
  const pageNum = spreadIndex / 2 + 1

  const pageAspect = bookH / pageW

  const leftPageTexture = useMemo(
    () => (leftPage ? createPageTexture(leftPage, pageAspect, 'left', pageNum) : null),
    [leftPage, pageAspect, pageNum],
  )

  const rightPageTexture = useMemo(
    () => (rightPage ? createPageTexture(rightPage, pageAspect, 'right', pageNum) : null),
    [rightPage, pageAspect, pageNum],
  )

  // ── Turned page materials (depends on rightPageTexture) ────
  const halfCenter = pageW / 2 + spineT / 2

  const turnedMat = useMemo(
    () =>
      new MeshStandardMaterial({
        map: rightPageTexture,
        color: rightPageTexture ? '#ffffff' : '#ede4d8',
        side: DoubleSide,
        roughness: 0.85,
        metalness: 0,
        transparent: true,
        opacity: 1,
      }),
    [rightPageTexture],
  )

  const shadowMatRef = useRef<MeshStandardMaterial>(null!)

  const turnT = useRef(0)

  useFrame((_, delta) => {
    if (prevState.current !== state) {
      prevState.current = state
      animTime.current = 0
    }

    const dt = Math.min(delta, 0.05)
    animTime.current += dt
    const p = progress.current

    switch (state) {
      case 'spawning': {
        const t = Math.min(animTime.current / (ANIM_TIMING.spawn / 1000), 1)
        const scale = easeOutBack(t)
        p.groupScale[0] = p.groupScale[1] = p.groupScale[2] = fittedScale * scale
        p.groupPos[1] = -0.06 * (1 - easeOutQuad(t))

        // Glow sprite animation
        const glow = glowRef.current
        if (glow) {
          if (t < 0.35) {
            const gt = t / 0.35
            glow.scale.setScalar(gt * 2.5)
            glow.material.opacity = gt * 0.7
          } else if (t < 0.7) {
            const gt = (t - 0.35) / 0.35
            glow.scale.setScalar(2.5 + gt * 2.5)
            glow.material.opacity = 0.7 * (1 - gt * 0.6)
          } else {
            const gt = (t - 0.7) / 0.3
            glow.scale.setScalar(5 * (1 - gt * 0.8))
            glow.material.opacity = 0.28 * (1 - gt)
          }
        }

        if (t >= 1) {
          p.groupPos[1] = 0
          p.groupScale[0] = p.groupScale[1] = p.groupScale[2] = fittedScale
          if (glowRef.current) {
            glowRef.current.scale.setScalar(0)
            glowRef.current.material.opacity = 0
          }
          dispatch('SPAWN_DONE')
        }
        break
      }
      case 'opened':
        break
      case 'turningPage': {
        const raw = Math.min(animTime.current / (ANIM_TIMING.pageTurn / 1000), 1)
        const t = easeInOutQuad(raw)
        p.groupRotX = Math.sin(raw * Math.PI) * 0.015

        // Rigid rotation around spine axis with subtle spine bend
        const geo = turnedRef.current?.geometry as BufferGeometry | undefined
        if (geo) {
          const turnPos = geo.attributes.position
          const src = geo.userData.origPos as Float32Array | undefined
          if (turnPos && src) {
            const w = pageW
            for (let i = 0; i < turnPos.count; i++) {
              const i3 = i * 3
              const ox = src[i3]!
              const oy = src[i3 + 1]!
              const dx = ox + w / 2
              const fullAngle = t * Math.PI
              const bendWidth = w * BEND_FRACTION
              const localAngle = dx < bendWidth ? fullAngle * smoothstep01(0, bendWidth, dx) : fullAngle
              const x = -w / 2 + dx * Math.cos(localAngle)
              const z = dx * Math.sin(localAngle)
              turnPos.setXYZ(i, x, oy, z)
            }
            turnPos.needsUpdate = true
            geo.computeVertexNormals()
          }
        }

        // Update shadow
        const shadowMat = shadowMatRef.current
        if (shadowMat) {
          shadowMat.opacity = raw * 0.12
          shadowMat.needsUpdate = true
        }

        turnT.current = t
        if (raw >= 1) {
          if (shadowMatRef.current) {
            shadowMatRef.current.opacity = 0
            shadowMatRef.current.needsUpdate = true
          }
          p.groupRotX = 0
          dispatch('TURN_DONE')
        }
        break
      }
      case 'closing': {
        const t = Math.min(animTime.current / (ANIM_TIMING.close / 1000), 1)
        const st = 1 - easeOutQuad(t)
        p.groupScale[0] = p.groupScale[1] = p.groupScale[2] = fittedScale * st
        p.groupPos[1] = -0.04 * t
        if (t >= 1) dispatch('CLOSE_DONE')
        break
      }
      case 'finished':
      case 'idle':
        break
    }

    const g = groupRef.current
    if (g) {
      g.position.set(p.groupPos[0], p.groupPos[1], p.groupPos[2])
      g.scale.set(p.groupScale[0], p.groupScale[1], p.groupScale[2])
      g.rotation.set(p.groupRotX, p.groupRotY, p.groupRotZ)
    }

    // Animate dust motes
    const dust = dustRef.current
    if (dust && state === 'opened') {
      const dp = dustPosRef.current
      for (let i = 0; i < DUST_COUNT; i++) {
        const i3 = i * 3
        dp[i3] = (dp[i3] ?? 0) + Math.sin(animTime.current * 0.3 + i) * 0.0004
        dp[i3 + 1] = (dp[i3 + 1] ?? 0) + Math.cos(animTime.current * 0.2 + i * 1.3) * 0.0003
        dp[i3 + 2] = (dp[i3 + 2] ?? 0) + Math.sin(animTime.current * 0.15 + i * 0.7) * 0.0002
        const x = dp[i3] ?? 0
        const y = dp[i3 + 1] ?? 0
        if (Math.abs(x) > 1.2) dp[i3] = -0.6 * x
        if (Math.abs(y) > 0.9) dp[i3 + 1] = -0.6 * y
      }
      dust.geometry.setAttribute('position', new Float32BufferAttribute([...dp], 3))
    }
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.5, 4, 3]} intensity={0.95} color="#ffe4cc" />
      <directionalLight position={[-1.5, 2, -1]} intensity={0.3} color="#cce4ff" />
      <directionalLight position={[2.5, 0.5, -2.5]} intensity={0.2} color="#ffe4cc" />
      <directionalLight position={[0, 3, 0]} intensity={0.15} color="#ffffff" />

      <group ref={groupRef}>
        <BookModel3D
          bookW={bookW}
          bookH={bookH}
          spineT={spineT}
          pageW={pageW}
          leftDepth={leftDepth}
          rightDepth={rightDepth}
          leftPageTexture={leftPageTexture}
          rightPageTexture={rightPageTexture}
          state={state}
        />

        {/* Turned page mesh (3D curl) */}
        <mesh
          ref={turnedRef}
          position={[halfCenter, 0, 0.006]}
          geometry={turnedGeo}
          material={turnedMat}
          visible={state === 'turningPage'}
        />

        {/* Shadow beneath the curl */}
        <mesh position={[halfCenter, 0, 0.001]} visible={state === 'turningPage'}>
          <planeGeometry args={[pageW, bookH]} />
          <meshStandardMaterial
            ref={shadowMatRef}
            color="#000000"
            transparent
            opacity={0}
            roughness={1}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      </group>

      <sprite ref={glowRef} scale={[0, 0, 0]}>
        <spriteMaterial map={glowTex} transparent opacity={0} depthWrite={false} blending={1} />
      </sprite>

      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial
          size={0.006}
          color="#d4c8b0"
          transparent
          opacity={0.15}
          sizeAttenuation
          depthWrite={false}
          blending={2}
        />
      </points>
    </>
  )
}
