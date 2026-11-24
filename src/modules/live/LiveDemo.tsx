import { useCallback, useEffect, useRef, useState } from 'react'
import { Badge, Card, DemoButton, FinePrint, cx } from '../../components/ui/primitives'
import { LabeledSlider } from '../../components/ui/LabeledSlider'
import { live } from '../../content/live'
import { DEFAULT_THRESHOLDS, defaultRule, updateClosedTime, type State, type Thresholds } from '../../lib/drowsy'
import { CHEEK_IMAGE_LEFT, CHEEK_IMAGE_RIGHT, EYE_IMAGE_LEFT, EYE_IMAGE_RIGHT, NOSE_TIP, earOf, headTurn, type Pt } from '../../lib/face'
import { detectFace, loadFaceLandmarker } from '../../lib/faceLandmarker'
import { simSample } from '../../lib/simSignal'
import { More } from '../../components/ui/More'
import { Experiment } from './Experiment'
import { FaceSketch } from './FaceSketch'

type Phase = 'idle' | 'starting' | 'camera' | 'sim'
type RuleFn = (ear: number, turn: number, closed: number, t: Thresholds) => State
interface View {
  state: State
  ear: number
  turn: number
  closed: number
  face: boolean
}

const WINDOW_S = 10
const GRAPH_W = 600
const GRAPH_H = 150
const EAR_MAX = 0.45

const STATE_STYLE: Record<State, string> = {
  Atent: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  Obosit: 'border-amber-300 bg-amber-50 text-amber-900',
  Distras: 'border-red-300 bg-red-50 text-red-900',
}
const STATE_ICON: Record<State, string> = { Atent: '●', Obosit: '◐', Distras: '▲' }

