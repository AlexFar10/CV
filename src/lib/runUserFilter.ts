import type { Img } from './image'

export type UserRunResult = { ok: true; img: Img } | { ok: false; message: string }

export const USER_CODE_TIMEOUT_MS = 3000

/** Rulează codul elevului într-un Web Worker; dacă durează prea mult, workerul e oprit. */
export function runUserFilter(code: string, img: Img, timeoutMs = USER_CODE_TIMEOUT_MS): Promise<UserRunResult> {
  return new Promise((resolve) => {
    let worker: Worker
    try {
      worker = new Worker(new URL('./userFilter.worker.ts', import.meta.url), { type: 'module' })
    } catch {
      resolve({ ok: false, message: 'Browserul nu poate porni un Web Worker, deci nu pot rula codul în siguranță.' })
      return
    }
    const done = (r: UserRunResult) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(r)
    }
    const timer = setTimeout(
      () => done({ ok: false, message: `Funcția durează prea mult (peste ${timeoutMs / 1000} secunde). Poate are o buclă infinită sau face prea multe calcule pe pixel.` }),
      timeoutMs,
    )
    worker.onmessage = (e: MessageEvent<{ ok: boolean; data?: Uint8ClampedArray; message?: string }>) => {
      if (e.data.ok && e.data.data) done({ ok: true, img: { width: img.width, height: img.height, data: e.data.data } })
      else done({ ok: false, message: e.data.message ?? 'Eroare necunoscută.' })
    }
    worker.onerror = (ev) => done({ ok: false, message: `Eroare în worker: ${ev.message}` })
    const copy = new Uint8ClampedArray(img.data)
    worker.postMessage({ code, width: img.width, height: img.height, data: copy }, [copy.buffer])
  })
}
