import { t } from '../../content/ro'
import { cvGray, type Img } from '../../lib/image'

interface Props {
  before: Img
  after: Img
  pos: { x: number; y: number } | null
  /** arată și vecinătatea 3×3 (luminanța înainte → după), pentru filtrele pe vecinătate */
  neighborhood?: boolean
}

function rgb(img: Img, x: number, y: number): [number, number, number] | null {
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return null
  const i = (y * img.width + x) * 4
  return [img.data[i], img.data[i + 1], img.data[i + 2]]
}

function Swatch({ c, label }: { c: [number, number, number]; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="h-8 w-8 rounded-md border border-line" style={{ background: `rgb(${c[0]},${c[1]},${c[2]})` }} />
      <div>
        <p className="font-mono text-[11px] text-ink-muted">{label}</p>
        <p className="font-mono text-sm tabular-nums">
          R {c[0]} · G {c[1]} · B {c[2]}
        </p>
      </div>
    </div>
  )
}

/** Valorile RGB ale pixelului de sub cursor, înainte și după. */
export function PixelInspector({ before, after, pos, neighborhood = false }: Props) {
  const a = pos ? rgb(before, pos.x, pos.y) : null
  const b = pos ? rgb(after, pos.x, pos.y) : null
  return (
    <div className="rounded-2xl border border-line bg-paper-subtle p-4" aria-live="off">
      <p className="mb-3 font-mono text-xs tracking-wide text-accent-text uppercase">{t.inspector.title}</p>
      {pos && a && b ? (
        <div className="space-y-3">
          <p className="font-mono text-xs text-ink-muted">
            x = {pos.x}, y = {pos.y}
          </p>
          <Swatch c={a} label={t.inspector.before} />
          <Swatch c={b} label={t.inspector.after} />
          {neighborhood ? (
            <div className="grid w-fit grid-cols-3 gap-1 font-mono text-xs tabular-nums">
              {[-1, 0, 1].flatMap((dy) =>
                [-1, 0, 1].map((dx) => {
                  const p = rgb(before, pos.x + dx, pos.y + dy)
                  const q = rgb(after, pos.x + dx, pos.y + dy)
                  return (
                    <span key={`${dx}${dy}`} className={`rounded border px-1.5 py-1 ${dx === 0 && dy === 0 ? 'border-accent bg-accent-soft' : 'border-line'}`}>
                      {p ? cvGray(...p) : '–'}
                      <span className="text-ink-muted">→</span>
                      {q ? cvGray(...q) : '–'}
                    </span>
                  )
                }),
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">{t.inspector.hint}</p>
      )}
    </div>
  )
}
