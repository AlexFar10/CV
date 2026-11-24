# Ce poate face informatica cu o imagine (partea 1)

Aplicație web interactivă, doar client (build static), pentru elevi de liceu. Elevul pornește de la un exemplu, schimbă parametri sau date, iar cei curioși pot modifica regula sau codul. Interfața e în română; tot textul vizibil e separat de logică, ca să se poată adăuga engleza.

Design: gri cald, un singur accent roșu („firul roșu”) pentru prag, butoane principale și numerotarea pașilor; Bricolage Grotesque (titluri), Geist (text), JetBrains Mono (etichete, formule). Tokenii sunt în `src/index.css`.

Fir roșu didactic: **pragul**. Apare pe pixeli (filtrul „Prag”), pe mască (portret), pe ochi (demo live), iar în partea 2 va apărea pe probabilitate. Ecranul de recapitulare (`/recapitulare`) leagă toate locurile.

## Module

Fiecare pagină de demo are exact trei pași, în ordinea asta: **1 · Ideea** (2–3 propoziții), **2 · Încearcă** (UN demo, UN slider principal), **3 · Verifică-te** (o întrebare cu 3 variante). Partea avansată stă pe o rută separată `…/avansat`, legată dintr-un singur bloc „Vrei mai mult?”.

| Rută | Pagina simplă | Pagina avansată (`/avansat`) |
|---|---|---|
| `/` | Hero cu pragul interactiv pe `camera.png`, cele 4 demo-uri, „firul roșu”, partea 2 | |
| `/filtre` | 5 filtre (luminozitate, contrast, negativ, blur, prag), un slider | stivă de 12 filtre, formule, inspector de pixel, histogramă, presete, joc „Ghicește filtrul”, editor de kernel 3×3, cod `(r,g,b,x,y) => [r,g,b]` în Web Worker |
| `/telefon` | două taburi: Mod noapte (sliderul = numărul de cadre) și Portret (sliderul = pragul măștii) | toate setările modului noapte (zgomot, lumină, mână care tremură, mediană, aliniere, MSE/SNR, grafic 1/√N) și pașii 1–4 de la portret (mască de mână, limite, model, blur) |
| `/live` | simulare cu semnal sintetic; sliderul = pragul EAR | camera reală cu puncte pe față, rotirea capului, sunet, experiment ghidat, regulă editabilă, etică și limite |
| `/recapitulare` | firul roșu + compromisul alarme false / ratate | costul unei alarme ratate, presete, pragul optim |

Demo educațional: pagina „Ești atent la drum?” nu este un sistem real de siguranță și spune asta pe toată pagina.

## Cum rulezi

Cerințe: Node 22+ și npm.

```bash
npm install
npm run dev        # server de dezvoltare
npm run build      # build static în dist/
npm run preview    # servește dist/ local
npm run lint       # oxlint
npm run test       # vitest (teste unitare pentru lib/)
```

Build-ul din `dist/` merge din orice folder sau hosting static: ruterul folosește `HashRouter` (`#/filtre`), iar `base` e `./`. Nu are nevoie de configurare pe server și nu face apeluri de rețea la rulare (fonturi, wasm, modele și imagini sunt toate locale). Dimensiune: ~20 MB, din care ~15 MB sunt wasm-ul MediaPipe, descărcat abia când elevul pornește pasul 3 din portret sau demo-ul live.

## Structura

```
src/
  app/            router, layout, registrul de module (modules.ts)
  modules/        pagină simplă + `Advanced…Page` (lazy) pe modul: home, filters, phone, live, recap
  components/
    ui/           Card, DemoButton, Badge, FinePrint, CodeBlock, LabeledSlider, Stage (panou închis), More („Vrei mai mult?”)
    layout/       Page, Step (număr + titlu + linie), PageBlock
    image/        ImagePicker, BeforeAfter, Histogram, PixelInspector, ImageCanvas
    learn/        Bullets, Quiz, ThresholdThread (firul roșu), HintBox, Term (glosar)
  lib/            funcții pure (testate): filtre, convoluție, blur, măști, zgomot/MSE/SNR, EAR, PRNG cu seed, scena de test
  content/        textele în română (ro.ts, filters.ts, phone.ts, live.ts, recap.ts, glossary.ts)
  hooks/          useThrottled
public/
  images/         camera.png, chelsea.png, CREDITS.md
  models/         selfie_segmenter.tflite, face_landmarker.task, CREDITS.md
  wasm/           vision_wasm_internal.{js,wasm} (MediaPipe Tasks Vision)
```

## Cum adaugi un modul nou (de exemplu din partea 2)

1. Creează `src/modules/<nume>/<Nume>Page.tsx` cu `export default function ...` (poți folosi `Page`, `More`, `ImagePicker`, `BeforeAfter`, `Histogram`, `HintBox`, `LabeledSlider` etc.). Textele merg într-un fișier nou din `src/content/`.
2. Adaugă **o singură intrare** în `src/app/modules.ts`:

