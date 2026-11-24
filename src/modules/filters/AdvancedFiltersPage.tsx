import { useMemo, useState } from 'react'
import { BeforeAfter } from '../../components/image/BeforeAfter'
import { Histogram } from '../../components/image/Histogram'
import { ImagePicker } from '../../components/image/ImagePicker'
import { PixelInspector } from '../../components/image/PixelInspector'
import { HintBox } from '../../components/learn/HintBox'
import { Page, PageBlock } from '../../components/layout/Page'
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

export default function AdvancedFiltersPage() {
  const [src, setSrc] = useState<Img | null>(null)
  const [stack, setStack] = useState<StackItem[]>(() => toStack(BUILT_IN.retro))
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const tStack = useThrottled(stack, 70)
  const out = useMemo(() => (src ? applyStack(src, tStack) : null), [src, tStack])
  const hBefore = useMemo(() => (src ? lumaHistogram(src) : null), [src])
  const hAfter = useMemo(() => (out ? lumaHistogram(out) : null), [out])
  const hasKernel = stack.some((s) => s.enabled && FILTER_BY_ID[s.id].kind === 'kernel')

  return (
    <Page kicker="01 · Avansat" title="Filtre: stivă, kernel și cod" lead="Pune filtre unul peste altul, scrie-ți kernelul sau codul. Ordinea contează." back={{ to: '/filtre', label: 'Înapoi la varianta simplă' }}>
      <ImagePicker onChange={(img) => setSrc(img)} />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {src && out ? (
            <>
              <BeforeAfter before={src} after={out} alt={studioText.altCompare} onProbe={setPos} />
              <div className="grid gap-4 sm:grid-cols-2">
                <PixelInspector before={src} after={out} pos={pos} neighborhood={hasKernel} />
                {hBefore && hAfter ? <Histogram before={hBefore} after={hAfter} /> : null}
              </div>
              <p className="text-sm text-ink-muted">
                <b className="text-accent-text">Firul roșu: pragul.</b> Adaugă „Prag”: orice pixel mai luminos decât p devine alb, restul negru.
              </p>
            </>
          ) : null}
        </div>
        <StackEditor stack={stack} onChange={setStack} />
      </div>

      <PageBlock title="Joc: ghicește filtrul">
        <FilterGame />
      </PageBlock>
      <PageBlock title="Salvează-ți presetul">
        <MyPresets stack={stack} onApply={setStack} />
      </PageBlock>
      <PageBlock title="Scrie-ți propriul filtru (kernel și cod)">
        {src ? (
          <div className="space-y-10">
            <div className="space-y-4">
              <KernelLab src={src} />
              <HintBox title="Indicii pentru kernel" steps={level3.kernelHints} />
            </div>
            <div className="space-y-4">
              <CodeLab src={src} />
              <HintBox title="Indicii pentru cod" steps={level3.codeHints} />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {(
                [
                  [level3.challengesTitle, level3.challenges],
                  [level3.aiTitle, level3.ai],
                  [level3.mistakesTitle, level3.mistakes],
                ] as const
              ).map(([title, items]) => (
                <Card key={title}>
                  <h3 className="font-semibold">{title}</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                    {items.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </PageBlock>
    </Page>
  )
}
