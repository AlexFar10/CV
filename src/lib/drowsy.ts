export type State = 'Atent' | 'Obosit' | 'Distras'
export const STATES: readonly State[] = ['Atent', 'Obosit', 'Distras']

export interface Thresholds {
  /** sub această valoare EAR, ochii sunt considerați închiși */
  ear: number
  /** secunde de ochi închiși până la „Obosit” */
  duration: number
  /** |rotirea capului| peste această valoare → „Distras” */
  turn: number
}

export const DEFAULT_THRESHOLDS: Thresholds = { ear: 0.2, duration: 1, turn: 0.35 }

/** Pragurile, cu nume în română, așa cum le vede elevul în cod. */
export interface Praguri {
  ear: number
  durata: number
  rotire: number
}

export type Rule = (ear: number, rotireCap: number, timpInchis: number, praguri: Praguri) => unknown

export const DEFAULT_RULE_CODE = `(ear, rotireCap, timpInchis, praguri) => {
  // rotireCap: 0 = privește drept, ±1 = foarte întors
  // timpInchis: secunde de când ochii sunt sub pragul EAR
  if (Math.abs(rotireCap) > praguri.rotire) return 'Distras'
  if (timpInchis > praguri.durata) return 'Obosit'
  return 'Atent'
}`

/** Regula implicită, cu aceleași praguri ca la slidere. */
export function defaultRule(ear: number, turn: number, closed: number, t: Thresholds): State {
  void ear
  if (Math.abs(turn) > t.turn) return 'Distras'
  if (closed > t.duration) return 'Obosit'
  return 'Atent'
}

/** Timpul continuu cu ochii sub prag (secunde). */
export function updateClosedTime(prev: number, ear: number, dt: number, threshold: number): number {
  return ear < threshold ? prev + dt : 0
}

export class RuleError extends Error {}

/** Compilează regula scrisă de elev (o expresie-funcție). Praguri: { ear, durata, rotire }. */
export function compileRule(code: string): (ear: number, turn: number, closed: number, t: Thresholds) => State {
  const src = code.trim().replace(/;+\s*$/, '')
  if (!src) throw new RuleError('Caseta e goală. Scrie o funcție (ear, rotireCap, timpInchis, praguri) => stare.')
  let fn: unknown
  try {
    fn = new Function(`"use strict"; return (${src});`)()
  } catch (e) {
    throw new RuleError(e instanceof SyntaxError ? `Ceva nu e scris corect (sintaxă): ${e.message}` : `Codul nu a putut porni: ${String(e)}`)
  }
  if (typeof fn !== 'function') throw new RuleError('Codul trebuie să fie o funcție, de exemplu (ear, rotireCap, timpInchis) => "Atent".')
  const f = fn as Rule
  return (e, turn, closed, t) => {
    let out: unknown
    try {
      out = f(e, turn, closed, { ear: t.ear, durata: t.duration, rotire: t.turn })
    } catch (err) {
      throw new RuleError(`Funcția a dat o eroare: ${err instanceof Error ? err.message : String(err)}`)
    }
    if (typeof out !== 'string' || !(STATES as readonly string[]).includes(out)) {
      throw new RuleError(`Funcția trebuie să întoarcă exact 'Atent', 'Obosit' sau 'Distras'. A întors: ${typeof out === 'string' ? `'${out}'` : String(out)}.`)
    }
    return out as State
  }
}

/** Încearcă regula pe o grilă de valori; întoarce un mesaj de eroare sau null dacă e în regulă. */
export function checkRule(rule: ReturnType<typeof compileRule>): string | null {
  try {
    for (const e of [0, 0.1, 0.2, 0.3, 0.4]) for (const r of [-1, -0.4, 0, 0.4, 1]) for (const c of [0, 0.5, 1, 3]) rule(e, r, c, DEFAULT_THRESHOLDS)
    return null
  } catch (err) {
    return err instanceof RuleError ? err.message : String(err)
  }
}
