
export type BoletoCodeKind = 'barcode44' | 'linhaDigitavel47' | 'convenio48'

export function normalizeBoletoCode(raw: string): { kind: BoletoCodeKind | null; digits: string } {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 44) return { kind: 'barcode44', digits }
  if (digits.length === 47) return { kind: 'linhaDigitavel47', digits }
  if (digits.length === 48) return { kind: 'convenio48', digits }
  return { kind: null, digits }
}

export function isValidBoletoCode(raw: string) {
  const { kind } = normalizeBoletoCode(raw)
  return kind !== null
}
