import { Card, Badge } from '../components/ui/primitives'

/** Pagină provizorie pentru modulele care urmează în etapele următoare. */
export function ModuleStub({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <Badge tone="line">în lucru</Badge>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">{title}</h1>
      <Card className="mt-8">
        <p className="text-ink-muted">{text}</p>
      </Card>
    </div>
  )
}
