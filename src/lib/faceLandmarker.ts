import type { FaceLandmarker } from '@mediapipe/tasks-vision'
import type { Pt } from './face'

/*
 * MediaPipe Face Landmarker (Tasks Vision), servit local din public/ (wasm comun cu segmentarea).
 * Biblioteca și modelul: Apache-2.0 (vezi public/models/CREDITS.md).
 */
const base = () => new URL(import.meta.env.BASE_URL, document.baseURI).href

let loading: Promise<FaceLandmarker> | null = null

export function loadFaceLandmarker(): Promise<FaceLandmarker> {
  loading ??= (async () => {
    const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision')
    const fileset = await FilesetResolver.forVisionTasks(`${base()}wasm`)
    return FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${base()}models/face_landmarker.task`, delegate: 'CPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: false,
    })
  })().catch((e) => {
    loading = null
    throw e
  })
  return loading
}

/**
 * Punctele primei fețe în PIXELI ai videoclipului (nu normalizate): raportul EAR e o proporție de distanțe,
 * deci x și y trebuie în aceeași unitate, altfel un cadru 16:9 ar deforma rezultatul.
 * Întoarce null dacă nu e nicio față în cadru.
 */
export function detectFace(lm: FaceLandmarker, video: HTMLVideoElement, tsMs: number): Pt[] | null {
  const res = lm.detectForVideo(video, tsMs)
  const face = res.faceLandmarks[0]
  const w = video.videoWidth
  const h = video.videoHeight
  return face ? face.map((p) => ({ x: p.x * w, y: p.y * h })) : null
}
