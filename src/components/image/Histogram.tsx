import { useEffect, useRef } from 'react'
import { t } from '../../content/ro'

interface Props {
  before: number[]
  after?: number[]
}

const W = 512
const H = 120

/** Histogramă de luminanță (256 de trepte), înainte vs. după. Scară pe rădăcină pătrată, ca să se vadă și valorile mici. */
export function Histogram({ before, after }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    ctx.clearRect(0, 0, W, H)
    const max = Math.sqrt(Math.max(1, ...before, ...(after ?? [])))
    const bar = W / 256
    const draw = (h: number[], fill: string) => {
      ctx.fillStyle = fill
      for (let i = 0; i < 256; i++) {
        const bh = (Math.sqrt(h[i]) / max) * (H - 2)
        ctx.fillRect(i * bar, H - bh, Math.ceil(bar), bh)
      }
    }
    draw(before, 'rgba(100,116,139,0.55)')
    if (after) draw(after, 'rgba(79,70,229,0.65)')
  }, [before, after])

  return (
    <figure>
      <figcaption className="mb-1 flex justify-between font-mono text-xs text-ink-muted">
        <span>{t.histogram.title}</span>
        <span>
          <span className="text-slate-500">■ {t.histogram.before}</span>{' '}
          {after ? <span className="text-accent-text">■ {t.histogram.after}</span> : null}
        </span>
      </figcaption>
      <canvas
        ref={ref}
        width={W}
        height={H}
        className="w-full rounded-lg border border-line bg-paper"
        role="img"
        aria-label="Histograma luminanței: câți pixeli au fiecare nivel de la 0 la 255"
      />
      <div className="mt-1 flex justify-between font-mono text-[11px] text-ink-muted">
        <span>{t.histogram.dark}</span>
        <span>{t.histogram.light}</span>
      </div>
    </figure>
  )
}
