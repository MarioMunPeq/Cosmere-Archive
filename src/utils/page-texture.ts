import * as THREE from 'three'
import type { PageData, PageContent } from '@/components/library/BookContent'

const BASE_W = 2048
const FONT = '"Georgia", "Times New Roman", serif'
const INK = '#1a1a2e'
const PAPER = '#f5efe6'
const MUTED = 'rgba(26,26,46,0.2)'
const FAINT = 'rgba(26,26,46,0.06)'

const MARGIN_TOP = Math.round(BASE_W * 0.09)
const MARGIN_BOTTOM = Math.round(BASE_W * 0.08)
const MARGIN_INNER = Math.round(BASE_W * 0.1)
const MARGIN_OUTER = Math.round(BASE_W * 0.08)

const FONT_TITLE = Math.round(BASE_W * 0.042)
const FONT_SECTION = Math.round(BASE_W * 0.022)
const FONT_BODY = Math.round(BASE_W * 0.018)
const FONT_DROPCAP = Math.round(BASE_W * 0.044)
const FONT_SMALL = Math.round(BASE_W * 0.014)
const FONT_GRID = Math.round(BASE_W * 0.015)
const FONT_GRID_LABEL = Math.round(BASE_W * 0.017)

const LINE_H = 1.6
const DROPCAP_GAP = Math.round(BASE_W * 0.012)
const FONT_HERO = Math.round(BASE_W * 0.055)
const FONT_SUBTITLE = Math.round(BASE_W * 0.026)

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = []
  const words = text.split(' ')
  let cur = ''
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur)
      cur = w
    } else {
      cur = test
    }
  }
  if (cur) lines.push(cur)
  return lines
}

function drawRule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.strokeStyle = FAINT
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w, y)
  ctx.stroke()
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  fontSize: number,
  color: string,
  lineH: number = LINE_H,
) {
  ctx.font = `${fontSize}px ${FONT}`
  ctx.fillStyle = color
  const lines = wrapText(ctx, text, maxW)
  let cy = y
  for (const line of lines) {
    ctx.fillText(line, x, cy)
    cy += fontSize * lineH
  }
  return cy - y
}

function renderHeading(ctx: CanvasRenderingContext2D, item: PageContent, x: number, y: number, maxW: number): number {
  if (!item.value) return 0
  ctx.font = `600 ${FONT_TITLE}px ${FONT}`
  ctx.fillStyle = '#16162a'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, item.value, maxW)
  let cy = y
  for (const line of lines) {
    ctx.fillText(line, x, cy)
    cy += FONT_TITLE * 1.15
  }
  return cy - y
}

function renderSmallHeading(
  ctx: CanvasRenderingContext2D,
  item: PageContent,
  x: number,
  y: number,
  maxW: number,
): number {
  if (!item.value) return 0
  ctx.font = `600 ${FONT_SECTION}px ${FONT}`
  ctx.fillStyle = MUTED
  ctx.textBaseline = 'top'
  const text = item.value.toUpperCase()
  const lines = wrapText(ctx, text, maxW)
  let cy = y
  for (const line of lines) {
    ctx.fillText(line, x, cy)
    cy += FONT_SECTION * 1.2
  }
  return cy - y
}

function renderArchiveHeader(
  ctx: CanvasRenderingContext2D,
  item: PageContent,
  x: number,
  y: number,
  maxW: number,
): number {
  if (!item.value) return 0
  ctx.font = `400 ${FONT_SMALL}px ${FONT}`
  ctx.fillStyle = MUTED
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  const midX = x + maxW / 2
  const lines = wrapText(ctx, item.value.toUpperCase(), maxW)
  let cy = y
  for (const line of lines) {
    ctx.fillText(line, midX, cy)
    cy += FONT_SMALL * 1.5
  }
  ctx.textAlign = 'left'
  return cy - y
}

