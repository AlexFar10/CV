import type { Img } from './image'
import { makeRng } from './prng'

/**
 * Scena de test, desenată din cod, determinist (PRNG cu seed).
 * Conține: gradient lin + zone foarte întunecate/luminoase, forme cu muchii clare,
 * linii subțiri, text mic, tablă de șah, textură fină, paletă de culori.
 */
export function drawTestScene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const rng = makeRng(2024)
  ctx.save()
  ctx.clearRect(0, 0, w, h)
  const u = w / 640 // unitate de scară (scena e gândită pe 640×480)
  const v = h / 480

  // 1) fundal cu gradient lin, de la aproape negru la aproape alb
  const g = ctx.createLinearGradient(0, 0, w, 0)
  g.addColorStop(0, '#050608')
  g.addColorStop(0.5, '#7a8590')
  g.addColorStop(1, '#fbfbf6')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // 2) zone foarte întunecate și foarte luminoase, cu detalii abia vizibile
  ctx.fillStyle = '#0a0a0c'
  ctx.fillRect(0, 0, 150 * u, 110 * v)
  ctx.fillStyle = '#1b1c20'
  ctx.fillRect(20 * u, 20 * v, 40 * u, 40 * v)
  ctx.fillStyle = '#fdfdf8'
  ctx.fillRect(490 * u, 0, 150 * u, 110 * v)
  ctx.fillStyle = '#e9e9df'
  ctx.fillRect(580 * u, 20 * v, 40 * u, 40 * v)

  // 3) forme cu muchii clare
  ctx.fillStyle = '#d6336c'
  ctx.fillRect(180 * u, 20 * v, 90 * u, 70 * v)
  ctx.fillStyle = '#1c7ed6'
  ctx.beginPath()
  ctx.arc(330 * u, 55 * v, 38 * Math.min(u, v), 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f59f00'
  ctx.beginPath()
  ctx.moveTo(380 * u, 95 * v)
  ctx.lineTo(425 * u, 15 * v)
  ctx.lineTo(470 * u, 95 * v)
  ctx.closePath()
  ctx.fill()

  // 4) linii subțiri (1 px, diverse unghiuri) și grup de linii paralele
  ctx.strokeStyle = '#111'
  ctx.lineWidth = 1
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo(20 * u, (130 + i * 7) * v)
    ctx.lineTo(200 * u, (130 + i * 7) * v)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(220 * u, 125 * v)
  ctx.lineTo(300 * u, 190 * v)
  ctx.moveTo(220 * u, 190 * v)
  ctx.lineTo(300 * u, 125 * v)
  ctx.stroke()

  // 5) text mic
  ctx.fillStyle = '#111'
  ctx.font = `${Math.max(8, Math.round(11 * v))}px sans-serif`
  ctx.textBaseline = 'top'
  ctx.fillText('Text mic: pixelii fac literele.', 320 * u, 128 * v)
  ctx.font = `${Math.max(6, Math.round(8 * v))}px sans-serif`
  ctx.fillText('abcdefghijklmnopqrstuvwxyz 0123456789', 320 * u, 148 * v)
  ctx.font = `${Math.max(12, Math.round(22 * v))}px sans-serif`
  ctx.fillStyle = '#fff'
  ctx.fillText('Aa Bb 123', 320 * u, 164 * v)

  // 6) tablă de șah
  const cell = 14 * Math.min(u, v)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#f4f4f4' : '#202020'
      ctx.fillRect(20 * u + c * cell, 215 * v + r * cell, cell, cell)
    }
  }

  // 7) textură fină: zgomot determinist pe o zonă pătrată
  const tx = Math.round(180 * u)
  const ty = Math.round(215 * v)
  const tw = Math.max(1, Math.round(112 * Math.min(u, v)))
  const tex = ctx.createImageData(tw, tw)
  for (let i = 0; i < tex.data.length; i += 4) {
    const n = 100 + Math.floor(rng() * 110)
    tex.data[i] = n
    tex.data[i + 1] = n
    tex.data[i + 2] = n
    tex.data[i + 3] = 255
  }
  ctx.putImageData(tex, tx, ty)

  // 8) paletă de culori
  const colors = ['#e03131', '#f08c00', '#fcc419', '#2f9e44', '#1098ad', '#1971c2', '#7048e8', '#c2255c']
  colors.forEach((col, i) => {
    ctx.fillStyle = col
    ctx.fillRect((320 + i * 38) * u, 215 * v, 36 * u, 50 * v)
  })

  // 9) gradient cu trepte de gri, ca să se vadă clar efectul filtrelor de contrast
  for (let i = 0; i < 16; i++) {
    const gv = Math.round((i * 255) / 15)
    ctx.fillStyle = `rgb(${gv},${gv},${gv})`
    ctx.fillRect((320 + i * 19) * u, 280 * v, 19 * u, 40 * v)
  }
  const grad = ctx.createLinearGradient(320 * u, 0, 624 * u, 0)
  grad.addColorStop(0, '#000')
  grad.addColorStop(1, '#fff')
  ctx.fillStyle = grad
  ctx.fillRect(320 * u, 326 * v, 304 * u, 30 * v)

  // 10) zona de jos: culoare plină + cerc cu gradient radial
  const rad = ctx.createRadialGradient(100 * u, 400 * v, 5, 100 * u, 400 * v, 70 * Math.min(u, v))
  rad.addColorStop(0, '#fff3bf')
  rad.addColorStop(1, '#e8590c')
  ctx.fillStyle = rad
  ctx.fillRect(20 * u, 345 * v, 160 * u, 125 * v)
  ctx.fillStyle = '#2b8a3e'
  ctx.fillRect(200 * u, 370 * v, 100 * u, 100 * v)
  ctx.restore()
}

/** Portret de probă, desenat din cod: siluetă simplă pe fundal încărcat. Imagine de probă, nu o persoană reală. */
export function drawPlaceholderPortrait(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const rng = makeRng(77)
  ctx.save()
  // fundal încărcat: dungi colorate + cercuri
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#74c0fc')
  bg.addColorStop(1, '#ffd8a8')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `hsla(${Math.floor(rng() * 360)},70%,60%,0.45)`
    ctx.beginPath()
    ctx.arc(rng() * w, rng() * h, (8 + rng() * 30) * (w / 480), 0, Math.PI * 2)
    ctx.fill()
  }
  // siluetă: umeri + cap
  ctx.fillStyle = '#364fc7'
  ctx.beginPath()
  ctx.ellipse(w / 2, h * 1.02, w * 0.36, h * 0.3, 0, Math.PI, 0)
  ctx.fill()
  ctx.fillStyle = '#e8b796'
  ctx.fillRect(w * 0.45, h * 0.52, w * 0.1, h * 0.14)
  ctx.beginPath()
  ctx.ellipse(w / 2, h * 0.4, w * 0.15, h * 0.2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#3b2a20'
  ctx.beginPath()
  ctx.ellipse(w / 2, h * 0.33, w * 0.165, h * 0.14, 0, Math.PI, 0)
  ctx.fill()
  ctx.restore()
}

/** Scena de test ca imagine (RGBA), 640×480 implicit. */
export function testSceneImg(width = 640, height = 480): Img {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const ctx = c.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas indisponibil')
  drawTestScene(ctx, width, height)
  return { width, height, data: ctx.getImageData(0, 0, width, height).data }
}
