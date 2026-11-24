/** MSE = media pătratelor diferențelor; SNR = 10·log10(media(curat²) / MSE). Aceleași formule ca în image-processing-lab/js/noise.js. */
export function mse(img: ArrayLike<number>, clean: ArrayLike<number>): number {
  let s = 0
  for (let i = 0; i < clean.length; i++) {
    const e = img[i] - clean[i]
    s += e * e
  }
  return s / clean.length
}

export function snr(img: ArrayLike<number>, clean: ArrayLike<number>): number {
  let p = 0
  for (let i = 0; i < clean.length; i++) p += clean[i] * clean[i]
  return 10 * Math.log10(p / clean.length / mse(img, clean))
}