function renderHero(ctx: CanvasRenderingContext2D, item: PageContent, x: number, y: number, maxW: number): number {
  if (!item.value) return 0
  ctx.font = `300 ${FONT_HERO}px ${FONT}`
  ctx.fillStyle = '#16162a'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, item.value, maxW)
  let cy = y
  for (const line of lines) {
    ctx.fillText(line, x, cy)
    cy += FONT_HERO * 1.1
  }
  return cy - y
}

function renderSubtitle(ctx: CanvasRenderingContext2D, item: PageContent, x: number, y: number, maxW: number): number {
  if (!item.value) return 0
  ctx.font = `400 ${FONT_SUBTITLE}px ${FONT}`
  ctx.fillStyle = INK
  ctx.textBaseline = 'top'

  const text = item.value
  const tw = ctx.measureText(text).width
  const cx = x + (maxW - tw) / 2
  ctx.fillText(text, cx, y)

  return Math.round(FONT_SUBTITLE * 1.4)
}

function renderDivider(ctx: CanvasRenderingContext2D, x: number, y: number, maxW: number): number {
  const midX = x + maxW / 2
  const dotR = 3
  const lineW = (maxW - dotR * 4) / 2

  ctx.strokeStyle = MUTED
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y + 8)
  ctx.lineTo(x + lineW, y + 8)
  ctx.stroke()

  ctx.fillStyle = MUTED
  ctx.beginPath()
  ctx.arc(midX, y + 8, dotR, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = MUTED
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(midX + dotR * 2, y + 8)
  ctx.lineTo(x + maxW, y + 8)
  ctx.stroke()

  return Math.round(FONT_BODY * 1.4)
}

function renderDropcapText(
  ctx: CanvasRenderingContext2D,
  item: PageContent,
  x: number,
  y: number,
  maxW: number,
): number {
  if (!item.value) return 0
  const dcChar = item.value[0] ?? ''
  const rest = item.value.slice(1)

  ctx.font = `600 ${FONT_DROPCAP}px ${FONT}`
  ctx.textBaseline = 'top'
  const dcW = ctx.measureText(dcChar).width
  const dcH = Math.round(FONT_DROPCAP * 0.85)

  ctx.fillStyle = '#16162a'
  ctx.fillText(dcChar, x, y)

  ctx.font = `${FONT_BODY}px ${FONT}`
  ctx.fillStyle = INK

  const restX = x + dcW + DROPCAP_GAP
  const firstMaxW = maxW - (restX - x)
  const bodyLh = Math.round(FONT_BODY * LINE_H)

  const words = rest.split(' ')
  let cy = y
  let line: string[] = []

  function flushLine() {
    if (line.length === 0) return
    const text = line.join(' ')
    const besideDrop = cy - y < dcH
    ctx.fillText(text, besideDrop ? restX : x, cy)
    cy += bodyLh
    line = []
  }

  for (const word of words) {
    const candidate = line.length === 0 ? word : line.join(' ') + ' ' + word
    const mw = cy - y < dcH ? firstMaxW : maxW
    if (ctx.measureText(candidate).width > mw && line.length > 0) {
      flushLine()
    }
    line.push(word)
  }
  flushLine()

  return Math.max(cy, y + dcH + bodyLh) - y
}

function renderText(ctx: CanvasRenderingContext2D, item: PageContent, x: number, y: number, maxW: number): number {
  if (!item.value) return 0
  return drawTextBlock(ctx, item.value, x, y, maxW, FONT_BODY, INK)
}

function renderSeparator(ctx: CanvasRenderingContext2D, x: number, y: number, maxW: number): number {
  const midY = y + 10
  drawRule(ctx, x, midY, maxW)
  return 20
}

