import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * Registrul modulelor. Pentru un modul nou (de exemplu din partea 2) adaugi O SINGURĂ intrare aici:
 * ruta, cardul de pe Acasă și linkul din antet se generează de aici.
 */
export type ModuleStatus = 'ready' | 'building' | 'soon'

export interface ModuleDef {
  id: string
  title: string
  description: string
  /** rută, fără „/” la început (ex. „filtre”) */
  path: string
  status: ModuleStatus
  part: 1 | 2
  /** absent pentru modulele „în curând” */
  component?: LazyExoticComponent<ComponentType>
}

export const modules: ModuleDef[] = [
  {
    id: 'filters',
    title: 'Studio de filtre',
    description: 'Construiește o stivă de filtre, vezi formula fiecăruia și ce se întâmplă cu pixelii și cu histograma.',
    path: 'filtre',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/filters/FiltersPage')),
  },
  {
    id: 'phone',
    title: 'Cum face telefonul poza asta?',
    description: 'Modul noapte (media mai multor cadre) și portret cu fundal neclar (masca dintr-un prag, apoi dintr-un model).',
    path: 'telefon',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/phone/PhonePage')),
  },
  {
    id: 'live',
    title: 'Ești atent la drum?',
    description: 'Demo live cu camera: din puncte pe față la o decizie „atent / obosit / distras”. Un demo educațional, nu un sistem real.',
    path: 'live',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/live/LivePage')),
  },
  {
    id: 'recap',
    title: 'Recapitulare: pragul',
    description: 'Firul roșu al părții 1: același prag pe pixeli, pe mască, pe ochi și, mai târziu, pe probabilitate. Mută pragul și numără greșelile.',
    path: 'recapitulare',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/recap/RecapPage')),
  },
  {
    id: 'medicine',
    title: 'Partea 2: AI în medicină',
    description: 'Detecția fracturilor de încheietură la copii. Aceleași idei, acum cu probabilități.',
    path: 'medicina',
    status: 'soon',
    part: 2,
  },
]
