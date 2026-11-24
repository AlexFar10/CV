# Ce poate face informatica cu o imagine (partea 1)

Aplicație web interactivă, doar client (build static), pentru elevi de liceu. Elevul pornește de la un exemplu, schimbă parametri sau date, iar cei curioși pot modifica regula sau codul. Interfața e în română; tot textul vizibil e separat de logică, ca să se poată adăuga engleza.

Fir roșu didactic: **pragul**. Apare pe pixeli (filtrul „Prag”), pe mască (portret), pe ochi (demo live), iar în partea 2 va apărea pe probabilitate. Ecranul de recapitulare (`/recapitulare`) leagă toate locurile.

## Module

| Rută | Modul | Ce conține |
|---|---|---|
| `/filtre` | Studio de filtre | 12 filtre în stivă, formule la vedere, inspector de pixel, histogramă, preseturi, joc „Ghicește filtrul”, editor de kernel 3×3, cod `(r,g,b,x,y) => [r,g,b]` în Web Worker |
| `/telefon` | Cum face telefonul poza asta? | Mod noapte (media/mediana cadrelor, MSE/SNR, grafic cu 1/√N, „mâna tremură”) și portret cu fundal neclar (mască de mână, apoi model MediaPipe). Panorama: „în curând” |
| `/live` | Ești atent la drum? | Demo cu camera (EAR + rotirea capului), mod simulat, experiment ghidat, regulă de decizie editabilă. Demo educațional, nu un sistem de siguranță |
| `/recapitulare` | Recapitulare: pragul | Compromisul alarme false / alarme ratate |

Fiecare pagină are **un singur ecran principal**: imaginea, 1–3 slidere și rezultatul, vizibile imediat. Tot ce e avansat stă sub „Vrei mai mult?” (blocuri închise, componenta `More`): joc, presete, editor de kernel și de cod, setări în plus, etică. Acolo sunt și indicii în trepte (`HintBox`), provocări, sfaturi pentru lucrul cu un asistent AI și „greșeli frecvente”, fără prompturi gata de copiat.

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
  modules/        o pagină (lazy) pe modul: home, filters, phone, live, recap
  components/
    ui/           Card, DemoButton, Badge, FinePrint, CodeBlock, LabeledSlider, More („Vrei mai mult?”)
    layout/       Page, PageBlock (titlu + o frază)
    image/        ImagePicker, BeforeAfter, Histogram, PixelInspector, ImageCanvas
    learn/        HintBox, Term (glosar), Quiz
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

Pentru prag pe probabilitate poți refolosi `lib/threshold.ts` (confuzie, histogramă, cost) și `ThresholdLab` din `modules/recap`. Pentru măști, `lib/portrait.ts`; pentru încărcarea unui model, `lib/segmenter.ts` este un exemplu.

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

- Demo-ul live nu a fost testat cu o cameră reală în mediul de dezvoltare (accesul la cameră era blocat); mod simulat și refuzul camerei sunt testate.
- Alinierea cadrelor din modul noapte folosește deplasările cunoscute din simulare; un telefon adevărat le estimează din imagini.
- Panorama (modulul „Cum face telefonul poza asta?”) nu e construită: apare ca „în curând”.
- Consola poate afișa un mesaj `INFO: Created TensorFlow Lite XNNPACK delegate` cu nivel `error`: vine din wasm-ul MediaPipe și e doar informativ.
