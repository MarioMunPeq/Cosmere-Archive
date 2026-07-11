import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import SearchBar from '@/components/common/SearchBar'
import ThemeToggle from '@/components/ui/ThemeToggle'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const

const DRAWER_LINKS: { to: string; label: string }[] = [
  { to: '/map', label: 'Interactive Map' },
  { to: '/characters', label: 'Characters' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/books', label: 'Books' },
  { to: '/locations', label: 'Locations' },
  { to: '/magic', label: 'Magic Systems' },
  { to: '/library', label: 'Library' },
  { to: '/stats', label: 'Stats' },
  { to: '/heralds', label: 'Heralds' },
  { to: '/mind-map', label: 'Mind Map' },
]

interface Props {
  open: boolean
  onClose: () => void
  navRef: React.RefObject<HTMLElement | null>
}

export default function ParchmentMenu({ open, onClose, navRef }: Props) {
  const navigate = useViewTransitionNavigate()
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuTop, setMenuTop] = useState(0)

  useEffect(() => {
    if (!open || !navRef.current) return
    const nav = navRef.current
    const rect = nav.getBoundingClientRect()
    setMenuTop(rect.bottom)
  }, [open, navRef])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const id = setTimeout(() => document.addEventListener('mousedown', onMouseDown), 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    function onResize() {
      if (navRef.current) {
        setMenuTop(navRef.current.getBoundingClientRect().bottom)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open, navRef])

  const handleNavigate = useCallback(
    (to: string) => {
      navigate(to)
      onClose()
    },
    [navigate, onClose],
  )

  const isActive = (to: string) => location.pathname + location.search === to || location.pathname === to

  if (!open) return null

  return createPortal(
    <div ref={menuRef} className="fixed inset-x-0 z-50 flex justify-center" style={{ top: menuTop }}>
      <div className="w-full animate-parchment-unfold px-2 sm:px-4" style={{ maxWidth: '896px' }}>
        <div
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,119,90,0.025) 2px, rgba(139,119,90,0.025) 4px), linear-gradient(180deg, #f5efe6 0%, #ede3d5 100%)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1)',
            border: '0.5px solid rgba(180,150,100,0.2)',
            borderRadius: '0 0 3px 3px',
          }}
        >
          <div className="flex items-center justify-between border-b border-[rgba(139,119,90,0.12)] px-6 pt-5 pb-3">
            <span
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '15px',
                letterSpacing: '0.08em',
                color: '#6b5a4a',
              }}
            >
              ARCHIVE INDEX
            </span>
            <button
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded-sm transition-colors hover:bg-[rgba(139,119,90,0.12)]"
              aria-label="Close menu"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#8a7a6a" strokeWidth="1.2">
                <path d="M1 1l10 10M11 1L1 11" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="border-b border-[rgba(139,119,90,0.08)] px-6 py-3">
            <SearchBar />
          </div>

          <div className="flex items-center border-b border-[rgba(139,119,90,0.08)] px-6 py-2.5">
            <ThemeToggle />
          </div>

          <nav className="px-4 py-3">
            {DRAWER_LINKS.map((link, i) => (
              <button
                key={link.to}
                onClick={() => handleNavigate(link.to)}
                className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-all duration-200 hover:bg-[rgba(139,119,90,0.1)]"
              >
                <span
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '13px',
                    color: isActive(link.to) ? '#b88930' : 'rgba(139,119,90,0.5)',
                    minWidth: '28px',
                    textAlign: 'right',
                    transition: 'color 0.2s',
                  }}
                >
                  {ROMAN[i]}.
                </span>
                <span
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '15px',
                    color: isActive(link.to) ? '#2d1a0e' : '#6b5a4a',
                    fontWeight: isActive(link.to) ? 700 : 400,
                    letterSpacing: '0.02em',
                    transition: 'color 0.2s, font-weight 0.2s',
                  }}
                >
                  {link.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="border-t border-[rgba(139,119,90,0.08)] px-6 py-3 text-center">
            <span
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '11px',
                color: 'rgba(139,119,90,0.35)',
                letterSpacing: '0.06em',
              }}
            >
              — ARCHIVES OF THE COSMERE —
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
