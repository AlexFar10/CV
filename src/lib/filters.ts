import { cloneImg, cvGray, makeImg, toByte, type Img } from './image'
import { gaussian, makeRng } from './prng'

/*
 * Operații pe imagini: funcții pure. Calculul e în virgulă mobilă; la final fiecare canal
 * este limitat la 0–255 și rotunjit (toByte). Formulele de aici sunt cele afișate în aplicație.
 * Canalul alfa nu se modifică.
 */

export const brightness = (img: Img, b: number): Img => mapRGB(img, (v) => v + b)

export const contrast = (img: Img, c: number): Img => mapRGB(img, (v) => (v - 128) * c + 128)

export const negative = (img: Img): Img => mapRGB(img, (v) => 255 - v)

export function saturation(img: Img, s: number): Img {
  const out = cloneImg(img)
  const d = out.data
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    d[i] = toByte(g + (d[i] - g) * s)
    d[i + 1] = toByte(g + (d[i + 1] - g) * s)
    d[i + 2] = toByte(g + (d[i + 2] - g) * s)
  }
  return out
}

/** Tonuri de gri exact ca în OpenCV (ponderile 0,299 / 0,587 / 0,114). */
export function grayscale(img: Img): Img {
  const out = cloneImg(img)
  const d = out.data
  for (let i = 0; i < d.length; i += 4) d[i] = d[i + 1] = d[i + 2] = cvGray(d[i], d[i + 1], d[i + 2])
  return out
}

const SEPIA = [
  [0.393, 0.769, 0.189],
  [0.349, 0.686, 0.168],
  [0.272, 0.534, 0.131],
]

export function sepia(img: Img, t: number): Img {
  const out = cloneImg(img)
  const d = out.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]
    const g = d[i + 1]
    const b = d[i + 2]
    for (let k = 0; k < 3; k++) {
      const m = SEPIA[k]
      const s = m[0] * r + m[1] * g + m[2] * b
      const old = k === 0 ? r : k === 1 ? g : b
      d[i + k] = toByte(old + t * (s - old))
    }
  }
  return out
}

/** Temperatură: t > 0 încălzește (mai mult roșu, mai puțin albastru), t < 0 răcește. */
export function temperature(img: Img, t: number): Img {
  const out = cloneImg(img)
  const d = out.data
  for (let i = 0; i < d.length; i += 4) {
    d[i] = toByte(d[i] + t)
    d[i + 2] = toByte(d[i + 2] - t)
  }
  return out
}

/** Vignetă: d = distanța la centru / distanța centru–colț (între 0 și 1); nou = vechi × (1 − s × d²). */
export function vignette(img: Img, s: number): Img {
  const out = cloneImg(img)
  const { width: w, height: h, data: d } = out
  const cx = (w - 1) / 2
  const cy = (h - 1) / 2
  const dmax2 = cx * cx + cy * cy || 1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d2 = ((x - cx) ** 2 + (y - cy) ** 2) / dmax2
      const f = 1 - s * d2
      const i = (y * w + x) * 4
      d[i] = toByte(d[i] * f)
      d[i + 1] = toByte(d[i + 1] * f)
      d[i + 2] = toByte(d[i + 2] * f)
    }
  }
  return out
}

/** Prag: 255 dacă luminanța > p, altfel 0. */
export function threshold(img: Img, p: number): Img {
  const out = cloneImg(img)
  const d = out.data
  for (let i = 0; i < d.length; i += 4) {
    const v = cvGray(d[i], d[i + 1], d[i + 2]) > p ? 255 : 0
    d[i] = d[i + 1] = d[i + 2] = v
  }
  return out
}

/** Grăunte: nou = vechi + σ·z, z ~ N(0,1), același z pe R, G, B (grăunte de luminanță). Același seed → același zgomot. */
export function grain(img: Img, sigma: number, seed = 1): Img {
  const out = cloneImg(img)
  const d = out.data
  const rng = makeRng(seed)
  for (let i = 0; i < d.length; i += 4) {
    const n = sigma * gaussian(rng)
    d[i] = toByte(d[i] + n)
    d[i + 1] = toByte(d[i + 1] + n)
    d[i + 2] = toByte(d[i + 2] + n)
  }
  return out
}

/** Blur: media pixelilor din fereastra (2r+1)×(2r+1), o singură dată; marginile se prelungesc (replicate). */
export function boxBlur(img: Img, r: number): Img {
  const rad = Math.round(r)
  if (rad <= 0) return cloneImg(img)
  const { width: w, height: h } = img
  const src = img.data
  const tmp = new Float64Array(w * h * 3)
  const n = 2 * rad + 1
  // orizontal
  for (let y = 0; y < h; y++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0
      for (let k = -rad; k <= rad; k++) sum += src[(y * w + clampIdx(k, w)) * 4 + c]
      for (let x = 0; x < w; x++) {
        tmp[(y * w + x) * 3 + c] = sum / n
        sum += src[(y * w + clampIdx(x + rad + 1, w)) * 4 + c] - src[(y * w + clampIdx(x - rad, w)) * 4 + c]
      }
    }
  }
  // vertical
  const out = makeImg(w, h)
  for (let x = 0; x < w; x++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0
      for (let k = -rad; k <= rad; k++) sum += tmp[(clampIdx(k, h) * w + x) * 3 + c]
      for (let y = 0; y < h; y++) {
        out.data[(y * w + x) * 4 + c] = toByte(sum / n)
        sum += tmp[(clampIdx(y + rad + 1, h) * w + x) * 3 + c] - tmp[(clampIdx(y - rad, h) * w + x) * 3 + c]
      }
    }
  }
  for (let i = 3; i < out.data.length; i += 4) out.data[i] = src[i]
  return out
}

