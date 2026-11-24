import { Page, PageBlock } from '../../components/layout/Page'
import { recap } from '../../content/recap'
import { ThresholdLabAdvanced } from './ThresholdLabAdvanced'

export default function AdvancedRecapPage() {
  return (
    <Page kicker="04 · Avansat" title="Pragul: cost și presete" lead="Ce se întâmplă când o alarmă ratată costă mai mult decât una falsă." back={{ to: '/recapitulare', label: 'Înapoi la varianta simplă' }}>
      <PageBlock title={recap.lab.title} lead={recap.lab.lead}>
        <ThresholdLabAdvanced />
      </PageBlock>
    </Page>
  )
}
