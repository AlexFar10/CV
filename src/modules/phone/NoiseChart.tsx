import { night } from '../../content/phone'

interface Props {
  /** eroarea RMS măsurată pentru N = 1..len */
  measured: number[]
  current: number
}

const W = 480
const H = 220
const M = { l: 44, r: 12, t: 12, b: 36 }

/** Grafic mic: eroarea RMS (măsurată) în funcție de N, plus curba teoretică σ₁/√N. */
export function NoiseChart({ measured, current }: Props) {
  const n = measured.length
  const e1 = measured[0]
  const ymax = e1 * 1.1
  const x = (k: number) => M.l + ((k - 1) / (n - 1)) * (W - M.l - M.r)
  const y = (v: number) => H - M.b - (v / ymax) * (H - M.t - M.b)
  const path = (f: (k: number) => number) => Array.from({ length: n }, (_, i) => `${i ? 'L' : 'M'}${x(i + 1).toFixed(1)},${y(f(i + 1)).toFixed(1)}`).join(' ')
  const cur = Math.min(n, Math.max(1, current))
  const ticks = [1, 8, 16, 24, 32].filter((t) => t <= n)

  return (
    <figure>
      <figcaption className="mb-1 flex flex-wrap justify-between gap-2 font-mono text-xs text-ink-muted">
        <span>{night.chartTitle}</span>
        <span>
          <span className="text-accent-text">━ {night.measured}</span> · <span>┅ {night.theory}</span>
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg border border-line bg-paper" role="img" aria-label={night.chartDesc}>
        <line x1={M.l} y1={H - M.b} x2={W - M.r} y2={H - M.b} stroke="#94a3b8" />
        <line x1={M.l} y1={M.t} x2={M.l} y2={H - M.b} stroke="#94a3b8" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={H - M.b} x2={x(t)} y2={H - M.b + 4} stroke="#94a3b8" />
            <text x={x(t)} y={H - M.b + 16} textAnchor="middle" fontSize="11" fill="#475569" fontFamily="var(--font-mono)">
              {t}
            </text>
          </g>
        ))}
        {[0, 0.5, 1].map((f) => (
          <text key={f} x={M.l - 6} y={y(e1 * f) + 4} textAnchor="end" fontSize="11" fill="#475569" fontFamily="var(--font-mono)">
            {(e1 * f).toFixed(0)}
          </text>
        ))}
        <text x={(M.l + W - M.r) / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="#475569" fontFamily="var(--font-mono)">
          {night.chartX}
        </text>
        <text x={12} y={M.t + 4} fontSize="11" fill="#475569" fontFamily="var(--font-mono)">
          {night.chartY}
        </text>
        <path d={path((k) => e1 / Math.sqrt(k))} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d={path((k) => measured[k - 1])} fill="none" stroke="#4f46e5" strokeWidth="2" />
        <line x1={x(cur)} y1={M.t} x2={x(cur)} y2={H - M.b} stroke="#4f46e5" strokeOpacity="0.35" />
        <circle cx={x(cur)} cy={y(measured[cur - 1])} r="4.5" fill="#4f46e5" stroke="#fff" strokeWidth="2" />
        <text x={Math.min(x(cur) + 8, W - 40)} y={M.t + 12} fontSize="11" fill="#4338ca" fontFamily="var(--font-mono)">
          {night.now} N={cur}
        </text>
      </svg>
    </figure>
  )
}
