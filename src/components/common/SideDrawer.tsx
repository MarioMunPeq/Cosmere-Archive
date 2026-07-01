import { useCallback, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import SearchBar from '@/components/common/SearchBar'
import SpoilerToggle from '@/components/ui/SpoilerToggle'
import ThemeToggle from '@/components/ui/ThemeToggle'

const DRAWER_LINKS: { to: string; label: string }[] = [
  { to: '/map', label: 'Interactive Map' },
  { to: '/characters', label: 'Characters' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/books', label: 'Books' },
  { to: '/locations', label: 'Locations' },
  { to: '/magic', label: 'Magic Systems' },
  { to: '/stats', label: 'Stats' },
  { to: '/heralds', label: 'Heralds' },

  { to: '/mind-map', label: 'Mind Map' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function SideDrawer({ open, onClose }: Props) {
  const navigate = useViewTransitionNavigate()
  const location = useLocation()
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleNavigate = useCallback(
    (to: string) => {
      navigate(to)
      onClose()
    },
    [navigate, onClose],
  )

  const isActive = (to: string) => location.pathname + location.search === to || location.pathname === to

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-gray-950 shadow-2xl shadow-black/50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
          <span className="text-sm font-bold tracking-wider text-purple-400">COSMERE ARCHIVE</span>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-200"
            aria-label="Close menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="border-b border-gray-800 px-4 py-3">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-2">
          <SpoilerToggle />
          <ThemeToggle />
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {DRAWER_LINKS.map((link) => (
            <button
              key={link.to}
              onClick={() => handleNavigate(link.to)}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                isActive(link.to)
                  ? 'bg-purple-900/30 text-purple-400'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}
