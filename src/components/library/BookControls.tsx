interface Props {
  current: number
  total: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  visible: boolean
}

const arrowBase: React.CSSProperties = {
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(26, 26, 46, 0.12)',
  borderRadius: '50%',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1,
  color: 'rgba(26, 26, 46, 0.35)',
  background: 'rgba(255,255,255,0.4)',
  transition: 'all 200ms ease',
  userSelect: 'none',
}

export default function BookControls({ current, total, onPrev, onNext, onClose, visible }: Props) {
  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '12px 0 10px',
        borderTop: '1px solid rgba(26, 26, 46, 0.06)',
        background: 'rgba(245, 239, 230, 0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 20,
      }}
    >
      {/* Previous button */}
      <div
        style={{ ...arrowBase, opacity: current > 1 ? 1 : 0.15, cursor: current > 1 ? 'pointer' : 'default' }}
        onClick={current > 1 ? onPrev : undefined}
        aria-label="Previous page"
      >
        ‹
      </div>

      {/* Page number */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 12,
          color: 'rgba(26, 26, 46, 0.4)',
          letterSpacing: '0.08em',
          fontVariant: 'all-small-caps',
          minWidth: 40,
          textAlign: 'center',
        }}
      >
        {current} / {total}
      </div>

      {/* Next button */}
      <div
        style={{
          ...arrowBase,
          opacity: current < total ? 1 : 0.15,
          cursor: current < total ? 'pointer' : 'default',
        }}
        onClick={current < total ? onNext : undefined}
        aria-label="Next page"
      >
        ›
      </div>

      {/* Close button */}
      <div
        style={{
          position: 'absolute',
          right: 12,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(26, 26, 46, 0.08)',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          color: 'rgba(26, 26, 46, 0.25)',
          background: 'transparent',
          transition: 'all 200ms ease',
          userSelect: 'none',
        }}
        onClick={onClose}
        aria-label="Close book"
      >
        ×
      </div>
    </div>
  )
}
