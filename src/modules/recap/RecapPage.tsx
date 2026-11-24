import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Page, PageBlock } from '../../components/layout/Page'
import { Quiz } from '../../components/learn/Quiz'
import { Badge, Card, cx } from '../../components/ui/primitives'
import { recap } from '../../content/recap'
import { ThresholdLab } from './ThresholdLab'

export default function RecapPage() {
  return (
    <Page title={recap.title} lead={recap.lead}>
      <ul className="grid gap-4 md:grid-cols-2">
        {recap.thread.items.map((it, i) => {
          const body = (
            <Card className={cx('h-full', it.to ? 'transition-colors hover:border-accent' : 'opacity-70')}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink-muted">0{i + 1}</span>
                {it.to ? null : <Badge tone="line">{recap.thread.soon}</Badge>}
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{it.place}</h2>
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
      <PageBlock title={recap.lab.title} lead={recap.lab.lead}>
        <ThresholdLab />
        <div className="max-w-2xl">
          <Quiz {...recap.quiz} options={recap.quiz.options} />
        </div>
      </PageBlock>
      <p className="max-w-3xl text-sm text-ink-muted">{recap.part2.text}</p>
    </Page>
  )
}
