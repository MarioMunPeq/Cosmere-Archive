import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { type Group, type PerspectiveCamera as PC, PlaneGeometry, MeshBasicMaterial, DoubleSide } from 'three'
import type { Book } from '@/types'
import { type BookState, type BookEvent, ANIM_TIMING } from './BookAnimator'
import BookModel3D from './BookModel3D'
import BookContentRenderer from './BookContentRenderer'
import type { PageData } from './BookContent'

const shadowMat = new MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0,
  side: DoubleSide,
  depthWrite: false,
})

interface Props {
  book: Book
  spineRect: { x: number; y: number; w: number; h: number }
  dim: { bookW: number; bookH: number; spineT: number; pageW: number }
  state: BookState
  dispatch: (event: BookEvent) => void
  leftDepth: number
  rightDepth: number
  pages: PageData[]
  curPage: number
  totalSpreads: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 3
}

function easeOutBack(t: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

const MAX_COVER_DEG = -155
const CAM_VEC: [number, number, number] = [0.3, 0.9, 3.0]

export interface AnimProgress {
  coverDeg: number
  pageSpread: number
  groupPos: [number, number, number]
  groupScale: [number, number, number]
  groupRotY: number
  groupRotX: number
  groupRotZ: number
}

function PageContentArea({
  page,
  side,
  pageNum,
  contentOpacity,
  totalSpreads,
  onPrev,
  onNext,
  onClose,
  pxW,
  pxH,
}: {
  page: PageData | undefined
  side: 'left' | 'right'
  pageNum: number
  contentOpacity: number
  totalSpreads: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  pxW: number
  pxH: number
}) {
  const visible = contentOpacity > 0.01

  return (
    <div
      style={{
        width: pxW,
        height: pxH,
        opacity: contentOpacity,
        transition: 'opacity 300ms ease',
        pointerEvents: visible ? 'auto' : 'none',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Cormorant Garamond', 'Playfair Display', 'Georgia', serif",
        color: '#1a1a2e',
      }}
    >
      {page ? (
        <BookContentRenderer page={page} side={side} pageNum={pageNum} />
      ) : (
        <div style={{ padding: '40%', textAlign: 'center', color: 'rgba(26,26,46,0.25)', fontSize: 14 }}>&mdash;</div>
      )}

      {/* Integrated prev control — bottom-left of left page */}
      {visible && side === 'left' && (
        <span
          onClick={onPrev}
          style={{
            position: 'absolute',
            bottom: 10,
            left: 14,
            cursor: pageNum > 1 ? 'pointer' : 'default',
            fontSize: 18,
            color: pageNum > 1 ? 'rgba(26,26,46,0.25)' : 'rgba(26,26,46,0.08)',
            lineHeight: 1,
            userSelect: 'none',
          }}
          aria-label="Previous"
        >
          &#8249;
        </span>
      )}

      {/* Integrated next control — bottom-right of right page */}
      {visible && side === 'right' && (
        <span
          onClick={onNext}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 14,
            cursor: pageNum < totalSpreads ? 'pointer' : 'default',
            fontSize: 18,
            color: pageNum < totalSpreads ? 'rgba(26,26,46,0.25)' : 'rgba(26,26,46,0.08)',
            lineHeight: 1,
            userSelect: 'none',
          }}
          aria-label="Next"
        >
          &#8250;
        </span>
      )}

      {/* Close — top-right of right page */}
      {visible && side === 'right' && (
        <span
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 10,
            right: 14,
            cursor: 'pointer',
            fontSize: 14,
            color: 'rgba(26,26,46,0.15)',
            lineHeight: 1,
            userSelect: 'none',
          }}
          aria-label="Close book"
        >
          &#10005;
        </span>
      )}
    </div>
  )
}

