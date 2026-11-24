import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { t } from '../../content/ro'
import { modules } from '../../app/modules'
import { Badge, Card, cx } from '../../components/ui/primitives'

export function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <p className="mb-3 font-mono text-sm font-medium tracking-[0.18em] text-accent-text uppercase">{t.home.kicker}</p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">{t.home.title}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-muted md:text-xl">{t.home.lead}</p>

      <Card className="mt-10 bg-accent-soft/50">
        <p className="font-mono text-xs tracking-wide text-accent-text uppercase">{t.home.threadTitle}</p>
        <p className="mt-2 max-w-3xl leading-relaxed">{t.home.threadText}</p>
        <Link to="/recapitulare" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent-text">
          {t.home.threadLink} <ArrowRight size={14} aria-hidden />
        </Link>
      </Card>

      <h2 className="mt-16 mb-2 text-2xl font-bold tracking-tight">{t.home.modules}</h2>
      <p className="mb-6 text-sm text-ink-muted">{t.home.levels}</p>
      <ul className="grid gap-4 md:grid-cols-2">
        {modules.map((m, i) => {
          const soon = m.status === 'soon' || !m.component
          const body = (
            <Card className={cx('h-full transition-colors', soon ? 'opacity-60' : 'hover:border-accent')}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                {soon ? <Badge tone="line">{t.home.soon}</Badge> : m.status === 'building' ? <Badge tone="line">în lucru</Badge> : null}
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{m.description}</p>
              {soon ? null : (
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-text">
                  {t.home.open} <ArrowRight size={14} aria-hidden />
                </p>
              )}
            </Card>
          )
          return (
            <li key={m.id}>
              {soon ? (
                <div aria-disabled="true">{body}</div>
              ) : (
                <Link to={`/${m.path}`} className="block h-full rounded-2xl">
                  {body}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
