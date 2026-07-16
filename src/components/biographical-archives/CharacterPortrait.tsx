import { useState, useRef, useCallback } from 'react'
import { getCharacterPortrait, getCharacterPortraitFallback } from '@/utils'

interface Props {
  name: string
  isDeceased?: boolean
  size?: number
  showCaption?: boolean
  caption?: string
  isSelected?: boolean
}

export default function CharacterPortrait({ name, isDeceased, size = 96, showCaption, caption, isSelected }: Props) {
  const imgRef = useRef<SVGImageElement | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'failed'>('loading')
  const r = size / 2
  const imgSrc = getCharacterPortrait(name)

  const handleError = useCallback(() => {
    if (!imgRef.current) return
    const currentHref = imgRef.current.getAttribute('href')
    if (currentHref?.endsWith('.webp')) {
      const fallback = getCharacterPortraitFallback(name)
      if (fallback) {
        imgRef.current.setAttribute('href', fallback)
        return
      }
    }
    setState('failed')
  }, [name])

  const handleLoad = useCallback(() => {
    if (state === 'failed') return
    setState('ok')
  }, [state])

  const clipId = `cp-clip-${name.replace(/\s/g, '')}`
  const sepiaId = `cp-sepia-${name.replace(/\s/g, '')}`

  const frameWidth = 3
  const imageR = r - frameWidth - 4
  const innerR = r - frameWidth

  return (
    <div className="shrink-0 inline-flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ filter: 'drop-shadow(0 2px 6px rgba(60,45,30,0.15))' }}
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx={r} cy={r} r={imageR} />
          </clipPath>
          {isDeceased && (
            <filter id={sepiaId}>
              <feColorMatrix
                type="matrix"
                values="0.35 0.30 0.15 0 0  0.30 0.35 0.20 0 0  0.20 0.20 0.25 0 0  0 0 0 0.65 0"
              />
            </filter>
          )}
        </defs>

        {/* Shadow under portrait */}
        <circle cx={r + 1} cy={r + 1.5} r={innerR + 1} fill="rgba(60,45,30,0.08)" />

        {/* Paper/background base */}
        <circle cx={r} cy={r} r={innerR + frameWidth} fill="#d4c4a8" />
        <circle
          cx={r}
          cy={r}
          r={innerR + frameWidth - 0.5}
          fill="none"
          stroke="#c4b08a"
          strokeWidth="0.5"
          strokeDasharray="1.5 2"
        />

        {/* Inner paper well */}
        <circle cx={r} cy={r} r={innerR} fill="#e8dcc8" />

        {/* Portrait image or placeholder */}
        {state !== 'failed' ? (
          <image
            ref={imgRef}
            href={imgSrc}
            clipPath={`url(#${clipId})`}
            width={size}
            height={size}
            preserveAspectRatio="xMidYMid slice"
            filter={isDeceased ? `url(#${sepiaId})` : undefined}
            onError={handleError}
            onLoad={handleLoad}
            style={{ opacity: state === 'loading' ? 0 : 0.92 }}
          />
        ) : (
          <g>
            <circle cx={r} cy={r} r={imageR} fill="#ede4d4" />
            <circle
              cx={r}
              cy={r}
              r={imageR - 4}
              fill="none"
              stroke="rgba(160,140,110,0.08)"
              strokeWidth="0.5"
              strokeDasharray="1.5 2.5"
            />
            <circle cx={r} cy={r} r={3} fill="rgba(160,140,110,0.1)" />
          </g>
        )}

        {/* Gold ring frame — three concentric rings */}
        <circle cx={r} cy={r} r={innerR + 1} fill="none" stroke="#c4a04a" strokeWidth="1.5" strokeOpacity="0.5" />
        <circle cx={r} cy={r} r={innerR + 2.5} fill="none" stroke="#b89840" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx={r} cy={r} r={innerR} fill="none" stroke="#c4b08a" strokeWidth="0.5" strokeOpacity="0.4" />

        {/* Selected indicator — illuminated gold ring */}
        {isSelected && (
          <circle cx={r} cy={r} r={innerR + 0.5} fill="none" stroke="#c4a04a" strokeWidth="2" strokeOpacity="0.6" />
        )}

        {/* Deceased cross */}
        {isDeceased && (
          <>
            <line x1={r - 8} y1={r - 8} x2={r + 8} y2={r + 8} stroke="#8a7a6a" strokeWidth="1.5" strokeOpacity="0.45" />
            <line x1={r + 8} y1={r - 8} x2={r - 8} y2={r + 8} stroke="#8a7a6a" strokeWidth="1.5" strokeOpacity="0.45" />
          </>
        )}

        {/* Outer dotted border */}
        <circle
          cx={r}
          cy={r}
          r={innerR + frameWidth - 0.5}
          fill="none"
          stroke="#a09078"
          strokeWidth="0.3"
          strokeDasharray="1.5 2"
          strokeOpacity="0.25"
        />
      </svg>

      {showCaption && caption && (
        <span
          className="font-serif text-[9px] italic mt-1.5 text-center leading-tight"
          style={{ color: 'rgba(80,60,40,0.3)' }}
        >
          {caption}
        </span>
      )}
    </div>
  )
}
