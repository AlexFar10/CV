import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { t } from '../../content/ro'
import { modules } from '../../app/modules'
import { Badge, Card, cx } from '../../components/ui/primitives'
import { Page } from '../../components/layout/Page'

export function Home() {
  return (
    <Page title={t.home.title} lead={t.home.lead}>
      <ul className="grid gap-4 md:grid-cols-2">
        {modules.map((m, i) => {
          const soon = m.status === 'soon' || !m.component
          const body = (
            <Card className={cx('h-full transition-colors', soon ? 'opacity-60' : 'hover:border-accent')}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                {soon ? <Badge tone="line">{t.home.soon}</Badge> : null}
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{m.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{m.description}</p>
              {soon ? null : (
                <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent-text">
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
      <p className="text-sm text-ink-muted">
        <b className="text-accent-text">{t.home.threadTitle}.</b> {t.home.threadText}{' '}
        <Link to="/recapitulare" className="font-medium text-accent-text underline">
          {t.home.threadLink}
        </Link>
      </p>
    </Page>
  )
}
