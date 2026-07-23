import { useState } from 'react'

interface Props {
  error: unknown
  route?: string
}

export default function ErrorDetails({ error, route }: Props) {
  const [open, setOpen] = useState(false)

  if (import.meta.env.PROD) return null

  const err = error instanceof Error ? error : new Error(String(error))

  const details: [string, string][] = [
    ['Type', err.name || 'Error'],
    ['Message', err.message || '—'],
  ]
  if (route) details.push(['Route', route])
  if (err.stack) details.push(['Stack', err.stack])
  if (location) details.push(['URL', location.href])

  return (
    <div className="mt-6 border border-[#8a7a5a]/10" style={{ background: 'rgba(60,40,20,0.02)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left cursor-pointer"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
      >
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: '#8a7a5a' }}>
          Archive Details
        </span>
        <span
          className="text-[10px] transition-transform duration-200"
          style={{
            color: '#8a7a5a',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          &#9662;
        </span>
      </button>
      {open && (
        <div className="border-t border-[#8a7a5a]/10 px-4 py-3">
          <pre
            className="overflow-x-auto whitespace-pre-wrap break-all text-[10px] leading-[1.6]"
            style={{
              fontFamily: 'ui-monospace, monospace',
              color: '#5a4a3a',
            }}
          >
            {details.map(([label, value]) => (
              <div key={label} className="mb-2">
                <span className="font-bold">{label}:</span> <span className="opacity-80">{value}</span>
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  )
}
