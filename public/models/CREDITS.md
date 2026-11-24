# Modele și fișiere wasm (servite local, fără rețea la rulare)

| Fișier | Sursă | Licență |
|---|---|---|
| `selfie_segmenter.tflite` (float16, 256×256) | MediaPipe Models, Google: https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite | Apache-2.0 (vezi cardul modelului: https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf) |
| `../wasm/vision_wasm_internal.{js,wasm}` | pachetul npm `@mediapipe/tasks-vision` 1.2.3 | Apache-2.0 |

Cardul modelului: destinat în principal divertismentului, nu deciziilor critice pentru viață.

## Face Landmarker (modulul „Ești atent la drum?”)

| Fișier | Sursă | Licență |
|---|---|---|
| `face_landmarker.task` (float16, 3,76 MB: detector BlazeFace + 468 puncte + blendshapes) | https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task | Apache-2.0 (carduri: „Model Card MediaPipe Face Mesh V2” și „Model Card Blendshape V2”, https://storage.googleapis.com/mediapipe-assets/). Cardul pentru detectorul BlazeFace nu a putut fi descărcat; modelul face parte din același pachet Google. |

Aplicația principală declarată în carduri: divertisment (AR). Nu e destinat deciziilor critice.

Indicii punctelor folosite (verificați pe geometria canonică `canonical_face_model.obj` din MediaPipe: ochii deschiși dau EAR ≈ 0,234, iar punctele de sus au y mai mare decât cele de jos):
- ochiul din dreapta imaginii (subiectul stâng): 362, 385, 387, 263, 373, 380 (colț exterior, sus, sus, colț interior, jos, jos);
- ochiul din stânga imaginii (subiectul drept): 33, 160, 158, 133, 153, 144;
- vârful nasului: 1; obrajii (marginile feței): 234 și 454.
