import { useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../../components/layout/Page'
import { More } from '../../components/ui/More'
import { cx } from '../../components/ui/primitives'
import { phoneSimple as ps } from '../../content/phone'
import { NightSimple } from './NightSimple'
import { PortraitSimple } from './PortraitSimple'

type Tab = 'night' | 'portrait'
const ORDER: Tab[] = ['night', 'portrait']

export default function PhonePage() {
  const [tab, setTab] = useState<Tab>('night')
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = e.key === 'ArrowRight' ? (i + 1) % 2 : e.key === 'ArrowLeft' ? (i + 1) % 2 : -1
    if (n < 0) return
    e.preventDefault()
    setTab(ORDER[n])
    document.getElementById(`ptab-${ORDER[n]}`)?.focus()
  }
  return (
    <Page kicker={ps.kicker} title={ps.title} lead={ps.lead}>
      <div role="tablist" aria-label={ps.tabsLabel} className="flex flex-wrap gap-2">
        {ORDER.map((t, i) => (
          <button
            key={t}
            id={`ptab-${t}`}
            role="tab"
            type="button"
            aria-selected={tab === t}
            aria-controls="ptab-panel"
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx(
              'min-h-11 cursor-pointer rounded-[4px] border px-5 text-[15px] font-medium transition-colors',
              tab === t ? 'border-ink bg-ink text-white' : 'border-line-strong bg-paper text-ink hover:border-accent hover:text-accent-hover',
            )}
          >
            {ps.tabs[t]}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="ptab-panel" aria-labelledby={`ptab-${tab}`}>
        {tab === 'night' ? <NightSimple /> : <PortraitSimple />}
      </div>
      <p className="font-mono text-[13px] text-ink-faint">{ps.panorama}</p>
      <More title={ps.more.title}>
        <p className="max-w-[40em] text-[15px] leading-normal text-ink-muted">{ps.more.text}</p>
        <Link to="/telefon/avansat" className="mt-3 inline-block font-medium text-accent-hover underline">
          {ps.more.link} →
        </Link>
      </More>
    </Page>
  )
}
