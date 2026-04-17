import './fields.css'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TextField({ label, value, onChange, placeholder }: Props) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="field__input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
