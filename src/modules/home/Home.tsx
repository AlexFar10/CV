import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ImageCanvas } from '../../components/image/ImageCanvas'
import { ThresholdThread } from '../../components/learn/ThresholdThread'
import { Stage, StageLabel } from '../../components/ui/Stage'
import { modules } from '../../app/modules'
import { t } from '../../content/ro'
import { grain, brightness, sepia, vignette, threshold } from '../../lib/filters'
import { loadImg, lumaHistogram, type Img } from '../../lib/image'

const base = import.meta.env.BASE_URL
const BINS = 32

function useImage(name: string): Img | null {
  const [img, setImg] = useState<Img | null>(null)
  useEffect(() => {
    let alive = true
    loadImg(`${base}images/${name}`).then((i) => alive && setImg(i)).catch(() => undefined)
    return () => {
      alive = false
    }
  }, [name])
  return img
}

/** Banc de lucru: pragul pe camera.png, cu histograma luminanței. Calcule reale din lib/. */
function Bench() {
  const h = t.home.bench
  const img = useImage('camera.png')
  const [p, setP] = useState(100)
  const hist = useMemo(() => (img ? lumaHistogram(img) : null), [img])
  const bars = useMemo(() => {
    if (!hist) return null
    const b = Array.from({ length: BINS }, (_, i) => hist.slice(i * 8, i * 8 + 8).reduce((a, c) => a + c, 0))
    const mx = Math.max(...b)
    return b.map((v) => Math.max(2, Math.round((v / mx) * 100)))
  }, [hist])
  const out = useMemo(() => (img ? threshold(img, p) : null), [img, p])
  const white = useMemo(() => {
    if (!hist) return 0
    const total = hist.reduce((a, c) => a + c, 0)
    let w = 0
    for (let v = p + 1; v < 256; v++) w += hist[v]
    return Math.round((w / total) * 100)
  }, [hist, p])
  const k = Math.min(BINS - 1, Math.floor(p / 8))

  return (
    <Stage className="shadow-[0_24px_48px_-24px_rgba(16,17,20,.55)]">
      <div className="flex items-center justify-between gap-4 border-b border-stage-line px-5 py-3.5 font-mono text-xs text-stage-muted">
        <span>{h.title}</span>
        <span className="hidden sm:inline">{h.formula}</span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        {out ? <ImageCanvas img={out} role="img" aria-label={h.alt} className="absolute inset-0 size-full object-cover object-[50%_38%] [image-rendering:pixelated]" /> : null}
        {img ? (
          <div className="absolute bottom-4 left-4 w-[132px] border-2 border-stage-text bg-black" style={{ borderRadius: 2 }}>
            <ImageCanvas img={img} role="img" aria-label={h.altOrig} className="block aspect-square w-full object-cover" />
            <span className="absolute top-0 left-0 bg-stage-text px-1.5 py-0.5 font-mono text-[11px] text-stage">{h.original}</span>
          </div>
        ) : null}
        <StageLabel className="right-4 !left-auto top-4">{h.after}</StageLabel>
      </div>
      <div className="px-5 pt-5 pb-3">
        <div className="mb-3.5 flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-[13px] text-stage-muted">{h.p}</span>
            <span className="font-display text-[44px] leading-none font-bold tracking-[-0.02em] text-thread">{p}</span>
          </div>
          <span role="status" className="text-right font-mono text-[13px] text-stage-muted">
            {t.home.bench.white(white)}
          </span>
        </div>
        <div role="img" aria-label={h.histAlt} className="relative mx-[9px] h-[84px]">
          <div className="absolute inset-0 flex items-end gap-0.5">
            {bars?.map((v, i) => (
              <div key={i} className="min-w-0 flex-1" style={{ height: `${v}%`, background: i < k ? '#4a4c53' : i === k ? '#8c8e95' : '#e8e8e4' }} />
            ))}
          </div>
          <div className="absolute -top-1.5 bottom-0 w-0.5 bg-thread" style={{ left: `calc(${(p / 255) * 100}% - 1px)` }} />
        </div>
        <div className="mx-[9px] mt-1.5 flex justify-between font-mono text-[11px] text-[#8c8e95]">
          <span>{h.black}</span>
          <span>{h.whiteLabel}</span>
        </div>
        <label htmlFor="home-p" className="sr-only">
          {h.slider}
        </label>
        <input id="home-p" type="range" className="on-stage" min={0} max={255} value={p} onChange={(e) => setP(Number(e.target.value))} />
      </div>
    </Stage>
  )
}

