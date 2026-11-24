import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * „Vrei mai mult?”: partea avansată, închisă implicit. Conținutul se montează abia la prima deschidere
 * (nu consumă calcul cât timp e închis) și rămâne montat după aceea, ca să nu-și piardă starea.
 */
export function More({ title, children }: { title: string; children: ReactNode }) {
  const [opened, setOpened] = useState(false)
  return (
    <details onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && setOpened(true)} className="group rounded-2xl border border-line bg-paper">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
        <span>
          <span className="mr-2 font-mono text-xs font-normal text-accent-text">Vrei mai mult?</span>
          {title}
        </span>
        <ChevronDown size={18} aria-hidden className="shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-line p-5">{opened ? children : null}</div>
    </details>
  )
}
