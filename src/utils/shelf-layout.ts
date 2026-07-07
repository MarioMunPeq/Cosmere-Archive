export interface BookLayout {
  width: number
  height: number
  fontSize: number
}

export interface ShelfLayout {
  books: BookLayout[]
  gap: number
  sidePadding: number
  totalWidth: number
}

const WORD_MIN = 0
const WORD_MAX = 500_000
const SPINE_MIN = 28
const SPINE_MAX = 130

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

function spineWidth(wc: number): number {
  const t = (Math.max(WORD_MIN, Math.min(WORD_MAX, wc)) - WORD_MIN) / (WORD_MAX - WORD_MIN)
  return lerp(SPINE_MIN, SPINE_MAX, t)
}

export function calcShelfLayout(wordCounts: number[], availableWidth: number): ShelfLayout {
  const n = wordCounts.length
  if (n === 0) return { books: [], gap: 0, sidePadding: 0, totalWidth: 0 }

  const rawWidths = wordCounts.map((w) => spineWidth(w ?? 50000))
  const rawTotal = rawWidths.reduce((a, b) => a + b, 0)

  const gap = Math.max(10, Math.min(36, Math.round(220 / n)))
  const sidePadding = Math.max(24, Math.min(64, Math.round(300 / n)))
  const fixedWidth = (n - 1) * gap + 2 * sidePadding
  const usableWidth = Math.max(300, availableWidth - fixedWidth)

  const scale = usableWidth / rawTotal
  const scaledWidths = rawWidths.map((w) => Math.max(SPINE_MIN, Math.round(w * scale)))

  const avgWidth = scaledWidths.reduce((a, b) => a + b, 0) / n
  const height = Math.max(340, Math.min(760, Math.round(avgWidth * 4.6)))

  const books: BookLayout[] = scaledWidths.map((w) => {
    const fontSize = Math.round(Math.max(12, Math.min(18, w * 0.14)))
    return { width: w, height, fontSize }
  })

  const totalWidth = scaledWidths.reduce((a, b) => a + b, 0) + fixedWidth

  return { books, gap, sidePadding, totalWidth }
}
