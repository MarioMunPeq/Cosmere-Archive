interface Props {
  title: string
  width: number
}

export default function Plaque({ title, width }: Props) {
  const fontSize = Math.round(Math.max(14, Math.min(48, width * 0.025)))
  const padX = Math.round(width * 0.022)
  const padY = Math.round(fontSize * 0.5)
  const borderR = Math.round(fontSize * 0.22)
  const screwSize = Math.round(fontSize * 0.3)
  const shadowBlur = Math.round(fontSize * 0.25)

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width,
        padding: `${padY}px ${padX}px`,
        background: 'linear-gradient(180deg, #7a6548 0%, #a0885a 25%, #c4a44a 50%, #a0885a 75%, #7a6548 100%)',
        borderRadius: borderR,
        boxShadow: `0 ${Math.round(fontSize * 0.12)}px ${shadowBlur}px rgba(0,0,0,0.5), inset 0 ${Math.round(fontSize * 0.06)}px 0 rgba(255,255,255,0.2)`,
        border: `1px solid #5a4a30`,
        marginBottom: Math.round(fontSize * 0.7),
      }}
    >
      {/* Screws */}
      {['top', 'bottom'].flatMap((v) =>
        ['left', 'right'].map((h) => (
          <span
            key={`${v}-${h}`}
            className="absolute rounded-full"
            style={{
              [v]: padY * 0.4,
              [h]: padX * 0.4,
              width: screwSize,
              height: screwSize,
              background: 'radial-gradient(circle at 35% 35%, #d4c8a0 0%, #8a7a5a 60%, #5a4a30 100%)',
              boxShadow: `inset 0 ${Math.round(fontSize * 0.03)}px ${Math.round(fontSize * 0.06)}px rgba(0,0,0,0.4), 0 0 ${Math.round(fontSize * 0.06)}px rgba(0,0,0,0.3)`,
            }}
          />
        )),
      )}

      <span
        style={{
          fontSize,
          fontWeight: 700,
          fontFamily: "'Times New Roman', 'Georgia', serif",
          letterSpacing: '0.15em',
          color: '#2a1f0a',
          textShadow: `0 ${Math.round(fontSize * 0.03)}px 0 rgba(255,255,255,0.12), 0 ${Math.round(-fontSize * 0.02)}px ${Math.round(fontSize * 0.03)}px rgba(0,0,0,0.15)`,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>
    </div>
  )
}
