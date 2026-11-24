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
    description: 'Pune filtre peste o poză și vezi formula și pixelii.',
    path: 'filtre',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/filters/FiltersPage')),
  },
  {
    id: 'phone',
    title: 'Cum face telefonul poza asta?',
    description: 'Poză de noapte din mai multe cadre și portret cu fundal neclar.',
    path: 'telefon',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/phone/PhonePage')),
  },
  {
    id: 'live',
    title: 'Ești atent la drum?',
    description: 'Camera urmărește ochii și capul: atent, obosit sau distras?',
    path: 'live',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/live/LivePage')),
  },
  {
    id: 'recap',
    title: 'Recapitulare: pragul',
    description: 'Același prag peste tot. Mută-l și numără greșelile.',
    path: 'recapitulare',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/recap/RecapPage')),
  },
  {
    id: 'medicine',
    title: 'Partea 2: AI în medicină',
    description: 'Fracturi de încheietură la copii: aceleași idei, cu probabilități.',
    path: 'medicina',
    status: 'soon',
    part: 2,
  },
]
