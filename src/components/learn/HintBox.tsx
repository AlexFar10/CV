import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { t } from '../../content/ro'
import { DemoButton } from '../ui/primitives'

export interface HintStep {
  /** etichetă scurtă; implicit „Întrebare / Indiciu / Exemplu” */
  label?: string
  text: string
}

/** Indicii în trepte, închise implicit: întâi o întrebare, apoi un indiciu, apoi (doar la cerere) un exemplu. */
export function HintBox({ title = t.hint.title, steps }: { title?: string; steps: HintStep[] }) {
  const [shown, setShown] = useState(0)
  return (
    <div className="rounded-2xl border border-line bg-paper-subtle p-5">
      <p className="flex items-center gap-2 font-mono text-xs tracking-wide text-accent-text uppercase">
        <Lightbulb size={14} aria-hidden /> {title}
      </p>
      <ol className="mt-3 space-y-3" aria-live="polite">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i} className="text-sm leading-relaxed">
            <span className="mr-2 font-mono text-xs text-ink-muted">{s.label ?? t.hint.stage[Math.min(i, 2)]}</span>
            {s.text}
          </li>
        ))}
      </ol>
      {shown < steps.length ? (
        <DemoButton className="mt-3" onClick={() => setShown((n) => n + 1)}>
          {t.hint.show} ({shown}/{steps.length})
        </DemoButton>
      ) : (
        <p className="mt-3 text-xs text-ink-muted">{t.hint.done}</p>
      )}
    </div>
  )
}
