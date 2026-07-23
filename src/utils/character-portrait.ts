const BASE = `${import.meta.env.BASE_URL}characters/`

const EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'] as const

function normalizeName(name: string): string {
  if (!name) return ''
  const stripped = name.replace(/^(?:King|Queen|Lord|Lady|Prince|Princess|Highprince|Highprincess|Sir|Dame)\s+/i, '')
  const firstWord = stripped.split(' ')[0] ?? stripped
  const clean = firstWord.replace(/['']/g, '').replace(/[^a-zA-Z0-9]/g, '')
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()
}

export function getCharacterPortrait(name: string): string {
  if (!name) return `${BASE}placeholder.webp`
  const normalized = normalizeName(name)
  return `${BASE}${normalized}.webp`
}

export function getCharacterPortraitFallback(name: string): string | null {
  if (!name) return null
  const normalized = normalizeName(name)
  for (const ext of EXTENSIONS) {
    if (ext === 'webp') continue
    return `${BASE}${normalized}.${ext}`
  }
  return null
}

export function getCharacterPlaceholder(): string {
  return `${BASE}placeholder.webp`
}
