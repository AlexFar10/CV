import type { ReactNode } from 'react'
import { cx } from './primitives'

/** Panou închis („masa de lumină”) pentru imagini, grafice, cameră. */
export function Stage({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'figure' }) {
  return <Tag className={cx('relative m-0 overflow-hidden rounded-[6px] bg-stage text-stage-text', className)}>{children}</Tag>
}

/** Etichetă peste imagine; `strong` = eticheta „Rezultat” (fundal accent). */
export function StageLabel({ children, strong = false, className }: { children: ReactNode; strong?: boolean; className?: string }) {
  return (
    <span
      className={cx(
        'absolute top-3 rounded-[2px] px-2 py-[3px] font-mono text-[11px]',
        strong ? 'bg-accent text-white' : 'bg-stage text-stage-text',
        className ?? 'left-3',
      )}
    >
      {children}
    </span>
  )
}
