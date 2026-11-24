import { gaussian, makeRng } from './prng'

/** Două grupuri de scoruri între 0 și 1: cazuri fără problemă (în jur de 0,35) și cazuri cu problemă (în jur de 0,65). Se suprapun, ca în viața reală. */
export interface Scores {
  neg: number[]
  pos: number[]
}

export function makeScores(seed = 11, n = 300, sd = 0.15): Scores {
  const rng = makeRng(seed)
  const clip = (v: number) => Math.min(1, Math.max(0, v))
  return {
    neg: Array.from({ length: n }, () => clip(0.35 + sd * gaussian(rng))),
    pos: Array.from({ length: n }, () => clip(0.65 + sd * gaussian(rng))),
  }
}

export interface Confusion {
  /** alarmă pe un caz fără problemă */
  fp: number
  /** caz cu problemă care nu a declanșat alarma */
  fn: number
  tp: number
  tn: number
}

/** Alarmă dacă scorul e strict mai mare decât pragul. */
export function confusion(s: Scores, thr: number): Confusion {
  const fp = s.neg.filter((v) => v > thr).length
  const tp = s.pos.filter((v) => v > thr).length
  return { fp, tp, fn: s.pos.length - tp, tn: s.neg.length - fp }
}

export function histogram(values: readonly number[], bins = 20): number[] {
  const h: number[] = Array.from({ length: bins }, () => 0)
  for (const v of values) h[Math.min(bins - 1, Math.floor(v * bins))]++
  return h
}

/** Pragul (din pași de 0,01) care minimizează costul = alarme false + cost × alarme ratate. La egalitate, cel mai mic. */
export function bestThreshold(s: Scores, missedCost: number): number {
  let best = 0
  let bestCost = Infinity
  for (let i = 0; i <= 100; i++) {
    const thr = i / 100
    const c = confusion(s, thr)
    const cost = c.fp + missedCost * c.fn
    if (cost < bestCost - 1e-9) {
      bestCost = cost
      best = thr
    }
  }
  return best
}
