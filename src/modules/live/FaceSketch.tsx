import { live } from '../../content/live'

/** Față simplificată pentru simulare: ochii se închid după EAR, trăsăturile se mută după rotirea capului. */
export function FaceSketch({ ear, turn }: { ear: number; turn: number }) {
  const open = Math.max(0.02, Math.min(1, ear / 0.3))
  const shift = Math.max(-1, Math.min(1, turn)) * 38
  const squeeze = 1 - Math.min(0.4, Math.abs(turn) * 0.4)
  return (
    <svg viewBox="0 0 240 240" className="mx-auto w-full max-w-[320px] rounded-[6px] border border-line bg-paper-subtle" role="img" aria-label={live.faceAlt}>
      <ellipse cx="120" cy="125" rx={78 * squeeze} ry="98" fill="#f3d9c4" stroke="#cbb29c" strokeWidth="2" />
      <g transform={`translate(${shift} 0)`}>
        {[-32, 32].map((dx) => (
          <g key={dx}>
            <ellipse cx={120 + dx * squeeze} cy="105" rx={15 * squeeze} ry={Math.max(1, 11 * open)} fill="#fff" stroke="#475569" strokeWidth="2" />
            <circle cx={120 + dx * squeeze} cy="105" r={Math.min(6, 6 * open)} fill="#0f172a" />
          </g>
        ))}
        <path d={`M${120 - 6} 120 L${120 + 6} 150 L${120 - 2} 152`} fill="none" stroke="#a98d77" strokeWidth="3" strokeLinecap="round" />
        <path d="M95 180 Q120 192 145 180" fill="none" stroke="#a98d77" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  )
}
