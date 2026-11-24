import { useMemo, useRef, useState } from 'react'
import { ImageCanvas } from '../../components/image/ImageCanvas'
import { ImagePicker } from '../../components/image/ImagePicker'
import { Bullets } from '../../components/learn/Bullets'
import { Quiz } from '../../components/learn/Quiz'
import { Step } from '../../components/layout/Page'
import { Stage, StageLabel } from '../../components/ui/Stage'
import { LabeledSlider } from '../../components/ui/LabeledSlider'
import { DemoButton } from '../../components/ui/primitives'
import { portrait as pAdv, phoneSimple as ps } from '../../content/phone'
import { useThrottled } from '../../hooks/useThrottled'
import type { Img } from '../../lib/image'
import { compositeBlur, coverage, featherMask, thresholdMask, type Mask } from '../../lib/portrait'
import { segmentPerson } from '../../lib/segmenter'

const pct = (v: number) => (v * 100).toFixed(1).replace('.', ',')

export function PortraitSimple() {
  const [src, setSrc] = useState<Img | null>(null)
  const [prob, setProb] = useState<Mask | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle')
  const [thr, setThr] = useState(0.5)
  const srcRef = useRef<Img | null>(null)
  const tt = useThrottled(thr, 70)

  const run = async () => {
    if (!src) return
    const mine = src
    setStatus('running')
    try {
      const p = await segmentPerson(mine)
      if (srcRef.current !== mine) return
      setProb(p)
      setStatus('idle')
    } catch (e) {
      console.warn('segmentare eșuată', e)
      setStatus('error')
    }
  }

  const bin = useMemo(() => (prob ? thresholdMask(prob, tt) : null), [prob, tt])
  const out = useMemo(() => (src && bin ? compositeBlur(src, featherMask(bin, 1.5), 6) : null), [src, bin])

  return (
    <div className="space-y-14">
      <Step n={1} title={ps.steps.idea}>
        <Bullets items={ps.portrait.idea} />
      </Step>
      <Step n={2} title={ps.steps.try}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
          <Stage as="figure" className="aspect-[4/3]">
            {src ? <ImageCanvas img={src} role="img" aria-label={ps.portrait.alt1} className="absolute inset-0 size-full object-contain" /> : null}
            <StageLabel>{ps.portrait.original}</StageLabel>
          </Stage>
          <Stage as="figure" className="aspect-[4/3]">
            {out ? (
              <ImageCanvas img={out} role="img" aria-label={ps.portrait.alt2} className="absolute inset-0 size-full object-contain" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-stage-muted">{ps.portrait.placeholder}</p>
                <DemoButton variant="solid" disabled={status === 'running' || !src} onClick={() => void run()}>
                  {status === 'running' ? ps.portrait.running : ps.portrait.run}
                </DemoButton>
                <p className="max-w-xs font-mono text-[11px] text-stage-muted">{ps.portrait.note}</p>
                {status === 'error' ? (
                  <p role="alert" className="text-sm text-thread">
                    {pAdv.s3.errorLoad}
                  </p>
                ) : null}
              </div>
            )}
            <StageLabel strong className="right-3">
              {ps.portrait.result}
            </StageLabel>
          </Stage>
        </div>
        <div className="mt-4 rounded-[6px] border border-line bg-paper px-6 py-3">
          <LabeledSlider label={ps.portrait.slider} value={thr} min={0} max={1} step={0.01} threshold format={(v) => v.toFixed(2).replace('.', ',')} onChange={setThr} />
          {bin ? <p role="status" className="font-mono text-[13px] text-ink-muted">{ps.portrait.covered(pct(coverage(bin)))}</p> : null}
        </div>
        <div className="mt-6">
          <ImagePicker
            sources={['portrait', 'chelsea', 'upload']}
            initial="portrait"
            onChange={(img) => {
              srcRef.current = img
              setSrc(img)
              setProb(null)
              setStatus('idle')
            }}
          />
        </div>
      </Step>
      <Step n={3} title={ps.steps.check}>
        <Quiz question={ps.portrait.quiz.question} options={ps.portrait.quiz.options} correct={ps.portrait.quiz.correct} explanation={ps.portrait.quiz.explanation} />
      </Step>
    </div>
  )
}
