import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageCanvas } from '../../components/image/ImageCanvas'
import { ImagePicker } from '../../components/image/ImagePicker'
import { Bullets } from '../../components/learn/Bullets'
import { Quiz } from '../../components/learn/Quiz'
import { Page, Step } from '../../components/layout/Page'
import { More } from '../../components/ui/More'
import { Stage, StageLabel } from '../../components/ui/Stage'
import { LabeledSlider } from '../../components/ui/LabeledSlider'
import { cx } from '../../components/ui/primitives'
import { filterText, simple } from '../../content/filters'
import { useThrottled } from '../../hooks/useThrottled'
import { FILTER_BY_ID, type FilterId } from '../../lib/filters'
import type { Img } from '../../lib/image'

type Mode = (typeof simple.modes)[number]

const fmt = (v: number, step: number) => (step >= 1 ? String(v) : v.toFixed(2)).replace('.', ',')

export default function FiltersPage() {
  const [src, setSrc] = useState<Img | null>(null)
  const [mode, setMode] = useState<Mode['id']>('brightness')
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries(simple.modes.map((m) => [m.id, m.start])))
  const cur = simple.modes.find((m) => m.id === mode)!
  const def = FILTER_BY_ID[mode as FilterId]
  const param = def.params[0]
  const text = filterText[mode as FilterId]
  const value = vals[mode]

  const tv = useThrottled(value, 60)
  const out = useMemo(() => (src ? def.apply(src, cur.key ? { [cur.key]: tv } : {}) : null), [src, def, cur.key, tv])

  return (
    <Page kicker={simple.kicker} title={simple.title} lead={simple.lead}>
      <Step n={1} title={simple.idea.title}>
        <Bullets items={simple.idea.items.map((s) => <span key={s} dangerouslySetInnerHTML={{ __html: s }} />)} />
      </Step>

      <Step n={2} title={simple.try.title}>
        <div role="group" aria-label={simple.try.pick} className="mb-5 flex flex-wrap gap-2">
          {simple.modes.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cx(
                'min-h-11 cursor-pointer rounded-[4px] border px-5 text-[15px] font-medium transition-colors',
                mode === m.id ? 'border-ink bg-ink text-white' : 'border-line-strong bg-paper text-ink hover:border-accent hover:text-accent-hover',
              )}
            >
              {filterText[m.id as FilterId].name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
          <Stage as="figure" className="aspect-[451/300]">
            {src ? <ImageCanvas img={src} role="img" aria-label="Imaginea originală" className="absolute inset-0 size-full object-cover" /> : null}
            <StageLabel>{simple.try.original}</StageLabel>
          </Stage>
          <Stage as="figure" className="aspect-[451/300]">
            {out ? <ImageCanvas img={out} role="img" aria-label={`Imaginea după filtrul ${text.name}`} className="absolute inset-0 size-full object-cover" /> : null}
            <StageLabel strong>
              {simple.try.result} · {text.name}
            </StageLabel>
          </Stage>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-4 rounded-[6px] border border-line bg-paper px-6 py-5">
          <div className="min-w-0 flex-[1_1_300px]">
            <p className="font-mono text-[11px] tracking-[0.06em] text-ink-faint uppercase">{simple.try.formula}</p>
            <p className="mt-1.5 font-mono text-lg leading-snug whitespace-pre-wrap">{text.formula.split('\n')[0]}</p>
            <p className="mt-2 text-[15px] leading-snug text-ink-muted">{text.what}</p>
          </div>
          <div className="min-w-0 flex-[1_1_300px]">
            {param ? (
              <LabeledSlider
                label={text.params[param.key]}
                value={value}
                min={param.min}
                max={param.max}
                step={param.step}
                threshold={mode === 'threshold'}
                format={(v) => fmt(v, param.step)}
                onChange={(v) => setVals({ ...vals, [mode]: v })}
              />
            ) : (
              <p className="font-mono text-[13px] text-ink-faint">{simple.try.noSlider}</p>
            )}
          </div>
        </div>

        {mode === 'threshold' ? (
          <p className="mt-4 max-w-[34em] border-t-2 border-accent pt-3 text-[15px] leading-normal text-ink-muted">
            <b className="font-display text-base text-accent-hover">{simple.thread.head}</b> {simple.thread.text}
          </p>
        ) : null}

        <div className="mt-6">
          <ImagePicker initial="chelsea" onChange={(img) => setSrc(img)} />
        </div>
      </Step>

      <Step n={3} title={simple.check.title}>
        <Quiz question={simple.check.question} options={[...simple.check.options]} correct={simple.check.correct} explanation={simple.check.explanation} compact />
      </Step>

      <More title={simple.more.title}>
        <p className="max-w-[40em] text-[15px] leading-normal text-ink-muted">{simple.more.text}</p>
        <Link to="/filtre/avansat" className="mt-3 inline-block font-medium text-accent-hover underline">
          {simple.more.link} →
        </Link>
      </More>
    </Page>
  )
}
