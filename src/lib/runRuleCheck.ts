/** Verifică într-un Web Worker că regula elevului merge și se termină; întoarce un mesaj de eroare sau null. */
export function runRuleCheck(code: string, timeoutMs = 1500): Promise<string | null> {
  return new Promise((resolve) => {
    let worker: Worker
    try {
      worker = new Worker(new URL('./rule.worker.ts', import.meta.url), { type: 'module' })
    } catch {
      resolve('Browserul nu poate porni un Web Worker, deci nu pot verifica regula în siguranță.')
      return
    }
    const done = (m: string | null) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(m)
    }
    const timer = setTimeout(() => done('Regula durează prea mult. Poate are o buclă infinită.'), timeoutMs)
    worker.onmessage = (e: MessageEvent<{ message: string | null }>) => done(e.data.message)
    worker.onerror = (ev) => done(`Eroare în worker: ${ev.message}`)
    worker.postMessage({ code })
  })
}
