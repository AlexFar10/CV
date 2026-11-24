/*
 * Din punctele faciale (MediaPipe Face Landmarker, 468 puncte) calculăm:
 *  - EAR (raportul de deschidere a ochiului) din 6 puncte pe ochi;
 *  - o estimare simplă a rotirii capului din poziția vârfului nasului față de obraji.
 *
 * Indicii au fost verificați pe geometria canonică a feței din MediaPipe
 * (canonical_face_model.obj): cu ochii deschiși EAR ≈ 0,234, iar punctele „de sus” au y mai mare decât cele „de jos”.
 */

export interface Pt {
  x: number
  y: number
}

/** Ordinea: p1 colț exterior, p2 și p3 pe pleoapa de sus, p4 colț interior, p5 și p6 pe pleoapa de jos. */
export const EYE_IMAGE_LEFT = [33, 160, 158, 133, 153, 144] as const
export const EYE_IMAGE_RIGHT = [362, 385, 387, 263, 373, 380] as const
export const NOSE_TIP = 1
export const CHEEK_IMAGE_LEFT = 234
export const CHEEK_IMAGE_RIGHT = 454

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)

/** EAR = (|p2−p6| + |p3−p5|) / (2·|p1−p4|). Deschis ≈ 0,25–0,35; închis → spre 0. */
export function ear(p: readonly Pt[]): number {
  const [p1, p2, p3, p4, p5, p6] = p
  return (dist(p2, p6) + dist(p3, p5)) / (2 * dist(p1, p4))
}

/** EAR mediu al celor doi ochi, din lista completă de puncte. */
export function earOf(lm: readonly Pt[]): number {
  const a = ear(EYE_IMAGE_LEFT.map((i) => lm[i]))
  const b = ear(EYE_IMAGE_RIGHT.map((i) => lm[i]))
  return (a + b) / 2
}

/**
 * Rotirea capului: r = (x_nas − x_obraz_stânga) / (x_obraz_dreapta − x_obraz_stânga); față: r ≈ 0,5.
 * Întoarce (r − 0,5) × 2: 0 = drept, ±1 ≈ nasul la marginea feței. Semnul depinde de sensul imaginii (nu contează, folosim modulul).
 */
export function headTurn(lm: readonly Pt[]): number {
  const l = lm[CHEEK_IMAGE_LEFT].x
  const r = lm[CHEEK_IMAGE_RIGHT].x
  const span = r - l
  if (Math.abs(span) < 1e-6) return 0
  return ((lm[NOSE_TIP].x - l) / span - 0.5) * 2
}
