import { describe, expect, it } from 'vitest'
import { bestThreshold, confusion, histogram, makeScores } from './threshold'

describe('compromisul pragului', () => {
  const s = makeScores()
  it('determinist și în [0,1]', () => {
    expect(makeScores()).toEqual(s)
    for (const v of [...s.neg, ...s.pos]) expect(v >= 0 && v <= 1).toBe(true)
  })
  it('prag 1: nicio alarmă; prag sub 0: alarmă pe toate', () => {
    expect(confusion(s, 1)).toEqual({ fp: 0, tp: 0, fn: 300, tn: 300 })
    expect(confusion(s, -0.1)).toEqual({ fp: 300, tp: 300, fn: 0, tn: 0 })
  })
  it('mărind pragul: mai puține alarme false, mai multe ratate', () => {
    let prev = confusion(s, 0)
    for (let t = 0.05; t <= 1; t += 0.05) {
      const c = confusion(s, t)
      expect(c.fp).toBeLessThanOrEqual(prev.fp)
      expect(c.fn).toBeGreaterThanOrEqual(prev.fn)
      prev = c
    }
  })
  it('calcul de mână', () => {
    const t = { neg: [0.1, 0.4, 0.6], pos: [0.5, 0.7, 0.9, 0.2] }
    expect(confusion(t, 0.5)).toEqual({ fp: 1, tn: 2, tp: 2, fn: 2 })
  })
  it('histogramă: toate valorile sunt numărate, 1,0 intră în ultimul coș', () => {
    const h = histogram([0, 0.04, 0.5, 1], 20)
    expect(h.reduce((a, b) => a + b, 0)).toBe(4)
    expect(h[0]).toBe(2)
    expect(h[19]).toBe(1)
  })
  it('cu cât o alarmă ratată costă mai mult, cu atât pragul optim scade', () => {
    const a = bestThreshold(s, 1)
    const b = bestThreshold(s, 5)
    const c = bestThreshold(s, 20)
    expect(b).toBeLessThanOrEqual(a)
    expect(c).toBeLessThanOrEqual(b)
    expect(a).toBeGreaterThan(0.4)
    expect(a).toBeLessThan(0.6)
  })
})
