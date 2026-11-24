import { gaussian, makeRng } from './prng'
import { toByte } from './image'

/*
 * Simulare „mod noapte”. Pentru fiecare cadru k:
 *   brut_k = limitare(rotunjire(negru + câștig × scenă(deplasată cu s_k) + σ × z_k)),  z_k ~ N(0,1)
 * Cadrele se combină (medie sau mediană), apoi „developarea” compensează luminozitatea:
 *   afișat = (combinat − negru) / câștig
 * „negru” e nivelul de negru al senzorului (valoare mică, fixă), ca zgomotul să nu fie tăiat la 0.
 */

export const BLACK_LEVEL = 20
export const MAX_FRAMES = 32

export interface Shift {
  dx: number
  dy: number
}

export interface NightParams {
  gain: number
  sigma: number
  /** deplasarea maximă (pixeli) a „mâinii care tremură” */
  shake: number
  align: boolean
  mode: 'mean' | 'median'
}

/** Zgomot unitar (N(0,1)) pentru fiecare cadru; același seed → aceleași cadre, iar primele N cadre sunt mereu aceleași. */
export function makeNoiseBank(w: number, h: number, frames = MAX_FRAMES, seed = 42): Float32Array[] {
  return Array.from({ length: frames }, (_, k) => {
    const rng = makeRng(seed * 1000 + k)
    const z = new Float32Array(w * h)
    for (let i = 0; i < z.length; i++) z[i] = gaussian(rng)
    return z
  })
}

/** Deplasările fiecărui cadru: întregi în [−shake, shake]; cadrul 0 nu se mișcă. */
export function makeShifts(frames: number, shake: number, seed = 7): Shift[] {
  const s = Math.round(shake)
  return Array.from({ length: frames }, (_, k) => {
    if (k === 0 || s === 0) return { dx: 0, dy: 0 }
    const rng = makeRng(seed * 1000 + k)
    return { dx: Math.floor(rng() * (2 * s + 1)) - s, dy: Math.floor(rng() * (2 * s + 1)) - s }
  })
}

/** Deplasează imaginea: out[x,y] = in[x−dx, y−dy]; marginile se prelungesc. */
export function shiftArray(a: ArrayLike<number>, w: number, h: number, dx: number, dy: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h)
  for (let y = 0; y < h; y++) {
    const sy = Math.min(h - 1, Math.max(0, y - dy))
    for (let x = 0; x < w; x++) {
      const sx = Math.min(w - 1, Math.max(0, x - dx))
      out[y * w + x] = a[sy * w + sx]
    }
  }
  return out
}

/** Cadrele brute (deja aliniate înapoi, dacă `align`). */
export function captureFrames(
  clean: Uint8ClampedArray,
  w: number,
  h: number,
  bank: Float32Array[],
  p: Pick<NightParams, 'gain' | 'sigma' | 'shake' | 'align'>,
): Uint8ClampedArray[] {
  const shifts = makeShifts(bank.length, p.shake)
  return bank.map((z, k) => {
    const { dx, dy } = shifts[k]
    const scene = dx || dy ? shiftArray(clean, w, h, dx, dy) : clean
    const raw = new Uint8ClampedArray(w * h)
    for (let i = 0; i < raw.length; i++) raw[i] = toByte(BLACK_LEVEL + p.gain * scene[i] + p.sigma * z[i])
    return p.align && (dx || dy) ? shiftArray(raw, w, h, -dx, -dy) : raw
  })
}

export function mergeMean(frames: Uint8ClampedArray[]): Float32Array {
  const out = new Float32Array(frames[0].length)
  for (const f of frames) for (let i = 0; i < out.length; i++) out[i] += f[i]
  for (let i = 0; i < out.length; i++) out[i] /= frames.length
  return out
}

/** Mediana pe pixel; la număr par de cadre, media celor două valori din mijloc. */
export function mergeMedian(frames: Uint8ClampedArray[]): Float32Array {
  const n = frames.length
  const out = new Float32Array(frames[0].length)
  const buf = new Uint8Array(n)
  for (let i = 0; i < out.length; i++) {
    for (let k = 0; k < n; k++) buf[k] = frames[k][i]
    buf.sort()
    out[i] = n % 2 ? buf[(n - 1) / 2] : (buf[n / 2 - 1] + buf[n / 2]) / 2
  }
  return out
}

/** Developare: compensează nivelul de negru și câștigul mic; rezultat întreg 0–255. */
export function develop(v: ArrayLike<number>, gain: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(v.length)
  for (let i = 0; i < out.length; i++) out[i] = toByte((v[i] - BLACK_LEVEL) / gain)
  return out
}

export function merge(frames: Uint8ClampedArray[], mode: NightParams['mode']): Float32Array {
  return mode === 'median' ? mergeMedian(frames) : mergeMean(frames)
}

/** Eroarea RMS (√MSE) a mediei primelor n cadre, pentru n = 1..frames.length (sume parțiale, ieftin). */
export function meanErrorCurve(frames: Uint8ClampedArray[], clean: ArrayLike<number>, gain: number): number[] {
  const len = clean.length
  const sum = new Float64Array(len)
  const out: number[] = []
  frames.forEach((f, k) => {
    let s = 0
    for (let i = 0; i < len; i++) {
      sum[i] += f[i]
      const v = toByte((sum[i] / (k + 1) - BLACK_LEVEL) / gain)
      const e = v - clean[i]
      s += e * e
    }
    out.push(Math.sqrt(s / len))
  })
  return out
}
