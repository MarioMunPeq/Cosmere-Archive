'use client'
import { memo } from 'react'

export default memo(function ControlsLegend() {
  return (
    <div
      className="fixed pointer-events-none select-none"
      style={{
        zIndex: 50,
        bottom: 28,
        left: 28,
        fontFamily: "'Times New Roman', 'Georgia', serif",
        fontSize: 'clamp(10px, 0.65vw, 12px)',
        color: 'rgba(200, 185, 165, 0.4)',
        lineHeight: 1.7,
        letterSpacing: '0.02em',
      }}
    >
      <div style={{ marginBottom: 4, opacity: 0.5, fontSize: 'clamp(9px, 0.55vw, 11px)', letterSpacing: '0.06em' }}>
        Controls
      </div>
      <div>LMB — Rotate</div>
      <div>RMB — Pan</div>
      <div>Wheel — Zoom</div>
      <div>Double Click — Focus</div>
      <div>ESC — Return</div>
    </div>
  )
})
