import { FILTER_BY_ID, defaultParams, type FilterId, type StackItem } from './filters'

export interface PresetItem {
  id: FilterId
  params: Record<string, number>
  enabled?: boolean
}
export interface Preset {
  name: string
  items: PresetItem[]
}

export const BUILT_IN: Record<'retro' | 'warm' | 'cool' | 'noir' | 'film', PresetItem[]> = {
  retro: [
    { id: 'sepia', params: { t: 0.8 } },
    { id: 'contrast', params: { c: 0.9 } },
    { id: 'vignette', params: { s: 0.55 } },
    { id: 'grain', params: { sigma: 10 } },
  ],
  warm: [
    { id: 'temperature', params: { t: 28 } },
    { id: 'saturation', params: { s: 1.2 } },
    { id: 'brightness', params: { b: 8 } },
  ],
  cool: [
    { id: 'temperature', params: { t: -30 } },
    { id: 'saturation', params: { s: 0.9 } },
    { id: 'contrast', params: { c: 1.1 } },
  ],
  noir: [
    { id: 'grayscale', params: {} },
    { id: 'contrast', params: { c: 1.45 } },
    { id: 'vignette', params: { s: 0.65 } },
    { id: 'grain', params: { sigma: 12 } },
  ],
  film: [
    { id: 'contrast', params: { c: 1.1 } },
    { id: 'saturation', params: { s: 0.85 } },
    { id: 'temperature', params: { t: 8 } },
    { id: 'vignette', params: { s: 0.3 } },
    { id: 'grain', params: { sigma: 14 } },
  ],
}

let uidCounter = 1
export const nextUid = () => uidCounter++

/** Elementele unui preset → stivă (cu parametri completați din valorile implicite și limitați la domeniu). */
export function toStack(items: readonly PresetItem[]): StackItem[] {
  return items.map((it) => {
    const def = FILTER_BY_ID[it.id]
    const params = defaultParams(it.id)
    for (const p of def.params) {
      const v = it.params[p.key]
      if (typeof v === 'number' && Number.isFinite(v)) params[p.key] = Math.min(p.max, Math.max(p.min, v))
    }
    return { uid: nextUid(), id: it.id, params, enabled: it.enabled !== false }
  })
}

export function fromStack(stack: readonly StackItem[]): PresetItem[] {
  return stack.map((s) => ({ id: s.id, params: { ...s.params }, enabled: s.enabled }))
}

export function serializePreset(name: string, stack: readonly StackItem[]): string {
  return JSON.stringify({ name, items: fromStack(stack) }, null, 2)
}

/** Citește un JSON de preset. Întoarce presetul sau un mesaj de eroare (string). */
export function parsePreset(text: string): Preset | string {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return 'Textul nu e un JSON valid.'
  }
  if (!raw || typeof raw !== 'object') return 'Presetul trebuie să fie un obiect cu „name” și „items”.'
  const o = raw as { name?: unknown; items?: unknown }
  if (!Array.isArray(o.items)) return 'Lipsește lista „items”.'
  const items: PresetItem[] = []
  for (const it of o.items) {
    const e = it as { id?: unknown; params?: unknown; enabled?: unknown }
    if (typeof e?.id !== 'string' || !(e.id in FILTER_BY_ID)) return `Filtru necunoscut: ${String(e?.id)}.`
    const params: Record<string, number> = {}
    if (e.params && typeof e.params === 'object') {
      for (const [k, v] of Object.entries(e.params)) if (typeof v === 'number') params[k] = v
    }
    items.push({ id: e.id as FilterId, params, enabled: e.enabled !== false })
  }
  return { name: typeof o.name === 'string' && o.name.trim() ? o.name.trim().slice(0, 40) : 'Preset importat', items }
}

const KEY = 'informatica-imagini:presete'

export function loadSaved(): Preset[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr: unknown = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.map((p) => parsePreset(JSON.stringify(p))).filter((p): p is Preset => typeof p !== 'string')
  } catch {
    return []
  }
}

/** Întoarce false dacă browserul nu permite salvarea. */
export function saveSaved(list: Preset[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}
