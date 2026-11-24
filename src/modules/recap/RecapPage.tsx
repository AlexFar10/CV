import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Section, type SectionMeta } from '../../components/layout/Section'
import { SideNav } from '../../components/layout/SideNav'
import { Quiz } from '../../components/learn/Quiz'
import { Badge, Card, cx } from '../../components/ui/primitives'
import { recap } from '../../content/recap'
import { ThresholdLab } from './ThresholdLab'

const sections: SectionMeta[] = [
  { id: 'fir', num: '01', kicker: recap.thread.kicker, title: recap.thread.title, lead: recap.lead },
  { id: 'compromis', num: '02', kicker: recap.lab.kicker, title: recap.lab.title, lead: recap.lab.lead },
  { id: 'parte2', num: '03', kicker: 'Mai departe', title: recap.part2.title },
]

export default function RecapPage() {
  return (
    <>
      <SideNav sections={sections} />
      <Section meta={sections[0]}>
        <ul className="grid gap-4 md:grid-cols-2">
          {recap.thread.items.map((it, i) => {
            const body = (
              <Card className={cx('h-full', it.to ? 'transition-colors hover:border-accent' : 'opacity-70')}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-muted">0{i + 1}</span>
                  {it.to ? null : <Badge tone="line">{recap.thread.soon}</Badge>}
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{it.place}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{it.text}</p>
                {it.to ? (
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent-text">
                    {it.where} <ArrowRight size={14} aria-hidden />
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-ink-muted">{it.where}</p>
                )}
              </Card>
            )
            return (
              <li key={it.place}>
                {it.to ? (
                  <Link to={it.to} className="block h-full rounded-2xl">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            )
          })}
        </ul>
      </Section>
      <Section meta={sections[1]}>
        <ThresholdLab />
        <div className="mt-10 max-w-2xl">
          <Quiz {...recap.quiz} options={recap.quiz.options} />
        </div>
      </Section>
      <Section meta={sections[2]}>
        <Card className="bg-accent-soft/50">
          <p className="max-w-3xl leading-relaxed">{recap.part2.text}</p>
        </Card>
      </Section>
    </>
  )
}
