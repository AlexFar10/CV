import { Suspense } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { t } from '../content/ro'
import { DemoButton } from '../components/ui/primitives'
import { Home } from '../modules/home/Home'
import { Layout } from './Layout'
import { modules } from './modules'

function NotFound() {
  return (
    <div className="px-6 py-24 text-center">
      <p className="mb-4">{t.app.notFound}</p>
      <Link to="/">
        <DemoButton variant="solid">{t.app.back}</DemoButton>
      </Link>
    </div>
  )
}

/** HashRouter: merge din orice folder sau hosting static, fără configurare de server. */
export function App() {
  return (
    <HashRouter>
      <Suspense fallback={<p className="px-6 py-24 text-center text-ink-muted">{t.app.loading}</p>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            {modules.flatMap((m) => {
              const C = m.component
              const A = m.advanced
              return [
                C ? <Route key={m.id} path={m.path} element={<C />} /> : null,
                A ? <Route key={`${m.id}-adv`} path={`${m.path}/avansat`} element={<A />} /> : null,
              ]
            })}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
