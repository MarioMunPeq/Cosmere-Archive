import Overlay from '@/components/ui/Overlay'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { SHORTCUTS } from '@/data/static'

interface Props {
  onClose: () => void
}

export default function KeyboardShortcutsHelp({ onClose }: Props) {
  const ref = useFocusTrap(true)

  useKeyboardShortcut([{ key: 'Escape' }], onClose)

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <Overlay onClick={onClose} />
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
