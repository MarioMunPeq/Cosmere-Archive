export interface SurfaceConfig {
  pattern: 'bands' | 'veins' | 'speckled' | 'metallic' | 'smooth' | 'scales' | 'marble' | 'geometric' | 'horizontals'
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

export interface StormCloudLayer {
  count: number
  color: string
  opacity: number
  blurAmount: number
  minSize: number
  maxSize: number
  radialSpread: number
  heightScale: number
}

export interface HighstormConfig {
  layers: StormCloudLayer[]
  arcSpan: number
  orbitalPeriod: number
  orbitalRadius: number
  frontGlowColor: string
  frontGlowOpacity: number
  stormlightCount: number
  stormlightColor: string
  lightningMinInterval: number
  lightningMaxInterval: number
  turbulenceFrequency: number
  turbulenceOctaves: number
  displacementScale: number
}

export interface ThematicConfig {
  type:
    | 'storm-spiral'
    | 'aon-lines'
    | 'day-night-split'
    | 'magma-cracks'
    | 'mist'
    | 'ancient-glow'
    | 'color-waves'
    | 'highstorm'
  colors: string[]
  opacity?: number
  speed?: number
  extendPx?: number
  highstorm?: HighstormConfig
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
  thematic?: ThematicConfig
  animation: AnimationConfig
}
