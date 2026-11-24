import { useMemo, useState } from 'react'
import { ImageCanvas } from '../../components/image/ImageCanvas'
import { ImagePicker } from '../../components/image/ImagePicker'
import { Bullets } from '../../components/learn/Bullets'
import { Quiz } from '../../components/learn/Quiz'
import { Step } from '../../components/layout/Page'
import { Stage, StageLabel } from '../../components/ui/Stage'
import { LabeledSlider } from '../../components/ui/LabeledSlider'
import { phoneSimple as ps } from '../../content/phone'
import { useThrottled } from '../../hooks/useThrottled'
import { grayToImg, resizeImg, toGrayArray, type Img } from '../../lib/image'
import { mse } from '../../lib/metrics'
import { MAX_FRAMES, captureFrames, develop, makeNoiseBank, merge } from '../../lib/night'

const GAIN = 0.15
const SIGMA = 6

export function NightSimple() {
  const [source, setSource] = useState<Img | null>(null)
  const [n, setN] = useState(8)
  const clean = useMemo(() => {
    if (!source) return null
    const small = resizeImg(source, 320)
    return { w: small.width, h: small.height, gray: toGrayArray(small) }
  }, [source])
  const frames = useMemo(() => (clean ? captureFrames(clean.gray, clean.w, clean.h, makeNoiseBank(clean.w, clean.h), { gain: GAIN, sigma: SIGMA, shake: 0, align: false }) : null), [clean])
  const tn = useThrottled(n, 60)
  const out = useMemo(() => {
    if (!clean || !frames) return null
    const single = develop(frames[0], GAIN)
    const merged = develop(merge(frames.slice(0, tn), 'mean'), GAIN)
    return { single: grayToImg(single, clean.w, clean.h), merged: grayToImg(merged, clean.w, clean.h), e1: mse(single, clean.gray), eN: mse(merged, clean.gray) }
  }, [clean, frames, tn])
  const f = (v: number) => v.toFixed(0)

  return (
    <div className="space-y-14">
      <Step n={1} title={ps.steps.idea}>
        <Bullets items={ps.night.idea} />
      </Step>
      <Step n={2} title={ps.steps.try}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
          <Stage as="figure" className="aspect-[4/3]">
            {out ? <ImageCanvas img={out.single} role="img" aria-label={ps.night.alt1} className="absolute inset-0 size-full object-cover" /> : null}
            <StageLabel>{ps.night.single}</StageLabel>
          </Stage>
          <Stage as="figure" className="aspect-[4/3]">
            {out ? <ImageCanvas img={out.merged} role="img" aria-label={ps.night.alt2} className="absolute inset-0 size-full object-cover" /> : null}
            <StageLabel strong>
              {ps.night.result} · {ps.night.merged(tn)}
            </StageLabel>
          </Stage>
        </div>
        <div className="mt-4 rounded-[6px] border border-line bg-paper px-6 py-3">
          <LabeledSlider label={ps.night.slider} value={n} min={1} max={MAX_FRAMES} onChange={setN} />
          {out ? (
            <p role="status" className="font-mono text-[13px] text-ink-muted">
              {ps.night.error(f(out.e1), f(out.eN))}
            </p>
          ) : null}
        </div>
        <div className="mt-6">
          <ImagePicker sources={['scene', 'camera', 'chelsea', 'upload']} initial="scene" onChange={(img) => setSource(img)} />
        </div>
      </Step>
      <Step n={3} title={ps.steps.check}>
        <Quiz question={ps.night.quiz.question} options={ps.night.quiz.options} correct={ps.night.quiz.correct} explanation={ps.night.quiz.explanation} />
      </Step>
    </div>
  )
}
