import { useEffect, useMemo, useState, useCallback, startTransition } from 'react'
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

/** Scene dimensions (3D units) */
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
  const [state, setState] = useState<BookState>('idle')
  const [curPage, setCurPage] = useState(0)

  const sceneDim = useMemo(() => getSceneDimensions(ws.ww, ws.wh, book.wordCount ?? 100000), [ws, book.wordCount])

  const pages = useMemo(() => generatePages(book), [book])
  const totalPages = pages.length
  const totalSpreads = Math.max(1, Math.ceil(totalPages / 2))
  const spreadIndex = Math.floor(curPage / 2) * 2
  const turnedSpreads = spreadIndex / 2
  const leftDepth = turnedSpreads
  const rightDepth = totalSpreads - turnedSpreads - 1

  useEffect(() => {
    const up = () => setWs({ ww: window.innerWidth, wh: window.innerHeight })
    window.addEventListener('resize', up)
    return () => window.removeEventListener('resize', up)
  }, [])

  const dispatch = useCallback((event: BookEvent) => {
    setState((prev) => transition(prev, event))
  }, [])

  useEffect(() => {
    startTransition(() => dispatch('EXTRACT'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Delay unmount to let return animation finish visually
  useEffect(() => {
    if (state === 'finished') {
      const t = setTimeout(onClose, 150)
      return () => clearTimeout(t)
    }
  }, [state, onClose])

  const handleNext = useCallback(() => {
    if (curPage < totalPages - 1 && state === 'opened') {
      dispatch('TURN_START')
      setCurPage((p) => Math.min(p + 1, totalPages - 1))
    }
  }, [curPage, totalPages, dispatch, state])

  const handlePrev = useCallback(() => {
    if (curPage > 0 && state === 'opened') {
      dispatch('TURN_START')
      setCurPage((p) => Math.max(p - 1, 0))
    }
  }, [curPage, dispatch, state])

  const handleClose = useCallback(() => {
    if (state !== 'closing' && state !== 'returning' && state !== 'finished') {
      dispatch('CLOSE')
    }
  }, [dispatch, state])

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 49,
          background: `rgba(0,0,0,${state === 'finished' || state === 'idle' ? 0 : 0.2})`,
          backdropFilter: isOpen(state) ? 'blur(1.5px)' : 'blur(0.5px)',
          WebkitBackdropFilter: isOpen(state) ? 'blur(1.5px)' : 'blur(0.5px)',
          transition: 'background 700ms ease, backdrop-filter 700ms ease',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Canvas */}
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
          onPointerMissed={isOpen(state) ? handleClose : undefined}
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
            curPage={curPage}
            totalSpreads={totalSpreads}
            onPrev={handlePrev}
            onNext={handleNext}
            onClose={handleClose}
          />
        </Canvas>
      </div>
    </>
  )
}
