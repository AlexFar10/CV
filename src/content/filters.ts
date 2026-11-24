import type { FilterId } from '../lib/filters'

export interface FilterText {
  name: string
  formula: string
  /** o frază despre ce face */
  what: string
  params: Record<string, string>
}

export const filterText: Record<FilterId, FilterText> = {
  brightness: { name: 'Luminozitate', formula: 'nou = vechi + b', what: 'Adună același număr la fiecare canal.', params: { b: 'b · cât adaug' } },
  contrast: { name: 'Contrast', formula: 'nou = (vechi − 128) × c + 128', what: 'Depărtează valorile de mijloc (128): c > 1 întunecă umbrele și luminează luminile.', params: { c: 'c · factor' } },
  saturation: {
    name: 'Saturație',
    formula: 'g = 0,299·R + 0,587·G + 0,114·B\nnou = g + (vechi − g) × s',
    what: 'Depărtează culoarea de gri (s > 1) sau o apropie de gri (s < 1).',
    params: { s: 's · factor' },
  },
  grayscale: { name: 'Tonuri de gri', formula: 'g = 0,299·R + 0,587·G + 0,114·B\nR = G = B = g', what: 'Înlocuiește cele trei canale cu luminanța pixelului.', params: {} },
  negative: { name: 'Negativ', formula: 'nou = 255 − vechi', what: 'Inversează fiecare canal: negrul devine alb și invers.', params: {} },
  sepia: {
    name: 'Sepia',
    formula: 'R′ = 0,393R + 0,769G + 0,189B\nG′ = 0,349R + 0,686G + 0,168B\nB′ = 0,272R + 0,534G + 0,131B\nnou = vechi + t × (sepia − vechi)',
    what: 'Amestecă canalele cu o matrice care dă nuanța brună de fotografie veche.',
    params: { t: 't · cât de mult' },
  },
  temperature: { name: 'Temperatură', formula: 'R′ = R + t\nB′ = B − t', what: 'Valori pozitive încălzesc imaginea (mai mult roșu), cele negative o răcesc.', params: { t: 't · cald / rece' } },
  vignette: {
    name: 'Vignetă',
    formula: 'd = dist(pixel, centru) / dist(colț, centru)\nnou = vechi × (1 − s × d²)',
    what: 'Întunecă marginile; depinde de poziția pixelului, nu doar de valoarea lui.',
    params: { s: 's · cât de tare' },
  },
  blur: {
    name: 'Blur',
    formula: 'nou = media pixelilor din fereastra (2r+1) × (2r+1)',
    what: 'Fiecare pixel devine media vecinilor; marginile imaginii se prelungesc. Se aplică o singură dată.',
    params: { r: 'r · rază (pixeli)' },
  },
  sharpen: {
    name: 'Sharpen',
    formula: 'nou = vechi + a × (4·vechi − sus − jos − stânga − dreapta)\nkernel: centru 1+4a, vecinii −a',
    what: 'Accentuează diferențele dintre un pixel și vecinii lui, deci muchiile.',
    params: { a: 'a · cantitate' },
  },
  grain: {
    name: 'Grain',
    formula: 'nou = vechi + σ × z,  z ~ N(0, 1)',
    what: 'Adaugă zgomot aleator (cu seed, deci același la fiecare rulare), la fel pe R, G și B.',
    params: { sigma: 'σ · intensitate' },
  },
  threshold: {
    name: 'Prag (alb-negru)',
    formula: 'nou = 255 dacă luminanța > p, altfel 0',
    what: 'Fiecare pixel devine alb sau negru, după cum e mai luminos sau nu decât pragul p.',
    params: { p: 'p · prag' },
  },
}

export const kindLabel = { pixel: 'pe pixel', kernel: 'pe vecinătate (kernel)' } as const

