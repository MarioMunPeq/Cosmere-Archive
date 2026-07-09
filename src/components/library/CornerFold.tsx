interface Props {
  side: 'left' | 'right'
  visible: boolean
}

export default function CornerFold({ side, visible }: Props) {
  const fold = side === 'right'
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 350ms ease',
        pointerEvents: 'none',
        transform: fold ? 'none' : 'scaleX(-1)',
      }}
    >
      <defs>
        <linearGradient id="cf-grad" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="65%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="cf-curl" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
      </defs>
      <path d="M0 22 L22 22 L22 0 Q11 11 0 22Z" fill="url(#cf-grad)" />
      <path d="M22 22 L22 16 Q14 16 10 19 Q6 22 0 22Z" fill="url(#cf-curl)" />
    </svg>
  )
}
