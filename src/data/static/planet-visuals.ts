import type { PlanetVisualConfig } from '@/types/planet-visuals'

export const PLANET_VISUALS: Record<string, PlanetVisualConfig> = {
  roshar: {
    core: { colors: ['#0a4a5c', '#0d3b4a', '#071f28'] },
    surface: {
      pattern: 'bands',
      colors: ['#0a4a5c', '#0d3b4a', '#061a22', '#0c5a70', '#082a36'],
      opacity: 0.8,
    },
    continents: { count: 4, color: '#1a7a8a', opacity: 0.25 },
    clouds: { color: '#7dd3fc', opacity: 0.15, count: 3 },
    atmosphere: { color: '#22d3ee', opacity: 0.2, animation: 'breathe', speed: 6 },
    halo: { color: '#22d3ee', size: 1.4, opacity: 0.12, animation: 'pulse', speed: 4 },
    shadow: { angle: -30, intensity: 0.35, color: '#000' },
    particles: { count: 12, color: '#67e8f9', size: [0.3, 0.8], speed: 25, spread: 1.8 },
    animation: { breatheSpeed: 6, rotationSpeed: 120 },
  },
  scadrial: {
    core: { colors: ['#3a3a3a', '#1f1f1f', '#0a0a0a'] },
    surface: {
      pattern: 'metallic',
      colors: ['#4a4a4a', '#2d2d2d', '#1a1a1a', '#3d3d3d', '#222222'],
      opacity: 0.9,
    },
    continents: { count: 3, color: '#5a5a5a', opacity: 0.15 },
    atmosphere: { color: '#f87171', opacity: 0.08, animation: 'steady', speed: 0 },
    halo: { color: '#f87171', size: 1.3, opacity: 0.06, animation: 'glow', speed: 6 },
    shadow: { angle: 20, intensity: 0.4, color: '#000' },
    particles: { count: 8, color: '#78716c', size: [0.2, 0.5], speed: 40, spread: 2.0 },
    animation: { breatheSpeed: 8, rotationSpeed: 180 },
  },
  sel: {
    core: { colors: ['#0d9488', '#0f766e', '#0a3d38'] },
    surface: {
      pattern: 'veins',
      colors: ['#0d9488', '#0f766e', '#115e59', '#14b8a6', '#0a3d38'],
      opacity: 0.85,
    },
    atmosphere: { color: '#5eead4', opacity: 0.15, animation: 'breathe', speed: 5 },
    halo: { color: '#5eead4', size: 1.35, opacity: 0.1, animation: 'pulse', speed: 5 },
    shadow: { angle: -15, intensity: 0.3, color: '#000' },
    animation: { breatheSpeed: 5, rotationSpeed: 150 },
  },
  nalthis: {
    core: { colors: ['#a21caf', '#86198f', '#4a044e'] },
    surface: {
      pattern: 'marble',
      colors: ['#a21caf', '#86198f', '#701a75', '#d946ef', '#4a044e'],
      opacity: 0.85,
    },
    atmosphere: { color: '#f0abfc', opacity: 0.18, animation: 'breathe', speed: 4 },
    halo: { color: '#f0abfc', size: 1.4, opacity: 0.1, animation: 'pulse', speed: 3 },
    shadow: { angle: 0, intensity: 0.25, color: '#000' },
    particles: { count: 6, color: '#f0abfc', size: [0.4, 1.0], speed: 15, spread: 1.6 },
    animation: { breatheSpeed: 4, rotationSpeed: 100 },
  },
  taldain: {
    core: { colors: ['#a16207', '#854d0e', '#422006'] },
    surface: {
      pattern: 'speckled',
      colors: ['#a16207', '#854d0e', '#713f12', '#ca8a04', '#422006'],
      opacity: 0.85,
    },
    atmosphere: { color: '#fef08a', opacity: 0.12, animation: 'steady', speed: 0 },
    halo: { color: '#fef08a', size: 1.3, opacity: 0.08, animation: 'glow', speed: 7 },
    shadow: { angle: 40, intensity: 0.35, color: '#000' },
    particles: { count: 10, color: '#facc15', size: [0.3, 0.6], speed: 30, spread: 1.5 },
    animation: { breatheSpeed: 7, rotationSpeed: 200 },
  },
  threnody: {
    core: { colors: ['#2d1b3d', '#1f1229', '#0d0712'] },
    surface: {
      pattern: 'scales',
      colors: ['#2d1b3d', '#1f1229', '#3d264f', '#1a0f24', '#0d0712'],
      opacity: 0.9,
    },
    atmosphere: { color: '#6b7280', opacity: 0.06, animation: 'steady', speed: 0 },
    halo: { color: '#6b7280', size: 1.25, opacity: 0.05, animation: 'glow', speed: 8 },
    shadow: { angle: 10, intensity: 0.5, color: '#000' },
    animation: { breatheSpeed: 10, rotationSpeed: 240 },
  },
  'first-of-the-sun': {
    core: { colors: ['#15803d', '#166534', '#0a2e1a'] },
    surface: {
      pattern: 'veins',
      colors: ['#15803d', '#166534', '#22c55e', '#0a2e1a', '#1a8a4a'],
      opacity: 0.8,
    },
    clouds: { color: '#6ee7b7', opacity: 0.12, count: 2 },
    atmosphere: { color: '#6ee7b7', opacity: 0.14, animation: 'breathe', speed: 6 },
    halo: { color: '#6ee7b7', size: 1.35, opacity: 0.08, animation: 'pulse', speed: 5 },
    shadow: { angle: -25, intensity: 0.3, color: '#000' },
    animation: { breatheSpeed: 6, rotationSpeed: 160 },
  },
  komashi: {
    core: { colors: ['#0369a1', '#075985', '#0c4a6e'] },
    surface: {
      pattern: 'scales',
      colors: ['#0369a1', '#075985', '#0284c7', '#0c4a6e', '#0e7490'],
      opacity: 0.85,
    },
    atmosphere: { color: '#7dd3fc', opacity: 0.15, animation: 'breathe', speed: 5 },
    halo: { color: '#7dd3fc', size: 1.35, opacity: 0.1, animation: 'pulse', speed: 4 },
    shadow: { angle: 30, intensity: 0.3, color: '#000' },
    animation: { breatheSpeed: 5, rotationSpeed: 130 },
  },
  lumar: {
    core: { colors: ['#db2777', '#be185d', '#831843'] },
    surface: {
      pattern: 'speckled',
      colors: ['#db2777', '#be185d', '#f472b6', '#831843', '#9d174d'],
      opacity: 0.8,
    },
    atmosphere: { color: '#f9a8d4', opacity: 0.15, animation: 'breathe', speed: 5 },
    halo: { color: '#f9a8d4', size: 1.35, opacity: 0.08, animation: 'pulse', speed: 4 },
    shadow: { angle: -10, intensity: 0.3, color: '#000' },
    particles: { count: 15, color: '#f9a8d4', size: [0.2, 0.7], speed: 20, spread: 2.2 },
    animation: { breatheSpeed: 5, rotationSpeed: 140 },
  },
  canticle: {
    core: { colors: ['#ea580c', '#c2410c', '#7c2d12'] },
    surface: {
      pattern: 'marble',
      colors: ['#ea580c', '#c2410c', '#f97316', '#9a3412', '#7c2d12'],
      opacity: 0.85,
    },
    atmosphere: { color: '#fde047', opacity: 0.12, animation: 'breathe', speed: 4 },
    halo: { color: '#fde047', size: 1.4, opacity: 0.1, animation: 'pulse', speed: 3 },
    shadow: { angle: 50, intensity: 0.35, color: '#000' },
    particles: { count: 8, color: '#fde047', size: [0.3, 0.6], speed: 35, spread: 1.7 },
    animation: { breatheSpeed: 4, rotationSpeed: 90 },
  },
  yolen: {
    core: { colors: ['#5b3a8a', '#4a2d6e', '#2a1a42'] },
    surface: {
      pattern: 'smooth',
      colors: ['#5b3a8a', '#4a2d6e', '#7c5bbf', '#2a1a42', '#3d2460'],
      opacity: 0.85,
    },
    atmosphere: { color: '#a78bfa', opacity: 0.1, animation: 'steady', speed: 0 },
    halo: { color: '#a78bfa', size: 1.3, opacity: 0.06, animation: 'glow', speed: 8 },
    shadow: { angle: -20, intensity: 0.4, color: '#000' },
    animation: { breatheSpeed: 9, rotationSpeed: 200 },
  },
}

export function getPlanetVisual(id: string): PlanetVisualConfig {
  return PLANET_VISUALS[id] ?? PLANET_VISUALS.roshar!
}
