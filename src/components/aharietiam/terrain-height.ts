/**
 * One height function for the rockbed, shared by the ground mesh, the loose
 * stones and the far hills. If they each invented their own terrain, a boulder
 * would hover above a dip the moment the camera orbited.
 */

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** Metres above the ceremonial plane at the centre of the ring. */
export function terrainHeightAt(x: number, z: number): number {
  const distance = Math.sqrt(x * x + z * z)
  const near = smoothstep(8, 17, distance)
  const far = smoothstep(15, 56, distance)

  const grain = near * (Math.sin(x * 0.46) * 0.035 + Math.cos(z * 0.39 + 1.1) * 0.03)
  const roll =
    far *
    (Math.sin(x * 0.052 + 1.2) * 0.85 +
      Math.cos(z * 0.047 - 0.6) * 0.72 +
      Math.sin((x + z) * 0.024) * 0.55 +
      Math.cos((x - z) * 0.031 + 2.3) * 0.34)

  return grain + roll
}
