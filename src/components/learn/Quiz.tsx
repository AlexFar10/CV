import { useId, useState } from 'react'
import { t } from '../../content/ro'
import { DemoButton, cx } from '../ui/primitives'

interface Props {
  question: string
  options: string[]
  correct: number
  explanation: string
}

/** Întrebare cu variante; răspunsul nu e afișat până nu verifici. */
export function Quiz({ question, options, correct, explanation }: Props) {
  const name = useId()
  const [choice, setChoice] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const ok = checked && choice === correct
  return (
    <fieldset className="rounded-2xl border border-line p-5">
      <legend className="px-2 text-sm font-semibold">{question}</legend>
      <div className="space-y-2">
        {options.map((o, i) => (
          <label
            key={i}
            className={cx(
              'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm',
              checked && i === correct ? 'border-accent bg-accent-soft' : 'border-line',
            )}
          >
            <input
              type="radio"
              name={name}
              checked={choice === i}
              onChange={() => {
                setChoice(i)
                setChecked(false)
              }}
              className="accent-accent"
            />
            {o}
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <DemoButton disabled={choice === null} onClick={() => setChecked(true)}>
          {t.quiz.check}
        </DemoButton>
        <p role="status" className="text-sm">
          {checked ? (ok ? `${t.quiz.right} ${explanation}` : t.quiz.wrong) : ''}
        </p>
      </div>
    </fieldset>
  )
}
