import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Pagină de demo: kicker mono roșu, titlu Bricolage, lead; conținutul stă într-un container de 1080 px. */
export function Page({ kicker, title, lead, children, wide = false, back }: { kicker?: string; title: string; lead?: string; children: ReactNode; wide?: boolean; back?: { to: string; label: string } }) {
  return (
    <div className={`mx-auto px-5 pt-10 pb-20 min-[980px]:px-10 min-[980px]:pt-14 ${wide ? 'max-w-[1280px]' : 'max-w-[1080px]'}`}>
      {back ? (
        <Link to={back.to} className="mb-6 inline-block font-mono text-[13px] text-accent-hover underline">
          ← {back.label}
        </Link>
      ) : null}
      {kicker ? <p className="mb-3.5 font-mono text-[13px] tracking-[0.08em] text-accent-hover uppercase">{kicker}</p> : null}
      <h1 className="font-display text-[44px] leading-none font-bold tracking-[-0.035em] text-balance min-[980px]:text-[64px]">{title}</h1>
      {lead ? <p className="mt-[18px] max-w-[34em] text-xl leading-normal text-ink-muted text-pretty">{lead}</p> : null}
      <div className="mt-12 space-y-14">{children}</div>
    </div>
  )
}

/** Un pas: număr mono roșu, titlu h2 de 28 px și o linie subțire care umple rândul; conținutul dedesubt. */
export function Step({ n, title, children }: { n: number | string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`}>
      <div className="mb-5 flex items-center gap-3.5">
        <span className="font-mono text-[13px] text-accent-hover">{n}</span>
        <h2 id={`step-${n}`} className="font-display text-[28px] leading-tight font-bold tracking-[-0.02em]">
          {title}
        </h2>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>
      {children}
    </section>
  )
}

/** Titlu de bloc pentru paginile avansate (fără numerotare de pas). */
export function PageBlock({ id, title, lead, children }: { id?: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-t` : undefined} className="scroll-mt-6">
      <h2 id={id ? `${id}-t` : undefined} className="font-display text-[28px] leading-tight font-bold tracking-[-0.02em]">
        {title}
      </h2>
      {lead ? <p className="mt-2 max-w-[40em] text-ink-muted">{lead}</p> : null}
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  )
}
