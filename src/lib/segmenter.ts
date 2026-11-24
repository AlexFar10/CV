import type { ImageSegmenter } from '@mediapipe/tasks-vision'
import { imgToCanvas } from './image'
import { newMask, type Mask } from './portrait'
import type { Img } from './image'

/*
 * Segmentarea persoanei cu MediaPipe Tasks Vision (ImageSegmenter, modelul selfie_segmenter).
 * Wasm-ul (~15 MB) și modelul se servesc local din public/ și se încarcă abia când elevul cere.
 * Biblioteca și modelul: Apache-2.0 (vezi public/models/CREDITS.md).
 */

const base = () => new URL(import.meta.env.BASE_URL, document.baseURI).href

let loading: Promise<ImageSegmenter> | null = null

export function loadSegmenter(): Promise<ImageSegmenter> {
  loading ??= (async () => {
    const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision')
    const fileset = await FilesetResolver.forVisionTasks(`${base()}wasm`)
    return ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${base()}models/selfie_segmenter.tflite`, delegate: 'CPU' },
      runningMode: 'IMAGE',
      outputConfidenceMasks: true,
      outputCategoryMask: false,
    })
  })().catch((e) => {
    loading = null // permite o nouă încercare
    throw e
  })
  return loading
}

/** Probabilitatea (0–1) ca fiecare pixel să fie persoană. */
export async function segmentPerson(img: Img): Promise<Mask> {
  const seg = await loadSegmenter()
  const result = seg.segment(imgToCanvas(img))
  try {
    const masks = result.confidenceMasks ?? []
    if (masks.length === 0) throw new Error('Modelul nu a întors nicio mască.')
    // selfie_segmenter: o singură mască (persoană) sau două (fundal, persoană); persoana e ultima
    const labels = seg.getLabels()
    let idx = masks.length - 1
    const nonBg = labels.findIndex((l) => l.toLowerCase() !== 'background')
    if (masks.length > 1 && nonBg >= 0 && nonBg < masks.length) idx = nonBg
    const m = masks[idx]
    const out = newMask(m.width, m.height)
    out.data.set(m.getAsFloat32Array())
    return out
  } finally {
    result.close()
  }
}
