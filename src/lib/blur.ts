/** Nucleu gaussian 1D, rază ceil(3σ), normalizat (suma = 1). */
export function gaussianKernel(sigma: number): Float64Array {
  const r = Math.max(1, Math.ceil(3 * sigma))
  const k = new Float64Array(2 * r + 1)
  let s = 0
  for (let i = -r; i <= r; i++) {
    k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma))
    s += k[i + r]
  }
  for (let i = 0; i < k.length; i++) k[i] /= s
  return k
}

/**
 * Blur gaussian separabil (orizontal, apoi vertical), aplicat o singură dată.
 * `data` are `channels` valori pe pixel, intercalate. Marginile se prelungesc (replicate).
 */
export function gaussianBlur(data: Float32Array, w: number, h: number, channels: number, sigma: number): Float32Array {
  if (sigma <= 0) return Float32Array.from(data)
  const k = gaussianKernel(sigma)
  const r = (k.length - 1) / 2
  const tmp = new Float32Array(data.length)
  const out = new Float32Array(data.length)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < channels; c++) {
        let acc = 0
        for (let i = -r; i <= r; i++) {
          const xx = x + i < 0 ? 0 : x + i >= w ? w - 1 : x + i
          acc += k[i + r] * data[(y * w + xx) * channels + c]
        }
        tmp[(y * w + x) * channels + c] = acc
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < channels; c++) {
        let acc = 0
        for (let i = -r; i <= r; i++) {
          const yy = y + i < 0 ? 0 : y + i >= h ? h - 1 : y + i
          acc += k[i + r] * tmp[(yy * w + x) * channels + c]
        }
        out[(y * w + x) * channels + c] = acc
      }
    }
  }
  return out
}
