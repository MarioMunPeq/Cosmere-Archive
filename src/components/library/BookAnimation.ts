export type BookPhase = 'extracting' | 'rotating' | 'centering' | 'opening' | 'reading' | 'closing'

export interface PhaseTiming {
  extracting: number
  rotating: number
  centering: number
  opening: number
  settle: number
  closing_cover: number
  closing_flight: number
}

export const TIMING: PhaseTiming = {
  extracting: 400,
  rotating: 500,
  centering: 700,
  opening: 950,
  settle: 300,
  closing_cover: 600,
  closing_flight: 700,
}

export const EASING = {
  extract: 'cubic-bezier(0.22, 1, 0.36, 1)',
  rotateBook: 'cubic-bezier(0.15, 0.85, 0.25, 1)',
  center: 'cubic-bezier(0.22, 1, 0.36, 1)',
  openCover: 'cubic-bezier(0.12, 0.85, 0.25, 0.95)',
  closeCover: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  closeFlight: 'cubic-bezier(0.36, 0, 0.64, 1)',
  pageTurn: 'cubic-bezier(0.22, 1, 0.36, 1)',
}
