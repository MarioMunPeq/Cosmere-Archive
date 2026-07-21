import { memo, useEffect, useRef, useState } from 'react'

export const Legend = memo(function Legend() {
  const [visible, setVisible] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const show = () => {
      setVisible(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        setVisible(false)
      }, 4000)
    }
    window.addEventListener('pointermove', show)
    window.addEventListener('wheel', show)
    return () => {
      window.removeEventListener('pointermove', show)
      window.removeEventListener('wheel', show)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 10,
        left: 12,
        fontFamily: 'serif',
        fontSize: 9,
        color: '#8a7a5a',
        lineHeight: 1.6,
        opacity: visible ? 0.5 : 0,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div>click — select</div>
      <div>double-click — focus</div>
      <div>drag — pan</div>
      <div>scroll — zoom</div>
      <div>esc — return</div>
    </div>
  )
})
