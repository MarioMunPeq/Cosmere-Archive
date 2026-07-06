export interface SurfaceConfig {
  pattern: 'bands' | 'veins' | 'speckled' | 'metallic' | 'smooth' | 'scales' | 'marble'
  colors: string[]
  opacity?: number
}

export interface ContinentConfig {
  count: number
  color: string
  opacity: number
}

export interface CloudConfig {
  color: string
  opacity: number
  count: number
}

export interface AtmosphereConfig {
  color: string
  opacity: number
  animation: 'breathe' | 'rotate' | 'steady'
  speed: number
}

export interface HaloConfig {
  color: string
  size: number
  opacity: number
  animation: 'pulse' | 'glow' | 'steady'
  speed: number
}

export interface ShadowConfig {
  angle: number
  intensity: number
  color: string
}

export interface ParticleConfig {
  count: number
  color: string
  size: [number, number]
  speed: number
  spread: number
}

export interface AnimationConfig {
  breatheSpeed: number
  rotationSpeed: number
}

export interface PlanetVisualConfig {
  core: { colors: [string, string, string] }
  surface: SurfaceConfig
  continents?: ContinentConfig
  clouds?: CloudConfig
  atmosphere: AtmosphereConfig
  halo: HaloConfig
  shadow: ShadowConfig
  particles?: ParticleConfig
  animation: AnimationConfig
}
