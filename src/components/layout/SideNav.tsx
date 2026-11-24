import { useEffect, useState } from 'react'
import { cx } from '../ui/primitives'
import type { SectionMeta } from './Section'

/** Navigare laterală cu puncte, doar pe ecrane mari. Folosește scroll programatic (nu #hash, care e luat de router). */
export function SideNav({ sections }: { sections: SectionMeta[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')
  const key = sections.map((s) => s.id).join('|')

  useEffect(() => {
    const ids = key.split('|').filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [key])

  const go = (id: string) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <nav aria-label="Secțiunile paginii" className="fixed top-1/2 left-5 z-40 hidden -translate-y-1/2 flex-col gap-1 xl:flex">
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => go(s.id)}
          aria-current={active === s.id ? 'true' : undefined}
          className={cx(
            'group flex cursor-pointer items-center gap-3 rounded-full py-1.5 pr-3 pl-1.5 transition-colors',
            active === s.id ? 'text-ink' : 'text-ink-muted hover:text-ink',
          )}
        >
          <span
            className={cx(
              'block h-2 w-2 rounded-[3px] transition-all duration-300',
              active === s.id ? 'scale-125 bg-accent' : 'bg-line group-hover:bg-ink-muted/40',
            )}
          />
          <span
            className={cx(
              'font-mono text-[11px] tracking-wide whitespace-nowrap transition-opacity duration-300',
              active === s.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-80 group-focus-visible:opacity-80',
            )}
          >
            {s.num} · {s.kicker}
          </span>
        </button>
      ))}
    </nav>
  )
}
