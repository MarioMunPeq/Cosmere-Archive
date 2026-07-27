let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function now(): number {
  return getCtx().currentTime
}

function createGain(volume: number): GainNode {
  const g = getCtx().createGain()
  g.gain.value = volume
  g.connect(getCtx().destination)
  return g
}

function createNoise(duration: number): AudioBuffer {
  const ac = getCtx()
  const sampleRate = ac.sampleRate
  const length = Math.floor(sampleRate * duration)
  const buffer = ac.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

let lastHoverTime = 0
const HOVER_THROTTLE_MS = 300

export function playHover() {
  const t = now()
  if (t * 1000 - lastHoverTime < HOVER_THROTTLE_MS) return
  lastHoverTime = t * 1000

  const ac = getCtx()
  const master = createGain(0)

  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(220, t)
  osc.frequency.exponentialRampToValueAtTime(330, t + 0.08)
  osc.frequency.exponentialRampToValueAtTime(280, t + 0.15)
  osc.connect(master)

  master.gain.setValueAtTime(0, t)
  master.gain.linearRampToValueAtTime(0.035, t + 0.04)
  master.gain.exponentialRampToValueAtTime(0.001, t + 0.18)

  osc.start(t)
  osc.stop(t + 0.2)
}

export function playFocus() {
  const ac = getCtx()
  const t = now()
  const master = createGain(0)

  const osc1 = ac.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(180, t)
  osc1.frequency.exponentialRampToValueAtTime(120, t + 1.2)
  osc1.connect(master)

  const osc2 = ac.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(540, t)
  osc2.frequency.exponentialRampToValueAtTime(360, t + 1.2)
  const osc2Gain = ac.createGain()
  osc2Gain.gain.value = 0.3
  osc2.connect(osc2Gain)
  osc2Gain.connect(master)

  const osc3 = ac.createOscillator()
  osc3.type = 'triangle'
  osc3.frequency.setValueAtTime(1080, t)
  osc3.frequency.exponentialRampToValueAtTime(720, t + 0.8)
  const osc3Gain = ac.createGain()
  osc3Gain.gain.value = 0.1
  osc3.connect(osc3Gain)
  osc3Gain.connect(master)

  master.gain.setValueAtTime(0, t)
  master.gain.linearRampToValueAtTime(0.06, t + 0.15)
  master.gain.setValueAtTime(0.06, t + 0.6)
  master.gain.exponentialRampToValueAtTime(0.001, t + 1.5)

  osc1.start(t)
  osc1.stop(t + 1.6)
  osc2.start(t)
  osc2.stop(t + 1.6)
  osc3.start(t)
  osc3.stop(t + 1.0)
}

export function playLeave() {
  const ac = getCtx()
  const t = now()
  const master = createGain(0)

  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(160, t)
  osc.frequency.exponentialRampToValueAtTime(240, t + 0.8)
  osc.connect(master)

  master.gain.setValueAtTime(0, t)
  master.gain.linearRampToValueAtTime(0.04, t + 0.1)
  master.gain.exponentialRampToValueAtTime(0.001, t + 1.0)

  osc.start(t)
  osc.stop(t + 1.1)
}

export function playReturn() {
  const ac = getCtx()
  const t = now()
  const master = createGain(0)

  const noiseBuffer = createNoise(1.8)
  const noiseSource = ac.createBufferSource()
  noiseSource.buffer = noiseBuffer
  const noiseFilter = ac.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.setValueAtTime(600, t)
  noiseFilter.frequency.exponentialRampToValueAtTime(200, t + 1.5)
  noiseFilter.Q.value = 0.5
  noiseSource.connect(noiseFilter)
  noiseFilter.connect(master)

  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(200, t)
  osc.frequency.exponentialRampToValueAtTime(150, t + 1.2)
  const oscGain = ac.createGain()
  oscGain.gain.value = 0.15
  osc.connect(oscGain)
  oscGain.connect(master)

  master.gain.setValueAtTime(0, t)
  master.gain.linearRampToValueAtTime(0.03, t + 0.2)
  master.gain.setValueAtTime(0.03, t + 0.8)
  master.gain.exponentialRampToValueAtTime(0.001, t + 1.8)

  noiseSource.start(t)
  noiseSource.stop(t + 1.9)
  osc.start(t)
  osc.stop(t + 1.4)
}

export function dispose() {
  if (ctx && ctx.state !== 'closed') {
    ctx.close()
    ctx = null
  }
}
