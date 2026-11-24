import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost'
  active?: boolean
}

/** Buton pilulă folosit peste tot în demo-uri. */
export function DemoButton({ variant = 'outline', active = false, className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'solid' || active
          ? 'bg-accent text-white shadow-sm hover:opacity-90'
          : variant === 'ghost'
            ? 'text-ink-muted hover:bg-paper-subtle hover:text-ink'
            : 'border border-line bg-paper text-ink hover:border-accent hover:text-accent-text',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx('rounded-2xl border border-line bg-paper p-6 shadow-[0_1px_3px_rgb(15_23_42/0.04)]', className)}>
      {children}
    </div>
  )
}

export function Badge({ children, tone = 'soft' }: { children: ReactNode; tone?: 'soft' | 'line' }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-xs',
        tone === 'soft' ? 'bg-accent-soft text-accent-text' : 'border border-line text-ink-muted',
      )}
    >
      {children}
    </span>
  )
}

/** Notă tehnică mică (de exemplu „simulare simplificată”). */
export function FinePrint({ children }: { children: ReactNode }) {
  return <p className="mt-3 font-mono text-xs leading-relaxed text-ink-muted">{children}</p>
}

export function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <pre
      tabIndex={0}
      className={cx(
        'overflow-x-auto rounded-xl border border-line bg-paper-subtle p-4 font-mono text-[13px] leading-relaxed text-ink',
        className,
      )}
    >
      <code>{code}</code>
    </pre>
  )
}
