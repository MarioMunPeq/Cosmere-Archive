import { memo, type ReactNode } from 'react'

interface Props {
  show: boolean
  onToggle: () => void
  buttonContent: ReactNode
  title: string
  children: ReactNode
  buttonFirst?: boolean
  panelWidth?: string
}

function FloatingTogglePanel({
  show,
  onToggle,
  buttonContent,
  title,
  children,
  buttonFirst = true,
  panelWidth,
}: Props) {
  const toggle = (
    <button
      onClick={onToggle}
      className="rounded-lg border px-2.5 py-1.5 text-xs backdrop-blur-sm transition-colors hover:border-purple-500/60 hover:text-purple-400 sm:px-3"
      style={{ borderColor: 'rgba(80,60,40,0.25)', background: 'rgba(80,60,40,0.1)', color: '#8a7050' }}
    >
      {buttonContent}
    </button>
  )

  const panel = show && (
    <div
      className={`animate-fade-in-up rounded-xl border p-3 shadow-2xl backdrop-blur-lg ${panelWidth ?? 'sm:w-56'} sm:p-4`}
      style={{ borderColor: 'rgba(80,60,40,0.25)', background: 'rgba(80,60,40,0.12)' }}
    >
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#8a7050' }}>
        {title}
      </h4>
      {children}
    </div>
  )

  return (
    <div className="flex flex-col items-start gap-2 sm:items-start">
      {buttonFirst ? toggle : panel}
      {buttonFirst ? panel : toggle}
    </div>
  )
}

export default memo(FloatingTogglePanel)
