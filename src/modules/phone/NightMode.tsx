import { useMemo, useState } from 'react'
import { BeforeAfter } from '../../components/image/BeforeAfter'
import { ImageCanvas } from '../../components/image/ImageCanvas'
import { ImagePicker } from '../../components/image/ImagePicker'
import { HintBox } from '../../components/learn/HintBox'
import { More } from '../../components/ui/More'
import { Term } from '../../components/learn/Term'
import { Card, DemoButton, FinePrint } from '../../components/ui/primitives'
import { LabeledSlider } from '../../components/ui/LabeledSlider'
import { night } from '../../content/phone'
import { NoiseChart } from './NoiseChart'
import { useThrottled } from '../../hooks/useThrottled'
import { grayToImg, resizeImg, toGrayArray, type Img } from '../../lib/image'
import { mse, snr } from '../../lib/metrics'
import { MAX_FRAMES, captureFrames, develop, makeNoiseBank, meanErrorCurve, merge, type NightParams } from '../../lib/night'

const MAX_SIDE = 320

export function NightMode() {
  const [source, setSource] = useState<Img | null>(null)
  const [n, setN] = useState(8)
  const [sigma, setSigma] = useState(6)
  const [gain, setGain] = useState(0.15)
  const [shake, setShake] = useState(0)
  const [mode, setMode] = useState<NightParams['mode']>('mean')
  const [align, setAlign] = useState(false)

  // imaginea curată, în tonuri de gri, la rezoluție mică
  const clean = useMemo(() => {
    if (!source) return null
    const small = resizeImg(source, MAX_SIDE)
    return { w: small.width, h: small.height, gray: toGrayArray(small) }
  }, [source])
  const bank = useMemo(() => (clean ? makeNoiseBank(clean.w, clean.h) : null), [clean])

  const p = useThrottled({ sigma, gain, shake, align }, 90)
  const frames = useMemo(() => (clean && bank ? captureFrames(clean.gray, clean.w, clean.h, bank, p) : null), [clean, bank, p])
  const curve = useMemo(() => (clean && frames ? meanErrorCurve(frames, clean.gray, p.gain) : null), [clean, frames, p.gain])

  const out = useMemo(() => {
    if (!clean || !frames) return null
    const single = develop(frames[0], p.gain)
    const merged = develop(merge(frames.slice(0, n), mode), p.gain)
    return {
      raw: grayToImg(frames[0], clean.w, clean.h),
      single: grayToImg(single, clean.w, clean.h),
      merged: grayToImg(merged, clean.w, clean.h),
      mse1: mse(single, clean.gray),
      snr1: snr(single, clean.gray),
      mseN: mse(merged, clean.gray),
      snrN: snr(merged, clean.gray),
    }
  }, [clean, frames, n, mode, p.gain])

  const modeName = mode === 'mean' ? night.mean : night.median
  const ghosts = p.shake > 0 && !p.align && n > 1

  return (
    <div className="space-y-6">
      <ImagePicker onChange={(img) => setSource(img)} />
      <div className="max-w-xl">
        <LabeledSlider label={night.frames} value={n} min={1} max={MAX_FRAMES} onChange={setN} />
      </div>

      {out && clean && curve ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <BeforeAfter before={out.single} after={out.merged} alt={night.alt} />
            <p className="mt-2 text-center font-mono text-xs text-ink-muted">
              {night.single} ↔ {night.merged(n, modeName)}
            </p>
            {ghosts ? (
              <p role="status" className="mt-3 rounded-[6px] border border-line bg-accent-soft/60 p-3 text-sm">
                {night.ghosts}
              </p>
            ) : null}
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 font-mono text-sm">
              <Metric title="1 cadru" mse={out.mse1} snr={out.snr1} />
              <Metric title={`${modeName} · N = ${n}`} mse={out.mseN} snr={out.snrN} strong />
            </div>
            <NoiseChart measured={curve} current={n} />
          </div>
        </div>
      ) : null}

      <More title="Mai multe setări (zgomot, lumină, mână care tremură, mediană)">
        <div className="space-y-6">
          <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
            <LabeledSlider label={night.sigma} value={sigma} min={1} max={15} onChange={setSigma} />
            <LabeledSlider label={night.gain} value={gain} min={0.05} max={0.5} step={0.01} onChange={setGain} format={(v) => v.toFixed(2).replace('.', ',')} />
            <LabeledSlider label={night.shake} value={shake} min={0} max={6} onChange={setShake} />
            <div>
              <p className="font-mono text-xs text-ink-muted">{night.combine}</p>
              <div className="mt-2 flex gap-2" role="group" aria-label={night.combine}>
                <DemoButton active={mode === 'mean'} aria-pressed={mode === 'mean'} onClick={() => setMode('mean')}>{night.mean}</DemoButton>
                <DemoButton active={mode === 'median'} aria-pressed={mode === 'median'} onClick={() => setMode('median')}>{night.median}</DemoButton>
              </div>
              {mode === 'median' ? <FinePrint>{night.medianNote}</FinePrint> : null}
            </div>
            <div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={align} onChange={(e) => setAlign(e.target.checked)} className="accent-accent" disabled={shake === 0} />
                {night.align}
              </label>
              <FinePrint>{night.alignNote}</FinePrint>
            </div>
          </div>
          {out && clean ? (
            <div className="grid max-w-md grid-cols-2 gap-3">
              <Thumb img={out.raw} label={night.raw} />
              <Thumb img={grayToImg(clean.gray, clean.w, clean.h)} label={night.clean} />
            </div>
          ) : null}
          <p className="max-w-3xl text-sm text-ink-muted">{night.how}</p>
          <pre className="overflow-x-auto rounded-[4px] bg-paper-subtle px-3 py-2 font-mono text-[12px] whitespace-pre-wrap">{night.formulas}</pre>
          <FinePrint>{night.mseNote}</FinePrint>
        </div>
      </More>

      <More title="Provocări și sfaturi">
        <div className="space-y-5">
          <p className="max-w-3xl text-sm text-ink-muted">
            Folosește <Term id="mse">MSE</Term> și <Term id="snr">SNR</Term> de mai sus ca să răspunzi provocărilor.
          </p>
          <HintBox title="Provocarea: de două ori mai luminos, fără mai mult zgomot" steps={night.hints} />
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <h3 className="font-semibold">{night.challengesTitle}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">{night.challenges.map((c) => <li key={c}>{c}</li>)}</ul>
            </Card>
            <Card>
              <h3 className="font-semibold">{night.aiTitle}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">{night.ai.map((c) => <li key={c}>{c}</li>)}</ul>
            </Card>
            <Card>
              <h3 className="font-semibold">{night.mistakesTitle}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">{night.mistakes.map((c) => <li key={c}>{c}</li>)}</ul>
            </Card>
          </div>
        </div>
      </More>
    </div>
  )
}

function Thumb({ img, label }: { img: Img; label: string }) {
  return (
    <figure>
      <ImageCanvas img={img} className="w-full rounded-[4px] border border-line" role="img" aria-label={label} />
      <figcaption className="mt-1 text-center font-mono text-[11px] text-ink-muted">{label}</figcaption>
    </figure>
  )
}

function Metric({ title, mse: m, snr: s, strong }: { title: string; mse: number; snr: number; strong?: boolean }) {
  return (
    <div className={`rounded-[6px] border p-3 ${strong ? 'border-accent bg-accent-soft/50' : 'border-line'}`}>
      <p className="text-xs text-ink-muted">{title}</p>
      <p className="mt-1">MSE {m.toFixed(1).replace('.', ',')}</p>
      <p>SNR {s.toFixed(1).replace('.', ',')} dB</p>
    </div>
  )
}

