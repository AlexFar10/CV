import { useMemo, useState } from 'react'
import { FILTER_BY_ID } from '../../lib/filters'
import { GAME_PARAMS, makeRounds } from '../../lib/game'
import { testSceneImg } from '../../lib/testScene'
import { BeforeAfter } from '../../components/image/BeforeAfter'
import { DemoButton, FinePrint, cx } from '../../components/ui/primitives'
import { filterText, game } from '../../content/filters'

const scene = (() => {
  let cache: ReturnType<typeof testSceneImg> | null = null
  return () => (cache ??= testSceneImg(480, 360))
})()

export function FilterGame() {
  const [seed, setSeed] = useState(1)
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const rounds = useMemo(() => makeRounds(seed), [seed])
  const r = rounds[round]
  const base = scene()
  const after = useMemo(() => (r ? FILTER_BY_ID[r.answer].apply(base, GAME_PARAMS[r.answer]) : base), [r, base])
  const finished = round >= rounds.length

  const restart = () => {
    setSeed((s) => s + 1)
    setRound(0)
    setScore(0)
    setPicked(null)
  }

  if (finished) {
    return (
      <div role="status" className="rounded-2xl border border-line p-6 text-center">
        <p className="font-mono text-xs text-ink-muted">{game.score}</p>
        <p className="mt-1 text-5xl font-bold tracking-tight">
          {score} / {rounds.length}
        </p>
        <DemoButton variant="solid" className="mt-5" onClick={restart}>
          {game.again}
        </DemoButton>
        <FinePrint>
          {game.seed}: {seed}
        </FinePrint>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 font-mono text-xs text-ink-muted">
        {game.round} {round + 1} / {rounds.length} · {game.seed} {seed} · {score} pct
      </p>
      <BeforeAfter before={base} after={after} alt="Perechea înainte / după pentru ghicit filtrul" />
      <fieldset className="mt-4" disabled={picked !== null}>
        <legend className="mb-2 text-sm font-medium">{game.pick}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {r.options.map((o) => {
            const correct = picked !== null && o === r.answer
            const wrong = picked === o && o !== r.answer
            return (
              <button
                key={o}
                type="button"
                onClick={() => {
                  setPicked(o)
                  if (o === r.answer) setScore((s) => s + 1)
                }}
                className={cx(
                  'cursor-pointer rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                  correct ? 'border-accent bg-accent-soft' : wrong ? 'border-red-400 bg-red-50' : 'border-line hover:border-accent',
                )}
              >
                {filterText[o].name}
              </button>
            )
          })}
        </div>
      </fieldset>
      <div role="status" className="mt-3 min-h-6 text-sm">
        {picked === null ? null : picked === r.answer ? game.right : `${game.wrong} ${filterText[r.answer].name}. ${filterText[r.answer].what}`}
      </div>
      {picked !== null ? (
        <DemoButton
          variant="solid"
          className="mt-2"
          onClick={() => {
            setRound((n) => n + 1)
            setPicked(null)
          }}
        >
          {round + 1 === rounds.length ? game.finish : game.next}
        </DemoButton>
      ) : null}
    </div>
  )
}
