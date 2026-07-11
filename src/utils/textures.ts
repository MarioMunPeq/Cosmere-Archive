let _paperTexture: string | null = null
let _woodTexture: string | null = null
let _stoneTexture: string | null = null

function getCtx(w: number, h: number): { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) return null
  return { c, ctx }
}

function generatePaperTexture(): string {
  const r = getCtx(512, 512)
  if (!r) return ''
  const { c, ctx } = r
  ctx.fillStyle = '#f5efe6'
  ctx.fillRect(0, 0, 512, 512)

  const d = ctx.getImageData(0, 0, 512, 512)
  const px = d.data
  for (let i = 0; i < px.length; i += 4) {
    const n = (Math.random() - 0.5) * 8
    px[i] = px[i]! + n
    px[i + 1] = px[i + 1]! + n
    px[i + 2] = px[i + 2]! + n
  }
  ctx.putImageData(d, 0, 0)

  for (let i = 0; i < 60; i++) {
    const sx = Math.random() * 512
    const sy = Math.random() * 512
    ctx.strokeStyle = `rgba(180,160,140,${0.015 + Math.random() * 0.025})`
    ctx.lineWidth = 0.3 + Math.random() * 0.5
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    for (let j = 0; j < 4; j++) {
      ctx.quadraticCurveTo(
        sx + (Math.random() - 0.5) * 220,
        sy + (Math.random() - 0.5) * 220,
        sx + (Math.random() - 0.5) * 220,
        sy + (Math.random() - 0.5) * 220,
      )
    }
    ctx.stroke()
  }

  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const r = 3 + Math.random() * 14
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(170,140,110,${0.03 + Math.random() * 0.05})`)
    g.addColorStop(1, 'rgba(170,140,110,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const vg = ctx.createRadialGradient(256, 256, 180, 256, 256, 380)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(0.7, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,0.07)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, 512, 512)

  return c.toDataURL()
}

export function getPaperTexture(): string {
  if (!_paperTexture) _paperTexture = generatePaperTexture()
  return _paperTexture
}

export function getWoodTexture(): string {
  if (_woodTexture) return _woodTexture
  const r = getCtx(512, 512)
  if (!r) return ''
  const { c, ctx } = r
  ctx.fillStyle = '#1f1209'
  ctx.fillRect(0, 0, 512, 512)

  const fd = ctx.getImageData(0, 0, 512, 512)
  const fpx = fd.data
  for (let i = 0; i < fpx.length; i += 4) {
    const grain = Math.sin(((i / 4) % 512) * 0.12 + Math.random() * 0.5) * 3
    const noise = (Math.random() - 0.5) * 4
    const v = grain + noise
    fpx[i] = Math.max(0, Math.min(255, fpx[i]! + v))
    fpx[i + 1] = Math.max(0, Math.min(255, fpx[i + 1]! + v * 0.8))
    fpx[i + 2] = Math.max(0, Math.min(255, fpx[i + 2]! + v * 0.6))
  }
  ctx.putImageData(fd, 0, 0)

  for (let y = 0; y < 16; y++) {
    const yy = y * 32 + 6 + Math.random() * 12
    const shade = 15 + Math.random() * 10
    ctx.strokeStyle = `rgba(${shade + 12}, ${shade}, ${shade - 4}, 0.12)`
    ctx.lineWidth = 4 + Math.random() * 6
    ctx.beginPath()
    ctx.moveTo(0, yy)
    for (let x = 0; x < 512; x += 40) {
      ctx.lineTo(x, yy + (Math.random() - 0.5) * 2)
    }
    ctx.stroke()
  }

  for (let i = 0; i < 6; i++) {
    const kx = 40 + Math.random() * 432
    const ky = 40 + Math.random() * 432
    ctx.strokeStyle = `rgba(60, 45, 30, ${0.06 + Math.random() * 0.04})`
    ctx.lineWidth = 0.5 + Math.random() * 0.5
    ctx.beginPath()
    ctx.ellipse(kx, ky, 4 + Math.random() * 6, 2 + Math.random() * 3, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(
      kx + (Math.random() - 0.5) * 2,
      ky + (Math.random() - 0.5) * 2,
      2 + Math.random() * 3,
      1 + Math.random() * 2,
      Math.random() * Math.PI,
      0,
      Math.PI * 2,
    )
    ctx.stroke()
  }

  _woodTexture = c.toDataURL()
  return _woodTexture
}

function generateStoneTexture(): string {
  const r = getCtx(1024, 1024)
  if (!r) return ''
  const { c, ctx } = r
  ctx.fillStyle = '#dad2c4'
  ctx.fillRect(0, 0, 1024, 1024)

  const d = ctx.getImageData(0, 0, 1024, 1024)
  const px = d.data
  for (let i = 0; i < px.length; i += 4) {
    const n = (Math.random() - 0.5) * 12
    px[i] = Math.max(0, Math.min(255, px[i]! + n))
    px[i + 1] = Math.max(0, Math.min(255, px[i + 1]! + n))
    px[i + 2] = Math.max(0, Math.min(255, px[i + 2]! + n))
  }
  ctx.putImageData(d, 0, 0)

  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 1024
    const y = Math.random() * 1024
    const r = 40 + Math.random() * 80
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(160,145,130,${0.025 + Math.random() * 0.03})`)
    g.addColorStop(1, 'rgba(160,145,130,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.strokeStyle = 'rgba(150,140,130,0.10)'
  ctx.lineWidth = 0.5
  const blockH = 100 + Math.random() * 20
  const blockW = 140 + Math.random() * 30
  for (let y = 0; y < 1024; y += blockH) {
    const offset = (Math.floor(y / blockH) % 2) * (blockW / 2)
    for (let x = -blockW; x < 1024 + blockW; x += blockW) {
      ctx.strokeRect(x + offset, y, blockW, blockH)
    }
  }

  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 1024
    const y = Math.random() * 1024
    ctx.strokeStyle = `rgba(140,130,120,${0.04 + Math.random() * 0.04})`
    ctx.lineWidth = 0.3 + Math.random() * 0.3
    ctx.beginPath()
    ctx.arc(x, y, 2 + Math.random() * 4, 0, Math.PI * 2)
    ctx.stroke()
  }

  return c.toDataURL()
}

export function getStoneTexture(): string {
  if (!_stoneTexture) _stoneTexture = generateStoneTexture()
  return _stoneTexture
}
