import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Book } from '@/types'
import { type BookState, type BookEvent, transition, isOpen } from './BookAnimator'
import BookScene from './BookScene'
import { generatePages } from './BookContent'

interface Props {
  book: Book
  rect: { x: number; y: number; w: number; h: number }
  onClose: () => void
}

function getSceneDimensions(ww: number, wh: number, wc: number) {
  const camDist = Math.sqrt(0.3 ** 2 + 0.9 ** 2 + 3.0 ** 2)
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
  const [state, setState] = useState<BookState>('extracting')
  const [curSpread, setCurSpread] = useState(0)
  const pendingDir = useRef<'next' | 'prev' | null>(null)
  const prevStateRef = useRef<BookState>('extracting')

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
    if (state !== 'closing' && state !== 'returning' && state !== 'finished') {
      dispatch('CLOSE')
    }
  }, [dispatch, state])

  const bookOpen = isOpen(state)
  const showControls = state === 'opened'

  return (
    <>
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

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <Canvas
          camera={{ position: [0.3, 0.9, 3.0], fov: 35, near: 0.1, far: 10 }}
          gl={{ alpha: true, antialias: true }}
          style={{ width: '100%', height: '100%' }}
          dpr={[1, 1.5]}
          onPointerMissed={bookOpen ? handleClose : undefined}
        >
          <BookScene
            book={book}
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

      {showControls && (
        <div
          style={{
            position: 'fixed',
            bottom: 36,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            background: 'rgba(16,14,24,0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 32,
            padding: '6px 18px',
            pointerEvents: 'auto',
            userSelect: 'none',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <button
            onClick={handlePrev}
            disabled={curSpread === 0}
            aria-label="Previous page"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: curSpread > 0 ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: curSpread > 0 ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.04)',
              borderRadius: '50%',
              color: curSpread > 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
              fontSize: 18,
              cursor: curSpread > 0 ? 'pointer' : 'default',
              padding: 0,
              lineHeight: 1,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              if (curSpread > 0) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = curSpread > 0 ? 'rgba(255,255,255,0.06)' : 'transparent'
              e.currentTarget.style.color = curSpread > 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 3L5 7L9 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: 12,
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.1em',
              minWidth: 48,
              textAlign: 'center',
            }}
          >
            {curSpread + 1} / {totalSpreads}
          </span>

          <button
            onClick={handleNext}
            disabled={curSpread >= totalSpreads - 1}
            aria-label="Next page"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: curSpread < totalSpreads - 1 ? 'rgba(255,255,255,0.06)' : 'transparent',
              border:
                curSpread < totalSpreads - 1 ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.04)',
              borderRadius: '50%',
              color: curSpread < totalSpreads - 1 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
              fontSize: 18,
              cursor: curSpread < totalSpreads - 1 ? 'pointer' : 'default',
              padding: 0,
              lineHeight: 1,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              if (curSpread < totalSpreads - 1) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = curSpread < totalSpreads - 1 ? 'rgba(255,255,255,0.06)' : 'transparent'
              e.currentTarget.style.color =
                curSpread < totalSpreads - 1 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 3L9 7L5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)' }} />

          <button
            onClick={handleClose}
            aria-label="Close book"
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 14,
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
