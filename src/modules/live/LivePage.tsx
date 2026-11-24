import { useCallback, useState } from 'react'
import { Page } from '../../components/layout/Page'
import { More } from '../../components/ui/More'
import { Card } from '../../components/ui/primitives'
import { live } from '../../content/live'
import { defaultRule, type State, type Thresholds } from '../../lib/drowsy'
import { LiveDemo } from './LiveDemo'
import { RuleEditor } from './RuleEditor'

type RuleFn = (ear: number, turn: number, closed: number, t: Thresholds) => State

export default function LivePage() {
  // React tratează o funcție dată lui setState ca „updater”, deci o împachetăm
  const [rule, setRule] = useState<{ fn: RuleFn }>({ fn: defaultRule })
  const [ruleError, setRuleError] = useState(false)
  const onRule = useCallback((f: RuleFn) => {
    setRuleError(false)
    setRule({ fn: f })
  }, [])
  const onRuleError = useCallback(() => {
    setRuleError(true)
    setRule({ fn: defaultRule })
  }, [])

  return (
    <Page title={live.title} lead="Camera urmărește ochii și capul. Dacă stai cu ochii închiși sau întorci capul, apare alarma.">
      <LiveDemo rule={rule.fn} onRuleError={onRuleError} />
      <More title={live.ethics.title}>
        <div className="grid gap-6 md:grid-cols-3">
          {live.ethics.cards.map((c) => (
            <Card key={c.title}>
              <h3 className="font-semibold">{c.title}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-muted">{live.ethics.modelCard}</p>
      </More>
      <More title={live.rule.title}>
        <RuleEditor onRule={onRule} externalError={ruleError} />
      </More>
    </Page>
  )
}
