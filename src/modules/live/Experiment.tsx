import { useState } from 'react'
import { DemoButton, FinePrint } from '../../components/ui/primitives'
import { live } from '../../content/live'
import type { State } from '../../lib/drowsy'

/** Experiment ghidat: pași scurți + numărarea alarmelor false și ratate, apoi un rezumat al compromisului. */
export function Experiment({ current }: { current: State }) {
  const ex = live.experiment
  const [step, setStep] = useState(0)
  const [falseN, setFalseN] = useState(0)
  const [missedN, setMissedN] = useState(0)
  const [summary, setSummary] = useState(false)
  const s = ex.steps[step]

  const reset = () => {
    setStep(0)
    setFalseN(0)
    setMissedN(0)
    setSummary(false)
  }

  return (
    <div>
      <p className="text-sm text-ink-muted">{ex.lead}</p>

      <div className="mt-4 rounded-[6px] border border-line bg-paper-subtle p-4">
        <p className="font-mono text-xs text-ink-muted">{ex.stepOf(step + 1, ex.steps.length)}</p>
        <p className="mt-1 font-medium">{s.text}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {ex.expected} <b>{live.states[s.expect as State]}</b> · acum: <b>{live.states[current]}</b>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <DemoButton disabled={step === 0} onClick={() => setStep(step - 1)}>{ex.prev}</DemoButton>
          <DemoButton disabled={step === ex.steps.length - 1} onClick={() => setStep(step + 1)}>{ex.next}</DemoButton>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <DemoButton onClick={() => setFalseN(falseN + 1)}>{ex.falseAlarm} (+1)</DemoButton>
          <FinePrint>{ex.falseHelp}</FinePrint>
        </div>
        <div>
          <DemoButton onClick={() => setMissedN(missedN + 1)}>{ex.missed} (+1)</DemoButton>
          <FinePrint>{ex.missedHelp}</FinePrint>
        </div>
      </div>
      <p role="status" className="mt-3 font-mono text-sm">
        {ex.falseCount(falseN)} · {ex.missedCount(missedN)}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <DemoButton variant="solid" onClick={() => setSummary(true)}>{ex.summary}</DemoButton>
        <DemoButton variant="ghost" onClick={reset}>{ex.reset}</DemoButton>
      </div>

      {summary ? (
        <div className="mt-4 space-y-3 rounded-[6px] border border-accent bg-accent-soft/40 p-4 text-sm leading-relaxed">
          <p className="font-semibold">{ex.summaryTitle}</p>
          <p>{falseN > missedN ? ex.verdictFalse : missedN > falseN ? ex.verdictMissed : ex.verdictBalanced}</p>
          <p>{ex.tradeoff}</p>
          <p>{ex.part2}</p>
        </div>
      ) : null}
    </div>
  )
}
