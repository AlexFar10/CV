import { useState } from 'react'
import type { StackItem } from '../../lib/filters'
import { loadSaved, parsePreset, saveSaved, serializePreset, toStack, type Preset } from '../../lib/presets'
import { mine } from '../../content/filters'
import { DemoButton, FinePrint } from '../../components/ui/primitives'

interface Props {
  stack: StackItem[]
  onApply: (s: StackItem[]) => void
}

/** Presetul elevului: salvat în localStorage (cu try/catch, aplicația nu depinde de el) și copiat/importat ca JSON. */
export function MyPresets({ stack, onApply }: Props) {
  const [name, setName] = useState('Presetul meu')
  const [saved, setSaved] = useState<Preset[]>(() => loadSaved())
  const [storageOk, setStorageOk] = useState(true)
  const [msg, setMsg] = useState('')
  const [json, setJson] = useState('')
  const [importErr, setImportErr] = useState('')

  const persist = (list: Preset[]) => {
    setSaved(list)
    setStorageOk(saveSaved(list))
  }
  const save = () => {
    const p = parsePreset(serializePreset(name.trim() || 'Presetul meu', stack))
    if (typeof p === 'string') return
    persist([...saved.filter((s) => s.name !== p.name), p])
  }
  const copy = async () => {
    const text = serializePreset(name.trim() || 'Presetul meu', stack)
    setJson(text)
    try {
      await navigator.clipboard.writeText(text)
      setMsg(mine.copied)
    } catch {
      setMsg(mine.copyFail)
    }
  }
  const doImport = () => {
    const p = parsePreset(json)
    if (typeof p === 'string') return setImportErr(p)
    setImportErr('')
    onApply(toStack(p.items))
  }

  return (
    <div>
      <h3 className="text-xl font-bold tracking-tight">{mine.title}</h3>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <span className="block font-mono text-xs text-ink-muted">{mine.name}</span>
          <input
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 rounded-[4px] border border-line px-4 py-2 text-sm"
          />
        </label>
        <DemoButton variant="solid" onClick={save} disabled={stack.length === 0}>
          {mine.save}
        </DemoButton>
        <DemoButton onClick={() => void copy()} disabled={stack.length === 0}>
          {mine.copy}
        </DemoButton>
        <span role="status" className="text-sm text-ink-muted">
          {msg}
        </span>
      </div>
      {!storageOk ? <FinePrint>{mine.noStorage}</FinePrint> : null}

      <ul className="mt-4 space-y-2">
        {saved.length === 0 ? <li className="text-sm text-ink-muted">{mine.empty}</li> : null}
        {saved.map((p) => (
          <li key={p.name} className="flex items-center gap-2">
            <span className="text-sm font-medium">{p.name}</span>
            <DemoButton onClick={() => onApply(toStack(p.items))}>{mine.apply}</DemoButton>
            <DemoButton variant="ghost" onClick={() => persist(saved.filter((s) => s.name !== p.name))}>
              {mine.del}
            </DemoButton>
          </li>
        ))}
      </ul>

      <label className="mt-4 block text-sm">
        <span className="block font-mono text-xs text-ink-muted">{mine.importLabel}</span>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={5}
          spellCheck={false}
          className="mt-1 w-full rounded-[6px] border border-line bg-paper-subtle p-3 font-mono text-xs"
        />
      </label>
      <div className="mt-2 flex items-center gap-3">
        <DemoButton onClick={doImport} disabled={!json.trim()}>
          {mine.import}
        </DemoButton>
        {importErr ? (
          <p role="alert" className="text-sm text-red-700">
            {importErr}
          </p>
        ) : null}
      </div>
    </div>
  )
}
