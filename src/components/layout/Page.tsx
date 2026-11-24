import type { ReactNode } from 'react'

/** Pagină simplă: titlu mare, o frază, apoi conținutul. Fără numere, fără navigare laterală. */
export function Page({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight text-balance md:text-5xl">{title}</h1>
      {lead ? <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-muted">{lead}</p> : null}
      <div className="mt-8 space-y-8">{children}</div>
    </div>
  )
}

/** Un bloc cu titlu propriu, pentru pagini cu mai multe demo-uri (ex. mod noapte + portret). */
export function PageBlock({ id, title, lead, children }: { id?: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-t` : undefined} className="scroll-mt-6 border-t border-line pt-8 first:border-t-0 first:pt-0">
      <h2 id={id ? `${id}-t` : undefined} className="text-2xl font-bold tracking-tight md:text-3xl">
        {title}
      </h2>
      {lead ? <p className="mt-2 max-w-3xl text-ink-muted">{lead}</p> : null}
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  )
}
