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

    /*
     * Validate, then pass the record through. Do not rebuild it.
     *
     * This used to construct a fresh object from six fields, which silently
     * discarded everything else. It was written when characters.json had
     * exactly those six fields, so it looked complete; after M4 the file
     * carried born, died, status, groups, titles and portrait, and every one
     * of them was being dropped here — which is why the record card rendered
     * "BORN: Unrecorded" for Kaladin while content/characters/kaladin.json
     * said 1475, and why he had no epithet and no status chip.
     *
     * The function is called `validate`. It validates.
     */
    const strings = (v: unknown) => (typeof v === 'string' ? v : undefined)
    const stringsOrNull = (v: unknown) => (typeof v === 'string' ? v : null)
    const numbersOrNull = (v: unknown) => (typeof v === 'number' ? v : null)

    valid.push({
      ...(obj as unknown as Character),
      id: obj.id,
      name: obj.name,
      planet: obj.planet,
      description: obj.description,
      image: strings(obj.image),
      pronunciation: strings(obj.pronunciation),
      born: numbersOrNull(obj.born),
      died: numbersOrNull(obj.died),
      status: strings(obj.status),
      groups: Array.isArray(obj.groups) ? obj.groups.filter((g): g is string => typeof g === 'string') : [],
      titles: Array.isArray(obj.titles) ? obj.titles.filter((t): t is string => typeof t === 'string') : [],
      portrait: stringsOrNull(obj.portrait),
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
