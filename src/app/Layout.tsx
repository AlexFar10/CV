import { NavLink, Outlet } from 'react-router-dom'
import { t } from '../content/ro'
import { cx } from '../components/ui/primitives'
import { modules } from './modules'

export function Layout() {
  const active = modules.filter((m) => m.status !== 'soon')
  return (
    <div className="relative flex min-h-dvh flex-col">
      <a
        href="#continut"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('continut')?.focus()
        }}
        className="sr-only z-50 rounded bg-paper px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t.app.skip}
      </a>
      <header className="relative z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3">
          <NavLink to="/" end className="flex items-center gap-2 font-semibold tracking-tight">
            <span aria-hidden className="grid h-6 w-6 grid-cols-2 gap-0.5">
              <i className="rounded-[2px] bg-accent" />
              <i className="rounded-[2px] bg-accent/40" />
              <i className="rounded-[2px] bg-accent/40" />
              <i className="rounded-[2px] bg-accent" />
            </span>
            {t.app.short}
          </NavLink>
          <nav aria-label={t.app.nav} className="flex flex-wrap gap-1">
            {active.map((m) => (
              <NavLink
                key={m.id}
                to={`/${m.path}`}
                className={({ isActive }) =>
                  cx(
                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                    isActive ? 'bg-accent-soft font-medium text-accent-text' : 'text-ink-muted hover:text-ink',
                  )
                }
              >
                {m.title}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="continut" tabIndex={-1} className="relative z-10 flex-1 outline-none">
        <Outlet />
      </main>
      <footer className="relative z-10 border-t border-line px-6 py-6 text-center font-mono text-xs text-ink-muted">{t.app.footer}</footer>
    </div>
  )
}