export const studioText = {
  rule: 'După fiecare filtru, valorile se limitează la 0–255 și se rotunjesc. Ordinea filtrelor contează.',
  add: 'Adaugă un filtru',
  empty: 'Stiva e goală: adaugă un filtru sau alege un preset.',
  presets: 'Preseturi',
  clear: 'Golește stiva',
  moveUp: 'Mută mai sus',
  moveDown: 'Mută mai jos',
  remove: 'Scoate filtrul',
  enabled: 'Activ',
  altCompare: 'Imaginea originală (stânga) și rezultatul după stiva de filtre (dreapta)',
}

export const presetNames = { retro: 'Retro', warm: 'Cald', cool: 'Rece', noir: 'Noir', film: 'Film' } as const

export const mine = {
  title: 'Preseturile tale',
  name: 'Numele presetului',
  save: 'Salvează stiva curentă',
  apply: 'Aplică',
  del: 'Șterge',
  copy: 'Copiază JSON',
  copied: 'Copiat!',
  copyFail: 'Nu am putut copia. Selectează textul de mai jos și copiază-l manual.',
  importLabel: 'Lipește un preset JSON',
  import: 'Importă',
  noStorage: 'Browserul nu permite salvarea locală (de exemplu în modul privat). Presetul rămâne doar cât timp ai pagina deschisă; îl poți copia ca JSON.',
  empty: 'Nu ai salvat încă niciun preset.',
}

export const game = {
  title: 'Ghicește filtrul',
  lead: 'Vezi o pereche înainte / după. Care filtru a fost aplicat? 8 runde.',
  round: 'Runda',
  pick: 'Alege filtrul:',
  right: 'Corect!',
  wrong: 'Nu chiar. Era:',
  next: 'Următoarea',
  finish: 'Vezi scorul',
  score: 'Scorul tău',
  again: 'Joc nou',
  seed: 'seed',
}

export const kernelLab = {
  title: 'Editor de kernel 3×3',
  lead: 'Fiecare pixel nou e suma produselor dintre kernel și vecinătatea 3×3 a pixelului. Schimbă numerele și vezi.',
  formula: 'nou = Σ k[i][j] × vechi[x+j][y+i] / divizor + decalaj',
  sum: 'Suma kernelului',
  divisor: 'Divizor',
  offset: 'Decalaj',
  warn: 'Suma nu e 1, deci luminozitatea medie se schimbă. Pentru un blur împarte la sumă (divizor).',
  presets: { identity: 'Identitate', blur: 'Blur', sharpen: 'Sharpen', edge: 'Contururi', emboss: 'Emboss', sobelX: 'Sobel X' },
  cell: (i: number, j: number) => `Kernel, rândul ${i + 1}, coloana ${j + 1}`,
}

export const codeLab = {
  title: 'Scrie propriul filtru',
  lead: 'O funcție care primește culoarea și poziția unui pixel și întoarce culoarea nouă. Rulează într-un Web Worker, izolat de pagină, cu limită de timp.',
  label: 'Funcția ta (r, g, b, x, y) => [r, g, b]',
  run: 'Rulează',
  running: 'Rulează…',
  reset: 'Resetează codul',
  ok: 'Gata.',
  alt: 'Imaginea originală (stânga) și rezultatul funcției tale (dreapta)',
}

