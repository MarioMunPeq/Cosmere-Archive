import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import { BOOKS, ALL_CHARACTERS } from '@/data/static'
import EmptyState from '@/components/ui/EmptyState'
import Overlay from '@/components/ui/Overlay'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { IconSearch } from '@/components/common/icons'

interface Command {
  id: string
  label: string
  description: string
  to: string
  icon: string
}

const PAGE_COMMANDS: Command[] = [
  { id: 'home', label: 'Map', description: 'Interactive Cosmere map', to: '/', icon: '🗺' },
  { id: 'books', label: 'Books', description: 'All Cosmere books', to: '/books', icon: '📚' },
  { id: 'characters', label: 'Characters', description: 'Notable Cosmere characters', to: '/characters', icon: '👤' },
  { id: 'shards', label: 'Shards', description: 'Shards of Adonalsium', to: '/locations?tab=shards', icon: '💎' },
  { id: 'timeline', label: 'Timeline', description: 'Cosmere timeline of events', to: '/timeline', icon: '📅' },
  { id: 'glossary', label: 'Glossary', description: 'Cosmere terminology', to: '/glossary', icon: '📖' },
  {
    id: 'magic',
    label: 'Magic Systems',
    description: 'Magic across the Cosmere',
    to: '/glossary?tab=magic',
    icon: '✨',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    description: 'Character relationships',
    to: '/relationships',
    icon: '🔗',
  },
  {
    id: 'family-tree',
    label: 'Family Tree',
    description: 'Cosmere family trees',
    to: '/characters?tab=family',
    icon: '🌳',
  },
  { id: 'heralds', label: 'Heralds', description: 'The 10 Heralds of the Almighty', to: '/heralds', icon: '👑' },
  {
    id: 'locations',
    label: 'Locations',
    description: 'Planets and celestial bodies in the Cosmere',
    to: '/locations',
    icon: '🌍',
  },
  { id: 'stats', label: 'Stats', description: 'Cosmere data dashboard', to: '/stats', icon: '📊' },
  {
    id: 'reading-order',
    label: 'Reading Order',
    description: 'Recommended reading order',
    to: '/reading-order',
    icon: '📋',
  },
  { id: 'about', label: 'About', description: 'About Cosmere Archive', to: '/about', icon: 'ℹ️' },
]

interface Props {
  onClose: () => void
}

export default function CommandPalette({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const navigate = useViewTransitionNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useFocusTrap(true)

  const allCommands = useMemo(() => {
    const bookCommands: Command[] = BOOKS.map((b) => ({
      id: `book-${b.id}`,
      label: b.title,
      description: `Book — ${b.description?.slice(0, 60) ?? ''}`,
      to: `/books/${b.id}`,
      icon: '📖',
    }))
    const characterCommands: Command[] = ALL_CHARACTERS.map((c) => ({
      id: `char-${c.id}`,
      label: c.name,
      description: c.description.slice(0, 60),
      to: `/?focus=character&id=${c.id}&planet=${c.planet.toLowerCase()}`,
      icon: '👤',
    }))
    return [...PAGE_COMMANDS, ...bookCommands, ...characterCommands]
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return allCommands
    return allCommands.filter((c) => c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
  }, [allCommands, query])

  const execute = useCallback(
    (cmd: Command) => {
      navigate(cmd.to)
      onClose()
    },
    [navigate, onClose],
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && filtered[selectedIdx]) {
        execute(filtered[selectedIdx])
      }
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [filtered, selectedIdx, execute, onClose],
  )

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <Overlay onClick={onClose} />
      <div className="relative w-full max-w-lg animate-fade-in-up rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
        <div className="flex items-center border-b border-gray-700 px-4">
          <IconSearch size={20} className="mr-3 shrink-0 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIdx(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, books, characters..."
            aria-label="Search commands"
            className="w-full bg-transparent py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
          />
          <kbd className="ml-2 shrink-0 rounded border border-gray-600 px-1.5 py-0.5 text-xs text-gray-500">esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && <EmptyState message="No results found." />}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => execute(cmd)}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                i === selectedIdx
                  ? 'bg-purple-600/20 text-purple-300'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <span className="text-lg">{cmd.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{cmd.label}</div>
                <div className="truncate text-xs text-gray-500">{cmd.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
