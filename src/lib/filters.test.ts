import { describe, expect, it } from 'vitest'
import { applyStack, boxBlur, brightness, contrast, convolve3x3, grain, grayscale, negative, saturation, sepia, sharpen, temperature, threshold, vignette, type StackItem } from './filters'
import { makeImg, type Img } from './image'

/** Imagine cu un singur pixel RGB. */
const px = (r: number, g: number, b: number): Img => {
  const im = makeImg(1, 1)
  im.data.set([r, g, b, 255])
  return im
}
const rgb = (im: Img, i = 0) => [im.data[i * 4], im.data[i * 4 + 1], im.data[i * 4 + 2]]
/** Imagine gri w×h din valori. */
const gray = (w: number, h: number, v: number[]): Img => {
  const im = makeImg(w, h)
  v.forEach((x, i) => im.data.set([x, x, x, 255], i * 4))
  return im
}
const R = (im: Img) => Array.from({ length: im.width * im.height }, (_, i) => im.data[i * 4])

describe('operații pe pixel', () => {
  it('luminozitate: adună și limitează', () => {
    expect(rgb(brightness(px(100, 250, 5), 10))).toEqual([110, 255, 15])
    expect(rgb(brightness(px(100, 250, 5), -10))).toEqual([90, 240, 0])
  })
  it('contrast: (v−128)·c+128', () => {
    expect(rgb(contrast(px(100, 200, 128), 2))).toEqual([72, 255, 128])
    expect(rgb(contrast(px(100, 200, 128), 0))).toEqual([128, 128, 128])
  })
  it('negativ: 255−v', () => {
    expect(rgb(negative(px(0, 100, 255)))).toEqual([255, 155, 0])
  })
  it('tonuri de gri: 0,299/0,587/0,114 ca în OpenCV', () => {
    expect(rgb(grayscale(px(255, 0, 0)))).toEqual([76, 76, 76])
    expect(rgb(grayscale(px(0, 255, 0)))).toEqual([150, 150, 150])
    expect(rgb(grayscale(px(0, 0, 255)))).toEqual([29, 29, 29])
  })
  it('saturație: s=0 dă griul, s=1 nu schimbă nimic', () => {
    expect(rgb(saturation(px(255, 0, 0), 0))).toEqual([76, 76, 76])
    expect(rgb(saturation(px(10, 120, 240), 1))).toEqual([10, 120, 240])
    // s=2: g=76,245; R = 76,245+(255−76,245)·2 = 433,7 → 255; G = 76,245−152,49 → 0
    expect(rgb(saturation(px(255, 0, 0), 2))).toEqual([255, 0, 0])
  })
  it('sepia: albul rămâne cald, negrul rămâne negru, t=0 nu schimbă', () => {
    expect(rgb(sepia(px(255, 255, 255), 1))).toEqual([255, 255, 239]) // B: 0,937·255 = 238,9
    expect(rgb(sepia(px(0, 0, 0), 1))).toEqual([0, 0, 0])
    expect(rgb(sepia(px(40, 80, 120), 0))).toEqual([40, 80, 120])
  })
  it('temperatură: +R, −B', () => {
    expect(rgb(temperature(px(100, 100, 100), 20))).toEqual([120, 100, 80])
  })
  it('prag: 255 doar dacă luminanța > p', () => {
    expect(rgb(threshold(px(128, 128, 128), 128))).toEqual([0, 0, 0])
    expect(rgb(threshold(px(129, 129, 129), 128))).toEqual([255, 255, 255])
  })
  it('vignetă: centrul nemodificat, colțurile × (1−s)', () => {
    const im = makeImg(3, 3)
    for (let i = 0; i < 9; i++) im.data.set([200, 200, 200, 255], i * 4)
    const v = vignette(im, 0.5)
    expect(R(v)[4]).toBe(200) // centrul
    expect(R(v)[0]).toBe(100) // colț: d²=1 → 200·0,5
    expect(R(v)[1]).toBe(150) // mijloc de margine: d²=0,5 → 200·0,75
  })
  it('grăunte: σ=0 nu schimbă, același seed → același rezultat, mediu ≈ neschimbat', () => {
    const im = gray(40, 40, Array.from({ length: 1600 }, () => 128))
    expect(R(grain(im, 0))).toEqual(R(im))
    expect(R(grain(im, 20, 5))).toEqual(R(grain(im, 20, 5)))
    expect(R(grain(im, 20, 5))).not.toEqual(R(grain(im, 20, 6)))
    const m = R(grain(im, 20, 5)).reduce((s, x) => s + x, 0) / 1600
    expect(Math.abs(m - 128)).toBeLessThan(2)
  })
})

