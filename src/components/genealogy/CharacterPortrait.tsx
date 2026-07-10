import { useState, useEffect, useRef } from 'react'
import { getCharacterPortrait } from '@/utils'

interface Props {
  name: string
  size: number
  isDeceased?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function CharacterPortrait({ name, size, isDeceased, isSelected, onClick }: Props) {
  const id = name.replace(/[^a-zA-Z0-9]/g, '')
  const imgSrc = getCharacterPortrait(name)
  const [imgError, setImgError] = useState(false)
  const checkedRef = useRef(false)

  useEffect(() => {
    if (checkedRef.current) return
    const img = new Image()
    img.onload = () => {
      checkedRef.current = true
      setImgError(false)
    }
    img.onerror = () => {
      checkedRef.current = true
      setImgError(true)
    }
    img.src = imgSrc
  }, [imgSrc])

  const w = size * 0.72
  const h = size
  const fw = w + 8
  const fh = h + 8
  const vw = fw + 4
  const vh = fh + 4
  return (
    <svg
      width={vw}
      height={vh}
      viewBox={`0 0 ${vw} ${vh}`}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : undefined}
      style={{ overflow: 'visible', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' }}
    >
      <defs>
        <linearGradient id={`frame-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4a04a" />
          <stop offset="30%" stopColor="#a08030" />
          <stop offset="60%" stopColor="#c4a04a" />
          <stop offset="100%" stopColor="#907020" />
        </linearGradient>
        <linearGradient id={`frameInner-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8a7a5a" />
          <stop offset="100%" stopColor="#6a5a3a" />
        </linearGradient>
        <clipPath id={`port-clip-${id}`}>
          <rect x={(vw - w) / 2} y={(vh - h) / 2} width={w} height={h} rx={1} />
        </clipPath>
        <filter id={`port-shadow-${id}`}>
          <feDropShadow dx={0} dy={1} stdDeviation={1.5} floodColor="rgba(0,0,0,0.25)" />
        </filter>
      </defs>

      {/* Outer frame shadow */}
      <rect x={1} y={1} width={vw - 2} height={vh - 2} rx={1.5} fill="rgba(0,0,0,0.1)" />

      {/* Outer frame border */}
      <rect x={0} y={0} width={vw} height={vh} rx={1.5} fill={`url(#frame-${id})`} stroke="#705a20" strokeWidth={0.5} />

      {/* Inner frame band */}
      <rect
        x={2.5}
        y={2.5}
        width={vw - 5}
        height={vh - 5}
        rx={0.5}
        fill="none"
        stroke={`url(#frameInner-${id})`}
        strokeWidth={1}
      />

      {/* Portrait area background */}
      <rect x={(vw - w) / 2} y={(vh - h) / 2} width={w} height={h} fill="#ede4d4" rx={1} />

      {/* Character image or fallback initial */}
      {!imgError ? (
        <image
          href={imgSrc}
          x={(vw - w) / 2}
          y={(vh - h) / 2}
          width={w}
          height={h}
          clipPath={`url(#port-clip-${id})`}
          preserveAspectRatio="xMidYMid slice"
          style={isDeceased ? { filter: 'grayscale(0.6)' } : undefined}
        />
      ) : (
        <text
          x={vw / 2}
          y={vh / 2 + 3}
          textAnchor="middle"
          fontSize={size * 0.28}
          fontFamily="'Cormorant Garamond','Georgia',serif"
          fill="#8a7a6a"
        >
          {name.charAt(0)}
        </text>
      )}

      {/* Deceased marker */}
      {isDeceased && (
        <text
          x={vw / 2}
          y={vh + 10}
          textAnchor="middle"
          fontSize={10}
          fontFamily="'Cormorant Garamond','Georgia',serif"
          fill="#8a7050"
          opacity={0.6}
        >
          †
        </text>
      )}

      {/* Selected ring */}
      {isSelected && (
        <rect
          x={-1}
          y={-1}
          width={vw + 2}
          height={vh + 2}
          rx={2}
          fill="none"
          stroke="#c4a04a"
          strokeWidth={1.5}
          opacity={0.5}
        />
      )}
    </svg>
  )
}
