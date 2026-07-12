import { useMemo } from 'react'

type InkWriting = {
  x: number
  y: number
  content: string
  size?: number
  rotate?: number
  opacity?: number
  weight?: 'bold' | 'normal' | 'light'
  variant?: 'fresh' | 'normal' | 'faded' | 'vintage'
  mono?: boolean
  wide?: boolean
  crossed?: boolean
  maxWidth?: number
  front?: boolean
}

type InkDoodle = {
  x: number
  y: number
  draw:
    | 'circle'
    | 'double-circle'
    | 'arrow'
    | 'long-arrow'
    | 'underline'
    | 'bracket'
    | 'cross'
    | 'brace'
    | 'squiggle'
    | 'dash-arrow'
  rotate?: number
  scale?: number
  variant?: 'fresh' | 'normal' | 'faded' | 'vintage'
  length?: number
  front?: boolean
}

const INK = {
  fresh: 'rgba(218,204,178,',
  normal: 'rgba(196,182,156,',
  faded: 'rgba(168,152,130,',
  vintage: 'rgba(148,132,112,',
}

const WRITINGS: InkWriting[] = [
  // ═══╗  MAJOR CONCLUSIONS — VERY LARGE  ╔══════════════════════════
  {
    x: 60,
    y: 100,
    content: 'The enemy is not honor.',
    size: 28,
    rotate: -0.8,
    opacity: 0.88,
    weight: 'bold',
    variant: 'fresh',
    maxWidth: 500,
  },
  {
    x: 40,
    y: 180,
    content: 'The enemy is not odium.',
    size: 25,
    rotate: 1.4,
    opacity: 0.78,
    weight: 'bold',
    variant: 'fresh',
    maxWidth: 480,
  },
  {
    x: 80,
    y: 260,
    content: 'The enemy is…',
    size: 30,
    rotate: -1.8,
    opacity: 0.92,
    weight: 'bold',
    variant: 'fresh',
    maxWidth: 400,
  },
  {
    x: 370,
    y: 260,
    content: 'something else entirely',
    size: 14,
    rotate: 3.2,
    opacity: 0.5,
    variant: 'faded',
    maxWidth: 260,
  },

  {
    x: 3680,
    y: 60,
    content: 'The Diagram must survive.',
    size: 27,
    rotate: 0.6,
    opacity: 0.88,
    weight: 'bold',
    variant: 'fresh',
    maxWidth: 460,
  },
  {
    x: 4060,
    y: 140,
    content: 'I am the one who sees.',
    size: 25,
    rotate: -2,
    opacity: 0.82,
    weight: 'bold',
    variant: 'fresh',
    maxWidth: 420,
  },

  {
    x: 120,
    y: 3740,
    content: 'Hold the secret',
    size: 27,
    rotate: -0.4,
    opacity: 0.85,
    weight: 'bold',
    variant: 'fresh',
    maxWidth: 360,
  },
  {
    x: 100,
    y: 3820,
    content: 'that shall save us all.',
    size: 24,
    rotate: 0.9,
    opacity: 0.8,
    weight: 'bold',
    variant: 'fresh',
    maxWidth: 440,
  },

  {
    x: 4040,
    y: 3720,
    content: '16 Shards — 1 Unity',
    size: 24,
    rotate: -1.5,
    opacity: 0.78,
    weight: 'bold',
    variant: 'fresh',
    maxWidth: 400,
  },
  {
    x: 4360,
    y: 3820,
    content: 'The Shattering was inevitable.',
    size: 20,
    rotate: 1.8,
    opacity: 0.65,
    weight: 'bold',
    variant: 'normal',
    maxWidth: 420,
  },

  // ═══╗  KEY PREDICTIONS  ╔══════════════════════════
  {
    x: 60,
    y: 600,
    content: 'Know that Odium',
    size: 24,
    rotate: -2.5,
    opacity: 0.85,
    weight: 'bold',
    variant: 'fresh',
    maxWidth: 340,
  },
  {
    x: 70,
    y: 680,
    content: 'will be free.',
    size: 24,
    rotate: 2.0,
    opacity: 0.8,
    weight: 'bold',
    variant: 'fresh',
    maxWidth: 320,
  },

  {
    x: 4020,
    y: 600,
    content: 'Taravangian —',
    size: 25,
    rotate: -0.6,
    opacity: 0.85,
    weight: 'bold',
    variant: 'fresh',
  },
  {
    x: 4000,
    y: 670,
    content: '21 March, 1173',
    size: 22,
    rotate: 1.4,
    opacity: 0.75,
    weight: 'bold',
    variant: 'fresh',
  },
  {
    x: 4180,
    y: 640,
    content: '<— day of greatest clarity',
    size: 8,
    rotate: 1,
    opacity: 0.35,
    variant: 'vintage',
    mono: true,
    maxWidth: 220,
  },

  {
    x: 3820,
    y: 4200,
    content: 'Perhaps the Diagram',
    size: 22,
    rotate: -1,
    opacity: 0.78,
    weight: 'bold',
    variant: 'normal',
  },
  {
    x: 3800,
    y: 4280,
    content: 'was required.',
    size: 22,
    rotate: 1.8,
    opacity: 0.7,
    weight: 'bold',
    variant: 'normal',
  },
  {
    x: 4000,
    y: 4250,
    content: 'or was it the cause?',
    size: 9,
    rotate: -2.8,
    opacity: 0.35,
    variant: 'vintage',
    maxWidth: 180,
  },

  // ═══╗  RESEARCH NOTES — MEDIUM  ╔══════════════════════════
  { x: -20, y: 940, content: 'H stands at the centre', size: 16, rotate: 1.8, opacity: 0.62, variant: 'normal' },
  {
    x: 20,
    y: 1000,
    content: 'not by choice — by necessity',
    size: 10,
    rotate: -2.5,
    opacity: 0.32,
    variant: 'faded',
    maxWidth: 240,
  },

  {
    x: 4140,
    y: 940,
    content: 'The Nightwatcher granted this',
    size: 16,
    rotate: -1.8,
    opacity: 0.65,
    variant: 'normal',
    wide: true,
    maxWidth: 340,
  },
  {
    x: 4180,
    y: 1000,
    content: 'but at what cost?',
    size: 10,
    rotate: 2.5,
    opacity: 0.32,
    variant: 'faded',
    maxWidth: 180,
  },

  { x: -20, y: 4050, content: 'I see the paths.', size: 16, rotate: -1, opacity: 0.65, variant: 'normal' },
  { x: -30, y: 4120, content: 'They are all before me.', size: 16, rotate: 0.6, opacity: 0.6, variant: 'normal' },
  {
    x: 180,
    y: 4080,
    content: 'but which one is real?',
    size: 9,
    rotate: -3.5,
    opacity: 0.3,
    variant: 'vintage',
    maxWidth: 180,
  },

  {
    x: 3760,
    y: 3980,
    content: 'The most important words…',
    size: 16,
    rotate: -1.4,
    opacity: 0.65,
    variant: 'normal',
    maxWidth: 320,
  },
  {
    x: 4080,
    y: 3960,
    content: 'before he dies',
    size: 13,
    rotate: 1,
    opacity: 0.42,
    variant: 'faded',
    wide: true,
    maxWidth: 240,
  },

  {
    x: 20,
    y: 4400,
    content: 'N(candidates) = 17',
    size: 15,
    rotate: -2.5,
    opacity: 0.6,
    variant: 'normal',
    mono: true,
  },

  // ═══╗  FORMULAS & MATHEMATICS  ╔══════════════════════════
  { x: 540, y: 420, content: 'R = N × λ', size: 18, rotate: -2.2, opacity: 0.7, variant: 'fresh', mono: true },
  {
    x: 560,
    y: 480,
    content: 'Desolation cycle constant',
    size: 8,
    rotate: -1.5,
    opacity: 0.28,
    variant: 'vintage',
    maxWidth: 180,
  },

  {
    x: 4240,
    y: 480,
    content: 'd(Pᵢ, Pⱼ) = ⟨Connection⟩',
    size: 15,
    rotate: 1.8,
    opacity: 0.6,
    variant: 'normal',
    mono: true,
  },
  {
    x: 4260,
    y: 540,
    content: 'distance between Shards',
    size: 8,
    rotate: 1,
    opacity: 0.25,
    variant: 'vintage',
    maxWidth: 180,
  },

  {
    x: 640,
    y: 1400,
    content: '∀x: Connection(x) → Investiture(x)',
    size: 14,
    rotate: -0.6,
    opacity: 0.58,
    variant: 'normal',
    mono: true,
    maxWidth: 400,
  },
  {
    x: 660,
    y: 1460,
    content: 'all Connection carries Investiture',
    size: 8,
    rotate: 1,
    opacity: 0.28,
    variant: 'vintage',
    maxWidth: 280,
  },

  {
    x: 4340,
    y: 940,
    content: '∫(Revelation) dt ≈ 0.73',
    size: 15,
    rotate: -2.5,
    opacity: 0.6,
    variant: 'normal',
    mono: true,
  },
  {
    x: 4360,
    y: 1000,
    content: 'revelation decays with time',
    size: 8,
    rotate: -1.2,
    opacity: 0.25,
    variant: 'vintage',
    maxWidth: 200,
  },

  {
    x: 740,
    y: 2260,
    content: 'P(Desolation) ≈ φ(t)',
    size: 15,
    rotate: 1.4,
    opacity: 0.58,
    variant: 'normal',
    mono: true,
  },
  {
    x: 760,
    y: 2320,
    content: 'probability of recurrence',
    size: 8,
    rotate: -0.5,
    opacity: 0.25,
    variant: 'vintage',
    maxWidth: 200,
  },

  {
    x: 4340,
    y: 2540,
    content: '∂(Connection) / ∂(Time) → 0',
    size: 13,
    rotate: -0.4,
    opacity: 0.55,
    variant: 'normal',
    mono: true,
  },
  {
    x: 4360,
    y: 2600,
    content: 'Connection tends to zero',
    size: 8,
    rotate: 2.2,
    opacity: 0.22,
    variant: 'vintage',
    maxWidth: 200,
  },

  {
    x: 240,
    y: 2760,
    content: 'P(Success | Knowledge) ≈ 0.64',
    size: 13,
    rotate: 2,
    opacity: 0.55,
    variant: 'normal',
    mono: true,
  },
  {
    x: 260,
    y: 2820,
    content: 'but knowledge alone is insufficient',
    size: 7,
    rotate: -1,
    opacity: 0.22,
    variant: 'vintage',
    maxWidth: 240,
  },

  { x: 3440, y: 1340, content: 'H₀ = H₁ × k', size: 16, rotate: -1.8, opacity: 0.6, variant: 'normal', mono: true },
  {
    x: 3460,
    y: 1400,
    content: 'Honor constant',
    size: 8,
    rotate: -1,
    opacity: 0.28,
    variant: 'vintage',
    maxWidth: 140,
  },

  {
    x: 3540,
    y: 4140,
    content: 'd(Connection) / dt ≠ 0',
    size: 13,
    rotate: 1.8,
    opacity: 0.52,
    variant: 'normal',
    mono: true,
  },
  {
    x: 3560,
    y: 4200,
    content: 'change is constant',
    size: 7,
    rotate: -0.8,
    opacity: 0.22,
    variant: 'vintage',
    maxWidth: 180,
  },

  {
    x: 2640,
    y: 840,
    content: '|ψ⟩ = α|Honor⟩ + β|Odium⟩',
    size: 15,
    rotate: 0.6,
    opacity: 0.6,
    variant: 'normal',
    mono: true,
    maxWidth: 380,
  },
  {
    x: 2660,
    y: 900,
    content: 'superposition of Shards',
    size: 8,
    rotate: -1.8,
    opacity: 0.25,
    variant: 'vintage',
    maxWidth: 200,
  },

  { x: 2940, y: 280, content: 'P(Unity) = ?', size: 19, rotate: -1.8, opacity: 0.65, variant: 'fresh', mono: true },
  {
    x: 2980,
    y: 340,
    content: 'unknown variable',
    size: 8,
    rotate: 0.5,
    opacity: 0.25,
    variant: 'vintage',
    maxWidth: 140,
  },

  { x: 4620, y: 600, content: 'Σ dawnshards = 4', size: 17, rotate: 1.4, opacity: 0.65, variant: 'normal', mono: true },
  {
    x: 4640,
    y: 660,
    content: 'but where are they?',
    size: 8,
    rotate: -2.5,
    opacity: 0.28,
    variant: 'vintage',
    maxWidth: 160,
  },

  {
    x: 240,
    y: 2360,
    content: 'φ = (1 + √5) / 2',
    size: 17,
    rotate: -0.8,
    opacity: 0.65,
    variant: 'normal',
    mono: true,
  },
  {
    x: 260,
    y: 2420,
    content: 'the golden ratio in all things',
    size: 8,
    rotate: 1.5,
    opacity: 0.25,
    variant: 'vintage',
    maxWidth: 260,
  },

  {
    x: 3360,
    y: 3340,
    content: 'Fₙ = Fₙ₋₁ + Fₙ₋₂',
    size: 14,
    rotate: -0.6,
    opacity: 0.6,
    variant: 'normal',
    mono: true,
  },
  {
    x: 3380,
    y: 3400,
    content: 'Fibonacci — pattern holds',
    size: 8,
    rotate: 2,
    opacity: 0.25,
    variant: 'vintage',
    maxWidth: 220,
  },

  // ═══╗  NUMBER SEQUENCES — DENSE  ╔══════════════════════════
  {
    x: 140,
    y: 380,
    content: '3  5  7  11  13  17  19  23  29  31  37  41  43  47  53  59  61  67',
    size: 10,
    rotate: 1.8,
    opacity: 0.7,
    variant: 'fresh',
    mono: true,
    maxWidth: 800,
  },
  {
    x: 190,
    y: 410,
    content: 'primes — foundation of reality',
    size: 7,
    rotate: -0.5,
    opacity: 0.28,
    variant: 'vintage',
    maxWidth: 240,
  },

  {
    x: 3740,
    y: 250,
    content: '7  14  21  28  35  42  49  56  63  70  77  84  91  98',
    size: 10,
    rotate: -1.5,
    opacity: 0.65,
    variant: 'normal',
    mono: true,
    maxWidth: 700,
  },
  {
    x: 3760,
    y: 280,
    content: 'sevens — significant pattern in all cultures',
    size: 7,
    rotate: 1.2,
    opacity: 0.25,
    variant: 'vintage',
    maxWidth: 280,
  },

  {
    x: 3740,
    y: 4080,
    content: '8  13  21  34  55  89  144  233  377  610  987',
    size: 10,
    rotate: -2,
    opacity: 0.65,
    variant: 'normal',
    mono: true,
    maxWidth: 700,
  },
  {
    x: 3760,
    y: 4120,
    content: 'Fibonacci seq — rate of Desolation increases',
    size: 7,
    rotate: 0.5,
    opacity: 0.25,
    variant: 'vintage',
    maxWidth: 320,
  },

  {
    x: 120,
    y: 4280,
    content: '233  377  610  987  1597  2584  4181  6765',
    size: 10,
    rotate: 0.4,
    opacity: 0.62,
    variant: 'normal',
    mono: true,
    maxWidth: 700,
  },
  {
    x: 140,
    y: 4320,
    content: 'converges to φ',
    size: 7,
    rotate: -2.5,
    opacity: 0.22,
    variant: 'vintage',
    maxWidth: 140,
  },

  {
    x: 4540,
    y: 2340,
    content: '2  4  8  16  32  64  128  256  512  1024  2048',
    size: 9,
    rotate: 1.8,
    opacity: 0.55,
    variant: 'normal',
    mono: true,
    maxWidth: 600,
  },

  {
    x: 2540,
    y: 180,
    content: 'λ₁  λ₂  λ₃  λ₄  λ₅  λ₆  λ₇',
    size: 14,
    rotate: 2.2,
    opacity: 0.6,
    variant: 'normal',
    mono: true,
  },
  {
    x: 2560,
    y: 220,
    content: 'eigenvalues of the Cosmere',
    size: 7,
    rotate: -1,
    opacity: 0.22,
    variant: 'vintage',
    maxWidth: 220,
  },

  // ═══╗  DENSE CALCULATIONS — SIDE NOTES  ╔══════════════════════════
  {
    x: 520,
    y: 350,
    content: 'F₁=1  F₂=1  F₃=2  F₄=3  F₅=5  F₆=8  F₇=13  F₈=21',
    size: 8,
    rotate: 2.2,
    opacity: 0.4,
    variant: 'faded',
    mono: true,
    maxWidth: 600,
  },
  {
    x: 4180,
    y: 1260,
    content: '299 792 458 m·s⁻¹  —  speed of Investiture?',
    size: 9,
    rotate: -1.8,
    opacity: 0.45,
    variant: 'faded',
    mono: true,
    maxWidth: 420,
  },
  {
    x: 4480,
    y: 1360,
    content: 'λ = 670 nm  —  not confirmed',
    size: 9,
    rotate: 2.5,
    opacity: 0.4,
    variant: 'faded',
    mono: true,
    maxWidth: 340,
  },
  {
    x: 1140,
    y: 1440,
    content: 'ΔDesolation ≈ 4500 years  —  margin ±500',
    size: 10,
    rotate: 1.8,
    opacity: 0.5,
    variant: 'normal',
    mono: true,
    maxWidth: 420,
  },
  {
    x: 3380,
    y: 1540,
    content: 'Voidbringers — return pattern TBD',
    size: 10,
    rotate: -2.2,
    opacity: 0.45,
    variant: 'faded',
    wide: true,
    maxWidth: 320,
  },
  {
    x: 4500,
    y: 4260,
    content: 'Era 2 → Era 3 → Era 4 → ?',
    size: 10,
    rotate: 0.6,
    opacity: 0.48,
    variant: 'normal',
    mono: true,
    maxWidth: 360,
  },
  {
    x: 4520,
    y: 4040,
    content: 'Recreance — 1500 years prior',
    size: 10,
    rotate: -1.4,
    opacity: 0.45,
    variant: 'faded',
    wide: true,
    maxWidth: 320,
  },
  {
    x: 640,
    y: 4620,
    content: 'Agelessness is not immortality',
    size: 12,
    rotate: 2.5,
    opacity: 0.48,
    variant: 'normal',
    wide: true,
    maxWidth: 280,
  },

  // ═══╗  CROSSED-OUT / CORRECTIONS  ╔══════════════════════════
  {
    x: 150,
    y: 4940,
    content: 'Odium cannot be contained',
    size: 13,
    rotate: -0.6,
    opacity: 0.32,
    variant: 'vintage',
    crossed: true,
    maxWidth: 300,
  },
  {
    x: 160,
    y: 4970,
    content: 'Odium CAN be contained',
    size: 12,
    rotate: -0.6,
    opacity: 0.6,
    variant: 'fresh',
    maxWidth: 280,
  },
  {
    x: 170,
    y: 5010,
    content: 'but it will shift — it always shifts',
    size: 8,
    rotate: 1.2,
    opacity: 0.35,
    variant: 'faded',
    maxWidth: 280,
  },

  {
    x: 4240,
    y: 4840,
    content: 'Voidbringers are men',
    size: 13,
    rotate: 1.8,
    opacity: 0.35,
    variant: 'vintage',
    crossed: true,
    maxWidth: 240,
  },
  { x: 4240, y: 4875, content: 'Voidbringers are', size: 12, rotate: 1, opacity: 0.6, variant: 'fresh' },
  { x: 4240, y: 4910, content: 'the parsh —', size: 12, rotate: 1, opacity: 0.55, variant: 'fresh' },
  {
    x: 4240,
    y: 4945,
    content: 'enslaved by honor',
    size: 12,
    rotate: 1,
    opacity: 0.5,
    variant: 'fresh',
    maxWidth: 240,
  },

  {
    x: 1340,
    y: 2740,
    content: 'Honor lives in the hearts of men',
    size: 13,
    rotate: 1.5,
    opacity: 0.35,
    variant: 'vintage',
    crossed: true,
    wide: true,
    maxWidth: 340,
  },
  {
    x: 1340,
    y: 2780,
    content: 'Honor lives in the storm',
    size: 12,
    rotate: 0.6,
    opacity: 0.55,
    variant: 'normal',
    maxWidth: 280,
  },

  {
    x: 150,
    y: 520,
    content: 'The enemy — defined by absence?',
    size: 10,
    rotate: 1.2,
    opacity: 0.28,
    variant: 'vintage',
    crossed: true,
    maxWidth: 280,
  },

  // ═══╗  ADDED NOTES AND MARGINALIA  ╔══════════════════════════
  {
    x: 390,
    y: 190,
    content: 'see folio 17b — contradictory evidence',
    size: 8,
    rotate: -1.2,
    opacity: 0.4,
    variant: 'faded',
    maxWidth: 260,
  },
  {
    x: 4240,
    y: 100,
    content: 'cf. the Diagram, section VII, paragraph 3',
    size: 8,
    rotate: 0.8,
    opacity: 0.38,
    variant: 'faded',
    maxWidth: 320,
  },
  {
    x: 50,
    y: 680,
    content: 'contradicts folio 3a — verify',
    size: 7,
    rotate: -2,
    opacity: 0.3,
    variant: 'vintage',
    maxWidth: 220,
  },

  // ═══╗  DIAGRAM TERMINOLOGY / CODED NOTES  ╔══════════════════════════
  {
    x: 2140,
    y: 340,
    content: 'The survival of the Cosmere',
    size: 16,
    rotate: -0.6,
    opacity: 0.6,
    variant: 'normal',
    maxWidth: 340,
  },
  {
    x: 2130,
    y: 400,
    content: 'depends upon understanding.',
    size: 14,
    rotate: 1.4,
    opacity: 0.52,
    variant: 'normal',
    maxWidth: 340,
  },

  {
    x: 2240,
    y: 2540,
    content: 'The past is a foreign Cosmere.',
    size: 15,
    rotate: 1,
    opacity: 0.58,
    variant: 'normal',
  },
  { x: 2260, y: 2600, content: 'Each Desolation reshapes', size: 13, rotate: -1.5, opacity: 0.5, variant: 'normal' },
  { x: 2260, y: 2650, content: 'the map of power.', size: 13, rotate: -1.5, opacity: 0.45, variant: 'normal' },

  {
    x: 4540,
    y: 4640,
    content: 'δ-Adonalsium → 16 Shards',
    size: 14,
    rotate: 1.8,
    opacity: 0.62,
    variant: 'normal',
    mono: true,
  },
  { x: 4560, y: 4700, content: 'the Shattering — moment', size: 10, rotate: -0.5, opacity: 0.42, variant: 'faded' },
  { x: 4550, y: 4740, content: 'of cosmic significance', size: 10, rotate: 1, opacity: 0.38, variant: 'faded' },

  { x: 40, y: 1800, content: 'V = 4/3 π r³', size: 17, rotate: -2.5, opacity: 0.65, variant: 'normal', mono: true },
  {
    x: 60,
    y: 1860,
    content: 'Speed of Investiture propagation unknown',
    size: 9,
    rotate: 1.5,
    opacity: 0.38,
    variant: 'faded',
    wide: true,
    maxWidth: 360,
  },

  { x: 40, y: 2060, content: 'e^{iπ} + 1 = 0', size: 19, rotate: 1.8, opacity: 0.7, variant: 'fresh', mono: true },
  {
    x: 60,
    y: 2120,
    content: "Euler's identity — beauty in truth",
    size: 8,
    rotate: -2.2,
    opacity: 0.28,
    variant: 'vintage',
    maxWidth: 280,
  },

  // ═══╗  SCATTERED NUMBERS & SYMBOLS  ╔══════════════════════════
  { x: 120, y: 3580, content: '17', size: 30, rotate: -3.5, opacity: 0.75, variant: 'fresh', mono: true },
  {
    x: 135,
    y: 3620,
    content: 'the sacred number',
    size: 9,
    rotate: 1.5,
    opacity: 0.32,
    variant: 'faded',
    maxWidth: 160,
  },

  { x: 100, y: 80, content: 'I', size: 22, rotate: -2.5, opacity: 0.4, variant: 'faded', mono: true },
  { x: 4540, y: 4550, content: 'XVI', size: 19, rotate: 2.2, opacity: 0.35, variant: 'faded', mono: true },

  { x: 430, y: 3940, content: '?', size: 24, rotate: 0, opacity: 0.5, variant: 'normal', mono: true },
  { x: 4140, y: 420, content: '…', size: 34, rotate: 0, opacity: 0.45, variant: 'normal' },

  // ═══╗  NEW — ADDITIONAL DENSE CALCULATIONS  ╔══════════════════════════
  {
    x: 4800,
    y: 1600,
    content: '∫₀^{∞} I(t) dt = E_Investiture',
    size: 12,
    rotate: -1.5,
    opacity: 0.48,
    variant: 'normal',
    mono: true,
    maxWidth: 360,
  },
  {
    x: 4820,
    y: 1660,
    content: 'total Investiture across all realms',
    size: 7,
    rotate: 0.5,
    opacity: 0.2,
    variant: 'vintage',
    maxWidth: 260,
  },

  {
    x: 50,
    y: 3200,
    content: '∏_{i=1}^{16} S_i = A',
    size: 13,
    rotate: 1.2,
    opacity: 0.5,
    variant: 'normal',
    mono: true,
  },
  {
    x: 70,
    y: 3260,
    content: 'product of shards = Adonalsium',
    size: 7,
    rotate: -1.8,
    opacity: 0.22,
    variant: 'vintage',
    maxWidth: 260,
  },

  {
    x: 4800,
    y: 2800,
    content: '∇·B = 0  ∇×E = −∂B/∂t',
    size: 12,
    rotate: 0.8,
    opacity: 0.45,
    variant: 'faded',
    mono: true,
  },
  {
    x: 4820,
    y: 2860,
    content: 'Investiture obeys physical laws?',
    size: 7,
    rotate: -1,
    opacity: 0.2,
    variant: 'vintage',
    maxWidth: 260,
  },

  {
    x: 140,
    y: 4700,
    content: '17  34  51  68  85  102  119  136  153  170  187  204',
    size: 8,
    rotate: -0.6,
    opacity: 0.52,
    variant: 'normal',
    mono: true,
    maxWidth: 700,
  },

  // ═══╗  NEW — CHAOTIC OVERLAPPING NOTES (front layer)  ╔══════════════════════════
  {
    x: 1560,
    y: 1620,
    content: 'I see the shape of it —',
    size: 14,
    rotate: -3.2,
    opacity: 0.55,
    variant: 'normal',
    front: true,
  },
  {
    x: 1540,
    y: 1680,
    content: 'the pattern of the Cosmere',
    size: 12,
    rotate: 1.8,
    opacity: 0.48,
    variant: 'normal',
    front: true,
  },
  {
    x: 3300,
    y: 1680,
    content: 'Worldhoppers move',
    size: 14,
    rotate: 3.5,
    opacity: 0.52,
    variant: 'normal',
    front: true,
  },
  {
    x: 3320,
    y: 1740,
    content: 'the Cosmere is permeable',
    size: 11,
    rotate: -1.5,
    opacity: 0.42,
    variant: 'normal',
    front: true,
  },

  {
    x: 1600,
    y: 2480,
    content: 'Shards cannot act directly',
    size: 13,
    rotate: -2.5,
    opacity: 0.5,
    variant: 'normal',
    front: true,
  },
  {
    x: 3420,
    y: 2480,
    content: 'Investiture flows between realms',
    size: 13,
    rotate: 2.8,
    opacity: 0.48,
    variant: 'normal',
    front: true,
  },

  {
    x: 2500,
    y: 3250,
    content: 'Time — nonlinear',
    size: 15,
    rotate: -1.5,
    opacity: 0.55,
    variant: 'fresh',
    front: true,
  },
  {
    x: 2520,
    y: 3320,
    content: 'past affects present in all realms',
    size: 9,
    rotate: 0.5,
    opacity: 0.32,
    variant: 'faded',
    front: true,
    maxWidth: 280,
  },

  // ═══╗  NEW — CORRECTIONS AND STRIKETHROUGHS  ╔══════════════════════════
  {
    x: 820,
    y: 480,
    content: 'the return was predicted',
    size: 10,
    rotate: -3.5,
    opacity: 0.25,
    variant: 'vintage',
    crossed: true,
    maxWidth: 220,
  },
  {
    x: 820,
    y: 515,
    content: 'the return was miscalculated',
    size: 9,
    rotate: 2.5,
    opacity: 0.4,
    variant: 'faded',
    maxWidth: 260,
  },

  {
    x: 4280,
    y: 3640,
    content: 'no — the timeline is wrong',
    size: 10,
    rotate: -1.8,
    opacity: 0.5,
    variant: 'fresh',
    maxWidth: 260,
  },
  {
    x: 4300,
    y: 3700,
    content: 'recalculate from Era 1',
    size: 9,
    rotate: 1.2,
    opacity: 0.32,
    variant: 'faded',
    maxWidth: 200,
  },

  // ═══╗  NEW — SIDEWAYS NOTES  ╔══════════════════════════
  {
    x: 4840,
    y: 1800,
    content: 'Connection is not linear',
    size: 13,
    rotate: 90,
    opacity: 0.4,
    variant: 'faded',
    maxWidth: 220,
  },
  {
    x: 4900,
    y: 2400,
    content: '16 Shards — 1 Purpose',
    size: 13,
    rotate: -92,
    opacity: 0.35,
    variant: 'faded',
    maxWidth: 220,
  },
  {
    x: 80,
    y: 3000,
    content: 'temporal drift observed',
    size: 11,
    rotate: -88,
    opacity: 0.3,
    variant: 'vintage',
    maxWidth: 200,
  },
  {
    x: 100,
    y: 3300,
    content: 'multiple Cosmere timeline',
    size: 11,
    rotate: 93,
    opacity: 0.28,
    variant: 'vintage',
    maxWidth: 220,
  },

  // ═══╗  NEW — REPEATED/FRANTIC NUMBERS  ╔══════════════════════════
  {
    x: 4400,
    y: 3200,
    content: '0.73  0.73  0.73  0.73  0.73',
    size: 14,
    rotate: 2,
    opacity: 0.6,
    variant: 'fresh',
    mono: true,
    maxWidth: 500,
  },
  {
    x: 4420,
    y: 3260,
    content: 'this number appears in every calculation',
    size: 7,
    rotate: -1.5,
    opacity: 0.25,
    variant: 'vintage',
    maxWidth: 300,
  },

  {
    x: 800,
    y: 3800,
    content: '64  64  64  64  64  64  64',
    size: 16,
    rotate: -3.5,
    opacity: 0.5,
    variant: 'normal',
    mono: true,
    maxWidth: 500,
  },

  // ═══╗  NEW — CHAOTIC ARITHMETIC  ╔══════════════════════════
  {
    x: 4600,
    y: 1400,
    content: '1173 − 450 = 723 — Desolation?',
    size: 10,
    rotate: -0.5,
    opacity: 0.48,
    variant: 'normal',
    mono: true,
    maxWidth: 340,
  },
  {
    x: 4620,
    y: 1460,
    content: 'check against folio 12',
    size: 6,
    rotate: 1,
    opacity: 0.2,
    variant: 'vintage',
    maxWidth: 180,
  },

  {
    x: 200,
    y: 1400,
    content: '4500 / 7 = 642.85…  —  not clean',
    size: 10,
    rotate: 0.3,
    opacity: 0.5,
    variant: 'normal',
    mono: true,
    maxWidth: 360,
  },
  {
    x: 220,
    y: 1460,
    content: 'the division must be exact',
    size: 7,
    rotate: -2,
    opacity: 0.22,
    variant: 'vintage',
    maxWidth: 200,
  },

  {
    x: 3200,
    y: 2000,
    content: '2 × 2 × 2 × 2 = 16',
    size: 18,
    rotate: 2.5,
    opacity: 0.55,
    variant: 'normal',
    mono: true,
  },
  {
    x: 3220,
    y: 2060,
    content: 'obvious — but profound',
    size: 8,
    rotate: -1.5,
    opacity: 0.28,
    variant: 'vintage',
    maxWidth: 200,
  },
]

