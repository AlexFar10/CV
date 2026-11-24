import type { ReactNode } from 'react'

/** Listă cu marker pătrat roșu 8×8 px (motivul „pixel”). */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex max-w-[40em] flex-col gap-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3.5 text-lg leading-normal">
          <i aria-hidden className="mt-[11px] size-2 flex-none bg-accent" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}