export function LiveDemo({ rule, onRuleError }: { rule: RuleFn; onRuleError: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [notice, setNotice] = useState('')
  const [busyMsg, setBusyMsg] = useState('')
  const [view, setView] = useState<View>({ state: 'Atent', ear: 0.3, turn: 0, closed: 0, face: true })
  const [thr, setThr] = useState<Thresholds>(DEFAULT_THRESHOLDS)
  const [showPoints, setShowPoints] = useState(true)
  const [sound, setSound] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const graphRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef(0)
  const runRef = useRef(0) // jeton: o pornire nouă anulează bucla veche
  const thrRef = useRef(thr)
  const ruleRef = useRef(rule)
  const soundRef = useRef(sound)
  const pointsRef = useRef(showPoints)
  const audioRef = useRef<AudioContext | null>(null)
  const onRuleErrorRef = useRef(onRuleError)
  useEffect(() => {
    thrRef.current = thr
    ruleRef.current = rule
    soundRef.current = sound
    pointsRef.current = showPoints
    onRuleErrorRef.current = onRuleError
  }, [thr, rule, sound, showPoints, onRuleError])

  const releaseCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    streamRef.current = null
    const v = videoRef.current
    if (v) v.srcObject = null
  }, [])

  const stop = useCallback(() => {
    runRef.current++
    cancelAnimationFrame(rafRef.current)
    releaseCamera()
    audioRef.current?.close().catch(() => undefined)
    audioRef.current = null
    setPhase('idle')
    setBusyMsg('')
  }, [releaseCamera])

  // la ieșirea din pagină: oprește camera și bucla
  useEffect(
    () => () => {
      runRef.current++
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((tr) => tr.stop())
      streamRef.current = null
      audioRef.current?.close().catch(() => undefined)
    },
    [],
  )

  const beep = () => {
    try {
      audioRef.current ??= new AudioContext()
      const ctx = audioRef.current
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = 880
      g.gain.value = 0.05
      o.connect(g).connect(ctx.destination)
      o.start()
      o.stop(ctx.currentTime + 0.15)
    } catch {
      /* fără sunet */
    }
  }

  const runLoop = useCallback((kind: 'camera' | 'sim', lm: Awaited<ReturnType<typeof loadFaceLandmarker>> | null) => {
    const token = ++runRef.current
    const buf: { t: number; ear: number }[] = []
    let simT = 0
    let last = performance.now()
    let t = 0
    let closed = 0
    let lastVideoTime = -1
    let ear = 0.3
    let turn = 0
    let face = true
    let pts: Pt[] | null = null
    let lastView = 0
    let lastBeep = 0
    let ruleFailed = false

    const frame = () => {
      if (runRef.current !== token) return
      const now = performance.now()
      const dt = Math.min(0.2, (now - last) / 1000)
      last = now
      t += dt
      const th = thrRef.current

      if (kind === 'sim') {
        simT += dt
        const s = simSample(simT)
        ear = s.ear
        turn = s.turn
        face = true
      } else {
        const v = videoRef.current
        if (v && lm && v.readyState >= 2 && v.currentTime !== lastVideoTime) {
          lastVideoTime = v.currentTime
          try {
            pts = detectFace(lm, v, now)
          } catch {
            pts = null
          }
          face = pts !== null
          if (pts) {
            ear = earOf(pts)
            turn = headTurn(pts)
          }
        }
      }

      closed = face ? updateClosedTime(closed, ear, dt, th.ear) : 0
      let state: State
      if (!face) state = 'Distras'
      else {
        try {
          state = ruleRef.current(ear, turn, closed, th)
        } catch {
          state = defaultRule(ear, turn, closed, th)
          if (!ruleFailed) {
            ruleFailed = true
            onRuleErrorRef.current()
          }
        }
      }

      buf.push({ t, ear: face ? ear : NaN })
      while (buf.length && t - buf[0].t > WINDOW_S + 1) buf.shift()
      drawGraph(graphRef.current, buf, t, th.ear)
      if (kind === 'camera') drawOverlay(overlayRef.current, videoRef.current, pointsRef.current ? pts : null)

      if (soundRef.current && state !== 'Atent' && now - lastBeep > 1200) {
        lastBeep = now
        beep()
      }
      if (now - lastView > 100) {
        lastView = now
        setView({ state, ear, turn, closed, face })
      }
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
  }, [])

  const startSim = useCallback(
    (msg = '') => {
      releaseCamera()
      setNotice(msg)
      setBusyMsg('')
      setPhase('sim')
      runLoop('sim', null)
    },
    [releaseCamera, runLoop],
  )

  const startCamera = async () => {
    stop()
    const token = runRef.current
    setNotice('')
    setPhase('starting')
    setBusyMsg(live.startingCam)
    if (!navigator.mediaDevices?.getUserMedia) return startSim(live.errors.missing)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false })
    } catch (e) {
      const name = e instanceof DOMException ? e.name : ''
      return startSim(name === 'NotAllowedError' || name === 'SecurityError' ? live.errors.denied : name === 'NotFoundError' || name === 'OverconstrainedError' ? live.errors.missing : live.errors.generic)
    }
    if (runRef.current !== token) {
      stream.getTracks().forEach((tr) => tr.stop())
      return
    }
    streamRef.current = stream
    const v = videoRef.current
    if (!v) return startSim(live.errors.generic)
    v.srcObject = stream
    try {
      await v.play()
      setBusyMsg(live.loadingModel)
      const lm = await loadFaceLandmarker()
      if (runRef.current !== token) return // oprit între timp
      setPhase('camera')
      setBusyMsg('')
      runLoop('camera', lm)
    } catch (e) {
      console.warn('pornirea camerei/modelului a eșuat', e)
      if (runRef.current === token) startSim(live.errors.model)
    }
  }

  const bar = (v: number, max: number) => Math.max(0, Math.min(100, (v / max) * 100))

  return (
    <div className="space-y-8">
      <Card className="border-amber-300 bg-amber-50/60 !p-4">
        <p className="text-sm font-medium text-amber-950">{live.disclaimer}</p>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* stânga: cameră / simulare */}
        <div>
          {phase === 'idle' || phase === 'starting' ? (
            <Card>
              <h3 className="font-semibold">{live.consentTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed">{live.consent}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <DemoButton variant="solid" disabled={phase === 'starting'} onClick={() => void startCamera()}>
                  {live.startCam}
                </DemoButton>
                <DemoButton disabled={phase === 'starting'} onClick={() => startSim()}>
                  {live.startSim}
                </DemoButton>
              </div>
              {busyMsg ? <p role="status" className="mt-3 text-sm text-ink-muted">{busyMsg}</p> : null}
              {notice ? <p role="alert" className="mt-3 text-sm text-amber-900">{notice}</p> : null}
            </Card>
          ) : (
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone={phase === 'sim' ? 'soft' : 'line'}>{phase === 'sim' ? live.simBadge : live.camBadge}</Badge>
                <DemoButton variant="outline" onClick={stop}>{live.stop}</DemoButton>
              </div>
              {notice ? <p role="alert" className="mb-2 text-sm text-amber-900">{notice}</p> : null}
              {phase === 'sim' ? <FinePrint>{live.simNote}</FinePrint> : null}
            </div>
          )}

          {/* video-ul rămâne montat ca să putem lega fluxul; se vede doar cu camera pornită */}
          <div className={cx('relative mx-auto mt-3 w-full max-w-[480px]', phase === 'camera' ? '' : 'hidden')}>
            <video ref={videoRef} muted playsInline aria-label={live.videoAlt} className="w-full -scale-x-100 rounded-xl border border-line bg-black" />
            <canvas ref={overlayRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100" />
          </div>
          {phase === 'sim' ? (
            <div className="mt-3">
              <FaceSketch ear={view.ear} turn={view.turn} />
            </div>
          ) : null}
          {phase === 'camera' ? (
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} className="accent-accent" />
              {live.showPoints}
            </label>
          ) : null}
        </div>

        {/* dreapta: stare, valori, grafic, slidere */}
        <div className="space-y-5">
          <div className={cx('rounded-2xl border-2 p-5', STATE_STYLE[view.state])}>
            <p className="font-mono text-xs tracking-wide uppercase opacity-80">{live.stateLabel}</p>
            <p aria-live="polite" aria-atomic="true" className="mt-1 text-4xl font-bold tracking-tight">
              <span aria-hidden>{STATE_ICON[view.state]} </span>
              {live.states[view.state]}
            </p>
            <p className="mt-1 text-sm">{view.face ? live.stateHelp[view.state] : live.noFace}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-sm">
            <Meter label={live.ear} value={fmt(view.ear, 2)} pct={bar(view.ear, EAR_MAX)} />
            <Meter label={live.turn} value={fmt(view.turn, 2)} pct={bar(Math.abs(view.turn), 1)} />
            <Meter label={live.closed} value={`${view.closed.toFixed(1).replace('.', ',')} s`} pct={bar(view.closed, 3)} />
          </div>

          <figure>
            <figcaption className="mb-1 font-mono text-xs text-ink-muted">{live.graphTitle}</figcaption>
            <canvas ref={graphRef} width={GRAPH_W} height={GRAPH_H} role="img" aria-label={live.graphAlt} className="w-full rounded-lg border border-line bg-paper" />
          </figure>

          <div className="space-y-4">
            <LabeledSlider label={live.sliders.ear} value={thr.ear} min={0.05} max={0.4} step={0.01} onChange={(v) => setThr({ ...thr, ear: v })} format={(v) => v.toFixed(2).replace('.', ',')} />
            <LabeledSlider label={live.sliders.duration} value={thr.duration} min={0.2} max={4} step={0.1} onChange={(v) => setThr({ ...thr, duration: v })} format={(v) => v.toFixed(1).replace('.', ',')} />
            <LabeledSlider label={live.sliders.turn} value={thr.turn} min={0.1} max={0.9} step={0.05} onChange={(v) => setThr({ ...thr, turn: v })} format={(v) => v.toFixed(2).replace('.', ',')} />
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className="accent-accent" />
              {live.sound}
            </label>
          </div>
        </div>
      </div>

      <More title={live.experiment.title}>
        <Experiment current={view.state} />
      </More>
    </div>
  )
}

