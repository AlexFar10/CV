import { useId, useState, type ReactNode } from 'react'
import { glossary } from '../../content/glossary'

/** Termen din glosar: se subliniază punctat, iar la click/Enter apare explicația. */
export function Term({ id, children }: { id: keyof typeof glossary | string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const panel = useId()
  const def = glossary[id]
  if (!def) return <>{children}</>
  return (
    <span className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="cursor-help border-b border-dotted border-accent-text text-accent-text"
      >
        {children}
      </button>
      {open ? (
        <span
          id={panel}
          role="note"
          className="absolute top-full left-0 z-30 mt-1 block w-64 rounded-xl border border-line bg-paper p-3 text-left text-xs leading-relaxed font-normal text-ink shadow-lg"
        >
          {def}
        </span>
      ) : null}
    </span>
  )
}