export default function BookScene({
  book,
  spineRect,
  dim,
  state,
  dispatch,
  leftDepth,
  rightDepth,
  pages,
  curPage,
  totalSpreads,
  onPrev,
  onNext,
  onClose,
}: Props) {
  const { bookW, bookH, spineT, pageW } = dim
  const groupRef = useRef<Group>(null)
  const shadowRef = useRef<Group>(null)
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

  const vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camDist
  const safeYOffset = -vh * 0.1

  const progress = useRef<AnimProgress>({
    coverDeg: 0,
    pageSpread: 0,
    groupPos: [0, 0, 0],
    groupScale: [fittedScale, fittedScale, fittedScale],
    groupRotY: 0,
    groupRotX: 0,
    groupRotZ: 0,
  })

  const shelfPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const aspect = size.width / size.height
    const vhCalc = 2 * Math.tan((camera.fov * Math.PI) / 360) * camDist
    const vwCalc = vhCalc * aspect
    shelfPos.current.x = ((spineRect.x + spineRect.w / 2) / size.width - 0.5) * vwCalc
    shelfPos.current.y = (-(spineRect.y + spineRect.h / 2) / size.height + 0.5) * vhCalc
  }, [spineRect, camera, size, camDist])

  useEffect(() => {
    camera.position.set(...CAM_VEC)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  const shadowGeo = useMemo(() => new PlaneGeometry(bookW * 1.4, bookH * 0.4), [bookW, bookH])

  // Page content
  const spreadIndex = Math.floor(curPage / 2) * 2
  const leftPage: PageData | undefined = pages[spreadIndex]
  const rightPage: PageData | undefined = pages[spreadIndex + 1]
  const pageNum = spreadIndex / 2 + 1
  const halfCenter = pageW / 2 + spineT / 2

  // Html pixel dimensions
  const contentW = useMemo(() => Math.round(size.width * 0.28), [size.width])
  const contentH = useMemo(() => Math.round(size.height * 0.7), [size.height])

  // Content opacity derived from state (no ref access during render)
  const contentOpacity = useMemo(() => {
    if (state === 'opened' || state === 'turningPage') return 1
    if (state === 'opening') return 0.35
    if (state === 'closing') return 0.2
    return 0
  }, [state])

  useFrame((_, delta) => {
    if (prevState.current !== state) {
      prevState.current = state
      animTime.current = 0
    }

    const dt = Math.min(delta, 0.05)
    animTime.current += dt
    const p = progress.current

    switch (state) {
      case 'extracting': {
        const t = Math.min(animTime.current / (ANIM_TIMING.extract / 1000), 1)
        const et = easeOutExpo(t)
        p.groupPos[0] = shelfPos.current.x * (1 - et * 0.7)
        p.groupPos[1] = shelfPos.current.y * (1 - et * 0.3)
        p.groupPos[2] = -et * 0.5
        p.groupScale[0] = p.groupScale[1] = p.groupScale[2] = fittedScale * (1 + 0.04 * et)
        p.groupRotY = (Math.PI / 2) * (1 - et)
        if (t >= 1) dispatch('EXTRACT_DONE')
        break
      }
      case 'rotating': {
        const t = Math.min(animTime.current / (ANIM_TIMING.rotate / 1000), 1)
        const rt = easeInOutCubic(t)
        p.groupPos[0] *= 0.92
        p.groupPos[2] = -0.5 + rt * 0.05
        p.groupRotY = (Math.PI / 2) * (1 - rt) * 0.15
        if (t >= 1) dispatch('ROTATE_DONE')
        break
      }
      case 'centering': {
        const t = Math.min(animTime.current / (ANIM_TIMING.center / 1000), 1)
        const ct = easeInOutCubic(t)
        p.groupPos[0] = shelfPos.current.x * (1 - ct) * (1 - ct * 0.3)
        p.groupPos[1] = safeYOffset * ct + shelfPos.current.y * (1 - ct) * 0.15
        p.groupPos[2] = -0.45 * (1 - ct)
        p.groupRotY = 0
        p.groupScale[0] = p.groupScale[1] = p.groupScale[2] = fittedScale * (1.04 - 0.04 * ct)
        if (t >= 1) dispatch('CENTER_DONE')
        break
      }
      case 'opening': {
        const t = Math.min(animTime.current / (ANIM_TIMING.open / 1000), 1)
        const ot = easeOutBack(t)
        p.coverDeg = MAX_COVER_DEG * ot
        p.pageSpread = Math.min(t * 1.2, 1)
        if (t >= 1) dispatch('OPEN_DONE')
        break
      }
      case 'opened': {
        p.coverDeg = MAX_COVER_DEG
        p.pageSpread = 1
        break
      }
      case 'turningPage': {
        const t = Math.min(animTime.current / (ANIM_TIMING.pageTurn / 1000), 1)
        p.coverDeg = MAX_COVER_DEG
        p.pageSpread = 1
        if (t >= 1) dispatch('TURN_DONE')
        break
      }
      case 'closing': {
        const t = Math.min(animTime.current / (ANIM_TIMING.closeCover / 1000), 1)
        p.coverDeg = MAX_COVER_DEG * (1 - t)
        p.pageSpread = Math.max(1 - t * 1.2, 0)
        if (t >= 1) dispatch('COVER_CLOSED')
        break
      }
      case 'returning': {
        const t = Math.min(animTime.current / (ANIM_TIMING.closeFlight / 1000), 1)
        const rt = easeOutExpo(t)
        p.groupPos[0] = shelfPos.current.x * rt
        p.groupPos[1] = safeYOffset * (1 - rt) + shelfPos.current.y * rt * 0.25
        p.groupPos[2] = -0.5 * rt
        p.groupRotY = (Math.PI / 2) * rt * 0.3
        p.groupScale[0] = p.groupScale[1] = p.groupScale[2] = fittedScale * (1 + 0.06 * rt)
        if (t >= 1) dispatch('RETURN_DONE')
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

    if (shadowRef.current) {
      const opened = state === 'opened' || state === 'turningPage'
      shadowMat.opacity = opened ? 0.2 : 0
      shadowMat.needsUpdate = true
      shadowRef.current.position.set(
        p.groupPos[0],
        p.groupPos[1] - bookH * 0.55 * p.groupScale[1],
        p.groupPos[2] + 0.05,
      )
      shadowRef.current.scale.set(p.groupScale[0], 1, p.groupScale[2])
      shadowRef.current.rotation.x = -Math.PI / 2
    }
  })

  const showContent = state !== 'idle' && state !== 'finished'

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.5, 4, 3]} intensity={0.95} color="#ffe4cc" />
      <directionalLight position={[-1.5, 2, -1]} intensity={0.3} color="#cce4ff" />
      <directionalLight position={[2.5, 0.5, -2.5]} intensity={0.2} color="#ffe4cc" />
      <directionalLight position={[0, 3, 0]} intensity={0.15} color="#ffffff" />

      <mesh ref={shadowRef} geometry={shadowGeo} material={shadowMat} />

      <group ref={groupRef}>
        <BookModel3D
          book={book}
          bookW={bookW}
          bookH={bookH}
          spineT={spineT}
          pageW={pageW}
          progress={progress}
          leftDepth={leftDepth}
          rightDepth={rightDepth}
        />

        {/* Left page content — Html inside the 3D group, follows all transforms */}
        {showContent && (
          <Html position={[-halfCenter, 0, 0.006]} transform style={{ width: contentW, height: contentH }}>
            <PageContentArea
              page={leftPage}
              side="left"
              pageNum={pageNum}
              contentOpacity={contentOpacity}
              totalSpreads={totalSpreads}
              onPrev={onPrev}
              onNext={onNext}
              onClose={onClose}
              pxW={contentW}
              pxH={contentH}
            />
          </Html>
        )}

        {/* Right page content */}
        {showContent && (
          <Html position={[halfCenter, 0, 0.006]} transform style={{ width: contentW, height: contentH }}>
            <PageContentArea
              page={rightPage}
              side="right"
              pageNum={pageNum}
              contentOpacity={contentOpacity}
              totalSpreads={totalSpreads}
              onPrev={onPrev}
              onNext={onNext}
              onClose={onClose}
              pxW={contentW}
              pxH={contentH}
            />
          </Html>
        )}
      </group>
    </>
  )
}
