import './fields.css'

type Props = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function NumberField({ label, value, onChange, min, max, step }: Props) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="field__input"
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}
