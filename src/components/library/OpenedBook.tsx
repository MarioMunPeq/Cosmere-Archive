import { useEffect, useState, useCallback } from 'react'
import type { Book } from '@/types'
import BookPageContent from './BookPageContent'

interface Props {
  book: Book
  onClose: () => void
}

const PAGE_THICKNESS = 8
const PAGE_COUNT = 6

export default function OpenedBook({ book, onClose }: Props) {
  const [open, setOpen] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    const t1 = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(t1)
  }, [])

  useEffect(() => {
    if (open) {
      const t2 = setTimeout(() => setContentVisible(true), 500)
      return () => clearTimeout(t2)
    }
  }, [open])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  const pageWidth = Math.round(book.wordCount ? Math.min(400, 120 + book.wordCount * 0.003) : 200)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-label={`${book.title} — opened book`}
    >
      <div
        className="relative"
        style={{
          width: pageWidth * 2 + 20,
          maxWidth: '90vw',
          maxHeight: '85vh',
          perspective: '1600px',
        }}
      >
        <div
          className="relative"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.9s cubic-bezier(0.4, 0.0, 0.2, 1)',
            transform: open ? 'translateZ(0)' : 'translateZ(-200px)',
          }}
        >
          {/* Front cover — rotates open */}
          <div
            className="absolute inset-0"
            style={{
              width: '100%',
              height: '100%',
              transformOrigin: 'left center',
              transform: open ? 'rotateY(-172deg)' : 'rotateY(0deg)',
              transition: 'transform 0.9s cubic-bezier(0.4, 0.0, 0.2, 1)',
              backfaceVisibility: 'hidden',
              zIndex: open ? 1 : 10,
            }}
          >
            <div
              className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-r"
              style={{
                background: 'linear-gradient(180deg, #0c1220 0%, #060a12 50%, #0c1220 100%)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '4px 20px 20px 4px',
                boxShadow: open ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              <div
                className="opacity-60"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: '#c0c8d4',
                  fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {book.title}
              </div>
              <div
                className="mt-3 opacity-30"
                style={{
                  width: '40%',
                  height: 1,
                  background: 'linear-gradient(90deg, transparent, #c0c8d4, transparent)',
                }}
              />
              <div
                className="mt-2 text-xs opacity-20"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
                  color: '#c0c8d4',
                  letterSpacing: '0.2em',
                }}
              >
                Brandon Sanderson
              </div>
            </div>
          </div>

          {/* Pages stack */}
          <div
            className="relative overflow-hidden"
            style={{
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transform: `translateZ(${PAGE_THICKNESS}px)`,
              zIndex: 5,
            }}
          >
            {Array.from({ length: PAGE_COUNT }, (_, i) => (
              <div
                key={i}
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, #e8e0d0 0%, #f5f0e8 40%, #faf5ed 60%, #e8e0d0 100%)',
                  boxShadow: i === 0 ? '0 0 20px rgba(0,0,0,0.15)' : '0 0 1px rgba(0,0,0,0.02)',
                  transform: `translateZ(${i * 1.2}px)`,
                  borderRadius: '0 4px 4px 0',
                }}
              />
            ))}

            {/* Page content */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translateZ(${PAGE_COUNT * 1.2 + 1}px)`,
                opacity: contentVisible ? 1 : 0,
                transition: 'opacity 0.4s ease-in',
                background: '#faf5ed',
                borderRadius: '0 4px 4px 0',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.04)',
                overflow: 'auto',
              }}
            >
              <BookPageContent book={book} />
            </div>
          </div>

          {/* Back cover */}
          <div
            className="absolute inset-0"
            style={{
              width: '100%',
              height: '100%',
              transform: `translateZ(-2px)`,
              zIndex: 2,
            }}
          >
            <div
              className="h-full w-full rounded-r"
              style={{
                background: 'linear-gradient(180deg, #060a12 0%, #0c1220 50%, #060a12 100%)',
                border: '1px solid rgba(255,255,255,0.025)',
                borderRadius: '4px 20px 20px 4px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        </div>

        {/* Close button */}
        <button
          className="absolute -top-8 right-0 text-white/60 hover:text-white transition-colors text-2xl leading-none cursor-pointer"
          onClick={onClose}
          aria-label="Close book"
        >
          ×
        </button>
      </div>
    </div>
  )
}
