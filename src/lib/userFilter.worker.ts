/// <reference lib="webworker" />
import { applyUserFn, compileUserFn, UserCodeError } from './userFilter'

// Codul elevului rulează aici, izolat de pagină și fără acces la rețea.
for (const k of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'indexedDB']) {
  try {
    Object.defineProperty(self, k, { value: undefined, configurable: true })
  } catch {
    /* nu contează */
  }
}

self.onmessage = (e: MessageEvent<{ code: string; width: number; height: number; data: Uint8ClampedArray }>) => {
  try {
    const fn = compileUserFn(e.data.code)
    const res = applyUserFn(fn, { width: e.data.width, height: e.data.height, data: e.data.data })
    self.postMessage({ ok: true, data: res.data }, [res.data.buffer])
  } catch (err) {
    const message = err instanceof UserCodeError ? err.message : `Eroare neașteptată: ${err instanceof Error ? err.message : String(err)}`
    self.postMessage({ ok: false, message })
  }
}
