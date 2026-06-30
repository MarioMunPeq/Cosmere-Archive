// ── Reading Order ──
export const READING_ORDER_KEY = 'cosmere-reading-progress'
export const READING_ORDER: string[] = [
  'elantris',
  'the_final_empire',
  'the_well_of_ascension',
  'the_hero_of_ages',
  'warbreaker',
  'the_way_of_kings',
  'words_of_radiance',
  'oathbringer',
  'dawnshard',
  'rhythm_of_war',
  'wind_and_truth',
  'the_alloy_of_law',
  'shadows_of_self',
  'the_bands_of_mourning',
  'the_lost_metal',
  'white_sand_vol_1',
  'white_sand_vol_2',
  'white_sand_vol_3',
  'arcanum_unbounded',
  'tress_of_the_emerald_sea',
  'yumi_and_the_nightmare_painter',
  'the_sunlit_man',
]

// ── Keyboard Shortcuts ──
export interface Shortcut {
  keys: string
  label: string
}

export const SHORTCUTS: Shortcut[] = [
  { keys: 'Ctrl+K', label: 'Command palette' },
  { keys: '/', label: 'Focus search' },
  { keys: '?', label: 'Toggle this help' },
  { keys: 'Alt+1', label: 'About page' },
  { keys: 'Alt+2', label: 'Relationships page' },
  { keys: 'Alt+3', label: 'Glossary page' },
  { keys: 'Alt+4', label: 'Family Tree page' },
  { keys: 'Alt+5', label: 'Heralds page' },
  { keys: 'Alt+6', label: 'Locations page' },
  { keys: 'Alt+7', label: 'Books page' },
  { keys: 'Alt+8', label: 'Characters page' },
  { keys: 'Alt+9', label: 'Shards page' },
  { keys: 'Alt+0', label: 'Stats page' },
]

import type { CharacterRelationship } from '@/types/relationships'

// ── Character Relationships ──

export const CHARACTER_RELATIONSHIPS: CharacterRelationship[] = [
  { characters: ['kelsier', 'mare'], type: 'spouse', label: 'Husband' },
  { characters: ['kelsier', 'vin'], type: 'mentor', label: 'Mentor' },
  { characters: ['kelsier', 'sazed'], type: 'ally', label: 'Allies' },
  { characters: ['vin', 'elend'], type: 'spouse', label: 'Wife' },
  { characters: ['vin', 'reene'], type: 'sibling', label: 'Brother' },
  { characters: ['vin', 'kelsier'], type: 'mentee', label: 'Student' },
  { characters: ['sazed', 'tindwyl'], type: 'spouse', label: 'Husband' },
  { characters: ['sazed', 'kelsier'], type: 'ally', label: 'Allies' },
  { characters: ['kaladin', 'syl'], type: 'bonded', label: 'Nahel bond' },
  { characters: ['kaladin', 'shallan'], type: 'ally', label: 'Allies' },
  { characters: ['kaladin', 'dalinar'], type: 'allegiance', label: 'Leads' },
  { characters: ['kaladin', 'teft'], type: 'ally', label: 'Bridge Four' },
  { characters: ['kaladin', 'moash'], type: 'rival', label: 'Betrayed' },
  { characters: ['shallan', 'adolin'], type: 'spouse', label: 'Wife' },
  { characters: ['shallan', 'kaladin'], type: 'ally', label: 'Allies' },
  { characters: ['dalinar', 'sadeas'], type: 'rival', label: 'Political rivals' },
  { characters: ['dalinar', 'navani'], type: 'spouse', label: 'Husband' },
  { characters: ['dalinar', 'kaladin'], type: 'allegiance', label: 'Commands' },
  { characters: ['elend', 'vin'], type: 'spouse', label: 'Husband' },
  { characters: ['elend', 'sazed'], type: 'ally', label: 'Allies' },
  { characters: ['raoden', 'sarene'], type: 'spouse', label: 'Husband' },
  { characters: ['hoid', 'kelsier'], type: 'rival', label: 'Adversaries' },
  { characters: ['hoid', 'dalinar'], type: 'ally', label: 'Advisor' },
  { characters: ['hoid', 'kaladin'], type: 'mentor', label: 'Philosophical guide' },
  { characters: ['vasher', 'nightblood'], type: 'creator', label: 'Awakener' },
  { characters: ['vasher', 'vivenna'], type: 'ally', label: 'Fellow Returned' },
  { characters: ['sarene', 'raoden'], type: 'spouse', label: 'Wife' },
  { characters: ['sarene', 'kiin'], type: 'parent', label: 'Niece' },
  { characters: ['spook', 'kelsier'], type: 'mentee', label: 'Student' },
  { characters: ['spook', 'vin'], type: 'ally', label: 'Crewmate' },
  { characters: ['teft', 'kaladin'], type: 'ally', label: 'Bridge Four' },
  { characters: ['moash', 'kaladin'], type: 'rival', label: 'Betrayed' },
  { characters: ['adolin', 'shallan'], type: 'spouse', label: 'Husband' },
  { characters: ['navani', 'dalinar'], type: 'spouse', label: 'Wife' },
  { characters: ['syl', 'kaladin'], type: 'bonded', label: 'Nahel bond' },
  { characters: ['nightblood', 'vasher'], type: 'creation', label: 'Created by' },
  { characters: ['nightblood', 'szeth'], type: 'wielder', label: 'Wields' },
  { characters: ['szeth', 'nightblood'], type: 'wields', label: 'Sword' },
  { characters: ['szeth', 'dalinar'], type: 'allegiance', label: 'Sworn to' },
  { characters: ['kelsier', 'sazed'], type: 'ally' },
  { characters: ['mare', 'kelsier'], type: 'spouse', label: 'Wife' },
]

