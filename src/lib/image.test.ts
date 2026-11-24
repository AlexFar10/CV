import { describe, expect, it } from 'vitest'
import { clamp255, cvGray, fitSize, lumaHistogram, makeImg, roundHalfEven, toByte } from './image'
import { gaussian, makeRng } from './prng'

describe('rotunjire și limitare', () => {
  it('roundHalfEven duce jumătățile la numărul par (ca NumPy)', () => {
    expect(roundHalfEven(0.5)).toBe(0)
    expect(roundHalfEven(1.5)).toBe(2)
    expect(roundHalfEven(2.5)).toBe(2)
    expect(roundHalfEven(3.5)).toBe(4)
    expect(roundHalfEven(2.4)).toBe(2)
    expect(roundHalfEven(2.6)).toBe(3)
  })
  it('clamp255 și toByte limitează întâi, rotunjesc apoi', () => {
    expect(clamp255(-5)).toBe(0)
    expect(clamp255(300)).toBe(255)
    expect(toByte(300.4)).toBe(255)
    expect(toByte(-0.4)).toBe(0)
    expect(toByte(127.5)).toBe(128)
  })
})

describe('tonuri de gri ca în OpenCV', () => {
  it('culori de referință', () => {
    expect(cvGray(0, 0, 0)).toBe(0)
    expect(cvGray(255, 255, 255)).toBe(255)
    expect(cvGray(255, 0, 0)).toBe(76) // 0,299·255 = 76,2
    expect(cvGray(0, 255, 0)).toBe(150) // 0,587·255 = 149,7
    expect(cvGray(0, 0, 255)).toBe(29) // 0,114·255 = 29,07
  })
})

describe('histogramă', () => {
  it('numără pixelii pe niveluri', () => {
    const img = makeImg(2, 1)
    img.data.set([0, 0, 0, 255, 255, 255, 255, 255])
    const h = lumaHistogram(img)
    expect(h[0]).toBe(1)
    expect(h[255]).toBe(1)
    expect(h.reduce((a, b) => a + b, 0)).toBe(2)
  })
})

describe('redimensionare și PRNG', () => {
  it('fitSize păstrează proporțiile și nu mărește', () => {
    expect(fitSize(1280, 640)).toEqual({ width: 640, height: 320 })
    expect(fitSize(320, 200)).toEqual({ width: 320, height: 200 })
  })
  it('același seed dă aceeași secvență', () => {
    const a = makeRng(7)
    const b = makeRng(7)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('zgomotul gaussian are media ≈ 0 și deviația ≈ 1', () => {
    const r = makeRng(1)
    const xs = Array.from({ length: 20000 }, () => gaussian(r))
    const m = xs.reduce((s, x) => s + x, 0) / xs.length
    const sd = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length)
    expect(Math.abs(m)).toBeLessThan(0.03)
    expect(Math.abs(sd - 1)).toBeLessThan(0.03)
  })
})
