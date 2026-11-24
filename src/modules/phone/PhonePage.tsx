import { Page, PageBlock } from '../../components/layout/Page'
import { Badge, Card } from '../../components/ui/primitives'
import { night, panorama, portrait } from '../../content/phone'
import { NightMode } from './NightMode'
import { PortraitMode } from './PortraitMode'

export default function PhonePage() {
  return (
    <Page title="Cum face telefonul poza asta?">
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
