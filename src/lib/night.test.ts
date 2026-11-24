import { describe, expect, it } from 'vitest'
import { BLACK_LEVEL, captureFrames, develop, makeNoiseBank, makeShifts, mergeMean, mergeMedian, meanErrorCurve, shiftArray } from './night'
import { mse, snr } from './metrics'

const flat = (w: number, h: number, v: number) => new Uint8ClampedArray(w * h).fill(v)
const rms = (a: ArrayLike<number>, b: ArrayLike<number>) => Math.sqrt(mse(a, b))

describe('MSE și SNR', () => {
  it('imagini identice → MSE 0', () => expect(mse([1, 2, 3], [1, 2, 3])).toBe(0))
  it('MSE calculat de mână: erori 1 și 3 → (1+9)/2 = 5', () => expect(mse([11, 13], [10, 10])).toBe(5))
  it('SNR: curat 100, imagine 110 → MSE 100, SNR = 10·log10(10000/100) = 20 dB', () => {
    expect(snr([110, 110], [100, 100])).toBeCloseTo(20, 10)
  })
})

describe('simulare', () => {
  it('zgomot determinist; primele N cadre nu se schimbă când adaug cadre', () => {
    const a = makeNoiseBank(8, 8, 4, 1)
    const b = makeNoiseBank(8, 8, 6, 1)
    expect(Array.from(a[3])).toEqual(Array.from(b[3]))
    expect(Array.from(a[0])).not.toEqual(Array.from(a[1]))
  })
  it('developarea inversează câștigul și nivelul de negru', () => {
    expect(Array.from(develop([BLACK_LEVEL + 10, BLACK_LEVEL + 0.5 * 100], 0.5))).toEqual([20, 100])
  })
  it('media a N cadre scade eroarea cam cu √N (N=16 → de ~4 ori)', () => {
    const clean = flat(60, 60, 128)
    const frames = captureFrames(clean, 60, 60, makeNoiseBank(60, 60, 16), { gain: 0.5, sigma: 8, shake: 0, align: false })
    const curve = meanErrorCurve(frames, clean, 0.5)
    expect(curve[0] / curve[15]).toBeGreaterThan(3.5)
    expect(curve[0] / curve[15]).toBeLessThan(4.5)
    expect(curve[0]).toBeCloseTo(16, 0) // σ/câștig = 8/0,5
  })
  it('mediana a 3 valori și a 4 valori', () => {
    const f = (v: number) => Uint8ClampedArray.of(v)
    expect(mergeMedian([f(1), f(5), f(3)])[0]).toBe(3)
    expect(mergeMedian([f(1), f(5), f(3), f(9)])[0]).toBe(4)
    expect(mergeMean([f(1), f(5), f(3)])[0]).toBe(3)
  })
  it('deplasare: [1,2,3] cu dx=1 → [1,1,2] (marginea se prelungește)', () => {
    expect(Array.from(shiftArray([1, 2, 3], 3, 1, 1, 0))).toEqual([1, 1, 2])
    expect(Array.from(shiftArray([1, 2, 3], 3, 1, -1, 0))).toEqual([2, 3, 3])
  })
  it('mâna care tremură strică media, iar alinierea o repară', () => {
    const w = 64
    const clean = new Uint8ClampedArray(w * w)
    for (let i = 0; i < clean.length; i++) clean[i] = (i % w) % 16 < 8 ? 40 : 220 // dungi verticale
    const bank = makeNoiseBank(w, w, 16)
    const run = (shake: number, align: boolean) => {
      const fr = captureFrames(clean, w, w, bank, { gain: 0.5, sigma: 4, shake, align })
      return rms(mergeMean(fr).map((v) => Math.min(255, Math.max(0, (v - BLACK_LEVEL) / 0.5))), clean)
    }
    const still = run(0, false)
    const shaky = run(3, false)
    const aligned = run(3, true)
    expect(shaky).toBeGreaterThan(still * 3)
    expect(aligned).toBeLessThan(shaky / 2)
  })
  it('deplasările sunt stabile și cadrul 0 rămâne pe loc', () => {
    expect(makeShifts(8, 3)).toEqual(makeShifts(8, 3))
    expect(makeShifts(8, 3)[0]).toEqual({ dx: 0, dy: 0 })
    expect(makeShifts(8, 0).every((s) => s.dx === 0 && s.dy === 0)).toBe(true)
  })
})
