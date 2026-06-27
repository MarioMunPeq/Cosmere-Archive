import { useRef } from 'react'
import type { Character } from '@/types/character'

interface Props {
  character: Pick<Character, 'name' | 'image' | 'planet'>
  color?: string
  size?: number
  className?: string
}

function avatarDataUri(name: string, color: string): string {
  const initial = name.charAt(0).toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${color}88"/>
    </linearGradient></defs>
    <circle cx="50" cy="50" r="50" fill="url(#g)"/>
    <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="40" font-weight="700" fill="white" font-family="system-ui,sans-serif">${initial}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default function CharacterAvatar({ character, color = '#6b7280', size = 40, className = '' }: Props) {
  const fallback = avatarDataUri(character.name, color)
  const fallbackRef = useRef(fallback)

  return (
    <img
      src={character.image || fallback}
      alt={character.name}
      className={`shrink-0 rounded-full object-cover ${className}`}
      style={{ width: size, height: size, backgroundColor: color }}
      onError={(e) => {
        if (e.currentTarget.src !== fallbackRef.current) {
          e.currentTarget.src = fallbackRef.current
        }
      }}
    />
  )
}
