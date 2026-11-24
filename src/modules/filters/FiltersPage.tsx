import { useMemo, useState } from 'react'
import { Section, type SectionMeta } from '../../components/layout/Section'
import { SideNav } from '../../components/layout/SideNav'
import { BeforeAfter } from '../../components/image/BeforeAfter'
import { Histogram } from '../../components/image/Histogram'
import { ImagePicker } from '../../components/image/ImagePicker'
import { PixelInspector } from '../../components/image/PixelInspector'
import { HintBox } from '../../components/learn/HintBox'
import { Term } from '../../components/learn/Term'
import { Card } from '../../components/ui/primitives'
import { useThrottled } from '../../hooks/useThrottled'
import { FILTER_BY_ID, applyStack, type StackItem } from '../../lib/filters'
import { lumaHistogram, type Img } from '../../lib/image'
import { toStack, BUILT_IN } from '../../lib/presets'
import { level3, studioText } from '../../content/filters'
import { CodeLab } from './CodeLab'
import { FilterGame } from './FilterGame'
import { KernelLab } from './KernelLab'
import { MyPresets } from './MyPresets'
import { StackEditor } from './StackEditor'

const sections: SectionMeta[] = [
  {
    id: 'joaca',
    num: '01',
    kicker: 'Joacă',
    title: 'Studio de filtre',
    lead: 'Un filtru e o regulă aplicată fiecărui pixel. Construiește o stivă de filtre, citește formula fiecăruia și vezi ce se întâmplă cu numerele și cu histograma.',
  },
  {
    id: 'schimba',
    num: '02',
    kicker: 'Schimbă',
    title: 'Pune-ți amprenta',
    lead: 'Folosește propria imagine (sau o poză făcută acum), salvează-ți presetul și vezi dacă recunoști un filtru doar din rezultat.',
  },
  {
    id: 'descopera',
    num: '03',
    kicker: 'Descoperă',
    title: 'Schimbă regula',
    lead: 'Un filtru pe vecinătate e un tabel de numere. Un filtru oarecare e o funcție. Scrie-le tu.',
  },
]

export default function FiltersPage() {
  const [src, setSrc] = useState<Img | null>(null)
  const [stack, setStack] = useState<StackItem[]>(() => toStack(BUILT_IN.retro))
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const tStack = useThrottled(stack, 70)
  const out = useMemo(() => (src ? applyStack(src, tStack) : null), [src, tStack])
  const hBefore = useMemo(() => (src ? lumaHistogram(src) : null), [src])
  const hAfter = useMemo(() => (out ? lumaHistogram(out) : null), [out])
  const hasKernel = stack.some((s) => s.enabled && FILTER_BY_ID[s.id].kind === 'kernel')

  return (
    <>
      <SideNav sections={sections} />

      <Section meta={sections[0]}>
        <ImagePicker onChange={(img) => setSrc(img)} />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-5 lg:sticky lg:top-4 lg:self-start">
            {src && out ? (
              <>
                <BeforeAfter before={src} after={out} alt={studioText.altCompare} onProbe={setPos} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <PixelInspector before={src} after={out} pos={pos} neighborhood={hasKernel} />
                  {hBefore && hAfter ? <Histogram before={hBefore} after={hAfter} /> : null}
                </div>
              </>
            ) : null}
            <Card className="bg-accent-soft/50 !p-4 text-sm leading-relaxed">
              <span className="font-mono text-xs tracking-wide text-accent-text uppercase">Firul roșu: pragul</span>
              <br />
              Adaugă filtrul <b>Prag</b>: fiecare pixel e comparat cu un număr și devine alb sau negru. Mută pragul și urmărește histograma:{' '}
              <Term id="prag">pragul</Term> împarte valorile în două grupe.
            </Card>
          </div>
          <StackEditor stack={stack} onChange={setStack} />
        </div>
      </Section>

      <Section meta={sections[1]}>
        <div className="grid gap-10 lg:grid-cols-2">
          <MyPresets stack={stack} onApply={setStack} />
          <div>
            <h3 className="text-xl font-bold tracking-tight">Ghicește filtrul</h3>
            <p className="mt-2 mb-4 text-sm text-ink-muted">Vezi o pereche înainte / după. Care filtru a fost aplicat? 8 runde.</p>
            <FilterGame />
          </div>
        </div>
        <p className="mt-8 text-sm text-ink-muted">
          Ai încărcat o imagine proprie? Ea rămâne în browser, redusă la maximum 640 px pe latura lungă. Folosește butoanele de sus (Încarcă imaginea ta sau Fă o poză acum).
        </p>
      </Section>

      <Section meta={sections[2]}>
        {src ? (
          <div className="space-y-12">
            <div className="space-y-4">
              <KernelLab src={src} />
              <HintBox title="Indicii pentru kernel" steps={level3.kernelHints} />
            </div>
            <div className="space-y-4">
              <CodeLab src={src} />
              <HintBox title="Indicii pentru cod" steps={level3.codeHints} />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <h3 className="font-semibold">{level3.challengesTitle}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                  {level3.challenges.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="font-semibold">{level3.aiTitle}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                  {level3.ai.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="font-semibold">{level3.mistakesTitle}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                  {level3.mistakes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        ) : null}
      </Section>
    </>
  )
}
