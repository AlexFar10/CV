import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface SectionMeta {
  id: string
  num: string
  kicker: string
  title: string
  lead?: string
}

const EASE = [0.16, 1, 0.3, 1] as const

/** Secțiune cu antet: etichetă mono majusculă, titlu mare, text muted, număr-fantomă. */
export function Section({ meta, children }: { meta: SectionMeta; children: ReactNode }) {
  const reduced = useReducedMotion()
  const reveal = {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6, ease: EASE },
  }
  return (
    <section id={meta.id} aria-labelledby={`${meta.id}-t`} className="relative z-10 scroll-mt-10 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <motion.header {...reveal} className="relative mb-10 md:mb-12">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-2 font-mono text-[7rem] leading-none font-bold text-accent-soft select-none md:-left-16 md:text-[9rem]"
          >
            {meta.num}
          </span>
          <div className="relative">
            <p className="mb-3 font-mono text-sm font-medium tracking-[0.18em] text-accent-text uppercase">{meta.kicker}</p>
            <h2 id={`${meta.id}-t`} className="max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
              {meta.title}
            </h2>
            {meta.lead ? <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-muted">{meta.lead}</p> : null}
          </div>
        </motion.header>
        <motion.div {...reveal}>{children}</motion.div>
      </div>
    </section>
  )
}
