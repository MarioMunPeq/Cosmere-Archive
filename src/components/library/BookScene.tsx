import { useRef, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  type Group,
  type PerspectiveCamera as PC,
  type Points as Pts,
  type Sprite as SpriteImpl,
  type Mesh as TurnMesh,
  type Mesh as ShadowMesh,
  BufferGeometry,
  Float32BufferAttribute,
  CanvasTexture,
  NearestFilter,
  MeshStandardMaterial,
  DoubleSide,
  PlaneGeometry,
} from 'three'
import { type BookState, type BookEvent, type Direction, ANIM_TIMING } from './BookAnimator'
import BookModel3D from './BookModel3D'
import { createPageTexture } from '@/utils/page-texture'
import { screenRectToWorld, type WorldTransform } from '@/utils/screen-to-world'
import type { ScreenRect } from '@/utils/screen-to-world'
import type { PageData } from './BookContent'

interface Props {
  spineRect: ScreenRect
  dim: { bookW: number; bookH: number; spineT: number; pageW: number }
  state: BookState
  dispatch: (event: BookEvent) => void
  leftDepth: number
  rightDepth: number
  pages: PageData[]
  curPage: number
  direction: Direction
}

function easeOutQuad(t: number): number {
  return t * (2 - t)
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
function easeInQuad(t: number): number {
  return t * t
}
function easePageTurn(t: number): number {
  if (t < 0.20) {
    const phase = t / 0.20
    return 0.20 * easeOutQuad(phase) * 0.65
  }
  if (t < 0.80) {
    const phase = (t - 0.20) / 0.60
    return 0.20 + 0.60 * easeInOutQuad(phase)
  }
  const phase = (t - 0.80) / 0.20
  return 0.80 + 0.20 * easeInQuad(phase)
}

const CAM_VEC: [number, number, number] = [0, 0.15, 3.0]
const HALF_PI = Math.PI / 2
const ROLL_RADIUS_FRACTION = 0.12

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
  spineRect,
  dim,
  state,
  dispatch,
  leftDepth,
  rightDepth,
  pages,
  curPage,
  direction,
}: Props) {
  const { bookW, bookH, spineT, pageW } = dim
  const layoutGroupRef = useRef<Group>(null)
  const animGroupRef = useRef<Group>(null)
  const glowRef = useRef<SpriteImpl>(null)
  const animTime = useRef(0)
  const prevState = useRef<BookState>('idle')
  const camera = useThree((s) => s.camera) as PC
  const { size } = useThree()

  const camDist = Math.hypot(...CAM_VEC)

  // ── Shelf-to-world transform (computed once, then frozen) ──
  const initRef = useRef<WorldTransform>({ x: 0, y: 0, scale: 1 })
  const layoutSetRef = useRef(false)
  const bookReadyRef = useRef(false)
  const [groupVisible, setGroupVisible] = useState(false)

  const fittedScale = useMemo(() => {
    const fovRad = (camera.fov * Math.PI) / 360
    const w = size.width > 0 ? size.width : window.innerWidth
    const h = size.height > 0 ? size.height : window.innerHeight
    const aspect = w / h
    const vh = 2 * Math.tan(fovRad) * camDist
    const vw = vh * aspect
    const margin = 0.85
    const maxW = vw * margin
    const maxH = vh * margin
    return Math.min(maxW / bookW, maxH / bookH)
  }, [bookW, bookH, camera, size, camDist])

  // Layout transform: set exactly once on the outer group (position + scale only)
  // and set initial book rotation on the inner group.
  // After the first successful run, layoutSetRef prevents re-applying,
  // so the extraction animation is never reset.
  useLayoutEffect(() => {
    if (layoutSetRef.current) return
    if (size.width === 0 || size.height === 0) return
    camera.updateProjectionMatrix()
    const t = screenRectToWorld(spineRect, size.width, size.height, camera, bookW)
    initRef.current = t
    const lg = layoutGroupRef.current
    const ag = animGroupRef.current
    if (lg && ag) {
      lg.position.set(t.x, t.y, 0)
      lg.scale.set(t.scale, t.scale, t.scale)
      setGroupVisible(true)
      ag.position.set(0, 0, 0)
      ag.scale.set(1, 1, 1)
      layoutSetRef.current = true
      bookReadyRef.current = true
    }
    animTime.current = 0
  }, [spineRect, size, camera, bookW])

  // ── Coordinate helpers (world → local space of the inner group) ──
  // Since the outer group has no rotation, local = (world - outerPos) / outerScale
  function toLocalX(wx: number): number {
    const s = initRef.current.scale
    return s > 0.001 ? (wx - initRef.current.x) / s : 0
  }
  function toLocalY(wy: number): number {
    const s = initRef.current.scale
    return s > 0.001 ? (wy - initRef.current.y) / s : 0
  }
  function toLocalZ(wz: number): number {
    const s = initRef.current.scale
    return s > 0.001 ? wz / s : 0
  }

  // ── Turned page mesh ──────────────────────────────────────
  const TURN_SEG_W = 52
  const TURN_SEG_H = 12
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
    const srcUv = base.attributes.uv
    if (srcUv) geo.setAttribute('uv', srcUv.clone())
    base.dispose()
    return geo
  }, [pageW, bookH])

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

  // ── Glow sprite texture ────────────────────────────────────
  const glowTex = useMemo(() => createGlowTexture(), [])

  useEffect(() => {
    camera.position.set(...CAM_VEC)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  // ── Page textures ─────────────────────────────────────────
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

  // ── Turned page materials ────────────────────────────────
  const halfCenter = pageW / 2 + spineT / 2

  const turnedTex = direction === 'forward' ? rightPageTexture : leftPageTexture
  const turnedMat = useMemo(
    () =>
      new MeshStandardMaterial({
        map: turnedTex,
        color: turnedTex ? '#ffffff' : '#ede4d8',
        side: DoubleSide,
        roughness: 0.85,
        metalness: 0,
        opacity: 1,
      }),
    [turnedTex],
  )

  const shadowMatRef = useRef<MeshStandardMaterial>(null!)
  const shadowMeshRef = useRef<ShadowMesh>(null!)
  const turnT = useRef(0)

  // Locked transform applied every frame during opened state
  // Prevents any post-animation reset from teleporting the book
  const openedTransformRef = useRef<{ pos: [number, number, number]; scale: [number, number, number]; rot: [number, number, number] } | null>(null)

  // ── Per-frame animation loop ───────────────────────────────
  useFrame((_, delta) => {
    if (prevState.current !== state) {
      prevState.current = state
      animTime.current = 0
    }

    const dt = Math.min(delta, 0.05)
    animTime.current += dt
    const ag = animGroupRef.current
    const glow = glowRef.current

    switch (state) {
      case 'extracting': {
        if (!bookReadyRef.current || !ag) break
        const raw = Math.min(animTime.current / (ANIM_TIMING.extract / 1000), 1)
        const et = easeOutQuad(raw)
        const init = initRef.current
        const sScale = init.scale > 0.001 ? init.scale : 1

        const lx = toLocalX(0)
        const ly = toLocalY(0)
        const lz = toLocalZ(0.5)

        ag.position.set(lx * et, ly * et, lz * et)
        const s = 1 + (fittedScale / sScale - 1) * et
        ag.scale.set(s, s, s)

        const wobble = Math.sin(raw * Math.PI * 3.5) * 0.008 * (1 - raw)
        ag.rotation.set(0.08 * (1 - easeOutQuad(raw)) + wobble, HALF_PI * (1 - et), 0)

        if (glow) {
          const glowT = raw < 0.3 ? raw / 0.3 : raw > 0.85 ? (1 - raw) / 0.15 : 1
          glow.scale.setScalar(glowT * 2.5)
          glow.material.opacity = glowT * 0.5
        }

        if (raw >= 1) {
          ag.position.set(lx, ly, lz)
          ag.scale.set(fittedScale / sScale, fittedScale / sScale, fittedScale / sScale)
          ag.rotation.set(0, 0, 0)
          openedTransformRef.current = {
            pos: [lx, ly, lz],
            scale: [fittedScale / sScale, fittedScale / sScale, fittedScale / sScale],
            rot: [0, 0, 0],
          }
          if (glow) {
            glow.scale.setScalar(0)
            glow.material.opacity = 0
          }
          animTime.current = 0
          dispatch('EXTRACT_DONE')
        }
        break
      }

      case 'opened': {
        if (ag && openedTransformRef.current) {
          const t = openedTransformRef.current
          ag.position.set(t.pos[0], t.pos[1], t.pos[2])
          ag.scale.set(t.scale[0], t.scale[1], t.scale[2])
          ag.rotation.set(t.rot[0], t.rot[1], t.rot[2])
        }
        break
      }

      case 'turningPage': {
        if (!ag) break
        const raw = Math.min(animTime.current / (ANIM_TIMING.pageTurn / 1000), 1.04)
        const rawAdjusted = Math.max(0, Math.min(1, (raw - 0.02) / 0.96))
        const t = easePageTurn(rawAdjusted) * 1.02
        const tiltAmp = Math.sin(Math.min(raw, 1) * Math.PI) * 0.015
        const bounce = Math.max(0, (raw - 1) * 0.25)
        ag.rotation.x = tiltAmp + bounce * 0.002
        ag.rotation.z = Math.sin(Math.min(raw, 1) * Math.PI * 0.5) * 0.0012

        const turnMesh = turnedRef.current
        const turnSide = direction === 'forward' ? halfCenter : -halfCenter
        const settle = Math.max(0, (raw - 0.95) / 0.09)
        const settleBounce = Math.sin(settle * Math.PI * 2) * 0.002 * (1 - settle)
        if (turnMesh) turnMesh.position.x = turnSide + settleBounce

        if (shadowMeshRef.current) {
          shadowMeshRef.current.position.x = turnSide
        }

        const geo = turnMesh?.geometry as BufferGeometry | undefined
        if (geo) {
          const turnPos = geo.attributes.position
          const src = geo.userData.origPos as Float32Array | undefined
          if (turnPos && src) {
            const w = pageW
            const isFwd = direction === 'forward'
            const h = bookH
            const rollR_base = w * ROLL_RADIUS_FRACTION
            const tighten = 1 - Math.min(t, 1) * 0.15
            const hingeX = isFwd ? -w / 2 : w / 2
            for (let i = 0; i < turnPos.count; i++) {
              const i3 = i * 3
              const ox = src[i3]!
              const oy = src[i3 + 1]!
              const dx = isFwd ? ox + w / 2 : w / 2 - ox
              const yNorm = Math.abs(oy) / (h / 2)
              const yFactor = 1 + Math.pow(yNorm, 1.5) * 0.4
              const adjustedRollR = rollR_base * tighten * yFactor
              const edgePhase = Math.pow(dx / w, 3) * 0.12
              const effectiveT = Math.max(0, Math.min(1, t - edgePhase))
              const effectiveFullAngle = effectiveT * Math.PI
              const effectiveConsumed = adjustedRollR * effectiveFullAngle
              let px: number, pz: number
              if (dx < effectiveConsumed) {
                const ra = dx / adjustedRollR
                const sx = adjustedRollR * Math.sin(ra)
                const cz = adjustedRollR * (1 - Math.cos(ra))
                px = isFwd ? hingeX + sx : hingeX - sx
                pz = cz
              } else {
                const flatDx = dx - effectiveConsumed
                const endSx = adjustedRollR * Math.sin(effectiveFullAngle)
                const endCz = adjustedRollR * (1 - Math.cos(effectiveFullAngle))
                px = isFwd
                  ? hingeX + endSx + flatDx * Math.cos(effectiveFullAngle)
                  : hingeX - endSx - flatDx * Math.cos(effectiveFullAngle)
                pz = endCz + flatDx * Math.sin(effectiveFullAngle)
              }
              turnPos.setXYZ(i, px, oy, pz)
            }
            turnPos.needsUpdate = true
            geo.computeVertexNormals()
          }
        }

        const shadowMat = shadowMatRef.current
        if (shadowMat) {
          const shadowRaw = Math.min(raw, 1)
          shadowMat.opacity = Math.sin(shadowRaw * Math.PI) * 0.14
          shadowMat.needsUpdate = true
        }

        turnT.current = t
        if (raw >= 1.04) {
          if (shadowMatRef.current) {
            shadowMatRef.current.opacity = 0
            shadowMatRef.current.needsUpdate = true
          }
          ag.rotation.x = 0
          ag.rotation.z = 0
          dispatch('TURN_DONE')
        }
        break
      }

      case 'closing': {
        if (!ag) break
        const raw = Math.min(animTime.current / (ANIM_TIMING.close / 1000), 1)
        const et = easeInOutQuad(raw)

        const ot = openedTransformRef.current
        const startX = ot ? ot.pos[0] : toLocalX(0)
        const startY = ot ? ot.pos[1] : toLocalY(0)
        const startZ = ot ? ot.pos[2] : toLocalZ(0.5)

        ag.position.set(startX * (1 - et), startY * (1 - et), startZ * (1 - et))
        const init = initRef.current
        const sScale = init.scale > 0.001 ? init.scale : 1
        const toScale = fittedScale / sScale
        const s = 1 + (toScale - 1) * (1 - et)
        ag.scale.set(s, s, s)
        ag.rotation.set(0.08 * et, HALF_PI * et, 0)

        if (raw >= 1) dispatch('CLOSE_DONE')
        break
      }

      case 'finished':
      case 'idle':
        break
    }

    // ── Dust motes ─────────────────────────────────────
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

      <group ref={layoutGroupRef} visible={groupVisible}>
        <group ref={animGroupRef}>
          <BookModel3D
            bookH={bookH}
            spineT={spineT}
            pageW={pageW}
            leftDepth={leftDepth}
            rightDepth={rightDepth}
            leftPageTexture={leftPageTexture}
            rightPageTexture={rightPageTexture}
            state={state}
            direction={direction}
          />

          <mesh
            ref={turnedRef}
            position={[halfCenter, 0, 0.006]}
            geometry={turnedGeo}
            material={turnedMat}
            visible={state === 'turningPage'}
          />

          <mesh ref={shadowMeshRef} position={[halfCenter, 0, 0.001]} visible={state === 'turningPage'}>
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
