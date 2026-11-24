import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bullets } from '../../components/learn/Bullets'
import { Quiz } from '../../components/learn/Quiz'
import { Page, Step } from '../../components/layout/Page'
import { LabeledSlider } from '../../components/ui/LabeledSlider'
import { More } from '../../components/ui/More'
import { Stage } from '../../components/ui/Stage'
import { FinePrint } from '../../components/ui/primitives'
import { liveSimple as L } from '../../content/live'
import { simSample } from '../../lib/simSignal'

/** Fereastra de 10 secunde din simulator (t = 9…19 s): conține închiderea lungă (11,5–14,5 s) și două clipiri (16 și 17,2 s). */
const T0 = 9
const SIGNAL = Array.from({ length: 101 }, (_, i) => ({ t: i / 10, v: simSample(T0 + i / 10).ear }))
/** Durata minimă (s) cu ochii sub prag pentru „Obosit”; peste FALSE_S, pragul e atât de mare încât și ochii deschiși par închiși. */
const MIN_S = 1
const FALSE_S = 4
const EAR_MAX = 0.4

const fmt = (v: number, d: number) => v.toFixed(d).replace('.', ',')
const render = (s: string) => s.split('**').map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p))

function FaceStage({ closed }: { closed: boolean }) {
  const dots = (ys: [number, number]) => (
    <g fill="#FF5A3C">
      {[242, 302, 338, 398].map((x) => (
        <circle key={x} cx={x} cy={208} r={4.5} />
      ))}
      {[257, 287, 353, 383].map((x) => (
        <g key={x}>
          <circle cx={x} cy={ys[0]} r={4.5} />
          <circle cx={x} cy={ys[1]} r={4.5} />
        </g>
      ))}
    </g>
  )
  return (
    <svg viewBox="0 0 640 480" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label={L.try.faceAlt} className="absolute inset-0">
      <g stroke="#23252A" strokeWidth="1">
        <path d="M0 120H640M0 240H640M0 360H640M160 0V480M320 0V480M480 0V480" />
      </g>
      <ellipse cx="320" cy="250" rx="130" ry="178" fill="#16171B" stroke="#6C6F77" strokeWidth="2" />
      {closed ? (
        <>
          <g fill="none" stroke="#E8E8E4" strokeWidth="3" strokeLinecap="round">
            <path d="M242 208 H302" />
            <path d="M338 208 H398" />
          </g>
          {dots([206, 210])}
        </>
      ) : (
        <>
          <g fill="none" stroke="#E8E8E4" strokeWidth="2.5">
            <path d="M242 208 Q272 186 302 208 Q272 226 242 208Z" />
            <path d="M338 208 Q368 186 398 208 Q368 226 338 208Z" />
          </g>
          {dots([197, 219])}
        </>
      )}
      <path d="M320 222 V282" stroke="#6C6F77" strokeWidth="2" fill="none" />
      <path d="M286 330 Q320 346 354 330" stroke="#6C6F77" strokeWidth="2.5" fill="none" />
    </svg>
  )
}

