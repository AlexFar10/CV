import { describe, expect, it } from 'vitest'
import { gaussianBlur, gaussianKernel } from './blur'
import { makeImg, type Img } from './image'
import { compositeBlur, coverage, featherMask, floodMask, invertMask, lumaMask, newMask, thresholdMask } from './portrait'

const fromRows = (rows: number[][]): Img => {
  const im = makeImg(rows[0].length, rows.length)
  rows.forEach((r, y) => r.forEach((v, x) => im.data.set([v, v, v, 255], (y * im.width + x) * 4)))
  return im
}
const rows = (m: { data: Float32Array; width: number }) => Array.from({ length: m.data.length / m.width }, (_, y) => Array.from(m.data.slice(y * m.width, (y + 1) * m.width)))

describe('blur gaussian', () => {
  it('nucleul are suma 1 și e simetric', () => {
    const k = gaussianKernel(2)
    expect(k.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
    expect(k[0]).toBeCloseTo(k[k.length - 1], 12)
  })
  it('imaginea plată nu se schimbă', () => {
    const out = gaussianBlur(new Float32Array(25).fill(7), 5, 5, 1, 1.5)
    for (const v of out) expect(v).toBeCloseTo(7, 5)
  })
  it('un impuls se întinde simetric și păstrează suma', () => {
    const d = new Float32Array(81)
    d[40] = 81
    const out = gaussianBlur(d, 9, 9, 1, 1)
    expect(out[39]).toBeCloseTo(out[41], 4)
    expect(out[31]).toBeCloseTo(out[49], 4)
    expect(out.reduce((a, b) => a + b, 0)).toBeCloseTo(81, 2)
  })
})

describe('mască de mână', () => {
  const img = fromRows([
    [10, 10, 200, 200],
    [10, 10, 200, 200],
  ])
  it('prag pe luminanță: persoana întunecată sau luminoasă', () => {
    expect(rows(lumaMask(img, 100, true))).toEqual([[1, 1, 0, 0], [1, 1, 0, 0]])
    expect(rows(lumaMask(img, 100, false))).toEqual([[0, 0, 1, 1], [0, 0, 1, 1]])
    expect(rows(lumaMask(img, 10, true))[0]).toEqual([0, 0, 0, 0]) // strict mai mic
  })
  it('umplere pe regiune: se oprește la muchie', () => {
    expect(rows(floodMask(img, 0, 0, 20))).toEqual([[1, 1, 0, 0], [1, 1, 0, 0]])
    expect(rows(floodMask(img, 3, 1, 20))).toEqual([[0, 0, 1, 1], [0, 0, 1, 1]])
  })
  it('toleranță mare „varsă” masca peste muchie', () => {
    expect(coverage(floodMask(img, 0, 0, 340))).toBe(1)
  })
  it('umplerea e conectată pe 4 vecini: o insulă identică, dar izolată, nu se selectează', () => {
    const t = fromRows([
      [10, 200, 10],
      [200, 200, 200],
    ])
    expect(rows(floodMask(t, 0, 0, 5))).toEqual([[1, 0, 0], [0, 0, 0]])
  })
  it('în afara imaginii nu selectează nimic; invertirea', () => {
    expect(coverage(floodMask(img, 9, 9, 50))).toBe(0)
    expect(rows(invertMask(lumaMask(img, 100, true)))[0]).toEqual([0, 0, 1, 1])
  })
})

describe('prag pe probabilități și compunere', () => {
  it('prag strict', () => {
    const p = newMask(3, 1)
    p.data.set([0.2, 0.5, 0.9])
    expect(Array.from(thresholdMask(p, 0.5).data)).toEqual([0, 0, 1])
    expect(Array.from(thresholdMask(p, 0.1).data)).toEqual([1, 1, 1])
  })
  it('feather păstrează valorile între 0 și 1 și înmoaie muchia', () => {
    const m = newMask(8, 1)
    m.data.set([0, 0, 0, 0, 1, 1, 1, 1])
    const f = featherMask(m, 1)
    expect(f.data[3]).toBeGreaterThan(0)
    expect(f.data[4]).toBeLessThan(1)
    expect(Math.min(...f.data)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...f.data)).toBeLessThanOrEqual(1)
  })
  it('masca 1 = original, masca 0 = blur; imagine plată rămâne plată', () => {
    const im = fromRows([[0, 255, 0, 255, 0, 255]])
    const all = newMask(6, 1).data.fill(1)
    const same = compositeBlur(im, { width: 6, height: 1, data: all }, 1)
    expect(Array.from(same.data.filter((_, i) => i % 4 === 0))).toEqual([0, 255, 0, 255, 0, 255])
    const none = compositeBlur(im, newMask(6, 1), 1)
    const mid = none.data[2 * 4]
    expect(mid).toBeGreaterThan(40)
    expect(mid).toBeLessThan(215) // s-a amestecat cu vecinii
    const flat = compositeBlur(fromRows([[90, 90, 90]]), newMask(3, 1), 2)
    expect(flat.data[0]).toBe(90)
  })
})
