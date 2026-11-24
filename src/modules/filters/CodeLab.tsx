import { useRef, useState } from 'react'
import { DEFAULT_USER_CODE } from '../../lib/userFilter'
import { runUserFilter } from '../../lib/runUserFilter'
import type { Img } from '../../lib/image'
import { BeforeAfter } from '../../components/image/BeforeAfter'
import { DemoButton } from '../../components/ui/primitives'
import { codeLab } from '../../content/filters'

export function CodeLab({ src }: { src: Img }) {
  const [code, setCode] = useState(DEFAULT_USER_CODE)
  const [out, setOut] = useState<Img | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const runId = useRef(0)

  const run = async () => {
    const id = ++runId.current
    setBusy(true)
    setError('')
    const res = await runUserFilter(code, src)
    if (id !== runId.current) return
    setBusy(false)
    if (res.ok) setOut(res.img)
    else setError(res.message)
  }

  return (
    <div>
      <h3 className="text-xl font-bold tracking-tight">{codeLab.title}</h3>
      <p className="mt-2 text-sm text-ink-muted">{codeLab.lead}</p>
      <label className="mt-4 block">
        <span className="block font-mono text-xs text-ink-muted">{codeLab.label}</span>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') void run()
          }}
          rows={6}
          spellCheck={false}
          className="mt-1 w-full rounded-xl border border-line bg-paper-subtle p-3 font-mono text-[13px] leading-relaxed"
        />
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <DemoButton variant="solid" disabled={busy} onClick={() => void run()}>
          {busy ? codeLab.running : codeLab.run}
        </DemoButton>
        <DemoButton
          variant="ghost"
          onClick={() => {
            setCode(DEFAULT_USER_CODE)
            setError('')
            setOut(null)
            runId.current++
            setBusy(false)
          }}
        >
          {codeLab.reset}
        </DemoButton>
        <span className="font-mono text-xs text-ink-muted">Ctrl/⌘ + Enter</span>
      </div>
      {error ? (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {out ? (
        <div className="mt-4">
          <BeforeAfter before={src} after={out} alt={codeLab.alt} />
        </div>
      ) : null}
    </div>
  )
}
