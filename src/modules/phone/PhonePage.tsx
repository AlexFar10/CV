import { Section, type SectionMeta } from '../../components/layout/Section'
import { SideNav } from '../../components/layout/SideNav'
import { Badge, Card } from '../../components/ui/primitives'
import { night, panorama, portrait } from '../../content/phone'
import { NightMode } from './NightMode'
import { PortraitMode } from './PortraitMode'

const sections: SectionMeta[] = [
  { id: 'noapte', num: '01', kicker: night.kicker, title: night.title, lead: night.lead },
  { id: 'portret', num: '02', kicker: portrait.kicker, title: portrait.title, lead: portrait.lead },
]

export default function PhonePage() {
  return (
    <>
      <SideNav sections={sections} />
      <Section meta={sections[0]}>
        <NightMode />
      </Section>
      <Section meta={sections[1]}>
        <PortraitMode />
      </Section>
      <section className="relative z-10 px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <Card className="opacity-70">
            <Badge tone="line">{portrait.soon}</Badge>
            <h3 className="mt-3 text-xl font-semibold">{panorama.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{panorama.text}</p>
          </Card>
        </div>
      </section>
    </>
  )
}
