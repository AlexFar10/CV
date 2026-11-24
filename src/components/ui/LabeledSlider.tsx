import { useId } from 'react'

interface Props {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  /** cum se afișează valoarea (implicit numărul) */
  format?: (v: number) => string
  hint?: string
  /** valoarea e un prag: se afișează cu roșu închis */
  threshold?: boolean
}

/** Slider cu etichetă, valoare afișată și control de la tastatură (săgeți). */
export function LabeledSlider({ label, value, min, max, step = 1, onChange, format, hint, threshold = false }: Props) {
  const id = useId()
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 font-mono text-[13px] text-ink-muted">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className={`text-[15px] tabular-nums ${threshold ? 'font-medium text-accent-hover' : 'text-ink'}`}>
          {format ? format(value) : value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
