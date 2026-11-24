import { FILTERS, type FilterId } from './filters'
import { makeRng, type Rng } from './prng'

/** Parametri „puternici”, ca efectul să se vadă clar în joc. */
export const GAME_PARAMS: Record<FilterId, Record<string, number>> = {
  brightness: { b: 70 },
  contrast: { c: 2 },
  saturation: { s: 2.4 },
  grayscale: {},
  negative: {},
  sepia: { t: 1 },
  temperature: { t: 45 },
  vignette: { s: 0.95 },
  blur: { r: 6 },
  sharpen: { a: 2.5 },
  grain: { sigma: 45 },
  threshold: { p: 128 },
}

export interface Round {
  answer: FilterId
  options: FilterId[]
}

function shuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 8 runde (implicit) cu răspunsuri diferite; fiecare are 4 variante. Același seed → același joc. */
export function makeRounds(seed: number, n = 8): Round[] {
  const rng = makeRng(seed)
  const ids = FILTERS.map((f) => f.id)
  const answers = shuffle(ids, rng).slice(0, n)
  return answers.map((answer) => {
    const others = shuffle(ids.filter((i) => i !== answer), rng).slice(0, 3)
    return { answer, options: shuffle([answer, ...others], rng) }
  })
}