const DOODLES: InkDoodle[] = [
  // Circles around important concepts
  { x: 120, y: 120, draw: 'double-circle', scale: 3, variant: 'fresh' },
  { x: 3800, y: 4240, draw: 'circle', scale: 2.5, variant: 'fresh' },
  { x: 3820, y: 160, draw: 'double-circle', scale: 2.8, variant: 'fresh' },
  { x: 140, y: 3800, draw: 'circle', scale: 2.6, variant: 'fresh' },
  { x: 80, y: 640, draw: 'circle', scale: 1.8, variant: 'normal' },
  { x: 583, y: 463, draw: 'circle', scale: 1.5, variant: 'normal' },
  { x: 4060, y: 460, draw: 'double-circle', scale: 2, variant: 'normal' },
  { x: 2980, y: 300, draw: 'circle', scale: 1.2, variant: 'normal' },
  { x: 150, y: 3630, draw: 'circle', scale: 1.6, variant: 'fresh' },
  { x: 640, y: 3820, draw: 'circle', scale: 1.4, variant: 'normal' },

  // Arrows connecting related ideas
  { x: 310, y: 280, draw: 'arrow', scale: 1, rotate: 0.5, variant: 'fresh' },
  { x: 140, y: 300, draw: 'dash-arrow', scale: 1.1, rotate: 2.2, variant: 'normal', length: 60 },
  { x: 3820, y: 330, draw: 'long-arrow', scale: 1, rotate: 0.5, variant: 'normal' },
  { x: 4280, y: 100, draw: 'dash-arrow', scale: 0.9, rotate: -0.5, variant: 'faded', length: 50 },
  { x: 640, y: 680, draw: 'arrow', scale: 0.8, rotate: 1.8, variant: 'normal' },
  { x: 80, y: 370, draw: 'dash-arrow', scale: 0.9, rotate: 3, variant: 'normal', length: 40 },
  { x: 1940, y: 390, draw: 'arrow', scale: 1, rotate: -0.8, variant: 'normal' },
  { x: 2240, y: 2640, draw: 'arrow', scale: 0.9, rotate: 0.5, variant: 'normal' },
  { x: 4560, y: 4670, draw: 'dash-arrow', scale: 1, rotate: -1.8, variant: 'faded', length: 60 },
  { x: 40, y: 2090, draw: 'arrow', scale: 0.7, rotate: 1, variant: 'normal' },
  { x: 4400, y: 3200, draw: 'arrow', scale: 0.6, rotate: 0.8, variant: 'normal' },
  { x: 3300, y: 1740, draw: 'long-arrow', scale: 0.7, rotate: 2, variant: 'normal' },

  // Underlines for emphasis
  { x: 120, y: 140, draw: 'underline', rotate: -0.8, variant: 'fresh' },
  { x: 80, y: 280, draw: 'underline', variant: 'fresh' },
  { x: 3800, y: 80, draw: 'underline', rotate: 0.6, variant: 'fresh' },
  { x: 140, y: 3820, draw: 'underline', rotate: -0.4, variant: 'fresh' },
  { x: 4040, y: 3780, draw: 'underline', rotate: -1.5, variant: 'fresh' },
  { x: 100, y: 640, draw: 'underline', rotate: -2.5, variant: 'normal' },
  { x: 140, y: 4100, draw: 'underline', rotate: 0.6, variant: 'normal' },
  { x: 2140, y: 360, draw: 'underline', rotate: -0.6, variant: 'normal' },

  // Brackets and braces grouping items
  { x: -10, y: 940, draw: 'bracket', scale: 1.5, rotate: 0.8, variant: 'normal' },
  { x: -10, y: 4080, draw: 'bracket', scale: 1.8, rotate: -0.3, variant: 'normal' },
  { x: 4540, y: 4000, draw: 'brace', scale: 1.1, variant: 'normal' },
  { x: 120, y: 4280, draw: 'brace', scale: 1.3, rotate: 0.5, variant: 'faded' },
  { x: 3740, y: 4070, draw: 'bracket', scale: 1, rotate: -0.5, variant: 'normal' },
  { x: 800, y: 3800, draw: 'brace', scale: 1.2, rotate: 0.3, variant: 'normal' },

  // Cross marks (deleted/wrong items)
  { x: 160, y: 4940, draw: 'cross', scale: 1, rotate: -0.5, variant: 'faded' },
  { x: 4250, y: 4830, draw: 'cross', scale: 0.9, rotate: 1.8, variant: 'faded' },
  { x: 1350, y: 2730, draw: 'cross', scale: 0.8, rotate: 1.5, variant: 'faded' },
  { x: 160, y: 520, draw: 'cross', scale: 0.7, rotate: 0.5, variant: 'faded' },
  { x: 830, y: 480, draw: 'cross', scale: 0.6, rotate: -0.5, variant: 'faded' },

  // Squiggles — nervous energy marks
  { x: 300, y: 2560, draw: 'squiggle', rotate: 0.5, variant: 'faded' },
  { x: 4140, y: 3460, draw: 'squiggle', rotate: -1.5, variant: 'faded' },
  { x: 160, y: 2660, draw: 'squiggle', rotate: 2.5, variant: 'vintage' },
  { x: 740, y: 1160, draw: 'squiggle', rotate: 0.3, variant: 'vintage' },
  { x: 4600, y: 1300, draw: 'squiggle', rotate: -2, variant: 'faded' },

  // Additional connecting marks
  { x: 180, y: 4650, draw: 'dash-arrow', scale: 0.8, rotate: -1.5, variant: 'faded', length: 40 },
  { x: 120, y: 1180, draw: 'squiggle', rotate: 0.3, variant: 'vintage' },

  // Overlapping front-layer doodles
  { x: 2500, y: 3280, draw: 'double-circle', scale: 1.2, variant: 'fresh', front: true },
  { x: 1560, y: 1650, draw: 'underline', rotate: -3.2, variant: 'normal', front: true },
  { x: 3420, y: 2500, draw: 'dash-arrow', scale: 0.7, rotate: 1.5, variant: 'normal', length: 50, front: true },
]

