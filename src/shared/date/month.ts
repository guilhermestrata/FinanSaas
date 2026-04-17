export type MonthKey = `${number}-${string}`

export function monthKeyFromDate(d: Date): MonthKey {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function addMonths(d: Date, months: number) {
  const x = new Date(d)
  x.setMonth(x.getMonth() + months)
  return x
}

export function formatMonthLabel(key: string) {
  const [y, m] = key.split('-').map((p) => Number(p))
  const date = new Date(y, (m ?? 1) - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}
