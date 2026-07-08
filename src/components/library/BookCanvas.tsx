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
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 28,
            padding: '8px 20px',
            pointerEvents: 'auto',
            userSelect: 'none',
          }}
        >
          <button
            onClick={handlePrev}
            disabled={curSpread === 0}
            aria-label="Previous page"
            style={{
              background: 'none',
              border: 'none',
              color: curSpread > 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
              fontSize: 22,
              cursor: curSpread > 0 ? 'pointer' : 'default',
              padding: '4px 8px',
              lineHeight: 1,
            }}
          >
            &#8249;
          </button>

          <span
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 13,
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.08em',
            }}
          >
            {curSpread + 1} / {totalSpreads}
          </span>

          <button
            onClick={handleNext}
            disabled={curSpread >= totalSpreads - 1}
            aria-label="Next page"
            style={{
              background: 'none',
              border: 'none',
              color: curSpread < totalSpreads - 1 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
              fontSize: 22,
              cursor: curSpread < totalSpreads - 1 ? 'pointer' : 'default',
              padding: '4px 8px',
              lineHeight: 1,
            }}
          >
            &#8250;
          </button>

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

          <button
            onClick={handleClose}
            aria-label="Close book"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 16,
              cursor: 'pointer',
              padding: '4px 8px',
              lineHeight: 1,
            }}
          >
            &#10005;
          </button>
        </div>
      )}
    </>
  )
}
