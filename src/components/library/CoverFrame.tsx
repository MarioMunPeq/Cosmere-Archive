import type { CSSProperties } from 'react'

interface Props {
  saga: string
  width: number
  height: number
  foil: string
}

function StormlightFrame({ foil }: { foil: string }) {
  return (
    <g stroke={foil} fill="none" strokeWidth="0.3" opacity="0.06">
      <rect x="4%" y="3%" width="92%" height="94%" rx="0.5" />
      <rect x="7%" y="5.5%" width="86%" height="89%" rx="0.3" strokeWidth="0.2" />
      <polygon points="4%,3% 12%,3% 4%,11%" strokeWidth="0.3" />
      <polygon points="96%,3% 88%,3% 96%,11%" strokeWidth="0.3" />
      <polygon points="4%,97% 12%,97% 4%,89%" strokeWidth="0.3" />
      <polygon points="96%,97% 88%,97% 96%,89%" strokeWidth="0.3" />
      <line x1="4%" y1="97%" x2="4%" y2="3%" strokeWidth="0.5" />
      <line x1="96%" y1="97%" x2="96%" y2="3%" strokeWidth="0.5" />
    </g>
  )
}

function MistbornFrame({ foil }: { foil: string }) {
  return (
    <g stroke={foil} fill="none" strokeWidth="0.4" opacity="0.18">
      <rect x="5%" y="4%" width="90%" height="92%" rx="0.3" />
      <rect x="8%" y="7%" width="84%" height="86%" strokeWidth="0.15" />
      <circle cx="8%" cy="8%" r="3%" strokeWidth="0.3" />
      <circle cx="92%" cy="8%" r="3%" strokeWidth="0.3" />
      <circle cx="8%" cy="92%" r="3%" strokeWidth="0.3" />
      <circle cx="92%" cy="92%" r="3%" strokeWidth="0.3" />
    </g>
  )
}

function Mistborn2Frame({ foil }: { foil: string }) {
  return (
    <g stroke={foil} fill="none" strokeWidth="0.35" opacity="0.16">
      <rect x="5%" y="4%" width="90%" height="92%" rx="0.3" />
      <line x1="8%" y1="4%" x2="8%" y2="96%" strokeWidth="0.2" />
      <line x1="92%" y1="4%" x2="92%" y2="96%" strokeWidth="0.2" />
      <circle cx="8%" cy="4%" r="1.5%" strokeWidth="0.3" />
      <circle cx="92%" cy="4%" r="1.5%" strokeWidth="0.3" />
      <circle cx="8%" cy="96%" r="1.5%" strokeWidth="0.3" />
      <circle cx="92%" cy="96%" r="1.5%" strokeWidth="0.3" />
    </g>
  )
}

function WarbreakerFrame({ foil }: { foil: string }) {
  return (
    <g stroke={foil} fill="none" strokeWidth="0.35" opacity="0.18">
      <rect x="5%" y="4%" width="90%" height="92%" rx="0.5" />
      <path d="M 5% 4% Q 12% 8%, 8% 14% Q 4% 8%, 5% 4%" strokeWidth="0.2" />
      <path d="M 95% 4% Q 88% 8%, 92% 14% Q 96% 8%, 95% 4%" strokeWidth="0.2" />
      <path d="M 5% 96% Q 12% 92%, 8% 86% Q 4% 92%, 5% 96%" strokeWidth="0.2" />
      <path d="M 95% 96% Q 88% 92%, 92% 86% Q 96% 92%, 95% 96%" strokeWidth="0.2" />
      <circle cx="8%" cy="8%" r="1.5%" strokeWidth="0.25" />
      <circle cx="92%" cy="8%" r="1.5%" strokeWidth="0.25" />
      <circle cx="8%" cy="92%" r="1.5%" strokeWidth="0.25" />
      <circle cx="92%" cy="92%" r="1.5%" strokeWidth="0.25" />
    </g>
  )
}

