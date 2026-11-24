import { Link } from 'react-router-dom'
import { Page, Step } from '../../components/layout/Page'
import { Quiz } from '../../components/learn/Quiz'
import { ThresholdThread } from '../../components/learn/ThresholdThread'
import { More } from '../../components/ui/More'
import { recap } from '../../content/recap'
import { ThresholdLab } from './ThresholdLab'

export default function RecapPage() {
  return (
    <Page kicker={recap.kicker} title={recap.title} lead={recap.lead}>
      <Step n={1} title={recap.ideaTitle}>
        <ThresholdThread compact />
      </Step>
      <Step n={2} title={recap.lab.stepTitle}>
        <p className="mb-6 max-w-[40em] text-[17px] leading-normal text-ink-muted text-pretty">{recap.lab.lead}</p>
        <ThresholdLab />
      </Step>
      <Step n={3} title="Verifică-te">
        <Quiz {...recap.quiz} />
      </Step>
      <aside className="rounded-[6px] bg-stage p-8 text-stage-text">
        <span className="inline-block rounded-[2px] border border-thread px-2.5 py-1 font-mono text-xs tracking-[0.08em] text-thread uppercase">{recap.part2.badge}</span>
        <p className="mt-4 max-w-[36em] text-lg leading-[1.55] text-[#c9cace] text-pretty">{recap.part2.short}</p>
      </aside>
      <More title={recap.more.title}>
        <p className="max-w-[40em] text-[15px] leading-normal text-ink-muted">{recap.more.text}</p>
        <Link to="/recapitulare/avansat" className="mt-3 inline-block font-medium text-accent-hover underline">
          {recap.more.link} →
        </Link>
      </More>
    </Page>
  )
}
