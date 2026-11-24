import { Page, PageBlock } from '../../components/layout/Page'
import { Badge, Card } from '../../components/ui/primitives'
import { night, panorama, portrait } from '../../content/phone'
import { NightMode } from './NightMode'
import { PortraitMode } from './PortraitMode'

export default function AdvancedPhonePage() {
  return (
    <Page kicker="02 · Avansat" title="Telefonul: setări în plus" lead="Toate sliderele de la modul noapte și pașii 1–4 de la portret." back={{ to: '/telefon', label: 'Înapoi la varianta simplă' }}>
      <PageBlock id="noapte" title="Mod noapte" lead={night.lead}>
        <NightMode />
      </PageBlock>
      <PageBlock id="portret" title={portrait.title} lead={portrait.lead}>
        <PortraitMode />
      </PageBlock>
      <Card className="opacity-70">
        <Badge tone="line">{portrait.soon}</Badge>
        <h2 className="mt-3 text-xl font-semibold">{panorama.title}</h2>
        <p className="mt-2 text-sm text-ink-muted">{panorama.text}</p>
      </Card>
    </Page>
  )
}
