import './simpleChart.css'

export function SimpleChart({ points }: { points: number[] }) {
  if (!points.length) return <div className="muted">Sem dados.</div>

  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = Math.max(1, max - min)

  const d = points
    .map((p, i) => {
      const x = (i / Math.max(1, points.length - 1)) * 100
      const y = 100 - ((p - min) / range) * 100
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <div className="chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="chart__line" d={d} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="chart__axis">
        <span>{min.toFixed(0)}</span>
        <span>{max.toFixed(0)}</span>
      </div>
    </div>
  )
}