function inkColor(variant: InkWriting['variant'] = 'normal', opacity: number): string {
  const base = INK[variant] ?? INK.normal
  return `${base}${opacity})`
}

const STYLES = [
  { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontStyle: 'italic' as const },
  { fontFamily: "'Playfair Display', 'Georgia', serif", fontStyle: 'normal' as const },
  { fontFamily: "'Courier New', 'Consolas', monospace", fontStyle: 'normal' as const },
]

function WritingLayer({ items, className }: { items: InkWriting[]; className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none ${className ?? ''}`}
      style={{ width: 5000, height: 5000 }}
    >
      {items.map((item, i) => {
        const weight = item.weight === 'bold' ? 700 : item.weight === 'light' ? 300 : 400
        const sz = item.size ?? 12
        const sIdx = item.mono ? 2 : i % 2
        const font = STYLES[sIdx]!.fontFamily
        const fontStyle = STYLES[sIdx]!.fontStyle
        const color = inkColor(item.variant, item.opacity ?? 0.5)
        const textShadow =
          item.weight === 'bold'
            ? `0 0 12px rgba(218,204,178,${(item.opacity ?? 0.5) * 0.35}), 0 2px 8px rgba(0,0,0,0.6)`
            : '0 1px 4px rgba(0,0,0,0.4)'

        return (
          <div
            key={`w${i}`}
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              transform: `rotate(${item.rotate ?? 0}deg)`,
              fontFamily: font,
              fontStyle,
              fontSize: sz,
              fontWeight: weight,
              color,
              lineHeight: 1.4,
              letterSpacing: item.wide ? '0.1em' : 'normal',
              whiteSpace: 'pre-wrap',
              textShadow,
              maxWidth: item.maxWidth ?? 500,
              textDecoration: item.crossed ? 'line-through' : 'none',
              textDecorationColor: inkColor('vintage', 0.4),
              textDecorationThickness: 1.5,
            }}
          >
            {item.content}
          </div>
        )
      })}
    </div>
  )
}

function DoodleLayer({ items, className }: { items: InkDoodle[]; className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none ${className ?? ''}`}
      style={{ width: 5000, height: 5000 }}
    >
      {items.map((item, i) => {
        const s = item.scale ?? 1
        const v = item.variant ?? 'normal'
        const stroke = `${INK[v] ?? INK.normal}${v === 'fresh' ? 0.35 : v === 'vintage' ? 0.12 : 0.2})`
        return (
          <div
            key={`d${i}`}
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              transform: `translate(-50%, -50%) rotate(${item.rotate ?? 0}deg)`,
            }}
          >
            {item.draw === 'circle' && (
              <svg width={44 * s} height={44 * s} viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke={stroke} strokeWidth="0.7" />
              </svg>
            )}
            {item.draw === 'double-circle' && (
              <svg width={50 * s} height={50 * s} viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke={stroke} strokeWidth="0.6" />
                <circle cx="25" cy="25" r="14" fill="none" stroke={stroke} strokeWidth="0.35" />
                <line x1="25" y1="5" x2="25" y2="45" stroke={stroke} strokeWidth="0.25" />
                <line x1="5" y1="25" x2="45" y2="25" stroke={stroke} strokeWidth="0.25" />
              </svg>
            )}
            {item.draw === 'arrow' && (
              <svg width={40 * s} height={14 * s} viewBox="0 0 40 14">
                <line x1="2" y1="7" x2="36" y2="7" stroke={stroke} strokeWidth="0.5" />
                <polyline points="30,2 36,7 30,12" fill="none" stroke={stroke} strokeWidth="0.5" />
              </svg>
            )}
            {item.draw === 'long-arrow' && (
              <svg width={100 * s} height={14 * s} viewBox="0 0 100 14">
                <line x1="2" y1="7" x2="96" y2="7" stroke={stroke} strokeWidth="0.4" />
                <polyline points="90,2 96,7 90,12" fill="none" stroke={stroke} strokeWidth="0.4" />
              </svg>
            )}
            {item.draw === 'dash-arrow' && (
              <svg width={(item.length ?? 60) * s} height={10 * s} viewBox={`0 0 ${item.length ?? 60} 10`}>
                <line
                  x1="2"
                  y1="5"
                  x2={(item.length ?? 60) - 8}
                  y2="5"
                  stroke={stroke}
                  strokeWidth="0.4"
                  strokeDasharray="2.5 2"
                />
                <polyline
                  points={`${(item.length ?? 60) - 12},2 ${(item.length ?? 60) - 8},5 ${(item.length ?? 60) - 12},8`}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="0.4"
                />
              </svg>
            )}
            {item.draw === 'underline' && (
              <svg width={180 * s} height={10 * s} viewBox="0 0 180 10">
                <path d="M 2 7 Q 45 2 90 7 Q 135 12 178 7" fill="none" stroke={stroke} strokeWidth="0.55" />
              </svg>
            )}
            {item.draw === 'bracket' && (
              <svg width={12 * s} height={70 * s} viewBox="0 0 12 70">
                <path d="M 10 5 Q 4 5 4 35 Q 4 65 10 65" fill="none" stroke={stroke} strokeWidth="0.5" />
              </svg>
            )}
            {item.draw === 'cross' && (
              <svg width={20 * s} height={20 * s} viewBox="0 0 20 20">
                <line x1="3" y1="3" x2="17" y2="17" stroke={stroke} strokeWidth="0.5" />
                <line x1="17" y1="3" x2="3" y2="17" stroke={stroke} strokeWidth="0.5" />
              </svg>
            )}
            {item.draw === 'brace' && (
              <svg width={70 * s} height={22 * s} viewBox="0 0 70 22">
                <path d="M 5 2 Q 26 2 35 11 Q 44 20 65 20" fill="none" stroke={stroke} strokeWidth="0.45" />
                <path d="M 5 20 Q 26 20 35 11 Q 44 2 65 2" fill="none" stroke={stroke} strokeWidth="0.25" />
              </svg>
            )}
            {item.draw === 'squiggle' && (
              <svg width={50 * s} height={20 * s} viewBox="0 0 50 20">
                <path
                  d="M 2 10 Q 10 2 18 10 Q 26 18 34 10 Q 42 2 50 10"
                  fill="none"
                  stroke={stroke}
                  strokeWidth="0.4"
                />
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}

const backWritings = WRITINGS.filter((w) => !w.front)
const frontWritings = WRITINGS.filter((w) => w.front)
const backDoodles = DOODLES.filter((d) => !d.front)
const frontDoodles = DOODLES.filter((d) => d.front)

export function DiagramWritings() {
  const bw = useMemo(() => backWritings, [])
  const fw = useMemo(() => frontWritings, [])
  const bd = useMemo(() => backDoodles, [])
  const fd = useMemo(() => frontDoodles, [])

  return (
    <>
      <WritingLayer items={bw} />
      <DoodleLayer items={bd} />
      <div className="absolute inset-0 pointer-events-none" style={{ width: 5000, height: 5000, zIndex: 10 }}>
        <WritingLayer items={fw} />
        <DoodleLayer items={fd} />
      </div>
    </>
  )
}
