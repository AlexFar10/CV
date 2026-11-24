import { useCallback, useState } from 'react'
import { Section, type SectionMeta } from '../../components/layout/Section'
import { SideNav } from '../../components/layout/SideNav'
import { Card } from '../../components/ui/primitives'
import { live } from '../../content/live'
import { defaultRule, type State, type Thresholds } from '../../lib/drowsy'
import { LiveDemo } from './LiveDemo'
import { RuleEditor } from './RuleEditor'

type RuleFn = (ear: number, turn: number, closed: number, t: Thresholds) => State

const sections: SectionMeta[] = [
  { id: 'demo', num: '01', kicker: live.kicker, title: live.title, lead: live.lead },
  { id: 'etica', num: '02', kicker: live.ethics.kicker, title: live.ethics.title, lead: live.ethics.lead },
  { id: 'regula', num: '03', kicker: live.rule.kicker, title: live.rule.title, lead: live.rule.lead },
]

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
    <>
      <SideNav sections={sections} />
      <Section meta={sections[0]}>
        <LiveDemo rule={rule.fn} onRuleError={onRuleError} />
      </Section>
      <Section meta={sections[1]}>
        <div className="grid gap-6 md:grid-cols-3">
          {live.ethics.cards.map((c) => (
            <Card key={c.title}>
              <h3 className="font-semibold">{c.title}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-muted">{live.ethics.modelCard}</p>
      </Section>
      <Section meta={sections[2]}>
        <RuleEditor onRule={onRule} externalError={ruleError} />
      </Section>
    </>
  )
}
