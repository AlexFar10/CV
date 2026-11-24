import { useMemo, useState } from 'react'
import { DemoButton, FinePrint } from '../../components/ui/primitives'
import { LabeledSlider } from '../../components/ui/LabeledSlider'
import { recap } from '../../content/recap'
import { bestThreshold, confusion, histogram, makeScores } from '../../lib/threshold'

const BINS = 20
const W = 520
const H = 200
const M = { l: 8, r: 8, t: 10, b: 28 }

export function ThresholdLabAdvanced() {
  const r = recap.lab
  const scores = useMemo(() => makeScores(), [])
  const [thr, setThr] = useState(0.5)
  const [cost, setCost] = useState(1)
  const c = confusion(scores, thr)
  const hn = useMemo(() => histogram(scores.neg, BINS), [scores])
  const hp = useMemo(() => histogram(scores.pos, BINS), [scores])
  const max = Math.max(...hn, ...hp)
  const bw = (W - M.l - M.r) / BINS
  const x = (v: number) => M.l + v * (W - M.l - M.r)
  const bar = (v: number) => (v / max) * (H - M.t - M.b)

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <figure>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-[6px] border border-line bg-paper" role="img" aria-label={r.chartAlt}>
          {hn.map((v, i) => (
            <rect key={`n${i}`} x={M.l + i * bw + 1} y={H - M.b - bar(v)} width={bw - 2} height={bar(v)} fill="#94a3b8" fillOpacity="0.7" />
          ))}
          {hp.map((v, i) => (
            <rect key={`p${i}`} x={M.l + i * bw + 1} y={H - M.b - bar(v)} width={bw - 2} height={bar(v)} fill="#2f5bd0" fillOpacity="0.55" />
          ))}
          <line x1={M.l} y1={H - M.b} x2={W - M.r} y2={H - M.b} stroke="#94a3b8" />
          <line x1={x(thr)} y1={M.t} x2={x(thr)} y2={H - M.b} stroke="#dc2626" strokeWidth="2" strokeDasharray="5 4" />
          <text x={Math.min(W - 70, x(thr) + 6)} y={M.t + 10} fontSize="11" fill="#b91c1c" fontFamily="var(--font-mono)">
            prag {thr.toFixed(2).replace('.', ',')}
          </text>
          {[0, 0.5, 1].map((t) => (
            <text key={t} x={x(t)} y={H - 12} textAnchor={t === 0 ? 'start' : t === 1 ? 'end' : 'middle'} fontSize="11" fill="#475569" fontFamily="var(--font-mono)">
              {String(t).replace('.', ',')}
            </text>
          ))}
          <text x={W / 2} y={H - 1} textAnchor="middle" fontSize="10" fill="#475569" fontFamily="var(--font-mono)">
            {r.scoreAxis}
          </text>
        </svg>
        <figcaption className="mt-2 flex flex-wrap gap-x-4 font-mono text-xs text-ink-muted">
          <span>■ {r.legendNeg}</span>
          <span className="text-accent-text">■ {r.legendPos}</span>
        </figcaption>
      </figure>

      <div className="space-y-4">
        <LabeledSlider label={r.thr} value={thr} min={0} max={1} step={0.01} onChange={setThr} format={(v) => v.toFixed(2).replace('.', ',')} />
        <div className="flex flex-wrap gap-2">
          <DemoButton onClick={() => setThr(0.25)}>{r.presets.sensitive}</DemoButton>
          <DemoButton onClick={() => setThr(0.5)}>{r.presets.balanced}</DemoButton>
          <DemoButton onClick={() => setThr(0.8)}>{r.presets.strict}</DemoButton>
        </div>
        <div role="status" className="rounded-[6px] border border-line bg-paper-subtle p-4 font-mono text-sm leading-relaxed">
          <p>{r.falseAlarms(c.fp, scores.neg.length)}</p>
          <p>{r.missed(c.fn, scores.pos.length)}</p>
          <p className="mt-1 text-xs text-ink-muted">{r.totalCost(c.fp + cost * c.fn)}</p>
        </div>
        <LabeledSlider label={r.cost} value={cost} min={1} max={20} onChange={setCost} format={r.costFmt} />
        <DemoButton variant="solid" onClick={() => setThr(bestThreshold(scores, cost))}>
          {r.best}
        </DemoButton>
        <FinePrint>{r.insight}</FinePrint>
      </div>
    </div>
  )
}
