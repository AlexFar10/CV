import { useEffect, useRef, type CanvasHTMLAttributes } from 'react'
import type { Img } from '../../lib/image'

/** Desenează o imagine (Img) într-un canvas. */
export function ImageCanvas({ img, ...rest }: { img: Img } & CanvasHTMLAttributes<HTMLCanvasElement>) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.width = img.width
    c.height = img.height
    c.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(img.data), img.width, img.height), 0, 0)
  }, [img])
  return <canvas ref={ref} {...rest} />
}
