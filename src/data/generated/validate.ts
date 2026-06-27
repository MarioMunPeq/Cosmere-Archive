import type { Character } from '@/types'

export function validateCharacterArray(data: unknown): Character[] {
  if (!Array.isArray(data)) {
    console.warn('[validate] Expected array, got', typeof data)
    return []
  }

  const valid: Character[] = []

  for (let i = 0; i < data.length; i++) {
    const item = data[i]

    if (!item || typeof item !== 'object') {
      console.warn(`[validate] Item ${i} is not an object, skipping`)
      continue
    }

    const obj = item as Record<string, unknown>

    if (typeof obj.id !== 'string' || !obj.id) {
      console.warn(`[validate] Item ${i} missing or invalid 'id'`)
      continue
    }

    if (typeof obj.name !== 'string' || !obj.name) {
      console.warn(`[validate] Item ${i} missing or invalid 'name'`)
      continue
    }

    if (typeof obj.planet !== 'string') {
      console.warn(`[validate] Item ${i} missing or invalid 'planet'`)
      continue
    }

    if (typeof obj.description !== 'string') {
      console.warn(`[validate] Item ${i} missing or invalid 'description'`)
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
    console.warn(`[validate] Filtered ${data.length - valid.length} invalid entries`)
  }

  return valid
}
