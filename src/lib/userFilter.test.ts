import { describe, expect, it } from 'vitest'
import { applyUserFn, compileUserFn, UserCodeError } from './userFilter'
import { makeImg } from './image'

const one = () => {
  const im = makeImg(2, 1)
  im.data.set([10, 20, 30, 255, 200, 100, 50, 255])
  return im
}

describe('cod scris de elev', () => {
  it('rulează o funcție simplă', () => {
    const o = applyUserFn(compileUserFn('(r, g, b) => [255 - r, g, b]'), one())
    expect(Array.from(o.data)).toEqual([245, 20, 30, 255, 55, 100, 50, 255])
  })
  it('limitează valorile peste 255 și sub 0, rotunjește', () => {
    const o = applyUserFn(compileUserFn('(r) => [r * 2, -5, 10.5]'), one())
    expect(Array.from(o.data.slice(0, 3))).toEqual([20, 0, 10]) // 10,5 → 10 (jumătate la par)
    expect(o.data[4]).toBe(255)
  })
  it('primește x și y', () => {
    const o = applyUserFn(compileUserFn('(r, g, b, x, y) => [x * 100, y, 0]'), one())
    expect(o.data[4]).toBe(100)
  })
  it('acceptă ; la final și funcții cu corp', () => {
    expect(() => compileUserFn('(r, g, b) => { return [r, g, b] };')).not.toThrow()
  })
  it('erori prietenoase', () => {
    expect(() => compileUserFn('')).toThrow(UserCodeError)
    expect(() => compileUserFn('(r, g, b => [r')).toThrow(/sintax/)
    expect(() => compileUserFn('42')).toThrow(/funcție/)
    expect(() => applyUserFn(compileUserFn('(r, g, b) => { r }'), one())).toThrow(/\[r, g, b\]/)
    expect(() => applyUserFn(compileUserFn('(r, g, b) => [r, g]'), one())).toThrow(/trei numere/)
    expect(() => applyUserFn(compileUserFn('(r, g, b) => [r, g, "a"]'), one())).toThrow(/nu e un număr/)
    expect(() => applyUserFn(compileUserFn('(r, g, b) => [r / 0 - r / 0, g, b]'), one())).toThrow(/NaN|număr/)
    expect(() => applyUserFn(compileUserFn('(r, g, b) => { throw new Error("hopa") }'), one())).toThrow(/hopa/)
  })
})
