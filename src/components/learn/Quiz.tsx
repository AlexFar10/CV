import { useId, useState } from 'react'
import { t } from '../../content/ro'
import { cx } from '../ui/primitives'

interface Props {
  question: string
  options: string[]
  correct: number
  explanation: string
  /** variante scurte (numere) pe un rând, cu font mono */
  compact?: boolean
}

/** Întrebare cu 3 variante; alegerea se verifică imediat. Corect: albastru de date; greșit: ink. Fără roșu/verde. */
export function Quiz({ question, options, correct, explanation, compact = false }: Props) {
  const id = useId()
  const [choice, setChoice] = useState<number | null>(null)
  const ok = choice === correct
  return (
    <div>
      <p id={id} className="font-display max-w-[26em] text-2xl leading-tight font-bold tracking-[-0.015em]">
        {question}
      </p>
      <div role="group" aria-labelledby={id} className={cx('mt-4 gap-2', compact ? 'flex flex-wrap' : 'flex max-w-[36em] flex-col')}>
        {options.map((o, i) => {
          const picked = choice === i
          return (
            <button
              key={o}
              type="button"
              aria-pressed={picked}
              onClick={() => setChoice(i)}
              className={cx(
                'min-h-[52px] cursor-pointer rounded-[4px] border-2 px-[18px] py-2.5 text-left text-base leading-snug text-ink transition-colors',
                compact && 'min-w-24 font-mono text-lg',
                picked ? (i === correct ? 'border-data bg-data-soft' : 'border-ink bg-band') : 'border-line-strong bg-paper hover:border-accent',
              )}
            >
              {o}
            </button>
          )
        })}
      </div>
      <p role="status" className="mt-3.5 min-h-12 max-w-[36em] text-base leading-normal text-ink-muted">
        {choice === null ? null : (
          <>
            <b className="text-ink">{ok ? t.quiz.right : t.quiz.wrong}</b> {ok ? explanation : ''}
          </>
        )}
      </p>
    </div>
  )
}
