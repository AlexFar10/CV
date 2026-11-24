import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost'
  /** selectat (aria-pressed) = fundal ink */
  active?: boolean
}

/** Buton dreptunghiular (rază 4 px, înălțime minimă 44 px). */
export function DemoButton({ variant = 'outline', active = false, className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[4px] px-5 text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? 'border border-ink bg-ink text-white'
          : variant === 'solid'
            ? 'bg-accent text-white hover:bg-accent-hover'
            : variant === 'ghost'
              ? 'text-ink-muted hover:text-accent-hover'
              : 'border border-line-strong bg-paper text-ink hover:border-accent hover:text-accent-hover',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-[6px] border border-line bg-paper p-6', className)}>{children}</div>
}

export function Badge({ children, tone = 'soft' }: { children: ReactNode; tone?: 'soft' | 'line' }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-[2px] border px-2.5 py-1 font-mono text-xs tracking-[0.06em] uppercase',
        tone === 'soft' ? 'border-accent text-accent-hover' : 'border-line-strong text-ink-faint',
      )}
    >
      {children}
    </span>
  )
}

/** Notă tehnică mică (de exemplu „simulare simplificată”). */
export function FinePrint({ children }: { children: ReactNode }) {
  return <p className="mt-3 font-mono text-xs leading-relaxed text-ink-faint">{children}</p>
}

export function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <pre
      tabIndex={0}
      className={cx(
        'overflow-x-auto rounded-[6px] border border-line bg-paper-subtle p-4 font-mono text-[13px] leading-relaxed text-ink',
        className,
      )}
    >
      <code>{code}</code>
    </pre>
  )
}
