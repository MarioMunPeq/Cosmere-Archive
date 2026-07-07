interface Props {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export default function BookPaper({ className, style, children }: Props) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        background: '#f5efe6',
        boxShadow: 'inset 0 0 80px rgba(139, 119, 90, 0.06)',
        ...style,
      }}
    >
      {/* Paper grain — extremely subtle vertical lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(139, 119, 90, 0.008) 1px,
            transparent 1.5px
          )`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>{children}</div>
    </div>
  )
}
