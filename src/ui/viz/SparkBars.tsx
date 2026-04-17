import './sparkBars.css'

export function SparkBars({ values }: { values: number[] }) {
  if (!values.length) return <div className="muted">Sem dados.</div>

  const max = Math.max(...values.map((v) => Math.abs(v)), 1)

  return (
    <div className="spark" aria-label="Barras (spark)">
      {values.map((v, i) => {
        const h = (Math.abs(v) / max) * 100
        const cls = v >= 0 ? 'spark__bar spark__bar--pos' : 'spark__bar spark__bar--neg'
        return <span key={i} className={cls} style={{ height: `${h}%` }} title={String(v)} />
      })}
    </div>
  )
}
