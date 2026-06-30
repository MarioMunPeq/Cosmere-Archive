import type { Character } from '@/types'

function warn(...args: unknown[]) {
  if (import.meta.env.DEV) console.warn(...args)
}

export function validateCharacterArray(data: unknown): Character[] {
  if (!Array.isArray(data)) {
    warn('[validate] Expected array, got', typeof data)
    return []
  }

  const valid: Character[] = []

  for (let i = 0; i < data.length; i++) {
    const item = data[i]

    if (!item || typeof item !== 'object') {
      warn(`[validate] Item ${i} is not an object, skipping`)
      continue
    }

    const obj = item as Record<string, unknown>

    if (typeof obj.id !== 'string' || !obj.id) {
      warn(`[validate] Item ${i} missing or invalid 'id'`)
      continue
    }

    if (typeof obj.name !== 'string' || !obj.name) {
      warn(`[validate] Item ${i} missing or invalid 'name'`)
      continue
    }

    if (typeof obj.planet !== 'string') {
      warn(`[validate] Item ${i} missing or invalid 'planet'`)
      continue
    }

    if (typeof obj.description !== 'string') {
      warn(`[validate] Item ${i} missing or invalid 'description'`)
      continue
    }

    valid.push({
      id: obj.id,
      name: obj.name,
      planet: obj.planet,
      description: obj.description,
      image: typeof obj.image === 'string' ? obj.image : undefined,
      pronunciation: typeof obj.pronunciation === 'string' ? obj.pronunciation : undefined,
      requiredBooks: Array.isArray(obj.requiredBooks)
        ? obj.requiredBooks.filter((b: unknown): b is string => typeof b === 'string')
        : [],
    })
  }

  if (valid.length !== data.length) {
    warn(`[validate] Filtered ${data.length - valid.length} invalid entries`)
  }

  return valid
}
