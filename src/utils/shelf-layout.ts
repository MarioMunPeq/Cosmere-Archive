export interface BookLayout {
  width: number
  height: number
  fontSize: number
  charWidth: number
}

export interface ShelfLayout {
  books: BookLayout[]
  gap: number
  sidePadding: number
  totalWidth: number
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

export function calcShelfLayout(wordCounts: number[], availableWidth: number): ShelfLayout {
  const n = wordCounts.length
  if (n === 0) return { books: [], gap: 0, sidePadding: 0, totalWidth: 0 }

  const sqrts = wordCounts.map((w) => Math.sqrt(Math.max(w, 1000)))
  const totalSqrt = sqrts.reduce((a, b) => a + b, 0)

  // Gap and padding adapt to book count — more books = tighter spacing
  const gap = Math.max(4, Math.min(20, Math.round(120 / n)))
  const sidePadding = Math.max(10, Math.min(40, Math.round(200 / n)))
  const fixedWidth = (n - 1) * gap + 2 * sidePadding
  const booksWidth = Math.max(100, availableWidth - fixedWidth)

  // Scale: maps sqrt(wordCount) sum to usable width
  const scaleFactor = booksWidth / totalSqrt

  // Unclamped widths — proportional to sqrt(wordCount)
  const rawWidths = sqrts.map((s) => Math.round(s * scaleFactor))

  // Clamp: never narrower than 90px, never wider than 380px
  const clampedWidths = rawWidths.map((w) => Math.max(90, Math.min(380, w)))

  // Height: derived from average width × adaptive aspect ratio
  const avgWidth = clampedWidths.reduce((a, b) => a + b, 0) / n
  const aspectRatio = lerp(3.5, 2.8, (n - 3) / 12)
  const rawHeight = Math.round(avgWidth * aspectRatio)
  const height = Math.max(350, Math.min(1100, rawHeight))

  // Font size: proportional to width, clamped for readability
  const books: BookLayout[] = clampedWidths.map((w) => {
    const fontSize = Math.round(Math.max(13, Math.min(42, w * 0.13)))
    const charWidth = Math.max(4, Math.floor((w - 8) / (fontSize * 0.58)))
    return { width: w, height, fontSize, charWidth }
  })

  const totalWidth = clampedWidths.reduce((a, b) => a + b, 0) + fixedWidth

  return { books, gap, sidePadding, totalWidth }
}