/** Convoluție 3×3 (corelație, ca în OpenCV filter2D): nou = Σ k·vechi / divizor + decalaj. Margini replicate. */
export function convolve3x3(img: Img, k: readonly number[], opts: { divisor?: number; offset?: number } = {}): Img {
  const { divisor = 1, offset = 0 } = opts
  const { width: w, height: h } = img
  const out = cloneImg(img)
  const s = img.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      for (let c = 0; c < 3; c++) {
        let acc = 0
        for (let dy = -1; dy <= 1; dy++) {
          const yy = clampIdx(y + dy, h)
          for (let dx = -1; dx <= 1; dx++) {
            acc += k[(dy + 1) * 3 + (dx + 1)] * s[(yy * w + clampIdx(x + dx, w)) * 4 + c]
          }
        }
        out.data[i + c] = toByte(acc / divisor + offset)
      }
    }
  }
  return out
}

/** Sharpen: kernel cu centrul 1+4a și vecinii (sus, jos, stânga, dreapta) −a. */
export function sharpenKernel(a: number): number[] {
  return [0, -a, 0, -a, 1 + 4 * a, -a, 0, -a, 0]
}
export const sharpen = (img: Img, a: number): Img => convolve3x3(img, sharpenKernel(a))

function clampIdx(i: number, n: number): number {
  return i < 0 ? 0 : i >= n ? n - 1 : i
}

function mapRGB(img: Img, f: (v: number) => number): Img {
  const out = cloneImg(img)
  const d = out.data
  for (let i = 0; i < d.length; i += 4) {
    d[i] = toByte(f(d[i]))
    d[i + 1] = toByte(f(d[i + 1]))
    d[i + 2] = toByte(f(d[i + 2]))
  }
  return out
}

/* ------------------------------ registrul de filtre ------------------------------ */

export type FilterId =
  | 'brightness' | 'contrast' | 'saturation' | 'grayscale' | 'negative' | 'sepia'
  | 'temperature' | 'vignette' | 'blur' | 'sharpen' | 'grain' | 'threshold'

export interface ParamDef {
  key: string
  min: number
  max: number
  step: number
  def: number
}

export interface FilterDef {
  id: FilterId
  /** „pixel” = valoarea depinde doar de pixel (și eventual de poziție); „kernel” = depinde de vecini */
  kind: 'pixel' | 'kernel'
  params: ParamDef[]
  apply: (img: Img, p: Record<string, number>) => Img
}

export const FILTERS: FilterDef[] = [
  { id: 'brightness', kind: 'pixel', params: [{ key: 'b', min: -100, max: 100, step: 1, def: 30 }], apply: (i, p) => brightness(i, p.b) },
  { id: 'contrast', kind: 'pixel', params: [{ key: 'c', min: 0, max: 3, step: 0.05, def: 1.4 }], apply: (i, p) => contrast(i, p.c) },
  { id: 'saturation', kind: 'pixel', params: [{ key: 's', min: 0, max: 3, step: 0.05, def: 1.5 }], apply: (i, p) => saturation(i, p.s) },
  { id: 'grayscale', kind: 'pixel', params: [], apply: (i) => grayscale(i) },
  { id: 'negative', kind: 'pixel', params: [], apply: (i) => negative(i) },
  { id: 'sepia', kind: 'pixel', params: [{ key: 't', min: 0, max: 1, step: 0.05, def: 1 }], apply: (i, p) => sepia(i, p.t) },
  { id: 'temperature', kind: 'pixel', params: [{ key: 't', min: -60, max: 60, step: 1, def: 25 }], apply: (i, p) => temperature(i, p.t) },
  { id: 'vignette', kind: 'pixel', params: [{ key: 's', min: 0, max: 1, step: 0.05, def: 0.6 }], apply: (i, p) => vignette(i, p.s) },
  { id: 'blur', kind: 'kernel', params: [{ key: 'r', min: 1, max: 12, step: 1, def: 3 }], apply: (i, p) => boxBlur(i, p.r) },
  { id: 'sharpen', kind: 'kernel', params: [{ key: 'a', min: 0, max: 3, step: 0.1, def: 1 }], apply: (i, p) => sharpen(i, p.a) },
  { id: 'grain', kind: 'pixel', params: [{ key: 'sigma', min: 0, max: 60, step: 1, def: 15 }], apply: (i, p) => grain(i, p.sigma, 1) },
  { id: 'threshold', kind: 'pixel', params: [{ key: 'p', min: 0, max: 255, step: 1, def: 128 }], apply: (i, p) => threshold(i, p.p) },
]

export const FILTER_BY_ID: Record<FilterId, FilterDef> = Object.fromEntries(FILTERS.map((f) => [f.id, f])) as Record<FilterId, FilterDef>

export interface StackItem {
  uid: number
  id: FilterId
  params: Record<string, number>
  enabled: boolean
}

export function defaultParams(id: FilterId): Record<string, number> {
  return Object.fromEntries(FILTER_BY_ID[id].params.map((p) => [p.key, p.def]))
}

/** Aplică stiva, în ordine, sărind peste filtrele dezactivate. */
export function applyStack(img: Img, stack: readonly StackItem[]): Img {
  let cur = img
  for (const it of stack) if (it.enabled) cur = FILTER_BY_ID[it.id].apply(cur, it.params)
  return cur
}
