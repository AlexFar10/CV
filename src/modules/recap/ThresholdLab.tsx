import { useMemo, useState } from 'react'
import { LabeledSlider } from '../../components/ui/LabeledSlider'
import { Stage } from '../../components/ui/Stage'
import { recap } from '../../content/recap'
import { confusion, histogram, makeScores } from '../../lib/threshold'

const W = 640
const H = 300
const L = 12
const R = 12
const T = 40
const B = 36
const BINS = 20

/** Compromisul pragului: histograme suprapuse, un slider, două numere mari (alarme false, alarme ratate). */
export function ThresholdLab() {
  const r = recap.lab
  const scores = useMemo(() => makeScores(), [])
  const [thr, setThr] = useState(0.5)
  const c = confusion(scores, thr)
  const hn = useMemo(() => histogram(scores.neg, BINS), [scores])
  const hp = useMemo(() => histogram(scores.pos, BINS), [scores])
  const max = Math.max(...hn, ...hp)
  const bw = (W - L - R) / BINS
  const bar = (v: number) => (v / max) * (H - T - B)
  const x = L + thr * (W - L - R)
  const tx = thr.toFixed(2).replace('.', ',')

  return (
    <div>
      <Stage as="figure">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={r.chartAlt} className="block">
          {hn.map((v, i) => (
            <rect key={`n${i}`} x={L + i * bw + 1} y={H - B - bar(v)} width={bw - 2} height={bar(v)} fill="#8c8e95" fillOpacity="0.75" />
          ))}
          {hp.map((v, i) => (
            <rect key={`p${i}`} x={L + i * bw + 1} y={H - B - bar(v)} width={bw - 2} height={bar(v)} fill="#7fa6ff" fillOpacity="0.7" />
          ))}
          <path d={`M${L} ${H - B}H${W - R}`} stroke="#e8e8e4" strokeWidth="1.5" />
          <path d={`M${x} 14V${H - B}`} stroke="#ff5a3c" strokeWidth="3" />
          <text x={thr > 0.8 ? x - 8 : x + 8} y="30" textAnchor={thr > 0.8 ? 'end' : 'start'} fill="#ff5a3c" fontFamily="var(--font-mono)" fontSize="14" fontWeight="500">
            prag {tx}
          </text>
          <text x={L} y={H - 16} fill="#a3a5ab" fontFamily="var(--font-mono)" fontSize="12">0</text>
          <text x={W / 2} y={H - 16} textAnchor="middle" fill="#a3a5ab" fontFamily="var(--font-mono)" fontSize="12">0,5</text>
          <text x={W - R} y={H - 16} textAnchor="end" fill="#a3a5ab" fontFamily="var(--font-mono)" fontSize="12">1</text>
        </svg>
        <figcaption className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-stage-line px-5 pt-3 pb-4 font-mono text-xs text-stage-muted">
          <span className="inline-flex items-center gap-2">
            <i className="inline-block size-2.5 bg-data-neutral" />
            {r.legendNeg}
          </span>
          <span className="inline-flex items-center gap-2 text-data-dark">
            <i className="inline-block size-2.5 bg-data-dark" />
            {r.legendPos}
          </span>
          <span>{r.scoreAxis}</span>
        </figcaption>
      </Stage>

      <div className="mt-4 flex flex-wrap items-stretch gap-4">
        <div className="min-w-0 flex-[2_1_320px] rounded-[6px] border border-line bg-paper px-5 py-2">
          <LabeledSlider label={r.thr} value={thr} min={0} max={1} step={0.01} threshold format={(v) => v.toFixed(2).replace('.', ',')} onChange={setThr} />
        </div>
        <div role="status" className="flex-[1_1_180px] rounded-[6px] border border-line bg-paper px-5 py-3.5">
          <p className="mb-1.5 font-mono text-[11px] text-ink-faint">Alarme false</p>
          <p className="font-display text-[40px] leading-none font-bold tracking-[-0.02em]">
            {c.fp}
            <span className="font-mono text-[13px] font-normal text-ink-faint"> din {scores.neg.length}</span>
          </p>
        </div>
        <div role="status" className="flex-[1_1_180px] rounded-[6px] border border-line bg-paper px-5 py-3.5">
          <p className="mb-1.5 font-mono text-[11px] text-ink-faint">Alarme ratate</p>
          <p className="font-display text-[40px] leading-none font-bold tracking-[-0.02em] text-data">
            {c.fn}
            <span className="font-mono text-[13px] font-normal text-ink-faint"> din {scores.pos.length}</span>
          </p>
        </div>
      </div>
      <p className="mt-4 max-w-[40em] text-[15px] leading-normal text-ink-muted">{r.closing}</p>
    </div>
  )
}
