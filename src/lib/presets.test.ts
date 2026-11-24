import { describe, expect, it } from 'vitest'
import { BUILT_IN, parsePreset, serializePreset, toStack } from './presets'
import { makeRounds } from './game'

describe('preseturi', () => {
  it('toate preseturile din aplicație sunt valide și se pot transforma în stivă', () => {
    for (const items of Object.values(BUILT_IN)) expect(toStack(items).length).toBe(items.length)
  })
  it('JSON dus-întors', () => {
    const st = toStack(BUILT_IN.noir)
    const p = parsePreset(serializePreset('Al meu', st))
    expect(typeof p).toBe('object')
    if (typeof p === 'string') return
    expect(p.name).toBe('Al meu')
    expect(toStack(p.items).map((s) => [s.id, s.params])).toEqual(st.map((s) => [s.id, s.params]))
  })
  it('limitează parametrii la domeniu și respinge JSON invalid', () => {
    expect(toStack([{ id: 'brightness', params: { b: 9999 } }])[0].params.b).toBe(100)
    expect(typeof parsePreset('nu e json')).toBe('string')
    expect(typeof parsePreset('{"items":[{"id":"inexistent"}]}')).toBe('string')
    expect(typeof parsePreset('{"items":"x"}')).toBe('string')
  })
})

describe('jocul „Ghicește filtrul”', () => {
  it('determinist după seed, 8 runde cu răspunsuri distincte și 4 variante unice', () => {
    const a = makeRounds(3)
    expect(a).toEqual(makeRounds(3))
    expect(a).not.toEqual(makeRounds(4))
    expect(a.length).toBe(8)
    expect(new Set(a.map((r) => r.answer)).size).toBe(8)
    for (const r of a) {
      expect(new Set(r.options).size).toBe(4)
      expect(r.options).toContain(r.answer)
    }
  })
})