/** Număr cu virgulă, fără „-0,00”. */
function fmt(v: number, d: number): string {
  const s = v.toFixed(d)
  return (/^-0(\.0+)?$/.test(s) ? s.slice(1) : s).replace('.', ',')
}

function Meter({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="font-sans text-[11px] leading-tight text-ink-muted">{label}</p>
      <p className="mt-1 tabular-nums">{value}</p>
      <div className="mt-2 h-1.5 rounded-full bg-line" aria-hidden>
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function drawGraph(c: HTMLCanvasElement | null, buf: { t: number; ear: number }[], now: number, thr: number) {
  const ctx = c?.getContext('2d')
  if (!c || !ctx) return
  ctx.clearRect(0, 0, GRAPH_W, GRAPH_H)
  const y = (v: number) => GRAPH_H - 6 - (Math.min(EAR_MAX, Math.max(0, v)) / EAR_MAX) * (GRAPH_H - 12)
  const x = (tt: number) => ((tt - (now - WINDOW_S)) / WINDOW_S) * GRAPH_W
  // zona „închis”
  ctx.fillStyle = 'rgba(239,68,68,0.08)'
  ctx.fillRect(0, y(thr), GRAPH_W, GRAPH_H - y(thr))
  ctx.strokeStyle = '#dc2626'
  ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(0, y(thr))
  ctx.lineTo(GRAPH_W, y(thr))
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#b91c1c'
  ctx.font = '11px ui-monospace, monospace'
  ctx.fillText(`${live.threshold} ${thr.toFixed(2).replace('.', ',')}`, 6, y(thr) - 4)
  ctx.strokeStyle = '#4f46e5'
  ctx.lineWidth = 2
  ctx.beginPath()
  let pen = false
  for (const p of buf) {
    if (Number.isNaN(p.ear)) {
      pen = false
      continue
    }
    if (pen) ctx.lineTo(x(p.t), y(p.ear))
    else ctx.moveTo(x(p.t), y(p.ear))
    pen = true
  }
  ctx.stroke()
  ctx.lineWidth = 1
}

function drawOverlay(c: HTMLCanvasElement | null, v: HTMLVideoElement | null, pts: Pt[] | null) {
  const ctx = c?.getContext('2d')
  if (!c || !ctx || !v || !v.videoWidth) return
  if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
    c.width = v.videoWidth
    c.height = v.videoHeight
  }
  ctx.clearRect(0, 0, c.width, c.height)
  if (!pts) return
  const dot = (i: number, color: string, r = 3) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(pts[i].x, pts[i].y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  for (const i of EYE_IMAGE_LEFT) dot(i, '#22c55e')
  for (const i of EYE_IMAGE_RIGHT) dot(i, '#22c55e')
  dot(NOSE_TIP, '#f59e0b', 4)
  dot(CHEEK_IMAGE_LEFT, '#38bdf8', 4)
  dot(CHEEK_IMAGE_RIGHT, '#38bdf8', 4)
}
