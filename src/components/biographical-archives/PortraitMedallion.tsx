import { useState } from 'react'
import { getCharacterPortrait } from '@/utils'

interface Props {
  name: string
  isDeceased?: boolean
  size?: number
}

export default function PortraitMedallion({ name, isDeceased, size = 72 }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const imgSrc = getCharacterPortrait(name)
  const r = size / 2
  const innerR = r - 4
  const fontSize = Math.round(size * 0.32)
  const initial = name.charAt(0)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      style={{ filter: 'drop-shadow(0 1px 2px rgba(60,40,20,0.12))' }}
    >
      <defs>
        <clipPath id={`clip-${name.replace(/\s/g, '')}`}>
          <circle cx={r} cy={r} r={innerR - 1} />
        </clipPath>
        {isDeceased && (
          <filter id={`sepia-${name.replace(/\s/g, '')}`}>
            <feColorMatrix
              type="matrix"
              values="
              0.35 0.30 0.15 0 0
              0.30 0.35 0.20 0 0
              0.20 0.20 0.25 0 0
              0 0 0 0.65 0
            "
            />
          </filter>
        )}
      </defs>

      <circle cx={r} cy={r} r={r} fill="#d4c4a8" />
      <circle cx={r} cy={r} r={innerR} fill="#e8dcc8" stroke="#b8a888" strokeWidth="0.5" />

      <circle cx={r} cy={r} r={innerR - 1} fill="#f5ede0" />

      {!imgFailed && (
        <image
          href={imgSrc}
          clipPath={`url(#clip-${name.replace(/\s/g, '')})`}
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid slice"
          filter={isDeceased ? `url(#sepia-${name.replace(/\s/g, '')})` : undefined}
          onError={() => setImgFailed(true)}
          style={{ opacity: 0.85 }}
        />
      )}

      {imgFailed && (
        <text
          x={r}
          y={r}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontFamily="Georgia, 'Times New Roman', serif"
          fill="#8a7a6a"
          fontWeight="bold"
        >
          {initial}
        </text>
      )}

      <circle cx={r} cy={r} r={innerR} fill="none" stroke="#c4b08a" strokeWidth="1.5" strokeOpacity="0.6" />
      <circle cx={r} cy={r} r={innerR + 1} fill="none" stroke="#b8a078" strokeWidth="0.5" strokeOpacity="0.4" />

      {isDeceased && (
        <>
          <line x1={r - 6} y1={r - 6} x2={r + 6} y2={r + 6} stroke="#8a7a6a" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1={r + 6} y1={r - 6} x2={r - 6} y2={r + 6} stroke="#8a7a6a" strokeWidth="1.5" strokeOpacity="0.5" />
        </>
      )}

      <circle
        cx={r}
        cy={r}
        r={r - 0.5}
        fill="none"
        stroke="#a09078"
        strokeWidth="0.3"
        strokeDasharray="2 2"
        strokeOpacity="0.3"
      />
    </svg>
  )
}
