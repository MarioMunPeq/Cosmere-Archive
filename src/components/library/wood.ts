/**
 * Wood — the cabinet, as an SVG data URI.
 *
 * M3 · deliverable 5. Replaces `wood-pattern.png`: a 203×317 bitmap stretched to
 * 2700 px wide on a 4K screen, which is why the cabinet looked like wallpaper
 * rather than like wood.
 *
 * The construction is the one §5.3.4 specifies:
 *
 *   feTurbulence  anisotropic, baseFrequency "0.012 0.09", 5 octaves. The wide
 *                 gap between the two frequencies is what produces long, tight
 *                 grain lines instead of isotropic noise.
 *   12 veins      drawn, on top of the noise, so the grain has a direction and
 *                 the tile has no obvious repeat.
 *
 * The knots §5.3.4 also specifies were drawn, then removed: at cabinet scale
 * five concentric ellipses per knot read as targets rather than as timber. The
 * grain alone carries it.
 *
 * One thing the first version got wrong, and which is worth recording: the wood
 * was drawn at its natural value. Walnut is #2a1c11 and that is *already* the
 * value of a lit board — on a #07090f page at full strength it read as an orange
 * fence, and a cabinet with twenty-two books and eight hundred pixels of empty
 * board beside them read as a brown wall.
 *
 * So the tile is not just darkened, it is scaled up and pulled down further:
 * the grain is carried by the *difference* between neighbouring pixels, and
 * that difference survives being dark, while the overall value disappears. The
 * cabinet should be felt. The books are the subject.
 *
 * Built once at module load and cached: encoding ~4 KB is not free per render.
 */

let cached: string | null = null

/** Deterministic pseudo-random in 0–1, so the tile is identical every load. */
function rnd(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

function build(): string {
  const veins: string[] = []
  for (let i = 0; i < 12; i++) {
    // Grain lines run with the plank, so mostly horizontal with a slow drift.
    const y = 40 + rnd(i + 1) * 432
    const amp = 3 + rnd(i + 21) * 9
    const wobble = 0.6 + rnd(i + 41) * 1.4
    const d = Array.from({ length: 9 }, (_, s) => {
      const x = (s / 8) * 512
      const yy = y + Math.sin((s / 8) * Math.PI * wobble + i) * amp
      return `${s === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yy.toFixed(1)}`
    }).join(' ')
    veins.push(
      `<path d="${d}" fill="none" stroke="#0a0704" stroke-width="${(0.7 + rnd(i + 61) * 1.6).toFixed(2)}" opacity="${(0.5 + rnd(i + 81) * 0.4).toFixed(2)}"/>`,
    )
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">` +
    `<defs>` +
    // Anisotropic turbulence: tight across the grain, stretched along it.
    `<filter id="g" x="0" y="0" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="5" seed="7" result="n"/>` +
    `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.055  0 0 0 0 0.038  0 0 0 0 0.026  1.3 0.5 0 0 -0.42"/>` +
    `</filter>` +
    // A second, coarser pass so the plank has broad tonal bands as well as grain.
    `<filter id="b" x="0" y="0" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.004 0.02" numOctaves="2" seed="19"/>` +
    `<feColorMatrix type="matrix" values="0 0 0 0 0.045  0 0 0 0 0.03  0 0 0 0 0.019  1.1 0 0 0 -0.32"/>` +
    `</filter>` +
    `</defs>` +
    `<rect width="512" height="512" fill="#0d0a07"/>` +
    `<rect width="512" height="512" filter="url(#b)" opacity="0.55"/>` +
    `<rect width="512" height="512" filter="url(#g)" opacity="0.7"/>` +
    veins.join('') +
    `</svg>`

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/** `background-image` value for the cabinet: one tile, repeated. */
export function woodTexture(): string {
  cached ??= build()
  return cached
}
