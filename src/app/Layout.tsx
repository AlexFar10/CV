import { NavLink, Outlet } from 'react-router-dom'
import { t } from '../content/ro'
import { cx } from '../components/ui/primitives'
import { modules } from './modules'

export function Layout() {
  const active = modules.filter((m) => m.status !== 'soon')
  return (
    <div className="flex min-h-dvh flex-col bg-ground">
      <a
        href="#continut"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('continut')?.focus()
        }}
        className="sr-only z-50 rounded-[4px] bg-paper px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t.app.skip}
      </a>
      <header className="border-b border-line bg-ground">
        <div className="mx-auto flex min-h-[68px] max-w-[1280px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 min-[980px]:px-10">
          <NavLink to="/" end className="flex items-center gap-3">
            <span aria-hidden className="grid size-6 grid-cols-2 gap-0.5">
              <i className="bg-ink" />
              <i className="bg-accent" />
              <i className="bg-accent" />
              <i className="bg-ink" />
            </span>
            <span className="font-display text-[19px] font-bold tracking-[-0.01em]">{t.app.short}</span>
          </NavLink>
          <nav aria-label={t.app.nav} className="flex flex-wrap gap-x-7 gap-y-1 text-[15px]">
            {active.map((m) => (
              <NavLink
                key={m.id}
                to={`/${m.path}`}
                className={({ isActive }) =>
                  cx(
                    'border-b-2 pt-[21px] pb-[19px] transition-colors',
                    isActive ? 'border-accent font-medium text-ink' : 'border-transparent text-ink-muted hover:text-accent-hover',
                  )
                }
              >
                {m.nav}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="continut" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-x-6 gap-y-2 px-5 py-7 font-mono text-[13px] text-ink-faint min-[980px]:px-10">
          <span>{t.app.footer}</span>
          <span>Imagini de test: scikit-image, CC0</span>
        </div>
      </footer>
    </div>
  )
}
