import { useCallback, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { BeforeAfter } from '../../components/image/BeforeAfter'
import { ImageCanvas } from '../../components/image/ImageCanvas'
import { ImagePicker } from '../../components/image/ImagePicker'
import { HintBox } from '../../components/learn/HintBox'
import { Badge, Card, DemoButton, FinePrint, cx } from '../../components/ui/primitives'
import { LabeledSlider } from '../../components/ui/LabeledSlider'
import { portrait as tx } from '../../content/phone'
import { useThrottled } from '../../hooks/useThrottled'
import type { Img } from '../../lib/image'
import {
  compositeBlur, coverage, featherMask, floodMask, invertMask, lumaMask, maskToImg, newMask, overlayMask, thresholdMask, type Mask,
} from '../../lib/portrait'
import { segmentPerson } from '../../lib/segmenter'

type Method = 'luma' | 'click'
type ModelState = { status: 'idle' | 'running' | 'ready' | 'error'; message?: string }

const pct = (v: number) => (v * 100).toFixed(1).replace('.', ',')

export function PortraitMode() {
  const [src, setSrc] = useState<Img | null>(null)
  const [label, setLabel] = useState('')
  const [step, setStep] = useState(0)
  // pasul 1
  const [method, setMethod] = useState<Method>('luma')
  const [t, setT] = useState(128)
  const [dark, setDark] = useState(true)
  const [seed, setSeed] = useState<{ x: number; y: number } | null>(null)
  const [tol, setTol] = useState(40)
  const [invert, setInvert] = useState(false)
  // pasul 3
  const [prob, setProb] = useState<Mask | null>(null)
  const [model, setModel] = useState<ModelState>({ status: 'idle' })
  const [thr, setThr] = useState(0.5)
  // pasul 4
  const [radius, setRadius] = useState(10)
  const [feather, setFeather] = useState(3)
  const [useModel, setUseModel] = useState(true)
  const srcRef = useRef<Img | null>(null)

  const onPick = useCallback((img: Img, l: string) => {
    srcRef.current = img
    setSrc(img)
    setLabel(l)
    setSeed(null)
    setProb(null)
    setModel({ status: 'idle' })
  }, [])

  const hp = useThrottled({ t, tol, seed, invert, dark, method }, 60)
  const hand = useMemo<Mask | null>(() => {
    if (!src) return null
    let m = hp.method === 'luma' ? lumaMask(src, hp.t, hp.dark) : hp.seed ? floodMask(src, hp.seed.x, hp.seed.y, hp.tol) : newMask(src.width, src.height)
    if (hp.invert) m = invertMask(m)
    return m
  }, [src, hp])

  const runModel = async () => {
    if (!src) return
    const mine = src
    setModel({ status: 'running' })
    try {
      const p = await segmentPerson(mine)
      if (srcRef.current !== mine) return
      setProb(p)
      setModel({ status: 'ready' })
    } catch (e) {
      console.warn('segmentare eșuată', e)
      setModel({ status: 'error', message: e instanceof Error && /mască|run|process/i.test(e.message) ? tx.s3.errorRun : tx.s3.errorLoad })
    }
  }

  const tProb = useThrottled(thr, 60)
  const modelBin = useMemo(() => (prob ? thresholdMask(prob, tProb) : null), [prob, tProb])
  const uncertain = useMemo(() => (prob ? prob.data.filter((v) => v > 0.2 && v < 0.8).length / prob.data.length : 0), [prob])

  // pasul 2: blur cu masca de mână, fără muchie moale
  const step2 = useMemo(() => (src && hand ? compositeBlur(src, hand, 5) : null), [src, hand])

  // pasul 4
  const p4 = useThrottled({ radius, feather }, 90)
  const modelAvailable = modelBin !== null
  const useModelNow = useModel && modelAvailable
  const alpha4 = useMemo(() => {
    const base = useModelNow ? modelBin : hand
    if (!base) return null
    return p4.feather > 0 ? featherMask(base, p4.feather / 2) : base
  }, [useModelNow, modelBin, hand, p4.feather])
  const out4 = useMemo(() => (src && alpha4 ? compositeBlur(src, alpha4, Math.max(0.01, p4.radius / 2)) : null), [src, alpha4, p4.radius])

  const tabs = tx.steps
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : -1
    if (n < 0) return
    e.preventDefault()
    setStep(n)
    document.getElementById(`pstep-${n}`)?.focus()
  }

  const onClickImage = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!src || method !== 'click') return
    const r = e.currentTarget.getBoundingClientRect()
    setSeed({ x: Math.floor(((e.clientX - r.left) / r.width) * src.width), y: Math.floor(((e.clientY - r.top) / r.height) * src.height) })
  }

  const isSample = label.includes('probă')

  return (
    <div>
      <ImagePicker sources={['portrait', 'chelsea', 'upload', 'webcam']} initial="portrait" onChange={(img, l) => onPick(img, l)} />
      {isSample ? (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <Badge>imagine de probă</Badge> {tx.sample}
        </p>
      ) : null}

      <div role="tablist" aria-label={tx.stepsLabel} className="mt-8 mb-6 flex flex-wrap gap-2">
        {tabs.map((name, i) => (
          <button
            key={name}
            id={`pstep-${i}`}
            role="tab"
            type="button"
            aria-selected={step === i}
            aria-controls="pstep-panel"
            tabIndex={step === i ? 0 : -1}
            onClick={() => setStep(i)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={cx(
              'cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              step === i ? 'border-accent bg-accent text-white' : 'border-line hover:border-accent',
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="pstep-panel" aria-labelledby={`pstep-${step}`}>
        {src && hand ? (
          step === 0 ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div>
                <ImageCanvas
                  img={overlayMask(src, hand)}
                  onClick={onClickImage}
                  role="img"
                  aria-label={tx.s1.altOverlay}
                  className={cx('mx-auto max-h-[520px] w-auto max-w-full rounded-xl border border-line', method === 'click' && 'cursor-crosshair')}
                />
                <p className="mt-2 text-center font-mono text-xs text-ink-muted">{tx.s1.overlay}</p>
              </div>
              <div className="space-y-4">
                <div role="group" aria-label={tx.s1.methodLabel} className="flex flex-wrap gap-2">
                  {(['luma', 'click'] as Method[]).map((m) => (
                    <DemoButton key={m} active={method === m} aria-pressed={method === m} onClick={() => setMethod(m)}>
                      {tx.s1.methods[m]}
                    </DemoButton>
                  ))}
                </div>
                {method === 'luma' ? (
                  <>
                    <LabeledSlider label={tx.s1.threshold} value={t} min={0} max={255} onChange={setT} />
                    <div role="group" aria-label="Care parte e persoana" className="flex gap-2">
                      <DemoButton active={dark} aria-pressed={dark} onClick={() => setDark(true)}>{tx.s1.dark}</DemoButton>
                      <DemoButton active={!dark} aria-pressed={!dark} onClick={() => setDark(false)}>{tx.s1.light}</DemoButton>
                    </div>
                  </>
                ) : (
                  <>
                    <LabeledSlider label={tx.s1.tolerance} value={tol} min={0} max={200} onChange={setTol} />
                    <p className="text-sm text-ink-muted">{tx.s1.clickHint}</p>
                  </>
                )}
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} className="accent-accent" />
                  {tx.s1.invert}
                </label>
                <div>
                  <ImageCanvas img={maskToImg(hand)} role="img" aria-label={tx.s1.mask} className="max-h-48 w-auto rounded-lg border border-line" />
                  <p className="mt-1 font-mono text-xs text-ink-muted">
                    {tx.s1.mask} · {tx.s1.covered(pct(coverage(hand)))}
                  </p>
                </div>
                <Card className="bg-accent-soft/50 !p-4 text-sm">{tx.s1.thread}</Card>
              </div>
            </div>
          ) : step === 1 && step2 ? (
            <div>
              <h3 className="text-xl font-bold tracking-tight">{tx.s2.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{tx.s2.intro}</p>
              <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1fr]">
                <div>
                  <BeforeAfter before={src} after={step2} alt={tx.s2.alt} />
                  <div className="mx-auto mt-3 max-w-[640px]">
                    <LabeledSlider label={method === 'luma' ? tx.s1.threshold : tx.s1.tolerance} value={method === 'luma' ? t : tol} min={0} max={method === 'luma' ? 255 : 200} onChange={method === 'luma' ? setT : setTol} />
                  </div>
                </div>
                <div className="space-y-4">
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">{tx.s2.limits.map((l) => <li key={l}>{l}</li>)}</ul>
                  <p className="rounded-xl border border-line bg-paper-subtle p-3 text-sm">{tx.s2.try}</p>
                  <p className="text-sm font-medium">{tx.s2.verdict}</p>
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            <div>
              <h3 className="text-xl font-bold tracking-tight">{tx.s3.title}</h3>
              <p className="mt-2 max-w-3xl text-sm text-ink-muted">{tx.s3.intro}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <DemoButton variant="solid" disabled={model.status === 'running'} onClick={() => void runModel()}>
                  {model.status === 'running' ? tx.s3.running : model.status === 'ready' ? tx.s3.again : tx.s3.run}
                </DemoButton>
                <span className="text-xs text-ink-muted">{tx.s3.note}</span>
              </div>
              {model.status === 'error' ? (
                <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{model.message}</p>
              ) : null}
              {prob && modelBin ? (
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <figure>
                    <ImageCanvas img={maskToImg(prob)} role="img" aria-label={tx.s3.altProb} className="mx-auto max-h-[480px] w-auto max-w-full rounded-xl border border-line" />
                    <figcaption className="mt-1 text-center font-mono text-xs text-ink-muted">{tx.s3.prob}</figcaption>
                  </figure>
                  <figure>
                    <ImageCanvas img={overlayMask(src, modelBin)} role="img" aria-label={tx.s3.altOverlay} className="mx-auto max-h-[480px] w-auto max-w-full rounded-xl border border-line" />
                    <figcaption className="mt-1 text-center font-mono text-xs text-ink-muted">{tx.s3.result}</figcaption>
                  </figure>
                  <div className="space-y-3 lg:col-span-2">
                    <div className="max-w-md">
                      <LabeledSlider label={tx.s3.thr} value={thr} min={0} max={1} step={0.01} onChange={setThr} format={(v) => v.toFixed(2).replace('.', ',')} />
                    </div>
                    <p className="font-mono text-xs text-ink-muted">{tx.s3.covered(pct(coverage(modelBin)))}</p>
                    <p className="text-sm text-ink-muted">{tx.s3.uncertain(pct(uncertain))}</p>
                    <Card className="bg-accent-soft/50 !p-4 text-sm">{tx.s3.thread}</Card>
                  </div>
                </div>
              ) : null}
            </div>
          ) : step === 3 ? (
            <div>
              <h3 className="text-xl font-bold tracking-tight">{tx.s4.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{tx.s4.intro}</p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-paper-subtle px-3 py-2 font-mono text-[12px] whitespace-pre-wrap">{tx.s4.formula}</pre>
              {out4 ? (
                <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_300px]">
                  <BeforeAfter before={src} after={out4} alt={tx.s4.alt} />
                  <div className="space-y-4">
                    <div role="group" aria-label={tx.s4.source} className="flex flex-wrap gap-2">
                      <DemoButton active={useModelNow} aria-pressed={useModelNow} disabled={!modelAvailable} onClick={() => setUseModel(true)}>{tx.s4.fromModel}</DemoButton>
                      <DemoButton active={!useModelNow} aria-pressed={!useModelNow} onClick={() => setUseModel(false)}>{tx.s4.fromHand}</DemoButton>
                    </div>
                    {!modelAvailable ? <p className="text-xs text-ink-muted">{tx.s4.needModel}</p> : null}
                    <LabeledSlider label={tx.s4.radius} value={radius} min={0} max={30} onChange={setRadius} />
                    <LabeledSlider label={tx.s4.feather} value={feather} min={0} max={20} onChange={setFeather} />
                    {useModelNow ? (
                      <LabeledSlider label={tx.s4.thr} value={thr} min={0} max={1} step={0.01} onChange={setThr} format={(v) => v.toFixed(2).replace('.', ',')} />
                    ) : null}
                    <FinePrint>{tx.s4.tip}</FinePrint>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null
        ) : null}
      </div>

      <div className="mt-14">
        <p className="mb-4 font-mono text-xs tracking-wide text-accent-text uppercase">Nivelul 3 · Descoperă</p>
        <HintBox title="Indicii pentru portret" steps={tx.hints} />
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ListCard title={tx.challengesTitle} items={tx.challenges} />
          <ListCard title={tx.aiTitle} items={tx.ai} />
          <ListCard title={tx.mistakesTitle} items={tx.mistakes} />
          <ListCard title={tx.ethicsTitle} items={tx.ethics} />
        </div>
      </div>
    </div>
  )
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">{items.map((c) => <li key={c}>{c}</li>)}</ul>
    </Card>
  )
}
