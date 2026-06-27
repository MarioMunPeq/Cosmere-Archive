interface Shortcut {
  keys: string
  label: string
}

const SHORTCUTS: Shortcut[] = [
  { keys: 'Ctrl+K', label: 'Command palette' },
  { keys: '/', label: 'Focus search' },
  { keys: '?', label: 'Toggle this help' },
  { keys: 'Alt+1', label: 'About page' },
  { keys: 'Alt+2', label: 'Relationships page' },
  { keys: 'Alt+3', label: 'Glossary page' },
  { keys: 'Alt+4', label: 'Family Tree page' },
  { keys: 'Alt+5', label: 'Heralds page' },
  { keys: 'Alt+6', label: 'Locations page' },
  { keys: 'Alt+7', label: 'Books page' },
  { keys: 'Alt+8', label: 'Characters page' },
  { keys: 'Alt+9', label: 'Shards page' },
  { keys: 'Alt+0', label: 'Stats page' },
]

export default function KeyboardShortcutsHelp({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md animate-fade-in-up rounded-xl border border-gray-700 bg-gray-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-100">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-xs text-gray-600 hover:bg-gray-800 hover:text-gray-300"
          >
            &times;
          </button>
        </div>
        <div className="space-y-1.5">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{s.label}</span>
              <kbd className="rounded border border-gray-700 bg-gray-800 px-2 py-0.5 font-mono text-gray-300">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
