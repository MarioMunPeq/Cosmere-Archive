/**
 * Codex · dust motes
 *
 * Motes are generated once at module load from a fixed seed. Nothing here may
 * call Math.random(): the values must be identical on every render, in tests
 * and between the server-rendered and hydrated trees, or React would see the
 * inline styles change for no reason.
 */

export interface DustMote {
  id: number
  /** % from the left edge of the desk. */
  left: number
  /** % from the top edge of the desk. */
  top: number
  /** Diameter in px. */
  size: number
  /** Peak opacity while drifting. */
  opacity: number
  /** Full drift cycle in seconds. */
  duration: number
  /** Negative so the motes are already mid-flight on first paint. */
  delay: number
  /** Horizontal travel in px over one cycle. */
  drift: number
}

/** Small, fast, deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const round = (value: number, places = 2) => {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

export function buildDustMotes(count = 18, seed = 0x5eed1e): DustMote[] {
  const random = mulberry32(seed)
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: round(3 + random() * 94),
    top: round(9 + random() * 82),
    size: round(1 + random() * 2.2),
    opacity: round(0.12 + random() * 0.26),
    duration: round(26 + random() * 26, 1),
    delay: round(-random() * 48, 1),
    drift: round(-16 + random() * 32),
  }))
}