// ── Colors ──
export const FALLBACK_COLOR = '#6b7280'

export const SHARD_COLORS: Record<string, string> = {
  Honor: '#f59e0b',
  Cultivation: '#22c55e',
  Odium: '#ef4444',
  Preservation: '#3b82f6',
  Ruin: '#991b1b',
  Harmony: '#14b8a6',
  Devotion: '#a5b4fc',
  Dominion: '#312e81',
  Endowment: '#d946ef',
  Autonomy: '#eab308',
  Ambition: '#8b5cf6',
  Virtuosity: '#0ea5e9',
  Mercy: '#f472b6',
}

export const SAGA_BG: Record<string, string> = {
  'Stormlight Archive': '#1e293b',
  'Mistborn Era 1': '#1c1917',
  'Mistborn Era 2': '#0f172a',
  Elantris: '#0f172a',
  Warbreaker: '#052e16',
  'White Sand': '#1c1917',
  'Secret Projects': '#1f0f29',
  Arcanum: '#1e1b4b',
}

export const SAGA_NAME_COLORS: Record<string, string> = {
  'Stormlight Archive': '#fbbf24',
  'Mistborn Era 1': '#f87171',
  'Mistborn Era 2': '#2dd4bf',
  'Mistborn Era 3': '#a78bfa',
  Elantris: '#60a5fa',
  Warbreaker: '#34d399',
  'White Sand': '#fb923c',
  'Secret Projects': '#f472b6',
  Arcanum: '#818cf8',
}

export const TAILWIND_TO_HEX: Record<string, string> = {
  red: '#ef4444',
  amber: '#f59e0b',
  teal: '#14b8a6',
  fuchsia: '#d946ef',
  cyan: '#06b6d4',
  yellow: '#eab308',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
}

export const EVENT_TYPE_BADGE_COLORS: Record<string, string> = {
  book: 'bg-blue-900/60 text-blue-300',
  cataclysm: 'bg-red-900/60 text-red-300',
  birth: 'bg-green-900/60 text-green-300',
  death: 'bg-gray-800/80 text-gray-400',
  arrival: 'bg-purple-900/60 text-purple-300',
  departure: 'bg-yellow-900/60 text-yellow-300',
  discovery: 'bg-cyan-900/60 text-cyan-300',
  historical: 'bg-gray-800/60 text-gray-400',
}

export const TYPE_LABELS: Record<string, string> = {
  book: 'Book',
  cataclysm: 'Cataclysm',
  birth: 'Birth',
  death: 'Death',
  arrival: 'Arrival',
  departure: 'Departure',
  discovery: 'Discovery',
  historical: 'Historical',
}

export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return [150, 150, 150]
  return [Number.parseInt(m[1]!, 16), Number.parseInt(m[2]!, 16), Number.parseInt(m[3]!, 16)]
}
