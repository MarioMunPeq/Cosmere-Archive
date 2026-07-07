import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react'
import type { Book } from '@/types'
import { type BookPhase, TIMING, EASING } from './BookAnimation'
import BookModel from './BookModel'
import BookControls from './BookControls'
import BookContentRenderer from './BookContentRenderer'
import PageTurn from './PageTurn'
import { generatePages, type PageData } from './BookContent'

interface Props {
  book: Book
  rect: { x: number; y: number; w: number; h: number }
  onClose: () => void
}

function getDimensions(ww: number, wc: number) {
  const spineT = Math.max(18, Math.min(54, Math.round(wc / 5000)))
  const bw = Math.min(800, Math.round(ww * 0.72))
  const pw = Math.round((bw - spineT) / 2)
  const bh = Math.round(pw * 1.4)
  return { bookW: bw, bookH: bh, spineT, pageW: pw }
}

export default function BookViewer({ book, rect, onClose }: Props) {
  const [ws, setWs] = useState({ ww: window.innerWidth, wh: window.innerHeight })
  const [phase, setPhase] = useState<BookPhase>('extracting')
  const [settle, setSettle] = useState(false)
  const [curPage, setCurPage] = useState(0)
  const [turning, setTurning] = useState<'forward' | 'backward' | null>(null)

  const showContent = phase === 'reading'
  const coverDeg = phase === 'opening' || phase === 'reading' ? -172 : 0

  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const flipRef = useRef<HTMLDivElement>(null)
  const book3dRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const up = () => setWs({ ww: window.innerWidth, wh: window.innerHeight })
    window.addEventListener('resize', up)
    return () => window.removeEventListener('resize', up)
  }, [])

  const pages = useMemo(() => generatePages(book), [book])
  const totalPages = pages.length

  const { bookW, bookH, spineT, pageW } = useMemo(
    () => getDimensions(ws.ww, book.wordCount ?? 100000),
    [ws.ww, book.wordCount],
  )

  const centerX = Math.round((ws.ww - bookW) / 2)
  const centerY = Math.round((ws.wh - bookH) / 2)
  const extractZ = Math.min(80, Math.round(bookH * 0.25))

  const flip = useMemo(
    () => ({
      dx: rect.x - centerX,
      dy: rect.y - centerY,
      sx: rect.w / bookW,
      sy: rect.h / bookH,
    }),
    [rect, bookW, bookH, centerX, centerY],
  )

  // FLIP: set initial position at spine (intentionally runs once)
  useLayoutEffect(() => {
    const el = flipRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.transform = `translate3d(${flip.dx}px, ${flip.dy}px, 0) rotateY(90deg) scale3d(${flip.sx}, ${flip.sy}, 1)`
    el.getBoundingClientRect()
    // Start extraction
    requestAnimationFrame(() => setPhase('extracting'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Phase transitions
  useEffect(() => {
    const el = flipRef.current
    const b3d = book3dRef.current
    if (!el || !b3d) return

    switch (phase) {
      case 'extracting': {
        el.style.transition = `transform ${TIMING.extracting}ms ${EASING.extract}`
        el.style.transform = `translate3d(${flip.dx}px, ${flip.dy}px, ${extractZ}px) rotateY(90deg) scale3d(${flip.sx}, ${flip.sy}, 1)`
        const t = setTimeout(() => setPhase('rotating'), TIMING.extracting)
        return () => clearTimeout(t)
      }
      case 'rotating': {
        el.style.transition = `transform ${TIMING.rotating}ms ${EASING.rotateBook}`
        el.style.transform = `translate3d(${flip.dx}px, ${flip.dy}px, ${extractZ}px) rotateY(0deg) scale3d(${flip.sx}, ${flip.sy}, 1)`
        const t = setTimeout(() => setPhase('centering'), TIMING.rotating)
        return () => clearTimeout(t)
      }
      case 'centering': {
        el.style.transition = `transform ${TIMING.centering}ms ${EASING.center}`
        el.style.transform = `translate3d(0, 0, 0) rotateY(0deg) scale3d(1, 1, 1)`
        const t = setTimeout(() => setPhase('opening'), TIMING.centering)
        return () => clearTimeout(t)
      }
      case 'opening': {
        const t = setTimeout(() => {
          setPhase('reading')
          setSettle(true)
        }, TIMING.opening)
        const t2 = setTimeout(() => setSettle(false), TIMING.opening + TIMING.settle)
        return () => {
          clearTimeout(t)
          clearTimeout(t2)
        }
      }
      case 'closing': {
        const t1 = setTimeout(() => {
          el.style.transition = `transform ${TIMING.closing_flight}ms ${EASING.closeFlight}`
          b3d.style.transition = `transform ${TIMING.closing_flight}ms ${EASING.closeFlight}`
          el.style.transform = `translate3d(${flip.dx}px, ${flip.dy}px, ${extractZ}px) rotateY(0deg) scale3d(${flip.sx}, ${flip.sy}, 1)`
          b3d.style.transform = 'rotateY(0deg)'
          setTimeout(() => {
            el.style.transition = `transform ${TIMING.extracting}ms ${EASING.extract}`
            el.style.transform = `translate3d(${flip.dx}px, ${flip.dy}px, 0) rotateY(90deg) scale3d(${flip.sx}, ${flip.sy}, 1)`
            b3d.style.transform = ''
            setTimeout(() => onCloseRef.current(), TIMING.extracting)
          }, TIMING.closing_flight)
        }, TIMING.closing_cover)
        return () => {
          clearTimeout(t1)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const handlePrev = useCallback(() => {
    if (curPage > 0 && !turning) {
      setTurning('backward')
    }
  }, [curPage, turning])

  const handleNext = useCallback(() => {
    if (curPage < totalPages - 1 && !turning) {
      setTurning('forward')
    }
  }, [curPage, totalPages, turning])

  const handleTurnComplete = useCallback(() => {
    setTurning(null)
    if (turning === 'forward') {
      setCurPage((p) => Math.min(p + 1, totalPages - 1))
    } else if (turning === 'backward') {
      setCurPage((p) => Math.max(p - 1, 0))
    }
  }, [turning, totalPages])

  const handleClose = useCallback(() => {
    setPhase('closing')
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    },
    [handleClose, handleNext, handlePrev],
  )

  // Current spread: the book shows spread for curPage (left = even index, right = odd index)
  // For simplicity: page 0 → spread 0 (left=page[0], right=page[1])
  //               page 2 → spread 1 (left=page[2], right=page[3])
  // We show two pages at a time. curPage is the index of the left page in the spread.
  const spreadIndex = Math.floor(curPage / 2) * 2
  const leftPage: PageData | undefined = pages[spreadIndex]
  const rightPage: PageData | undefined = pages[spreadIndex + 1]
  const nextRightPage: PageData | undefined = pages[spreadIndex + 2] // for page turn back
  const prevLeftPage: PageData | undefined = pages[spreadIndex - 1] // for page turn back

  const pageNum = spreadIndex / 2 + 1
  const totalSpreads = Math.max(1, Math.ceil(totalPages / 2))

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1600px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && phase === 'reading') handleClose()
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(0,0,0,${phase === 'reading' ? '0.5' : '0.3'})`,
          backdropFilter: phase === 'reading' ? 'blur(4px)' : 'blur(1.5px)',
          WebkitBackdropFilter: phase === 'reading' ? 'blur(4px)' : 'blur(1.5px)',
          transition: 'all 700ms ease',
          pointerEvents: 'none',
        }}
      />

      {/* FLIP wrapper */}
      <div
        ref={flipRef}
        style={{
          position: 'absolute',
          top: centerY,
          left: centerX,
          width: bookW,
          height: bookH,
          willChange: 'transform',
          transformStyle: 'preserve-3d',
          pointerEvents: phase === 'reading' ? 'auto' : 'none',
        }}
        className={settle ? 'book-settle' : ''}
      >
        {/* 3D Book */}
        <div
          ref={book3dRef}
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          <BookModel
            book={book}
            spineT={spineT}
            pageW={pageW}
            coverDeg={coverDeg}
            showContent={showContent}
            leftChildren={leftPage ? <BookContentRenderer page={leftPage} side="left" /> : null}
            rightChildren={rightPage ? <BookContentRenderer page={rightPage} side="right" /> : null}
            turnElement={
              turning === 'forward' && rightPage && nextRightPage ? (
                <PageTurn
                  pageW={pageW}
                  pageH={bookH}
                  active={true}
                  direction="forward"
                  front={<BookContentRenderer page={rightPage} side="right" />}
                  back={<BookContentRenderer page={nextRightPage} side="left" />}
                  onComplete={handleTurnComplete}
                />
              ) : turning === 'backward' && leftPage && prevLeftPage ? (
                <PageTurn
                  pageW={pageW}
                  pageH={bookH}
                  active={true}
                  direction="backward"
                  front={<BookContentRenderer page={leftPage} side="left" />}
                  back={<BookContentRenderer page={prevLeftPage} side="right" />}
                  onComplete={handleTurnComplete}
                />
              ) : null
            }
            navigation={
              <BookControls
                current={pageNum}
                total={totalSpreads}
                onPrev={handlePrev}
                onNext={handleNext}
                onClose={handleClose}
                visible={phase === 'reading'}
              />
            }
          />
        </div>
      </div>
    </div>
  )
}