function renderEntry(ctx: CanvasRenderingContext2D, item: PageContent, x: number, y: number, maxW: number): number {
  if (!item.entries) return 0
  let cy = y
  for (const e of item.entries) {
    const labelH = drawTextBlock(ctx, e.label, x, cy, maxW, FONT_BODY, '#16162a', 1.35)
    cy += labelH + 2
    if (e.value) {
      const valH = drawTextBlock(ctx, e.value, x, cy, maxW, FONT_GRID, INK, 1.5)
      cy += valH + Math.round(FONT_GRID * 0.5)
    }
    cy += Math.round(FONT_BODY * 0.4)
  }
  return cy - y
}

function renderGrid(ctx: CanvasRenderingContext2D, item: PageContent, x: number, y: number, maxW: number): number {
  if (!item.entries) return 0
  let cy = y
  const colW = Math.round(maxW * 0.46)
  const gap = Math.round(maxW * 0.08)
  let col2Y = cy

  for (let i = 0; i < item.entries.length; i++) {
    const e = item.entries[i]!
    const col = i % 2
    const cx = x + col * (colW + gap)

    const labelH = drawTextBlock(ctx, e.label, cx, cy, colW, FONT_GRID_LABEL, '#16162a', 1.3)
    const labelEnd = cy + labelH + 2

    if (e.value) {
      const valH = drawTextBlock(ctx, e.value, cx, labelEnd, colW, FONT_GRID, INK, 1.45)
      const totalH = labelEnd + valH + Math.round(FONT_GRID * 0.6) - cy
      if (col === 0) {
        col2Y = Math.max(col2Y, labelEnd + valH + Math.round(FONT_GRID * 0.6))
      } else {
        cy = Math.max(cy + totalH, col2Y)
        col2Y = cy
      }
    } else {
      if (col === 0) {
        col2Y = Math.max(col2Y, labelEnd + Math.round(FONT_GRID * 0.6))
      } else {
        cy = Math.max(labelEnd + Math.round(FONT_GRID * 0.6), col2Y)
        col2Y = cy
      }
    }
  }
  return cy - y
}

function renderList(ctx: CanvasRenderingContext2D, item: PageContent, x: number, y: number, maxW: number): number {
  if (!item.items) return 0
  let cy = y
  ctx.font = `${FONT_GRID}px ${FONT}`
  ctx.fillStyle = INK
  ctx.textBaseline = 'top'
  const bulletW = ctx.measureText('\u2022 ').width
  for (const text of item.items ?? []) {
    const lines = wrapText(ctx, text, maxW - bulletW)
    ctx.fillText('\u2022', x, cy)
    let lcy = cy
    for (const line of lines) {
      ctx.fillText(line, x + bulletW, lcy)
      lcy += FONT_GRID * LINE_H
    }
    cy = lcy + Math.round(FONT_GRID * 0.3)
  }
  return cy - y
}

function renderItem(ctx: CanvasRenderingContext2D, item: PageContent, x: number, y: number, maxW: number): number {
  switch (item.type) {
    case 'archive-header':
      return renderArchiveHeader(ctx, item, x, y, maxW)
    case 'hero':
      return renderHero(ctx, item, x, y, maxW)
    case 'subtitle':
      return renderSubtitle(ctx, item, x, y, maxW)
    case 'divider':
      return renderDivider(ctx, x, y, maxW)
    case 'heading':
      return renderHeading(ctx, item, x, y, maxW)
    case 'small-heading':
      return renderSmallHeading(ctx, item, x, y, maxW)
    case 'dropcap-text':
      return renderDropcapText(ctx, item, x, y, maxW)
    case 'text':
      return renderText(ctx, item, x, y, maxW)
    case 'separator':
      return renderSeparator(ctx, x, y, maxW)
    case 'entry':
      return renderEntry(ctx, item, x, y, maxW)
    case 'grid':
      return renderGrid(ctx, item, x, y, maxW)
    case 'list':
      return renderList(ctx, item, x, y, maxW)
    default:
      return 0
  }
}

// Module-level noise pattern cache
let _noisePattern: CanvasPattern | null = null

