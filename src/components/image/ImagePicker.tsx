import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import { t } from '../../content/ro'
import { imgFromSource, type Img } from '../../lib/image'
import { drawPlaceholderPortrait, testSceneImg } from '../../lib/testScene'
import { Badge, DemoButton, FinePrint } from '../ui/primitives'

export type SourceId = 'scene' | 'camera' | 'chelsea' | 'portrait' | 'upload' | 'webcam'
type BuiltIn = 'scene' | 'camera' | 'chelsea' | 'portrait'

interface Props {
  /** apelată la fiecare imagine nouă (imaginea e deja redusă la max 640 px) */
  onChange: (img: Img, label: string, source: SourceId) => void
  /** sursele oferite; implicit toate */
  sources?: SourceId[]
  initial?: SourceId
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image()
    im.onload = () => resolve(im)
    im.onerror = () => reject(new Error('load'))
    im.src = url
  })
}

/** Alege imaginea de lucru: scenă de test, poze CC0, încărcare proprie sau webcam. Totul rămâne local. */
export function ImagePicker({ onChange, sources = ['scene', 'camera', 'chelsea', 'upload', 'webcam'], initial = 'scene' }: Props) {
  const [active, setActive] = useState<SourceId>(initial)
  const [error, setError] = useState<string | null>(null)
  const [camOn, setCamOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const stopCam = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    streamRef.current = null
    setCamOn(false)
  }, [])

  const emit = useCallback((img: Img, label: string, src: SourceId) => {
    setActive(src)
    setError(null)
    onChangeRef.current(img, label, src)
  }, [])

  const pickBuiltIn = useCallback(
    async (id: BuiltIn) => {
      try {
        if (id === 'scene') return emit(testSceneImg(), t.picker.scene, id)
        if (id === 'portrait') {
          try {
            const im = await loadImage(`${import.meta.env.BASE_URL}images/portrait.jpg`)
            return emit(imgFromSource(im, im.naturalWidth, im.naturalHeight), t.picker.portrait, id)
          } catch {
            // nu există portrait.jpg: placeholder desenat din cod
            const c = document.createElement('canvas')
            c.width = 480
            c.height = 600
            const ctx = c.getContext('2d', { willReadFrequently: true })
            if (!ctx) throw new Error('Canvas indisponibil')
            drawPlaceholderPortrait(ctx, 480, 600)
            return emit({ width: 480, height: 600, data: ctx.getImageData(0, 0, 480, 600).data }, t.picker.portraitPlaceholder, id)
          }
        }
        const im = await loadImage(`${import.meta.env.BASE_URL}images/${id}.png`)
        emit(imgFromSource(im, im.naturalWidth, im.naturalHeight), id === 'camera' ? t.picker.camera : t.picker.chelsea, id)
      } catch {
        setError(t.picker.errorLoad)
      }
    },
    [emit],
  )

  // imaginea inițială; camera se oprește la ieșirea din pagină
  useEffect(() => {
    if (initial !== 'upload' && initial !== 'webcam') void pickBuiltIn(initial)
    return () => {
      streamRef.current?.getTracks().forEach((tr) => tr.stop())
      streamRef.current = null
    }
  }, [initial, pickBuiltIn])

  const onFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setError(t.picker.errorType)
    try {
      const bmp = await createImageBitmap(file)
      const big = Math.max(bmp.width, bmp.height) > 4000
      emit(imgFromSource(bmp, bmp.width, bmp.height), file.name, 'upload')
      bmp.close()
      if (big) setError(t.picker.errorTooBig) // doar informare; imaginea a fost deja redusă
    } catch {
      setError(t.picker.errorLoad)
    }
  }

  const startCam = async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) return setError(t.picker.errorCamMissing)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 } }, audio: false })
      streamRef.current = stream
      setCamOn(true)
    } catch (e) {
      const name = e instanceof DOMException ? e.name : ''
      setError(
        name === 'NotAllowedError' || name === 'SecurityError'
          ? t.picker.errorCamDenied
          : name === 'NotFoundError' || name === 'OverconstrainedError'
            ? t.picker.errorCamMissing
            : t.picker.errorCamGeneric,
      )
    }
  }

  // leagă fluxul de elementul video imediat ce apare
  useEffect(() => {
    const v = videoRef.current
    if (camOn && v && streamRef.current) {
      v.srcObject = streamRef.current
      void v.play().catch(() => undefined)
    }
  }, [camOn])

  const snap = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    emit(imgFromSource(v, v.videoWidth, v.videoHeight), t.picker.webcam, 'webcam')
    stopCam()
  }

  const items: { id: SourceId; label: string }[] = [
    { id: 'scene', label: t.picker.scene },
    { id: 'portrait', label: t.picker.portrait },
    { id: 'camera', label: t.picker.camera },
    { id: 'chelsea', label: t.picker.chelsea },
  ]

  return (
    <div role="group" aria-label={t.picker.label}>
      <div className="flex flex-wrap items-center gap-2">
        {items
          .filter((i) => sources.includes(i.id))
          .map((i) => (
            <DemoButton
              key={i.id}
              active={active === i.id}
              aria-pressed={active === i.id}
              onClick={() => {
                stopCam()
                void pickBuiltIn(i.id as BuiltIn)
              }}
            >
              {i.label}
            </DemoButton>
          ))}
        {sources.includes('upload') ? (
          <>
            <DemoButton active={active === 'upload'} onClick={() => fileRef.current?.click()}>
              <Upload size={14} aria-hidden /> {t.picker.upload}
            </DemoButton>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label={t.picker.upload}
              tabIndex={-1}
              onChange={(e) => {
                void onFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </>
        ) : null}
        {sources.includes('webcam') ? (
          <DemoButton active={active === 'webcam'} onClick={() => (camOn ? stopCam() : void startCam())}>
            <Camera size={14} aria-hidden /> {t.picker.webcam}
          </DemoButton>
        ) : null}
      </div>

      {camOn ? (
        <div className="mt-4 max-w-sm">
          <video ref={videoRef} muted playsInline className="w-full rounded-[6px] border border-line bg-black" aria-label="Previzualizare cameră" />
          <div className="mt-2 flex gap-2">
            <DemoButton variant="solid" onClick={snap}>
              {t.picker.snap}
            </DemoButton>
            <DemoButton variant="ghost" onClick={stopCam}>
              {t.picker.cancel}
            </DemoButton>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge tone="line">{t.picker.privacy}</Badge>
      </div>
      {active === 'camera' || active === 'chelsea' ? <FinePrint>Imagini CC0 din scikit-image (vezi public/images/CREDITS.md).</FinePrint> : null}
    </div>
  )
}
