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
}

/** Slider cu etichetă, valoare afișată și control de la tastatură (săgeți). */
export function LabeledSlider({ label, value, min, max, step = 1, onChange, format, hint }: Props) {
  const id = useId()
  return (
    <div className="text-sm">
      <label htmlFor={id} className="flex justify-between gap-3 font-mono text-xs text-ink-muted">
        <span>{label}</span>
        <span className="text-ink tabular-nums">{format ? format(value) : value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2"
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