function ElantrisFrame({ foil }: { foil: string }) {
  return (
    <g stroke={foil} fill="none" strokeWidth="0.3" opacity="0.15">
      <rect x="5%" y="4%" width="90%" height="92%" rx="0.2" />
      <line x1="5%" y1="4%" x2="12%" y2="4%" strokeWidth="0.2" />
      <line x1="88%" y1="4%" x2="95%" y2="4%" strokeWidth="0.2" />
      <line x1="5%" y1="96%" x2="12%" y2="96%" strokeWidth="0.2" />
      <line x1="88%" y1="96%" x2="95%" y2="96%" strokeWidth="0.2" />
      <line x1="5%" y1="4%" x2="5%" y2="12%" strokeWidth="0.2" />
      <line x1="95%" y1="4%" x2="95%" y2="12%" strokeWidth="0.2" />
      <line x1="5%" y1="88%" x2="5%" y2="96%" strokeWidth="0.2" />
      <line x1="95%" y1="88%" x2="95%" y2="96%" strokeWidth="0.2" />
    </g>
  )
}

function TressFrame({ foil }: { foil: string }) {
  return (
    <g stroke={foil} fill="none" strokeWidth="0.3" opacity="0.15">
      <path d="M 6% 4% Q 25% 6%, 50% 4% T 94% 4%" strokeWidth="0.3" />
      <path d="M 6% 96% Q 25% 94%, 50% 96% T 94% 96%" strokeWidth="0.3" />
      <path d="M 5% 8% Q 3% 25%, 5% 50% T 5% 92%" strokeWidth="0.3" />
      <path d="M 95% 8% Q 97% 25%, 95% 50% T 95% 92%" strokeWidth="0.3" />
    </g>
  )
}

function YumiFrame({ foil }: { foil: string }) {
  return (
    <g stroke={foil} fill="none" strokeWidth="0.3" opacity="0.16">
      <rect x="5%" y="4%" width="90%" height="92%" rx="0.2" />
      <rect x="8%" y="7%" width="84%" height="86%" rx="0.15" strokeWidth="0.15" />
      <line x1="8%" y1="4%" x2="8%" y2="7%" strokeWidth="0.2" />
      <line x1="92%" y1="4%" x2="92%" y2="7%" strokeWidth="0.2" />
      <line x1="8%" y1="93%" x2="8%" y2="96%" strokeWidth="0.2" />
      <line x1="92%" y1="93%" x2="92%" y2="96%" strokeWidth="0.2" />
      <line x1="5%" y1="8%" x2="8%" y2="8%" strokeWidth="0.2" />
      <line x1="92%" y1="8%" x2="95%" y2="8%" strokeWidth="0.2" />
      <line x1="5%" y1="92%" x2="8%" y2="92%" strokeWidth="0.2" />
      <line x1="92%" y1="92%" x2="95%" y2="92%" strokeWidth="0.2" />
    </g>
  )
}

function DefaultFrame({ foil }: { foil: string }) {
  return (
    <g stroke={foil} fill="none" strokeWidth="0.25" opacity="0.06">
      <rect x="5%" y="4%" width="90%" height="92%" rx="0.2" />
    </g>
  )
}

const FRAMES: Record<string, (p: { foil: string }) => React.ReactNode> = {
  stormlight: StormlightFrame,
  'mistborn-era-1': MistbornFrame,
  'mistborn-era-2': Mistborn2Frame,
  warbreaker: WarbreakerFrame,
  elantris: ElantrisFrame,
  'white-sand': DefaultFrame,
  'secret-projects': DefaultFrame,
  'arcanum-unbounded': DefaultFrame,
  tress: TressFrame,
  yumi: YumiFrame,
}

export default function CoverFrame({ saga, width, height, foil }: Props) {
  const F = FRAMES[saga]
  if (!F) return null

  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    color: foil,
    overflow: 'visible',
  }

  return (
    <svg style={style} viewBox={`0 0 ${width} ${height}`}>
      {F({ foil })}
    </svg>
  )
}