/** Miniatură de card: jumătate original, jumătate rezultat, despărțite de o linie roșie. */
function Split({ a, b, la, lb }: { a: Img | null; b: Img | null; la: string; lb: string }) {
  return (
    <div className="relative aspect-[16/8] overflow-hidden bg-stage">
      {b ? <ImageCanvas img={b} aria-hidden className="absolute inset-0 size-full object-cover object-[50%_40%]" /> : null}
      {a ? <ImageCanvas img={a} aria-hidden className="absolute inset-0 size-full object-cover object-[50%_40%]" style={{ clipPath: 'inset(0 50% 0 0)' }} /> : null}
      <div aria-hidden className="absolute inset-y-0 left-1/2 w-0.5 bg-thread" />
      <StageLabel>{la}</StageLabel>
      <StageLabel className="right-3 !left-auto">{lb}</StageLabel>
    </div>
  )
}

function Thumbs({ id }: { id: string }) {
  const cat = useImage('chelsea.png')
  const filtered = useMemo(() => (cat ? vignette(sepia(cat, 0.85), 0.7) : null), [cat])
  const night = useMemo(() => (cat ? grain(brightness(cat, -90), 45, 4) : null), [cat])
  if (id === 'filters') return <Split a={cat} b={filtered} la="înainte" lb="după" />
  if (id === 'phone') return <Split a={night} b={cat} la="un cadru" lb="mai multe cadre, mediate" />
  if (id === 'live')
    return (
      <div className="relative aspect-[16/8] overflow-hidden bg-stage">
        <svg viewBox="0 0 640 320" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Față schematică cu punctele din jurul ochilor" className="absolute inset-0">
          <g stroke="#2a2c32" strokeWidth="1">
            <path d="M0 80H640M0 160H640M0 240H640M160 0V320M320 0V320M480 0V320" />
          </g>
          <ellipse cx="320" cy="168" rx="92" ry="124" fill="none" stroke="#6c6f77" strokeWidth="2" />
          <g fill="none" stroke="#e8e8e4" strokeWidth="2">
            <path d="M262 140 Q282 124 302 140 Q282 152 262 140Z" />
            <path d="M338 140 Q358 124 378 140 Q358 152 338 140Z" />
          </g>
          <g fill="#ff5a3c">
            {[262, 302, 338, 378].map((x) => (
              <circle key={x} cx={x} cy={140} r={3.5} />
            ))}
            {[272, 292, 348, 368].flatMap((x) => [132, 147].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={3.5} />))}
          </g>
          <path d="M300 216 Q320 226 340 216" fill="none" stroke="#6c6f77" strokeWidth="2" />
          <path d="M320 150 V190" stroke="#6c6f77" strokeWidth="2" />
        </svg>
        <StageLabel className="!bg-stage-text !text-stage">SIMULARE</StageLabel>
        <span className="absolute right-3 bottom-3 rounded-[2px] border border-thread bg-stage px-2 py-[3px] font-mono text-[11px] text-thread">Atent</span>
      </div>
    )
  return (
    <div className="relative aspect-[16/8] overflow-hidden bg-stage">
      <svg viewBox="0 0 640 320" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Două distribuții de scoruri care se suprapun, cu linia pragului" className="absolute inset-0">
        <path d="M40 280 C90 280 120 60 190 60 C260 60 300 280 400 280Z" fill="#6c6f77" fillOpacity=".7" />
        <path d="M240 280 C330 280 380 80 450 80 C520 80 540 280 600 280Z" fill="#7fa6ff" fillOpacity=".75" />
        <path d="M40 280H600" stroke="#e8e8e4" strokeWidth="2" />
        <path d="M320 24V280" stroke="#ff5a3c" strokeWidth="3.5" />
      </svg>
      <StageLabel>fără problemă</StageLabel>
      <StageLabel className="right-3 !left-auto !text-data-dark">cu problemă</StageLabel>
    </div>
  )
}

