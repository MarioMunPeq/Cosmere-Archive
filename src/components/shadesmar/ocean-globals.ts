export const MAX_BEADS = 800
export const INITIAL_BEADS = 60
export const BEAD_RADIUS = 0.06

export const beadActive = new Uint8Array(MAX_BEADS)
export const beadPosition = new Float32Array(MAX_BEADS * 3)
export const beadPhase = new Float32Array(MAX_BEADS)
export const beadSpeed = new Float32Array(MAX_BEADS)
export const beadGlow = new Float32Array(MAX_BEADS)
export const beadGlowTarget = new Float32Array(MAX_BEADS)
