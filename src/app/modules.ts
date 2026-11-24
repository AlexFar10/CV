import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * Registrul modulelor. Pentru un modul nou (de exemplu din partea 2) adaugi O SINGURĂ intrare aici:
 * ruta, cardul de pe Acasă și linkul din antet se generează de aici.
 */
export type ModuleStatus = 'ready' | 'soon'

export interface ModuleDef {
  id: string
  title: string
  /** etichetă scurtă pentru meniul din antet */
  nav: string
  description: string
  /** rută, fără „/” la început (ex. „filtre”) */
  path: string
  status: ModuleStatus
  part: 1 | 2
  /** absent pentru modulele „în curând” */
  component?: LazyExoticComponent<ComponentType>
  /** pagina avansată, la `/<path>/avansat`; nu apare în meniu și nici pe carduri */
  advanced?: LazyExoticComponent<ComponentType>
}

export const modules: ModuleDef[] = [
  {
    id: 'filters',
    title: 'Filtre pe o poză',
    nav: 'Filtre',
    description: 'Alege un filtru, mută sliderul și compară cu originalul.',
    path: 'filtre',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/filters/FiltersPage')),
    advanced: lazy(() => import('../modules/filters/AdvancedFiltersPage')),
  },
  {
    id: 'phone',
    title: 'Cum face telefonul poza asta?',
    nav: 'Telefonul',
    description: 'Poză de noapte din mai multe cadre și portret cu fundal neclar.',
    path: 'telefon',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/phone/PhonePage')),
    advanced: lazy(() => import('../modules/phone/AdvancedPhonePage')),
  },
  {
    id: 'live',
    title: 'Ești atent la drum?',
    nav: 'Ești atent la drum?',
    description: 'Camera urmărește ochii și capul: atent, obosit sau distras?',
    path: 'live',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/live/LivePage')),
    advanced: lazy(() => import('../modules/live/AdvancedLivePage')),
  },
  {
    id: 'recap',
    title: 'Recapitulare: pragul',
    nav: 'Recapitulare',
    description: 'Același prag peste tot. Mută-l și numără greșelile.',
    path: 'recapitulare',
    status: 'ready',
    part: 1,
    component: lazy(() => import('../modules/recap/RecapPage')),
    advanced: lazy(() => import('../modules/recap/AdvancedRecapPage')),
  },
  {
    id: 'medicine',
    title: 'Partea 2: AI în medicină',
    nav: 'Partea 2',
    description: 'Fracturi de încheietură la copii: aceleași idei, cu probabilități.',
    path: 'medicina',
    status: 'soon',
    part: 2,
  },
]
