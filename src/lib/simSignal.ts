import { makeRng } from './prng'

/**
 * Semnal sintetic (simulare), periodic la 30 s: clipiri normale, o închidere lungă și o privire în lateral.
 * Determinist: același t → aceleași valori.
 */
export const SIM_PERIOD = 30

const BLINKS = [2.0, 5.5, 8.7, 16.0, 17.2, 24.5, 27.3]
export const SIM_LONG_CLOSE = { from: 11.5, to: 14.5 }
export const SIM_LOOK_AWAY = { from: 19.5, to: 22.5 }

const smooth = (x: number) => x * x * (3 - 2 * x)

function noise(t: number): number {
  const k = Math.floor(t * 30)
  return (makeRng(k + 1)() - 0.5) * 0.03
}

export function simSample(tAbs: number): { ear: number; turn: number } {
  const t = ((tAbs % SIM_PERIOD) + SIM_PERIOD) % SIM_PERIOD
  let ear = 0.3 + noise(tAbs)
  for (const b of BLINKS) {
    const d = t - b
    if (d >= 0 && d < 0.2) ear = Math.min(ear, 0.3 - 0.22 * Math.sin((d / 0.2) * Math.PI))
  }
  const { from, to } = SIM_LONG_CLOSE
  if (t >= from && t <= to) {
    const e = Math.min(smooth(Math.min(1, (t - from) / 0.15)), smooth(Math.min(1, (to - t) / 0.15)))
    ear = Math.min(ear, 0.3 - 0.23 * e)
  }
  let turn = noise(tAbs + 100) * 0.4
  const a = SIM_LOOK_AWAY
  if (t >= a.from && t <= a.to) {
    const e = Math.min(smooth(Math.min(1, (t - a.from) / 0.4)), smooth(Math.min(1, (a.to - t) / 0.4)))
    turn += 0.7 * e
  }
  return { ear, turn }
}
