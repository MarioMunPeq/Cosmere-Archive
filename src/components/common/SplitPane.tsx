import { useState, useCallback, useRef, useEffect } from 'react'

interface Props {
  left: React.ReactNode
  right: React.ReactNode
}

const MIN_LEFT_PCT = 30
const MAX_LEFT_PCT = 80

export default function SplitPane({ left, right }: Props) {
  const [split, setSplit] = useState(60)
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    draggingRef.current = true
    const el = containerRef.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    setSplit(Math.max(MIN_LEFT_PCT, Math.min(MAX_LEFT_PCT, pct)))
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    const el = containerRef.current
    if (el) el.releasePointerCapture(e.pointerId)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = () => {
      if (draggingRef.current) draggingRef.current = false
    }
    window.addEventListener('pointerup', handler)
    return () => window.removeEventListener('pointerup', handler)
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-1 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="relative min-w-0 overflow-hidden" style={{ width: `${split}%` }}>
        {left}
      </div>
      <div
        className="relative w-1.5 shrink-0 cursor-col-resize bg-gray-800 transition-colors hover:bg-purple-600 active:bg-purple-500"
        onPointerDown={handlePointerDown}
      >
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-gray-700" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto border-l border-gray-800 bg-gray-950">{right}</div>
    </div>
  )
}
