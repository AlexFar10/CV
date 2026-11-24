import { useState } from 'react'
import { Card, DemoButton } from '../../components/ui/primitives'
import { HintBox } from '../../components/learn/HintBox'
import { live } from '../../content/live'
import { DEFAULT_RULE_CODE, compileRule, defaultRule } from '../../lib/drowsy'
import { runRuleCheck } from '../../lib/runRuleCheck'
import type { Thresholds, State } from '../../lib/drowsy'

type RuleFn = (ear: number, turn: number, closed: number, t: Thresholds) => State

export const DEFAULT_RULE_FN: RuleFn = defaultRule

export function RuleEditor({ onRule, externalError }: { onRule: (f: RuleFn) => void; externalError: boolean }) {
  const r = live.rule
  const [code, setCode] = useState(DEFAULT_RULE_CODE)
  const [msg, setMsg] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  const apply = async () => {
    setBusy(true)
    setOk(false)
    const err = await runRuleCheck(code)
    setBusy(false)
    if (err) return setMsg(err)
    try {
      onRule(compileRule(code))
      setMsg(null)
      setOk(true)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label>
          <span className="block font-mono text-xs text-ink-muted">{r.label}</span>
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setOk(false)
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') void apply()
            }}
            rows={9}
            spellCheck={false}
            className="mt-1 w-full rounded-xl border border-line bg-paper-subtle p-3 font-mono text-[13px] leading-relaxed"
          />
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <DemoButton variant="solid" disabled={busy} onClick={() => void apply()}>
            {busy ? r.checking : r.apply}
          </DemoButton>
          <DemoButton
            variant="ghost"
            onClick={() => {
              setCode(DEFAULT_RULE_CODE)
              setMsg(null)
              setOk(false)
              onRule(DEFAULT_RULE_FN)
            }}
          >
            {r.reset}
          </DemoButton>
          <span className="font-mono text-xs text-ink-muted">Ctrl/⌘ + Enter</span>
          {ok ? <span role="status" className="text-sm text-emerald-800">{r.applied}</span> : null}
        </div>
        <p className="mt-2 text-xs text-ink-muted">{r.note}</p>
        {msg || externalError ? (
          <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{msg ?? live.errors.rule}</p>
        ) : null}
      </div>
      <HintBox title="Indicii pentru regulă" steps={r.hints} />
      <div className="grid gap-6 md:grid-cols-3">
        {[[r.challengesTitle, r.challenges], [r.aiTitle, r.ai], [r.mistakesTitle, r.mistakes]].map(([title, items]) => (
          <Card key={title as string}>
            <h3 className="font-semibold">{title as string}</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">{(items as string[]).map((c) => <li key={c}>{c}</li>)}</ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
