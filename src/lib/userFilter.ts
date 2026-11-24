import { toByte, type Img } from './image'

export type UserFn = (r: number, g: number, b: number, x: number, y: number) => unknown

/** Eroare cu mesaj pentru elev (în română), fără detalii tehnice inutile. */
export class UserCodeError extends Error {}

export const DEFAULT_USER_CODE = '(r, g, b, x, y) => [255 - r, g, b]'

/** Transformă textul scris de elev într-o funcție. Acceptă doar o expresie-funcție. */
export function compileUserFn(code: string): UserFn {
  const src = code.trim().replace(/;+\s*$/, '')
  if (!src) throw new UserCodeError('Caseta e goală. Scrie o funcție, de exemplu (r, g, b, x, y) => [r, g, b].')
  let fn: unknown
  try {
    fn = new Function(`"use strict"; return (${src});`)()
  } catch (e) {
    if (e instanceof SyntaxError) throw new UserCodeError(`Ceva nu e scris corect (sintaxă): ${e.message}`)
    throw new UserCodeError(`Codul nu a putut porni: ${e instanceof Error ? e.message : String(e)}`)
  }
  if (typeof fn !== 'function') {
    throw new UserCodeError('Codul trebuie să fie o funcție, de exemplu (r, g, b, x, y) => [r, g, b].')
  }
  return fn as UserFn
}

/** Aplică funcția pe fiecare pixel. Valorile finale sunt limitate la 0–255 și rotunjite. */
export function applyUserFn(fn: UserFn, img: Img): Img {
  const { width: w, height: h } = img
  const out = new Uint8ClampedArray(img.data)
  const s = img.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      let res: unknown
      try {
        res = fn(s[i], s[i + 1], s[i + 2], x, y)
      } catch (e) {
        throw new UserCodeError(`Funcția a dat o eroare la pixelul (${x}, ${y}): ${e instanceof Error ? e.message : String(e)}`)
      }
      if (res == null || typeof res !== 'object' || !('length' in res) || (res as ArrayLike<unknown>).length < 3) {
        throw new UserCodeError(`La pixelul (${x}, ${y}) funcția trebuie să întoarcă trei numere, de forma [r, g, b]. A întors: ${describe(res)}`)
      }
      const a = res as ArrayLike<unknown>
      for (let k = 0; k < 3; k++) {
        const v = a[k]
        if (typeof v !== 'number' || Number.isNaN(v)) {
          throw new UserCodeError(`La pixelul (${x}, ${y}) valoarea ${['r', 'g', 'b'][k]} nu e un număr (a ieșit ${describe(v)}). Verifică operațiile din formulă.`)
        }
        out[i + k] = toByte(v) // valorile peste 255 sau sub 0 sunt limitate
      }
    }
  }
  return { width: w, height: h, data: out }
}

function describe(v: unknown): string {
  if (v === undefined) return 'nimic (undefined). Ai uitat un return sau parantezele?'
  if (typeof v === 'number') return String(v)
  if (Array.isArray(v)) return `o listă cu ${v.length} elemente`
  return typeof v
}
