import './stackBar.css'

type Item = { label: string; value: number; color: string }

export function StackBar({ items }: { items: Item[] }) {
  const total = items.reduce((acc, x) => acc + Math.max(0, x.value), 0)
  if (total <= 0) return <div className="muted">Sem dados.</div>

  return (
    <div className="stack">
      <div className="stack__bar" role="img" aria-label="Distribuição">
        {items
          .filter((x) => x.value > 0)
          .map((x) => (
            <span
              key={x.label}
              className="stack__seg"
              style={{ width: `${(x.value / total) * 100}%`, background: x.color }}
              title={`${x.label}: ${x.value.toFixed(2)}`}
            />
          ))}
      </div>
      <div className="stack__legend">
        {items.map((x) => (
          <div key={x.label} className="stack__item">
            <span className="stack__dot" style={{ background: x.color }} />
            <span className="stack__label">{x.label}</span>
            <span className="stack__value">{x.value.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
