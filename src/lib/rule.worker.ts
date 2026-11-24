/// <reference lib="webworker" />
import { checkRule, compileRule, RuleError } from './drowsy'

// Verifică regula elevului într-un Worker (o buclă infinită nu blochează pagina).
for (const k of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'indexedDB']) {
  try {
    Object.defineProperty(self, k, { value: undefined, configurable: true })
  } catch {
    /* nu contează */
  }
}

self.onmessage = (e: MessageEvent<{ code: string }>) => {
  try {
    self.postMessage({ message: checkRule(compileRule(e.data.code)) })
  } catch (err) {
    self.postMessage({ message: err instanceof RuleError ? err.message : `Eroare neașteptată: ${String(err)}` })
  }
}