```ts
{
  id: 'medicine',
  title: 'Detecția fracturilor',
  description: 'Text scurt pentru cardul de pe Acasă.',
  path: 'medicina',
  status: 'ready',            // 'soon' = card inactiv, „în curând”
  part: 2,
  component: lazy(() => import('../modules/medicine/MedicinePage')),
}
```

Ruta, cardul de pe Acasă și linkul din antet se generează din registru. Cardul „Partea 2: AI în medicină” există deja, ca „în curând”: ca să-l activezi, adaugi `component` și treci `status` pe `'ready'`.

Ruta avansată se leagă prin câmpul `advanced` din registru (`…/avansat`, ascunsă din meniu și de pe carduri). Pentru prag pe probabilitate poți refolosi `lib/threshold.ts` (confuzie, histogramă, cost) și `ThresholdLab` din `modules/recap`. Pentru măști, `lib/portrait.ts`; pentru încărcarea unui model, `lib/segmenter.ts` este un exemplu.

## Imagini

- `public/images/camera.png` (512×512, gri): `skimage.data.camera()` din scikit-image 0.26, autor Lav Varshney, **CC0**.
- `public/images/chelsea.png` (451×300, color): `skimage.data.chelsea()`, autor Stefan van der Walt, **CC0**.
- Scena de test și portretul de probă sunt desenate din cod (deterministe, cu seed), fără fișier.
- `public/images/portrait.jpg` (512×512, color): `skimage.data.astronaut()`, portretul astronautei Eileen Collins, NASA, domeniu public. Poți înlocui fișierul cu orice alt portret (JPG); dacă lipsește, aplicația folosește un placeholder desenat din cod, marcat „imagine de probă”.
- Imaginile încărcate de elev sau făcute cu camera rămân în browser, reduse la maximum 640 px pe latura lungă, și nu se trimit nicăieri.

Detalii în `public/images/CREDITS.md`.

## Modele și wasm

| Fișier | Sursă | Licență | Mărime |
|---|---|---|---|
| `public/models/selfie_segmenter.tflite` | MediaPipe Models (Google) | Apache-2.0 | 0,25 MB |
| `public/models/face_landmarker.task` | MediaPipe Models (Google) | Apache-2.0 | 3,76 MB |
| `public/wasm/vision_wasm_internal.{js,wasm}` | `@mediapipe/tasks-vision` 1.2.3 | Apache-2.0 | 15 MB |

Ambele modele sunt declarate de autori pentru divertisment (AR), nu pentru decizii critice. Sursele exacte, cardurile modelelor și indicii folosiți pentru puncte sunt în `public/models/CREDITS.md`. Ca să actualizezi wasm-ul după o schimbare de versiune, copiază din `node_modules/@mediapipe/tasks-vision/wasm/` fișierele `vision_wasm_internal.js` și `.wasm`.

## Licențele dependențelor

React, `react-router-dom`, Vite, Tailwind CSS, Framer Motion, Vitest, oxlint: MIT. `lucide-react`: ISC. Fonturile Geist și JetBrains Mono (`@fontsource-variable/*`): SIL OFL 1.1. `@mediapipe/tasks-vision`, TypeScript: Apache-2.0.

## Corectitudine și aliniere cu laboratorul

- Calcul în virgulă mobilă, apoi limitare la 0–255 și rotunjire (după **fiecare** filtru din stivă).
- Tonuri de gri: formula întreagă din OpenCV (ponderile 0,299 / 0,587 / 0,114), ca la `image-processing-lab`. Rotunjirea jumătăților merge la numărul par, ca în NumPy.
- MSE și SNR folosesc aceleași formule ca `image-processing-lab/js/noise.js`, calculate pe imaginea afișată (valori întregi 0–255).
- Blurul din Studio se aplică o singură dată (medie în fereastra (2r+1)×(2r+1)); sharpenul e un kernel cu centru 1+4a și vecini −a; fiecare formulă afișată corespunde codului, iar `src/lib/*.test.ts` o verifică pe cazuri calculate de mână.

## Limite cunoscute

- Demo-ul live nu a fost testat cu o cameră reală în mediul de dezvoltare (accesul la cameră era blocat); modul simulat și refuzul camerei sunt testate. Pe pagina simplă, camera pornește doar de pe `/live/avansat`.
- Pragurile paginii simple „Ești atent la drum?” (1 s pentru „Obosit”, 4 s pentru „alarmă falsă”) sunt calibrate pe fereastra de 10 s (t = 9…19 s) din `lib/simSignal.ts`.
- Alinierea cadrelor din modul noapte folosește deplasările cunoscute din simulare; un telefon adevărat le estimează din imagini.
- Panorama (modulul „Cum face telefonul poza asta?”) nu e construită: apare ca text mic „în curând”.
- Consola poate afișa un mesaj `INFO: Created TensorFlow Lite XNNPACK delegate` cu nivel `error`: vine din wasm-ul MediaPipe și e doar informativ.
