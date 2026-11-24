import { gaussianBlur } from './blur'
import { cvGray, makeImg, toByte, type Img } from './image'

/** Mască: valori între 0 (fundal) și 1 (persoană), câte una pe pixel. */
export interface Mask {
  width: number
  height: number
  data: Float32Array
}

export const newMask = (width: number, height: number): Mask => ({ width, height, data: new Float32Array(width * height) })

/** Prag pe luminanță: persoana e fie sub prag (mai întunecată), fie peste prag. */
export function lumaMask(img: Img, t: number, personIsDark: boolean): Mask {
  const m = newMask(img.width, img.height)
  for (let i = 0, j = 0; j < m.data.length; i += 4, j++) {
    const l = cvGray(img.data[i], img.data[i + 1], img.data[i + 2])
    m.data[j] = (personIsDark ? l < t : l > t) ? 1 : 0
  }
  return m
}

/**
 * Selecție prin click cu toleranță (umplere pe regiune): pornind de la pixelul (x, y), se adaugă vecinii
 * (sus, jos, stânga, dreapta) a căror culoare e la distanță ≤ tol de culoarea pixelului de start (distanță euclidiană în RGB).
 */
export function floodMask(img: Img, x0: number, y0: number, tol: number): Mask {
  const { width: w, height: h, data: d } = img
  const m = newMask(w, h)
  if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return m
  const s = (y0 * w + x0) * 4
  const [sr, sg, sb] = [d[s], d[s + 1], d[s + 2]]
  const tol2 = tol * tol
  const stack = new Int32Array(w * h)
  let sp = 0
  stack[sp++] = y0 * w + x0
  m.data[y0 * w + x0] = 1
  const test = (p: number) => {
    if (m.data[p]) return
    const i = p * 4
    const dr = d[i] - sr
    const dg = d[i + 1] - sg
    const db = d[i + 2] - sb
    if (dr * dr + dg * dg + db * db <= tol2) {
      m.data[p] = 1
      stack[sp++] = p
    }
  }
  while (sp > 0) {
    const p = stack[--sp]
    const x = p % w
    const y = (p - x) / w
    if (x > 0) test(p - 1)
    if (x < w - 1) test(p + 1)
    if (y > 0) test(p - w)
    if (y < h - 1) test(p + w)
  }
  return m
}

export function invertMask(m: Mask): Mask {
  return { width: m.width, height: m.height, data: m.data.map((v) => 1 - v) }
}

/** Prag pe probabilități: 1 dacă p > prag, altfel 0 (firul roșu al aplicației). */
export function thresholdMask(prob: Mask, thr: number): Mask {
  return { width: prob.width, height: prob.height, data: prob.data.map((v) => (v > thr ? 1 : 0)) }
}

/** Muchie moale („feather”): blur gaussian pe mască. */
export function featherMask(m: Mask, sigma: number): Mask {
  return { width: m.width, height: m.height, data: gaussianBlur(m.data, m.width, m.height, 1, sigma) }
}

/** Fracția pixelilor cu valoare > 0,5. */
export function coverage(m: Mask): number {
  let n = 0
  for (const v of m.data) if (v > 0.5) n++
  return n / m.data.length
}

/** nou = a × original + (1 − a) × blur(original), unde a e masca (persoana rămâne clară, fundalul se încețoșează). */
export function compositeBlur(img: Img, alpha: Mask, sigma: number): Img {
  const { width: w, height: h } = img
  const rgb = new Float32Array(w * h * 3)
  for (let j = 0; j < w * h; j++) {
    rgb[j * 3] = img.data[j * 4]
    rgb[j * 3 + 1] = img.data[j * 4 + 1]
    rgb[j * 3 + 2] = img.data[j * 4 + 2]
  }
  const blurred = gaussianBlur(rgb, w, h, 3, sigma)
  const out = makeImg(w, h)
  for (let j = 0; j < w * h; j++) {
    const a = Math.min(1, Math.max(0, alpha.data[j]))
    for (let c = 0; c < 3; c++) out.data[j * 4 + c] = toByte(a * rgb[j * 3 + c] + (1 - a) * blurred[j * 3 + c])
    out.data[j * 4 + 3] = 255
  }
  return out
}

/** Masca ca imagine alb-negru. */
export function maskToImg(m: Mask): Img {
  const out = makeImg(m.width, m.height)
  for (let j = 0; j < m.data.length; j++) {
    const v = toByte(m.data[j] * 255)
    out.data[j * 4] = out.data[j * 4 + 1] = out.data[j * 4 + 2] = v
    out.data[j * 4 + 3] = 255
  }
  return out
}

/** Imaginea cu masca colorată peste ea (roșu semitransparent), ca să se vadă ce a fost selectat. */
export function overlayMask(img: Img, m: Mask, strength = 0.5): Img {
  const out = makeImg(img.width, img.height)
  for (let j = 0; j < m.data.length; j++) {
    const a = m.data[j] * strength
    const i = j * 4
    out.data[i] = toByte(img.data[i] * (1 - a) + 255 * a)
    out.data[i + 1] = toByte(img.data[i + 1] * (1 - a) + 40 * a)
    out.data[i + 2] = toByte(img.data[i + 2] * (1 - a) + 60 * a)
    out.data[i + 3] = 255
  }
  return out
}
