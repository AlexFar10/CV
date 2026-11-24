import { Link } from 'react-router-dom'
import { recap } from '../../content/recap'

/** „Firul roșu”: aceeași linie cu 4 puncte (pixeli, mască, ochi, probabilitate), folosită pe Acasă și în Recapitulare. */
export function ThresholdThread({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-x-7 gap-y-10 ${compact ? 'grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))]' : 'grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-x-8'}`}>
      {recap.thread.items.map((it) => {
        const real = Boolean(it.to)
        return (
          <div key={it.place} className={`border-t-[3px] border-accent ${real ? '' : 'border-dashed'}`}>
            {real ? (
              <span aria-hidden className="-mt-[9.5px] block size-4 rounded-full bg-accent" />
            ) : (
              <span aria-hidden className="-mt-[9.5px] box-content block size-3 rounded-full border-2 border-accent bg-ground" />
            )}
            <h3 className={`font-display mt-5 mb-2 font-bold tracking-[-0.015em] ${compact ? 'text-[22px]' : 'text-2xl'}`}>{it.place}</h3>
            <p className="mb-3.5 text-[15px] leading-[1.55] text-ink-muted">{compact ? it.short : it.text}</p>
            {real ? (
              <Link to={it.to} className="font-mono text-[13px] text-accent-hover underline hover:text-accent">
                {compact ? it.nav : it.where}
              </Link>
            ) : (
              <span className="font-mono text-[13px] text-ink-faint">Partea 2 · în curând</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