describe('convoluție 3×3', () => {
  const img = gray(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9])
  it('kernel identitate', () => {
    expect(R(convolve3x3(img, [0, 0, 0, 0, 1, 0, 0, 0, 0]))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
  it('media 3×3: centrul = 5; colțul cu margini replicate = 21/9 → 2', () => {
    const o = R(convolve3x3(img, [1, 1, 1, 1, 1, 1, 1, 1, 1], { divisor: 9 }))
    expect(o[4]).toBe(5)
    expect(o[0]).toBe(2) // (1+1+2 + 1+1+2 + 4+4+5)/9 = 2,33
  })
  it('kernel asimetric (corelație): deplasare cu un pixel', () => {
    // k[0][1] = 1 ia pixelul de deasupra; pe centru: 2
    expect(R(convolve3x3(img, [0, 1, 0, 0, 0, 0, 0, 0, 0]))[4]).toBe(2)
  })
  it('suma ≠ 1 schimbă luminozitatea: kernel×2 pe imagine plată', () => {
    const flat = gray(3, 3, Array(9).fill(60))
    expect(R(convolve3x3(flat, [0, 0, 0, 0, 2, 0, 0, 0, 0]))[4]).toBe(120)
  })
  it('limitare la 0–255 și decalaj', () => {
    expect(R(convolve3x3(img, [0, 0, 0, 0, 100, 0, 0, 0, 0]))[8]).toBe(255)
    expect(R(convolve3x3(img, [0, 0, 0, 0, 0, 0, 0, 0, 0], { offset: 128 }))[0]).toBe(128)
  })
  it('sharpen nu schimbă o imagine plată, dar accentuează o muchie', () => {
    const flat = gray(3, 3, Array(9).fill(90))
    expect(R(sharpen(flat, 1.5))).toEqual(Array(9).fill(90))
    // muchie: 1 coloană 50 | 100 | 100; a=1 → centru: 5·100 −(100+100+100+50)... linia din mijloc
    const edge = gray(3, 3, [50, 100, 100, 50, 100, 100, 50, 100, 100])
    // centru (x=1,y=1): 5·100 − (100 sus + 100 jos + 50 stânga + 100 dreapta) = 150
    expect(R(sharpen(edge, 1))[4]).toBe(150)
  })
})

describe('blur', () => {
  it('r=1 pe centru = media celor 9', () => {
    expect(R(boxBlur(gray(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1))[4]).toBe(5)
  })
  it('se aplică o singură dată: același rezultat ca media 3×3 directă', () => {
    const im = gray(4, 3, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120])
    expect(R(boxBlur(im, 1))).toEqual(R(convolve3x3(im, Array(9).fill(1), { divisor: 9 })))
  })
  it('margini replicate: [0,90,0] → [30,30,30]', () => {
    expect(R(boxBlur(gray(3, 1, [0, 90, 0]), 1))).toEqual([30, 30, 30])
  })
  it('conservă luminozitatea medie a unei imagini plate', () => {
    expect(R(boxBlur(gray(5, 5, Array(25).fill(77)), 2))).toEqual(Array(25).fill(77))
  })
})

describe('stivă', () => {
  const base = px(100, 100, 100)
  const mk = (id: StackItem['id'], params: Record<string, number>, enabled = true): StackItem => ({ uid: Math.random(), id, params, enabled })
  it('aplică în ordine; ordinea contează (limitare între pași)', () => {
    const a = applyStack(base, [mk('brightness', { b: 100 }), mk('contrast', { c: 2 })])
    const b = applyStack(base, [mk('contrast', { c: 2 }), mk('brightness', { b: 100 })])
    expect(rgb(a)).toEqual([255, 255, 255]) // 200 → (200−128)·2+128 = 272 → 255
    expect(rgb(b)).toEqual([172, 172, 172]) // 72 + 100
  })
  it('filtrele dezactivate sunt sărite', () => {
    expect(rgb(applyStack(base, [mk('negative', {}, false)]))).toEqual([100, 100, 100])
  })
})