export const level3 = {
  kernelHints: [
    { text: 'Ce kernel lasă imaginea neschimbată? Unde pui numărul 1?' },
    { text: 'Pentru un blur, toate numerele sunt egale. Cât trebuie să dea suma lor ca imaginea să nu se lumineze sau întunece?' },
    { text: 'Un kernel de contururi are suma 0: centrul e pozitiv, iar vecinii negativi, de exemplu centru 8 și opt vecini de −1. Pe zonele plate rezultatul e 0 (negru).' },
  ],
  codeHints: [
    { text: 'Ce vrei să se întâmple cu roșu, verde și albastru? Scrie-le pe hârtie înainte de cod.' },
    { text: 'Funcția trebuie să întoarcă o listă cu trei numere. Poți folosi x și y ca să schimbi culoarea în funcție de poziție.' },
    { text: 'Exemplu pentru „doar roșu”: (r, g, b) => [r, 0, 0]. Încearcă acum să faci doar jumătatea de sus a imaginii alb-negru, folosind y.' },
  ],
  challengesTitle: 'Provocări',
  challenges: [
    'Fă poza să pară făcută cu un telefon vechi (puțin blur, culori ușor spălate, grain).',
    'Fă o poză „de noapte”: mai întunecată, rece și cu mult grain.',
    'Găsește două filtre care, puse în ordine inversă, dau rezultate diferite. De ce?',
    'Cu kernelul editabil, fă un filtru care arată doar muchiile verticale.',
    'În cod: colorează în roșu doar pixelii mai luminoși de 200 și lasă restul în tonuri de gri.',
  ],
  aiTitle: 'Dacă lucrezi cu un asistent AI',
  ai: [
    'Descrie ce vrei să VEZI în imagine, nu doar ce să facă codul („marginile să fie mai întunecate decât centrul”).',
    'Cere o schimbare mică o dată. Un singur pas, apoi rulezi și te uiți.',
    'Verifică rezultatul cu ochii tăi și cu inspectorul de pixel; nu te baza pe faptul că „sună corect”.',
    'Când ceva se strică, spune-i exact ce a ieșit („imaginea a devenit complet albă”), nu doar „nu merge”.',
    'Cere-i să explice linia pe care nu o înțelegi, apoi explic-o tu cu cuvintele tale.',
  ],
  mistakesTitle: 'Greșeli frecvente',
  mistakes: [
    'Valori peste 255 (sau sub 0): aplicația le limitează, dar la un calcul în mai mulți pași poți pierde informație.',
    'Ordinea filtrelor: luminozitate + contrast într-o ordine dă alt rezultat decât în cealaltă.',
    'Kernel cu suma diferită de 1: imaginea devine mai luminoasă sau mai întunecată.',
    'Funcția nu întoarce [r, g, b] (ai uitat return sau parantezele { }): vezi mesajul de eroare.',
    'Împărțirea întreagă și rotunjirile: 5 / 2 e 2,5 în JavaScript; rezultatul se rotunjește abia la final.',
    'A aplica blur de două ori nu e același lucru cu un blur de rază dublă.',
  ],
}

/** Pagina simplă „Filtre pe o poză”. */
export const simple = {
  kicker: '01 · Partea 1',
  title: 'Filtre pe o poză',
  lead: 'Alege un filtru, mută sliderul și compară cu originalul.',
  idea: {
    title: 'Ideea',
    items: [
      'Un filtru e o formulă aplicată pe <b>fiecare pixel</b>, pe rând.',
      'Un pixel are trei numere între 0 și 255: roșu, verde, albastru.',
      'Dacă rezultatul iese din 0–255, se taie la capete.',
    ],
  },
  try: { title: 'Încearcă', pick: 'Alege un filtru', formula: 'Formula', original: 'Original', result: 'Rezultat', noSlider: 'Acest filtru nu are slider: face același lucru peste tot.' },
  thread: { head: 'Firul roșu: pragul.', text: 'Orice pixel mai luminos decât p devine alb, restul negru.' },
  check: {
    title: 'Verifică-te',
    question: 'Ce valoare are un pixel de 200 după filtrul Negativ?',
    options: ['55', '200', '255'],
    correct: 0,
    explanation: '255 − 200 = 55. Negrul devine alb și invers.',
  },
  more: {
    title: 'Mai multe filtre una peste alta, kernel și cod',
    text: 'Pentru cei curioși: pune 12 filtre în stivă, scrie-ți propriul kernel 3×3 sau propriul cod. Stă pe o pagină separată, ca să nu încarce ecranul de aici.',
    link: 'Deschide pagina avansată',
  },
  /** filtrele din pagina simplă, în ordine, cu valori de pornire cu efect vizibil */
  modes: [
    { id: 'brightness', key: 'b', start: 40 },
    { id: 'contrast', key: 'c', start: 1.6 },
    { id: 'negative', key: '', start: 0 },
    { id: 'blur', key: 'r', start: 4 },
    { id: 'threshold', key: 'p', start: 110 },
  ] as const,
}
