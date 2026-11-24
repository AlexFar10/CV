import { useId, useRef, useState, type PointerEvent } from 'react'
import { t } from '../../content/ro'
import type { Img } from '../../lib/image'
import { ImageCanvas } from './ImageCanvas'

interface Props {
  before: Img
  after: Img
  alt: string
  /** coordonate de pixel sub cursor (sau null când pleacă); folosit de PixelInspector */
  onProbe?: (p: { x: number; y: number } | null) => void
}

/** Comparație înainte/după cu slider. Sliderul e un <input range>, deci merge de la tastatură. */
export function BeforeAfter({ before, after, alt, onProbe }: Props) {
  const [pos, setPos] = useState(50)
  const id = useId()
  const box = useRef<HTMLDivElement>(null)

  const onMove = (e: PointerEvent) => {
    if (!onProbe || !box.current) return
    const r = box.current.getBoundingClientRect()
    const x = Math.floor(((e.clientX - r.left) / r.width) * after.width)
    const y = Math.floor(((e.clientY - r.top) / r.height) * after.height)
    if (x >= 0 && y >= 0 && x < after.width && y < after.height) onProbe({ x, y })
  }

  return (
    <div>
      <div
        ref={box}
        className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-xl border border-line bg-paper-subtle select-none"
        style={{ aspectRatio: `${after.width} / ${after.height}` }}
        onPointerMove={onMove}
        onPointerLeave={() => onProbe?.(null)}
        role="img"
        aria-label={alt}
      >
        <ImageCanvas img={after} className="absolute inset-0 h-full w-full" />
        <ImageCanvas
          img={before}
          className="absolute inset-0 h-full w-full"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} />
        <span className="pointer-events-none absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-xs text-white">
          {t.beforeAfter.before}
        </span>
        <span className="pointer-events-none absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-xs text-white">
          {t.beforeAfter.after}
        </span>
      </div>
      <label htmlFor={id} className="sr-only">
        {t.beforeAfter.slider}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="mx-auto mt-3 block max-w-[640px]"
      />
    </div>
  )
}
