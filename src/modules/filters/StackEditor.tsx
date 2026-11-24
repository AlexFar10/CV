import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { FILTERS, FILTER_BY_ID, defaultParams, type FilterId, type StackItem } from '../../lib/filters'
import { BUILT_IN, nextUid, toStack } from '../../lib/presets'
import { filterText, kindLabel, presetNames, studioText } from '../../content/filters'
import { Badge, DemoButton, cx } from '../../components/ui/primitives'
import { LabeledSlider } from '../../components/ui/LabeledSlider'

interface Props {
  stack: StackItem[]
  onChange: (s: StackItem[]) => void
}

function decimals(step: number): number {
  return step >= 1 ? 0 : String(step).split('.')[1]?.length ?? 0
}

export function StackEditor({ stack, onChange }: Props) {
  const update = (uid: number, patch: Partial<StackItem>) => onChange(stack.map((s) => (s.uid === uid ? { ...s, ...patch } : s)))
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= stack.length) return
    const next = [...stack]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const add = (id: FilterId) => onChange([...stack, { uid: nextUid(), id, params: defaultParams(id), enabled: true }])

  return (
    <div>
      <p className="mb-2 font-mono text-xs text-ink-muted">{studioText.presets}</p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(BUILT_IN) as (keyof typeof BUILT_IN)[]).map((k) => (
          <DemoButton key={k} onClick={() => onChange(toStack(BUILT_IN[k]))}>
            {presetNames[k]}
          </DemoButton>
        ))}
        <DemoButton variant="ghost" onClick={() => onChange([])} disabled={stack.length === 0}>
          {studioText.clear}
        </DemoButton>
      </div>

      <p className="mt-5 mb-2 font-mono text-xs text-ink-muted">{studioText.add}</p>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => add(f.id)}
            className="cursor-pointer rounded-full border border-line px-3 py-1 text-xs hover:border-accent hover:text-accent-text"
          >
            + {filterText[f.id].name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-muted">{studioText.rule}</p>

      {stack.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-line p-4 text-sm text-ink-muted">{studioText.empty}</p> : null}

      <ol className="mt-5 space-y-3">
        {stack.map((it, i) => {
          const def = FILTER_BY_ID[it.id]
          const tx = filterText[it.id]
          return (
            <li key={it.uid} className={cx('rounded-2xl border border-line bg-paper p-4', !it.enabled && 'opacity-60')}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-ink-muted">{i + 1}.</span>
                <h3 className="text-base font-semibold">{tx.name}</h3>
                <Badge tone={def.kind === 'kernel' ? 'soft' : 'line'}>{kindLabel[def.kind]}</Badge>
                <div className="ml-auto flex items-center gap-1">
                  <label className="mr-1 flex cursor-pointer items-center gap-1 text-xs text-ink-muted">
                    <input
                      type="checkbox"
                      checked={it.enabled}
                      onChange={(e) => update(it.uid, { enabled: e.target.checked })}
                      className="accent-accent"
                    />
                    {studioText.enabled}
                    <span className="sr-only"> · {tx.name}</span>
                  </label>
                  <IconBtn label={`${studioText.moveUp}: ${tx.name}`} disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp size={14} />
                  </IconBtn>
                  <IconBtn label={`${studioText.moveDown}: ${tx.name}`} disabled={i === stack.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown size={14} />
                  </IconBtn>
                  <IconBtn label={`${studioText.remove}: ${tx.name}`} onClick={() => onChange(stack.filter((s) => s.uid !== it.uid))}>
                    <Trash2 size={14} />
                  </IconBtn>
                </div>
              </div>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-paper-subtle px-3 py-2 font-mono text-[12px] leading-relaxed whitespace-pre-wrap">{tx.formula}</pre>
              <p className="mt-2 text-xs text-ink-muted">{tx.what}</p>
              {def.params.length ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {def.params.map((p) => (
                    <LabeledSlider
                      key={p.key}
                      label={tx.params[p.key] ?? p.key}
                      value={it.params[p.key]}
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      format={(v) => v.toFixed(decimals(p.step)).replace('.', ',')}
                      onChange={(v) => update(it.uid, { params: { ...it.params, [p.key]: v } })}
                    />
                  ))}
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function IconBtn({ label, children, ...rest }: { label: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-line text-ink-muted hover:border-accent hover:text-accent-text disabled:cursor-not-allowed disabled:opacity-40"
      {...rest}
    >
      {children}
    </button>
  )
}
