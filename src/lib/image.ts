/** Imagine RGBA 8 biți, compatibilă cu ImageData dar fără să depindă de DOM (se poate testa în Node). */
export interface Img {
  width: number
  height: number
  data: Uint8ClampedArray
}

export const MAX_SIDE = 640

export function makeImg(width: number, height: number): Img {
  return { width, height, data: new Uint8ClampedArray(width * height * 4) }
}

export function cloneImg(img: Img): Img {
  return { width: img.width, height: img.height, data: new Uint8ClampedArray(img.data) }
}

/** Limitare la 0–255. */
export function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v
}

/** Rotunjire ca în NumPy (np.round): jumătățile merg la numărul par: 2,5 → 2; 3,5 → 4. */
export function roundHalfEven(x: number): number {
  const r = Math.round(x)
  return r - x === 0.5 && r % 2 !== 0 ? r - 1 : r
}

/** Valoare finală a unui canal: limitare la 0–255, apoi rotunjire (ca la laborator). */
export function toByte(v: number): number {
  return roundHalfEven(clamp255(v))
}

/** Tonuri de gri exact ca în OpenCV (ponderi 0,299/0,587/0,114, în aritmetică întreagă). */
export function cvGray(r: number, g: number, b: number): number {
  return (r * 9798 + g * 19235 + b * 3735 + 16384) >> 15
}

/** Luminanță în virgulă mobilă, pentru formule afișate (0,299 R + 0,587 G + 0,114 B). */
export function luma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/** Histogramă de luminanță, 256 de trepte (aceeași conversie ca OpenCV). */
export function lumaHistogram(img: Img): number[] {
  const h: number[] = Array.from({ length: 256 }, () => 0)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) h[cvGray(d[i], d[i + 1], d[i + 2])]++
  return h
}

export function toImageData(img: Img): ImageData {
  // copie, ca ImageData să nu partajeze bufferul cu Img
  return new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
}

/** Dimensiunea după redimensionare astfel încât latura lungă să fie ≤ max. */
export function fitSize(w: number, h: number, max = MAX_SIDE): { width: number; height: number } {
  const k = Math.min(1, max / Math.max(w, h))
  return { width: Math.max(1, Math.round(w * k)), height: Math.max(1, Math.round(h * k)) }
}

/** Desenează o sursă (imagine, bitmap, video) într-un canvas redus la max 640 px și citește pixelii. */
export function imgFromSource(source: CanvasImageSource, sw: number, sh: number, max = MAX_SIDE): Img {
  const { width, height } = fitSize(sw, sh, max)
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const ctx = c.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas indisponibil')
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height) // fundal alb sub transparență
  ctx.drawImage(source, 0, 0, width, height)
  const id = ctx.getImageData(0, 0, width, height)
  return { width, height, data: id.data }
}

/** Redimensionează o imagine astfel încât latura lungă să fie ≤ max (nu o mărește). */
export function resizeImg(img: Img, max: number): Img {
  const { width, height } = fitSize(img.width, img.height, max)
  if (width === img.width && height === img.height) return img
  const src = document.createElement('canvas')
  src.width = img.width
  src.height = img.height
  src.getContext('2d')?.putImageData(toImageData(img), 0, 0)
  return imgFromSource(src, img.width, img.height, max)
}

/** Tonuri de gri (OpenCV), un octet pe pixel. */
export function toGrayArray(img: Img): Uint8ClampedArray {
  const out = new Uint8ClampedArray(img.width * img.height)
  for (let i = 0, j = 0; j < out.length; i += 4, j++) out[j] = cvGray(img.data[i], img.data[i + 1], img.data[i + 2])
  return out
}

/** Imagine RGBA din valori de gri. */
export function grayToImg(g: ArrayLike<number>, width: number, height: number): Img {
  const out = makeImg(width, height)
  for (let j = 0; j < width * height; j++) {
    const i = j * 4
    out.data[i] = out.data[i + 1] = out.data[i + 2] = g[j]
    out.data[i + 3] = 255
  }
  return out
}

/** Imagine → canvas nou (pentru API-uri care cer un element de desen). */
export function imgToCanvas(img: Img): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  c.getContext('2d')?.putImageData(toImageData(img), 0, 0)
  return c
}

/** Încarcă o imagine din `public/` (sau de la un URL) ca Img, redusă la max 640 px. */
export function loadImg(url: string): Promise<Img> {
  return new Promise((resolve, reject) => {
    const im = new Image()
    im.onload = () => resolve(imgFromSource(im, im.naturalWidth, im.naturalHeight))
    im.onerror = () => reject(new Error(`Nu am putut încărca ${url}`))
    im.src = url
  })
}
