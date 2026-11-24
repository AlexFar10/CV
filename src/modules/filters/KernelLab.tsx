import { useMemo, useState } from 'react'
import { convolve3x3 } from '../../lib/filters'
import type { Img } from '../../lib/image'
import { useThrottled } from '../../hooks/useThrottled'
import { BeforeAfter } from '../../components/image/BeforeAfter'
import { DemoButton, FinePrint } from '../../components/ui/primitives'
import { kernelLab } from '../../content/filters'

const PRESETS: Record<keyof typeof kernelLab.presets, { k: number[]; divisor?: number; offset?: number }> = {
  identity: { k: [0, 0, 0, 0, 1, 0, 0, 0, 0] },
  blur: { k: [1, 1, 1, 1, 1, 1, 1, 1, 1], divisor: 9 },
  sharpen: { k: [0, -1, 0, -1, 5, -1, 0, -1, 0] },
  edge: { k: [-1, -1, -1, -1, 8, -1, -1, -1, -1] },
  emboss: { k: [-2, -1, 0, -1, 1, 1, 0, 1, 2] },
  sobelX: { k: [-1, 0, 1, -2, 0, 2, -1, 0, 1], offset: 128 },
}

const num = (s: string) => {
  const v = Number(s.replace(',', '.'))
  return Number.isFinite(v) ? v : 0
}

export function KernelLab({ src }: { src: Img }) {
  const [cells, setCells] = useState<string[]>(PRESETS.sharpen.k.map(String))
  const [divisor, setDivisor] = useState('1')
  const [offset, setOffset] = useState('0')
  const params = useThrottled({ k: cells.map(num), d: num(divisor) || 1, o: num(offset) }, 100)
  const after = useMemo(() => convolve3x3(src, params.k, { divisor: params.d, offset: params.o }), [src, params])
  const sum = cells.map(num).reduce((a, b) => a + b, 0)
  const effective = sum / (num(divisor) || 1)

  const load = (key: keyof typeof PRESETS) => {
    const p = PRESETS[key]
    setCells(p.k.map(String))
    setDivisor(String(p.divisor ?? 1))
    setOffset(String(p.offset ?? 0))
  }

  return (
    <div>
      <h3 className="text-xl font-bold tracking-tight">{kernelLab.title}</h3>
      <p className="mt-2 text-sm text-ink-muted">{kernelLab.lead}</p>
      <pre className="mt-3 overflow-x-auto rounded-[4px] bg-paper-subtle px-3 py-2 font-mono text-[12px] whitespace-pre-wrap">{kernelLab.formula}</pre>
      <div className="mt-4 grid gap-6 lg:grid-cols-[220px_1fr]">
        <div>
          <div role="group" aria-label={kernelLab.title} className="grid grid-cols-3 gap-1.5">
            {cells.map((c, idx) => (
              <input
                key={idx}
                type="number"
                inputMode="decimal"
                step="any"
                value={c}
                aria-label={kernelLab.cell(Math.floor(idx / 3), idx % 3)}
                onChange={(e) => setCells(cells.map((x, i) => (i === idx ? e.target.value : x)))}
                className="w-full rounded-[4px] border border-line px-2 py-2 text-center font-mono text-sm"
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <label>
              <span className="block font-mono text-ink-muted">{kernelLab.divisor}</span>
              <input type="number" step="any" value={divisor} onChange={(e) => setDivisor(e.target.value)} className="mt-1 w-full rounded-[4px] border border-line px-2 py-1.5 font-mono" />
            </label>
            <label>
              <span className="block font-mono text-ink-muted">{kernelLab.offset}</span>
              <input type="number" step="any" value={offset} onChange={(e) => setOffset(e.target.value)} className="mt-1 w-full rounded-[4px] border border-line px-2 py-1.5 font-mono" />
            </label>
          </div>
          <p className="mt-3 font-mono text-xs text-ink-muted">
            {kernelLab.sum}: {sum.toFixed(2).replace('.', ',')} {num(divisor) !== 1 ? `(÷ ${divisor} = ${effective.toFixed(2).replace('.', ',')})` : ''}
          </p>
          {Math.abs(effective - 1) > 1e-9 ? <FinePrint>{kernelLab.warn}</FinePrint> : null}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((k) => (
              <DemoButton key={k} className="!px-3 !py-1 !text-xs" onClick={() => load(k)}>
                {kernelLab.presets[k]}
              </DemoButton>
            ))}
          </div>
        </div>
        <BeforeAfter before={src} after={after} alt="Imaginea originală și rezultatul convoluției cu kernelul tău" />
      </div>
    </div>
  )
}
