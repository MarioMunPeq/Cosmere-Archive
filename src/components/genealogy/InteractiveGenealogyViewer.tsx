import { useRef, useEffect, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  contentWidth: number
  contentHeight: number
}

/**
 * Renders SVG content inside a padded viewport. The SVG root has NO viewBox
 * (so 1 user-unit = 1 CSS-pixel). All fitting is done via a single <g>
 * transform (translate + scale), avoiding the double-scale bug that occurs
 * when both viewBox and <g> transform apply.
 */
export default function InteractiveGenealogyViewer({ children, contentWidth, contentHeight }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const groupRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let attempts = 0
    const MAX_ATTEMPTS = 10

    function fit(): boolean {
      const c = containerRef.current
      const svg = svgRef.current
      const g = groupRef.current
      if (!c || !svg || !g) return false

      const vw = c.clientWidth
      const vh = c.clientHeight
      if (vw <= 0 || vh <= 0) return false

      const bw = contentWidth
      const bh = contentHeight
      if (bw <= 0 || bh <= 0) return false

      const scale = Math.min(vw / bw, vh / bh) * 0.95
      const ox = vw / 2 - (bw / 2) * scale
      const oy = vh / 2 - (bh / 2) * scale

      g.setAttribute('transform', `translate(${ox},${oy}) scale(${scale})`)
      return true
    }

    if (!fit()) {
      const raf = requestAnimationFrame(function tick() {
        attempts++
        if (fit() || attempts >= MAX_ATTEMPTS) return
        requestAnimationFrame(tick)
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [contentWidth, contentHeight])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        <g ref={groupRef}>{children}</g>
      </svg>
    </div>
  )
}