export function Home() {
  const goThread = (e: React.MouseEvent) => {
    e.preventDefault()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('fir')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }
  const first = modules.find((m) => m.component)!
  return (
    <div>
      {/* HERO */}
      <section>
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 pt-12 pb-16 min-[980px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-[980px]:gap-[72px] min-[980px]:px-10 min-[980px]:pt-[72px] min-[980px]:pb-[88px]">
          <div className="flex min-w-0 flex-col gap-7">
            <p className="font-mono text-[13px] tracking-[0.08em] text-accent-hover uppercase">{t.home.kicker}</p>
            <h1 className="font-display text-[52px] leading-[0.98] font-bold tracking-[-0.035em] text-balance min-[980px]:text-[80px]">
              {t.home.title}
              <span className="text-accent">?</span>
            </h1>
            <p className="max-w-[30em] text-xl leading-normal text-ink-muted text-pretty">{t.home.lead}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link to={`/${first.path}`} className="inline-flex min-h-12 items-center gap-2.5 rounded-[4px] bg-accent px-6 text-base font-semibold text-white transition-colors hover:bg-accent-hover">
                {t.home.start} <ArrowRight size={18} aria-hidden />
              </Link>
              <a href="#fir" onClick={goThread} className="border-b border-current py-3 text-base leading-tight font-medium transition-colors hover:text-accent">
                {t.home.threadLink}
              </a>
            </div>
          </div>
          <div className="min-w-0">
            <Bench />
          </div>
        </div>
      </section>

      {/* DEMO-URI */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1280px] px-5 py-16 min-[980px]:px-10 min-[980px]:py-20">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <h2 className="font-display text-[44px] leading-[1.05] font-bold tracking-[-0.025em]">{t.home.pick}</h2>
            <p className="max-w-[28em] text-[17px] text-ink-muted">{t.home.pickLead}</p>
          </div>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(520px,100%),1fr))] gap-6">
            {modules
              .filter((m) => m.component)
              .map((m, i) => (
                <li key={m.id}>
                  <Link to={`/${m.path}`} className="flex h-full flex-col overflow-hidden rounded-[6px] border border-line bg-paper transition-colors hover:border-accent">
                    <Thumbs id={m.id} />
                    <div className="flex flex-col gap-2.5 px-7 pt-6 pb-7">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[13px] text-accent-hover">{String(i + 1).padStart(2, '0')}</span>
                        <span className="font-mono text-xs text-ink-faint">{t.home.tags[m.id as keyof typeof t.home.tags]}</span>
                      </div>
                      <h3 className="font-display text-[28px] font-bold tracking-[-0.02em]">{m.title}</h3>
                      <p className="text-base leading-normal text-ink-muted">{m.description}</p>
                      <span className="mt-1.5 inline-flex items-center gap-2 text-[15px] font-semibold text-accent-hover">
                        {t.home.open} <ArrowRight size={16} aria-hidden />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* FIRUL ROȘU */}
      <section id="fir" className="border-y border-line bg-band">
        <div className="mx-auto max-w-[1280px] px-5 py-16 min-[980px]:px-10 min-[980px]:pt-20 min-[980px]:pb-[88px]">
          <p className="mb-4 font-mono text-[13px] tracking-[0.08em] text-accent-hover uppercase">{t.home.thread.kicker}</p>
          <h2 className="font-display max-w-[18em] text-[44px] leading-[1.05] font-bold tracking-[-0.025em] text-balance">{t.home.thread.title}</h2>
          <p className="mt-5 mb-16 max-w-[36em] text-lg leading-normal text-ink-muted">{t.home.thread.lead}</p>
          <ThresholdThread />
        </div>
      </section>

      {/* PARTEA 2 */}
      <section className="bg-stage text-stage-text">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-16 min-[980px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-[980px]:gap-[72px] min-[980px]:px-10 min-[980px]:py-[88px]">
          <div className="flex min-w-0 flex-col items-start gap-5">
            <span className="inline-flex rounded-[2px] border border-thread px-3 py-1.5 font-mono text-xs tracking-[0.08em] text-thread uppercase">{t.home.part2.badge}</span>
            <h2 className="font-display text-[52px] leading-none font-bold tracking-[-0.03em]">{t.home.part2.title}</h2>
            <p className="max-w-[28em] text-xl leading-normal text-[#c9cace] text-pretty">{t.home.part2.text}</p>
            <span className="mt-2 border-t border-[#3a3c42] pt-3.5 font-mono text-[13px] text-stage-muted">{t.home.part2.note}</span>
          </div>
          <figure className="m-0 min-w-0 rounded-[6px] border border-stage-line bg-[#16171b] px-7 pt-7 pb-5">
            <svg viewBox="0 0 640 280" width="100%" role="img" aria-label={t.home.part2.figAlt} className="block">
              <path d="M20 230 C60 230 80 40 130 40 C180 40 220 230 330 230Z" fill="#6c6f77" fillOpacity=".75" />
              <path d="M230 230 C310 230 350 60 410 60 C470 60 490 230 620 230Z" fill="#7fa6ff" fillOpacity=".8" />
              <path d="M20 230H620" stroke="#e8e8e4" strokeWidth="2" />
              <path d="M290 14V230" stroke="#ff5a3c" strokeWidth="3.5" />
              <text x="298" y="26" fill="#ff5a3c" fontFamily="var(--font-mono)" fontSize="14">prag p</text>
              <text x="20" y="256" fill="#a3a5ab" fontFamily="var(--font-mono)" fontSize="13">{t.home.part2.none}</text>
              <text x="620" y="256" fill="#a3a5ab" fontFamily="var(--font-mono)" fontSize="13" textAnchor="end">{t.home.part2.sure}</text>
            </svg>
            <figcaption className="mt-3.5 font-mono text-xs text-stage-muted">{t.home.part2.figCap}</figcaption>
          </figure>
        </div>
      </section>
    </div>
  )
}
