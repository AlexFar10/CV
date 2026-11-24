import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * „Vrei mai mult?”: partea avansată, închisă implicit. Conținutul se montează abia la prima deschidere
 * (nu consumă calcul cât timp e închis) și rămâne montat după aceea, ca să nu-și piardă starea.
 */
export function More({ title, children }: { title: string; children: ReactNode }) {
  const [opened, setOpened] = useState(false)
  return (
    <details onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && setOpened(true)} className="group rounded-[6px] border border-line bg-paper">
      <summary className="flex min-h-[68px] cursor-pointer list-none items-center justify-between gap-4 px-6 [&::-webkit-details-marker]:hidden">
        <span className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <span className="font-mono text-xs text-accent-hover">Vrei mai mult?</span>
          <span className="font-display text-xl font-bold tracking-[-0.01em]">{title}</span>
        </span>
        <ChevronDown size={20} aria-hidden className="shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-line p-6">{opened ? children : null}</div>
    </details>
  )
}
