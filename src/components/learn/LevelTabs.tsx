import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { t } from '../../content/ro'
import { cx } from '../ui/primitives'

export type LevelId = 'play' | 'change' | 'discover'
const ORDER: LevelId[] = ['play', 'change', 'discover']

interface Props {
  /** conținutul fiecărui nivel; un nivel lipsă nu apare */
  levels: Partial<Record<LevelId, ReactNode>>
  initial?: LevelId
}

/** Cele trei niveluri ale unui modul (Joacă / Schimbă / Descoperă), ca tab-uri accesibile. */
export function LevelTabs({ levels, initial = 'play' }: Props) {
  const base = useId()
  const available = ORDER.filter((l) => levels[l] != null)
  const [active, setActive] = useState<LevelId>(available.includes(initial) ? initial : available[0])
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  const onKey = (e: KeyboardEvent, i: number) => {
    let next = i
    if (e.key === 'ArrowRight') next = (i + 1) % available.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + available.length) % available.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = available.length - 1
    else return
    e.preventDefault()
    setActive(available[next])
    refs.current[available[next]]?.focus()
  }

  const hints: Record<LevelId, string> = { play: t.levels.playHint, change: t.levels.changeHint, discover: t.levels.discoverHint }
  const names: Record<LevelId, string> = { play: t.levels.play, change: t.levels.change, discover: t.levels.discover }

  return (
    <div>
      <div role="tablist" aria-label={t.levels.label} className="mb-6 flex flex-wrap gap-2">
        {available.map((l, i) => (
          <button
            key={l}
            ref={(el) => {
              refs.current[l] = el
            }}
            role="tab"
            type="button"
            id={`${base}-tab-${l}`}
            aria-selected={active === l}
            aria-controls={`${base}-panel-${l}`}
            tabIndex={active === l ? 0 : -1}
            onClick={() => setActive(l)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx(
              'cursor-pointer rounded-full border px-4 py-2 text-left text-sm font-medium transition-colors',
              active === l ? 'border-accent bg-accent text-white' : 'border-line bg-paper text-ink hover:border-accent',
            )}
          >
            <span className="font-mono text-xs opacity-80">{ORDER.indexOf(l) + 1} · </span>
            {names[l]}
          </button>
        ))}
        <p className="basis-full text-sm text-ink-muted">{hints[active]}</p>
      </div>
      {available.map((l) => (
        <div
          key={l}
          role="tabpanel"
          id={`${base}-panel-${l}`}
          aria-labelledby={`${base}-tab-${l}`}
          hidden={active !== l}
          tabIndex={0}
        >
          {active === l ? levels[l] : null}
        </div>
      ))}
    </div>
  )
}
