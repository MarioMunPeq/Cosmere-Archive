import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Book } from '@/types'
import { type BookState, type BookEvent, transition, isOpen } from './BookAnimator'
import BookScene from './BookScene'
import { generatePages } from './BookContent'
import CornerFold from './CornerFold'

interface Props {
  book: Book
  rect: { x: number; y: number; w: number; h: number }
  onClose: () => void
}

function getSceneDimensions(ww: number, wh: number, wc: number) {
  const camDist = Math.sqrt(0 ** 2 + 0.15 ** 2 + 3.0 ** 2)
  const vh = 2 * Math.tan((35 * Math.PI) / 360) * camDist
  const vw = vh * (ww / wh)
  const spineT = Math.max(0.02, Math.min(0.1, wc / 5000000))
  const bw = vw * 0.65
  const maxH = vh * 0.7
  const bh = Math.min(bw * 0.62, maxH)
  const pw = (bw - spineT) / 2
  return { bookW: bw, bookH: bh, spineT, pageW: pw }
}

export default function BookCanvas({ book, rect, onClose }: Props) {
  const [ws, setWs] = useState({ ww: window.innerWidth, wh: window.innerHeight })
  const [state, setState] = useState<BookState>('spawning')
  const [curSpread, setCurSpread] = useState(0)
  const pendingDir = useRef<'next' | 'prev' | null>(null)
  const prevStateRef = useRef<BookState>('spawning')

  const sceneDim = useMemo(() => getSceneDimensions(ws.ww, ws.wh, book.wordCount ?? 100000), [ws, book.wordCount])

  const pages = useMemo(() => generatePages(book), [book])
  const totalPages = pages.length
  const totalSpreads = Math.max(1, Math.ceil(totalPages / 2))
  const leftDepth = curSpread
  const rightDepth = totalSpreads - curSpread - 1

  useEffect(() => {
    const up = () => setWs({ ww: window.innerWidth, wh: window.innerHeight })
    window.addEventListener('resize', up)
    return () => window.removeEventListener('resize', up)
  }, [])

  const dispatch = useCallback((event: BookEvent) => {
    setState((prev) => transition(prev, event))
  }, [])

  // Advance spread only after turn animation completes
  useEffect(() => {
    if (prevStateRef.current === 'turningPage' && state === 'opened' && pendingDir.current) {
      if (pendingDir.current === 'next') {
        setCurSpread((p) => Math.min(p + 1, totalSpreads - 1))
      } else {
        setCurSpread((p) => Math.max(p - 1, 0))
      }
      pendingDir.current = null
    }
    prevStateRef.current = state
  }, [state, totalSpreads])

  useEffect(() => {
    if (state === 'finished') {
      const t = setTimeout(onClose, 150)
      return () => clearTimeout(t)
    }
  }, [state, onClose])

  // ── Keyboard navigation ────────────────────────────────────
  useEffect(() => {
    const opened = state === 'opened'
    const closable = state !== 'closing' && state !== 'finished'
    const handler = (e: KeyboardEvent) => {
      if (!opened) return
      if (e.key === 'ArrowLeft' && curSpread > 0) {
        pendingDir.current = 'prev'
        dispatch('TURN_START')
      } else if (e.key === 'ArrowRight' && curSpread < totalSpreads - 1) {
        pendingDir.current = 'next'
        dispatch('TURN_START')
      } else if (e.key === 'Escape' && closable) {
        dispatch('CLOSE')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state, curSpread, totalSpreads, dispatch])

  const handleNext = useCallback(() => {
    if (curSpread < totalSpreads - 1 && state === 'opened') {
      pendingDir.current = 'next'
      dispatch('TURN_START')
    }
  }, [curSpread, totalSpreads, dispatch, state])

  const handlePrev = useCallback(() => {
    if (curSpread > 0 && state === 'opened') {
      pendingDir.current = 'prev'
      dispatch('TURN_START')
    }
  }, [curSpread, dispatch, state])

  const handleClose = useCallback(() => {
    if (state !== 'closing' && state !== 'finished') {
      dispatch('CLOSE')
    }
  }, [dispatch, state])

  const bookOpen = isOpen(state)

  return (
    <>
      {/* Dim backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 49,
          background: `rgba(0,0,0,${state === 'finished' || state === 'idle' ? 0 : 0.2})`,
          backdropFilter: bookOpen ? 'blur(1.5px)' : 'blur(0.5px)',
          WebkitBackdropFilter: bookOpen ? 'blur(1.5px)' : 'blur(0.5px)',
          transition: 'background 700ms ease, backdrop-filter 700ms ease',
          pointerEvents: 'none',
        }}
      />

      {/* 3D canvas */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <Canvas
          camera={{ position: [0, 0.15, 3.0], fov: 35, near: 0.1, far: 10 }}
          gl={{ alpha: true, antialias: true }}
          style={{ width: '100%', height: '100%' }}
          dpr={[1, 1.5]}
          onPointerMissed={bookOpen ? handleClose : undefined}
        >
          <BookScene
            spineRect={rect}
            dim={sceneDim}
            state={state}
            dispatch={dispatch}
            leftDepth={leftDepth}
            rightDepth={rightDepth}
            pages={pages}
            curPage={curSpread * 2}
          />
        </Canvas>
      </div>

      {/* Invisible click zones + corner-fold indicators */}
      {bookOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 55,
            pointerEvents: 'none',
          }}
        >
          {/* Left zone — prev */}
          {curSpread > 0 && (
            <div
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '45%',
                height: '100%',
                pointerEvents: 'auto',
                cursor: 'pointer',
              }}
            />
          )}

          {/* Right zone — next */}
          {curSpread < totalSpreads - 1 && (
            <div
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '45%',
                height: '100%',
                pointerEvents: 'auto',
                cursor: 'pointer',
              }}
            />
          )}

          {/* Corner folds */}
          <div
            style={{
              position: 'absolute',
              left: '18%',
              bottom: '15%',
              transform: 'translateY(50%)',
            }}
          >
            <CornerFold side="left" visible={curSpread > 0} />
          </div>
          <div
            style={{
              position: 'absolute',
              right: '18%',
              bottom: '15%',
              transform: 'translateY(50%)',
            }}
          >
            <CornerFold side="right" visible={curSpread < totalSpreads - 1} />
          </div>
        </div>
      )}
    </>
  )
}
