function adjust(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

const METAL: Record<
  string,
  {
    base: string
    dark: string
    text: string
  }
> = {
  stormlight: { base: '#8890a0', dark: '#585e6e', text: '#181c2a' },
  mistborn: { base: '#8a7e6a', dark: '#5a4e3e', text: '#100c08' },
  'mistborn-era2': { base: '#8a8468', dark: '#5a5438', text: '#181208' },
  warbreaker: { base: '#988e6a', dark: '#685e3e', text: '#181208' },
  elantris: { base: '#9ea0a8', dark: '#6e7078', text: '#1a1c2a' },
  'white-sand': { base: '#8a7e6a', dark: '#5a4e3e', text: '#100c08' },
  arcanum: { base: '#8890a0', dark: '#585e6e', text: '#181c2a' },
}

interface Props {
  title: string
  width: number
  saga: string
}

export default function Plaque({ title, width, saga }: Props) {
  const m = METAL[saga] ?? { base: '#8a8a90', dark: '#5a5a60', text: '#18181e' }
  const fontSize = Math.round(Math.max(12, Math.min(36, width * 0.018)))
  const padX = Math.round(width * 0.015)
  const padY = Math.round(fontSize * 0.35)
  const screwSize = Math.round(fontSize * 0.18)
  const borderR = Math.round(fontSize * 0.12)

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width,
        padding: `${padY}px ${padX}px`,
        background: `linear-gradient(180deg, ${adjust(m.base, -6)} 0%, ${m.base} 50%, ${adjust(m.base, -4)} 100%)`,
        borderRadius: borderR,
        boxShadow: `0 ${Math.round(fontSize * 0.06)}px ${Math.round(fontSize * 0.15)}px rgba(0,0,0,0.25), inset 0 ${Math.round(fontSize * 0.02)}px 0 rgba(255,255,255,0.06)`,
        border: `1px solid ${m.dark}`,
        marginBottom: Math.round(fontSize * 0.5),
      }}
    >
      {['top', 'bottom'].flatMap((v) =>
        ['left', 'right'].map((h) => (
          <span
            key={`${v}-${h}`}
            className="absolute rounded-full"
            style={{
              [v]: padY * 0.3,
              [h]: padX * 0.3,
              width: screwSize,
              height: screwSize,
              background: `radial-gradient(circle at 35% 35%, ${adjust(m.base, 8)} 0%, ${m.dark} 60%, ${adjust(m.dark, -10)} 100%)`,
              boxShadow: `inset 0 ${Math.round(fontSize * 0.02)}px ${Math.round(fontSize * 0.04)}px rgba(0,0,0,0.25), 0 0 ${Math.round(fontSize * 0.04)}px rgba(0,0,0,0.15)`,
            }}
          />
        )),
      )}

      <span
        style={{
          fontSize,
          fontWeight: 500,
          fontFamily: "'Cormorant Garamond', 'Georgia', serif",
          fontVariant: 'all-small-caps',
          letterSpacing: '0.15em',
          color: m.text,
          textShadow: `0 ${Math.round(fontSize * 0.02)}px 0 rgba(255,255,255,0.06), 0 ${Math.round(-fontSize * 0.01)}px ${Math.round(fontSize * 0.015)}px rgba(0,0,0,0.08)`,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>
    </div>
  )
}
