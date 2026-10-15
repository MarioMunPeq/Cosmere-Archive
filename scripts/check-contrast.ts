/**
 * M1 · Block 7 — contrast budget
 *
 * Reads src/design/tokens.css and asserts every text×surface pair clears the
 * WCAG 2.x threshold. Fails the build (and CI) if any pair regresses.
 *
 *   text pairs        ≥ 4.5:1   (SC 1.4.3)
 *   disabled text     ≥ 3:1     (SC 1.4.3 exempt, but held to the stricter bar)
 *   non-text (border, focus)  ≥ 3:1   (SC 1.4.11)
 *   shard colours     ≥ 3:1     (used as UI colour: nodes, chips, rings)
 *
 * Usage: pnpm test:contrast
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const TOKENS_FILE = resolve(here, '../src/design/tokens.css')

type Rgb = [number, number, number]

function hexToRgb(hex: string): Rgb {
  let h = hex.replace('#', '').trim()
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  return [h.slice(0, 2), h.slice(2, 4), h.slice(4, 6)].map((s) => parseInt(s, 16)) as Rgb
}

function relativeLuminance([r, g, b]: Rgb): number {
  const f = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function contrast(a: string, b: string): number {
  const l1 = relativeLuminance(hexToRgb(a))
  const l2 = relativeLuminance(hexToRgb(b))
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

function parseTokens(): Record<string, string> {
  const css = readFileSync(TOKENS_FILE, 'utf8')
  const start = css.indexOf(':root')
  const end = css.indexOf('/* ===', start + 10)
  const block = css.slice(start, end === -1 ? css.length : end)
  const out: Record<string, string> = {}
  for (const m of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim().replace(/\s+/g, ' ')
  }
  return out
}

const T = parseTokens()

const TEXT_AA = 4.5
const NON_TEXT_AA = 3

interface Rule {
  label: string
  fg: string
  bg: string
  min: number
}

const rules: Rule[] = []

// Dark theme: every text token against every surface it is allowed to sit on.
for (const [token, bgs] of [
  ['primary', ['base', 'void', 'raised']],
  ['secondary', ['base', 'void', 'raised']],
  ['tertiary', ['base', 'void', 'raised']],
  ['link', ['base', 'void', 'raised']],
  ['accent', ['base', 'void', 'raised']],
  ['disabled', ['base']],
] as const) {
  for (const bg of bgs) {
    rules.push({
      label: `--text-${token} on --surface-${bg}`,
      fg: `--text-${token}`,
      bg: `--surface-${bg}`,
      min: token === 'disabled' ? NON_TEXT_AA : TEXT_AA,
    })
  }
}

// Paper theme.
for (const [token, bgs] of [
  ['primary', ['page', 'page-inset']],
  ['secondary', ['page', 'page-inset']],
  ['tertiary', ['page', 'page-inset']],
  ['link', ['page', 'page-inset']],
  ['accent', ['page']],
  ['disabled', ['page']],
] as const) {
  for (const bg of bgs) {
    rules.push({
      label: `--text-on-page-${token} on --surface-${bg}`,
      fg: `--text-on-page-${token}`,
      bg: `--surface-${bg}`,
      min: token === 'disabled' ? NON_TEXT_AA : TEXT_AA,
    })
  }
}

// Non-text: borders and focus rings must clear 3:1 (SC 1.4.11).
for (const [label, fg, bg] of [
  ['--border-interactive on --surface-base', '--border-interactive', '--surface-base'],
  ['--border-interactive on --surface-raised', '--border-interactive', '--surface-raised'],
  ['--border-interactive-on-page on --surface-page', '--border-interactive-on-page', '--surface-page'],
  ['--border-interactive-on-page on --surface-page-inset', '--border-interactive-on-page', '--surface-page-inset'],
  ['--focus-color on --surface-base', '--focus-color', '--surface-base'],
  ['--focus-color-on-page on --surface-page', '--focus-color-on-page', '--surface-page'],
] as const) {
  rules.push({ label, fg, bg, min: NON_TEXT_AA })
}

// Shard colours are used as UI colour, so they are held to the non-text bar.
for (const shard of [
  'honor',
  'cultivation',
  'odium',
  'preservation',
  'ruin',
  'harmony',
  'autonomy',
  'adonalsium',
  'yolen',
  'none',
]) {
  rules.push({
    label: `--shard-${shard} on --surface-base`,
    fg: `--shard-${shard}`,
    bg: '--surface-base',
    min: NON_TEXT_AA,
  })
}

let failed = 0
const missing: string[] = []

console.log('contrast budget · src/design/tokens.css\n')

for (const rule of rules) {
  const fg = T[rule.fg]
  const bg = T[rule.bg]
  if (!fg || !bg || !fg.startsWith('#') || !bg.startsWith('#')) {
    missing.push(`${rule.fg} or ${rule.bg} is not a #hex token`)
    failed++
    console.log(`  ??  ${rule.label} — token missing or not a hex colour`)
    continue
  }
  const ratio = contrast(fg, bg)
  const ok = ratio >= rule.min
  if (!ok) failed++
  console.log(
    `  ${ok ? 'PASS' : 'FAIL'}  ${rule.label.padEnd(46)} ${fg} / ${bg}  ${ratio
      .toFixed(2)
      .padStart(6)}  (min ${rule.min})`,
  )
}

console.log(`\n${rules.length} checks · ${failed} failures`)

if (missing.length > 0) {
  console.log('\ntokens not found:')
  for (const m of new Set(missing)) console.log(`  - ${m}`)
}

if (failed > 0) {
  console.error('\ncontrast budget FAILED')
  process.exit(1)
}

console.log('contrast budget PASSED')
