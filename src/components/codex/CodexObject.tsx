import { useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { buildDustMotes } from './codex-dust'

/**
 * CodexObject — the desk the book rests on.
 *
 * Three layers, no images: walnut, a candle whose pool of light follows the
 * pointer, and sparse dust. The candle position is written straight to the
 * element's custom properties inside a rAF, never through React state, so
 * moving the mouse costs one style write per frame instead of a re-render of
 * the whole book.
 */

const MOTES = buildDustMotes()

interface Props {
  children: ReactNode
}

export default function CodexObject({ children }: Props) {
  const desk = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)
  const pointer = useRef({ x: 62, y: 22 })

  useEffect(() => {
    return () => {
      if (frame.current !== null) window.cancelAnimationFrame(frame.current)
    }
  }, [])

  const paintCandle = () => {
    frame.current = null
    const node = desk.current
    if (!node) return
    node.style.setProperty('--candle-x', `${pointer.current.x.toFixed(2)}%`)
    node.style.setProperty('--candle-y', `${pointer.current.y.toFixed(2)}%`)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const node = desk.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    pointer.current = {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    }
    if (frame.current === null) frame.current = window.requestAnimationFrame(paintCandle)
  }

  return (
    <div ref={desk} className="codex-object" onPointerMove={onPointerMove}>
      <div className="codex-object__wood" aria-hidden="true" />
      <div className="codex-object__grain" aria-hidden="true" />
      <div className="codex-object__cone" aria-hidden="true" />
      <div className="codex-object__candle" aria-hidden="true" />

      <div className="codex-dust" aria-hidden="true">
        {MOTES.map((mote) => (
          <span
            key={mote.id}
            className="codex-mote"
            style={
              {
                left: `${mote.left}%`,
                top: `${mote.top}%`,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                animationDuration: `${mote.duration}s`,
                animationDelay: `${mote.delay}s`,
                '--mote-opacity': mote.opacity,
                '--codex-drift': `${mote.drift}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="codex-object__vignette" aria-hidden="true" />
      {children}
    </div>
  )
}
