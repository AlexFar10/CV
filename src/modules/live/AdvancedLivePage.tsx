import { useCallback, useState } from 'react'
import { Page, PageBlock } from '../../components/layout/Page'
import { Card } from '../../components/ui/primitives'
import { live } from '../../content/live'
import { defaultRule, type State, type Thresholds } from '../../lib/drowsy'
import { LiveDemo } from './LiveDemo'
import { RuleEditor } from './RuleEditor'

type RuleFn = (ear: number, turn: number, closed: number, t: Thresholds) => State

export default function AdvancedLivePage() {
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
    <Page kicker="03 · Avansat" title="Ești atent la drum?: avansat" lead="Camera, rotirea capului, experimentul, regula ta și limitele sistemului." back={{ to: '/live', label: 'Înapoi la varianta simplă' }}>
      <LiveDemo rule={rule.fn} onRuleError={onRuleError} />
      <PageBlock title={live.ethics.title}>
        <div className="grid gap-6 md:grid-cols-3">
          {live.ethics.cards.map((c) => (
            <Card key={c.title}>
              <h3 className="font-semibold">{c.title}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-muted">{live.ethics.modelCard}</p>
      </PageBlock>
      <PageBlock title={live.rule.title}>
        <RuleEditor onRule={onRule} externalError={ruleError} />
      </PageBlock>
    </Page>
  )
}
