import { describe, expect, it } from 'vitest'
import { CHEEK_IMAGE_LEFT, CHEEK_IMAGE_RIGHT, EYE_IMAGE_LEFT, EYE_IMAGE_RIGHT, NOSE_TIP, ear, earOf, headTurn, type Pt } from './face'
import { DEFAULT_THRESHOLDS, checkRule, compileRule, defaultRule, updateClosedTime, DEFAULT_RULE_CODE, RuleError } from './drowsy'
import { SIM_LONG_CLOSE, SIM_LOOK_AWAY, simSample } from './simSignal'

describe('EAR', () => {
  it('calcul de mână: lățime 4, înălțimi 2 → (2+2)/(2·4) = 0,5', () => {
    const p: Pt[] = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 0 }, { x: 3, y: -1 }, { x: 1, y: -1 }]
    expect(ear(p)).toBeCloseTo(0.5, 12)
  })
  it('ochi închis (pleoape lipite) → 0', () => {
    const p: Pt[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 3, y: 0 }, { x: 1, y: 0 }]
    expect(ear(p)).toBe(0)
  })
  it('geometria canonică din MediaPipe (ochi deschiși) dă ≈ 0,234, cu indicii din aplicație', () => {
    const lm: Pt[] = Array.from({ length: 468 }, () => ({ x: 0, y: 0 }))
    const right: [number, number, number][] = [[362, 1.86, 2.59], [385, 2.72, 2.96], [387, 3.67, 2.93], [263, 4.45, 2.66], [373, 3.67, 2.36], [380, 2.72, 2.32]]
    const left: [number, number, number][] = [[33, -4.45, 2.66], [160, -3.67, 2.93], [158, -2.72, 2.96], [133, -1.86, 2.59], [153, -2.72, 2.32], [144, -3.67, 2.36]]
    for (const [i, x, y] of [...right, ...left]) lm[i] = { x, y }
    expect(EYE_IMAGE_LEFT).toEqual(left.map((p) => p[0]))
    expect(EYE_IMAGE_RIGHT).toEqual(right.map((p) => p[0]))
    expect(earOf(lm)).toBeCloseTo(0.234, 2)
  })
})

describe('rotirea capului', () => {
  const lm = (nose: number): Pt[] => {
    const a: Pt[] = Array.from({ length: 468 }, () => ({ x: 0, y: 0 }))
    a[CHEEK_IMAGE_LEFT] = { x: 0, y: 0 }
    a[CHEEK_IMAGE_RIGHT] = { x: 1, y: 0 }
    a[NOSE_TIP] = { x: nose, y: 0 }
    return a
  }
  it('nas la mijloc → 0; spre o margine → ±1', () => {
    expect(headTurn(lm(0.5))).toBeCloseTo(0, 12)
    expect(headTurn(lm(1))).toBeCloseTo(1, 12)
    expect(headTurn(lm(0))).toBeCloseTo(-1, 12)
    expect(headTurn(lm(0.75))).toBeCloseTo(0.5, 12)
  })
})

describe('reguli de decizie', () => {
  const t = DEFAULT_THRESHOLDS
  it('regula implicită', () => {
    expect(defaultRule(0.3, 0, 0, t)).toBe('Atent')
    expect(defaultRule(0.05, 0, 0.9, t)).toBe('Atent') // încă sub durata minimă
    expect(defaultRule(0.05, 0, 1.2, t)).toBe('Obosit')
    expect(defaultRule(0.3, 0.5, 0, t)).toBe('Distras')
    expect(defaultRule(0.3, -0.5, 0, t)).toBe('Distras')
    expect(defaultRule(0.05, 0.5, 2, t)).toBe('Distras') // capul are prioritate
  })
  it('timp închis: crește cât ochii sunt sub prag, se resetează la deschidere', () => {
    let c = 0
    c = updateClosedTime(c, 0.1, 0.5, 0.2)
    c = updateClosedTime(c, 0.1, 0.5, 0.2)
    expect(c).toBe(1)
    expect(updateClosedTime(c, 0.3, 0.5, 0.2)).toBe(0)
  })
  it('codul implicit scris în aplicație se comportă la fel ca funcția din cod', () => {
    const r = compileRule(DEFAULT_RULE_CODE)
    for (const e of [0.05, 0.3]) for (const turn of [0, 0.5]) for (const c of [0, 2]) expect(r(e, turn, c, t)).toBe(defaultRule(e, turn, c, t))
    expect(checkRule(r)).toBeNull()
  })
  it('erori prietenoase', () => {
    expect(() => compileRule('')).toThrow(RuleError)
    expect(() => compileRule('(a, b =>')).toThrow(/sintax/)
    expect(() => compileRule('5')).toThrow(/funcție/)
    expect(checkRule(compileRule('() => "Somnoros"'))).toMatch(/Atent/)
    expect(checkRule(compileRule('() => { throw new Error("x") }'))).toMatch(/eroare/)
    expect(checkRule(compileRule('(e) => e'))).toMatch(/exact/)
  })
})

describe('semnal simulat', () => {
  it('determinist', () => expect(simSample(3.3)).toEqual(simSample(3.3)))
  it('ochi deschiși de obicei; închidere lungă și privire în lateral la momentele scriptate', () => {
    expect(simSample(0.5).ear).toBeGreaterThan(0.25)
    expect(simSample(0.5).turn).toBeLessThan(0.1)
    expect(simSample((SIM_LONG_CLOSE.from + SIM_LONG_CLOSE.to) / 2).ear).toBeLessThan(0.12)
    expect(Math.abs(simSample((SIM_LOOK_AWAY.from + SIM_LOOK_AWAY.to) / 2).turn)).toBeGreaterThan(0.5)
    expect(simSample(2.1).ear).toBeLessThan(0.15) // în mijlocul unei clipiri
    expect(simSample(33).ear).toBeCloseTo(simSample(3).ear, 1) // periodic
  })
})