export default function LivePage() {
  const [ear, setEar] = useState(0.2)
  const { longest, pts } = useMemo(() => {
    let run = 0
    let best = 0
    for (const p of SIGNAL) {
      if (p.v < ear) {
        run++
        if (run > best) best = run
      } else run = 0
    }
    return { longest: best * 0.1, pts: SIGNAL.map((p) => `${(p.t * 60).toFixed(1)},${(200 - (p.v / EAR_MAX) * 200).toFixed(1)}`).join(' ') }
  }, [ear])

  const falseAlarm = longest > FALSE_S
  const tired = longest >= MIN_S
  const msg = falseAlarm ? L.try.msgFalse : tired ? L.try.msgOk : longest === 0 ? L.try.msgMissedNone : L.try.msgMissed
  const state = falseAlarm ? L.try.states.falsa : tired ? L.try.states.Obosit : L.try.states.Atent
  const thrY = 200 - (ear / EAR_MAX) * 200

  return (
    <Page kicker={L.kicker} title={L.title} lead={L.lead}>
      <p className="-mt-6 inline-block border border-accent px-3.5 py-2.5 font-mono text-[13px] leading-normal text-accent-hover" style={{ borderRadius: 4 }}>
        {L.disclaimer}
      </p>

      <Step n={1} title={L.idea.title}>
        <Bullets items={L.idea.items.map(render)} />
      </Step>

      <Step n={2} title={L.try.title}>
        <div className="flex flex-wrap items-start gap-6">
          <div className="min-w-0 flex-[1_1_400px]">
            <Stage>
              <div className="relative aspect-[4/3] overflow-hidden">
                <FaceStage closed={tired && !falseAlarm} />
                <span className="absolute top-3.5 left-3.5 rounded-[2px] bg-stage-text px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] text-stage">{L.try.sim}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-stage-line px-5 py-4">
                <div>
                  <p className="mb-1 font-mono text-[11px] tracking-[0.06em] text-stage-muted uppercase">{L.try.result}</p>
                  <p role="status" className={`font-display text-[40px] leading-none font-bold tracking-[-0.02em] ${state === L.try.states.Atent ? 'text-stage-text' : 'text-thread'}`}>
                    {state}
                  </p>
                </div>
                <Link
                  to="/live/avansat"
                  className="inline-flex min-h-11 items-center rounded-[4px] border border-[#3a3c42] px-4 text-sm font-medium text-stage-text transition-colors hover:border-thread hover:text-thread"
                >
                  {L.try.camera}
                </Link>
              </div>
            </Stage>
            <FinePrint>{L.try.consent}</FinePrint>
          </div>

          <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-4">
            <section aria-labelledby="gr" className="rounded-[6px] border border-line bg-paper p-5">
              <h3 id="gr" className="mb-3.5 font-mono text-xs font-medium tracking-[0.06em] text-ink-faint uppercase">
                {L.try.graph}
              </h3>
              <svg viewBox="0 0 600 200" width="100%" role="img" aria-label={L.try.graphAlt} className="block overflow-visible">
                <defs>
                  <clipPath id="below">
                    <rect x="0" y={thrY} width="600" height="200" />
                  </clipPath>
                </defs>
                <g stroke="#e2e1db" strokeWidth="1">
                  <path d="M0 0H600M0 100H600M0 200H600" />
                </g>
                <polyline points={pts} fill="none" stroke="#121316" strokeWidth="2.5" strokeLinejoin="round" />
                <polyline points={pts} fill="none" stroke="#C22A12" strokeWidth="3.5" strokeLinejoin="round" clipPath="url(#below)" />
                <path d={`M0 ${thrY} H600`} stroke="#C22A12" strokeWidth="2" strokeDasharray="7 5" />
                <text x="596" y={thrY - 8} textAnchor="end" fill="#A82310" fontFamily="var(--font-mono)" fontSize="13">
                  prag {fmt(ear, 2)}
                </text>
              </svg>
              <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-faint">
                <span>{L.try.from}</span>
                <span>{L.try.to}</span>
              </div>
            </section>
            <div className="rounded-[6px] border border-line bg-paper px-5 py-2">
              <LabeledSlider label={L.try.slider} value={ear} min={0.05} max={EAR_MAX} step={0.01} threshold format={(v) => fmt(v, 2)} onChange={setEar} />
              <p role="status" className="min-h-[68px] pt-0.5 pb-3 text-[15px] leading-normal text-ink-muted">
                <b className="text-ink">{L.try.longest(`${fmt(longest, 1)} s`)}</b> {msg}
              </p>
            </div>
          </div>
        </div>
      </Step>

      <Step n={3} title={L.check.title}>
        <Quiz question={L.check.question} options={L.check.options} correct={L.check.correct} explanation={L.check.explanation} />
      </Step>

      <More title={L.more.title}>
        <p className="max-w-[40em] text-[15px] leading-normal text-ink-muted">{L.more.text}</p>
        <Link to="/live/avansat" className="mt-3 inline-block font-medium text-accent-hover underline">
          {L.more.link} →
        </Link>
      </More>
    </Page>
  )
}