function getNoisePattern(): CanvasPattern {
  if (_noisePattern) return _noisePattern
  const nc = document.createElement('canvas')
  nc.width = 256
  nc.height = 256
  const nctx = nc.getContext('2d')!
  const id = nctx.createImageData(256, 256)
  const d = id.data
  for (let i = 0; i < d.length; i += 4) {
    const n1 = Math.sin(i * 12.9898) * 43758.5453
    const n2 = Math.sin((i + 1) * 78.233) * 43758.5453
    const grain = (Math.abs(n1 - Math.floor(n1)) - 0.5) * 6
    d[i] = 245 + grain
    d[i + 1] = 239 + grain
    d[i + 2] = 230 + grain
    d[i + 3] = 18 + Math.abs(n2 - Math.floor(n2)) * 8
  }
  nctx.putImageData(id, 0, 0)
  _noisePattern = nctx.createPattern(nc, 'repeat')!
  return _noisePattern
}

export function createPageTexture(
  page: PageData | undefined,
  aspect: number,
  side: 'left' | 'right',
  pageNum?: number,
): THREE.CanvasTexture {
  const w = BASE_W
  const h = Math.round(BASE_W * aspect)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, w, h)

  // Paper grain texture
  ctx.save()
  ctx.fillStyle = getNoisePattern()
  ctx.fillRect(0, 0, w, h)
  ctx.restore()

  const innerX = side === 'left' ? MARGIN_OUTER : MARGIN_INNER
  const outerX = side === 'left' ? MARGIN_INNER : MARGIN_OUTER
  const textX = Math.min(innerX, outerX)
  const textW = w - outerX - innerX

  // Running header
  if (page) {
    ctx.font = `${FONT_SMALL}px ${FONT}`
    ctx.fillStyle = MUTED
    ctx.textBaseline = 'top'
    const headX = side === 'left' ? textX : w - outerX - ctx.measureText(page.title).width
    ctx.fillText(page.title, headX, MARGIN_TOP)
  }

  // Thin rule below header
  const ruleY = MARGIN_TOP + Math.round(FONT_SMALL * 1.5)
  drawRule(ctx, textX, ruleY, textW)

  // Content area
  let cy = ruleY + Math.round(FONT_SMALL * 1.2)
  const bottomBound = h - MARGIN_BOTTOM - Math.round(FONT_SMALL * 2)

  if (page) {
    for (const item of page.content) {
      if (cy > bottomBound) break
      const itemH = renderItem(ctx, item, textX, cy, textW)
      cy += itemH + (item.type === 'separator' ? 0 : Math.round(FONT_BODY * 0.3))
    }
  }

  // Page number
  if (pageNum !== undefined) {
    ctx.font = `${FONT_SMALL}px ${FONT}`
    ctx.fillStyle = MUTED
    ctx.textBaseline = 'bottom'
    const pnText = pageNum.toString()
    const pnX = side === 'left' ? textX : w - outerX - ctx.measureText(pnText).width
    ctx.fillText(pnText, pnX, h - MARGIN_BOTTOM)
  }

  // Subtle gutter shadow
  const gutterX = side === 'left' ? w - MARGIN_INNER : MARGIN_INNER - 10
  const gutterGrad = ctx.createLinearGradient(gutterX - 14, 0, gutterX, 0)
  if (side === 'left') {
    gutterGrad.addColorStop(0, 'rgba(0,0,0,0)')
    gutterGrad.addColorStop(1, 'rgba(0,0,0,0.03)')
  } else {
    gutterGrad.addColorStop(0, 'rgba(0,0,0,0.03)')
    gutterGrad.addColorStop(1, 'rgba(0,0,0,0)')
  }
  ctx.fillStyle = gutterGrad
  ctx.fillRect(side === 'left' ? w - MARGIN_INNER - 14 : MARGIN_INNER - 10, 0, 24, h)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  return texture
}
