export type ISODate = string

export type SalaryChange = {
  id: string
  effectiveFrom: ISODate // yyyy-mm-dd
  newNetMonthly: number
}

export type FixedExpense = {
  id: string
  name: string
  amount: number
  dueDay: number // 1..31
}

export type Boleto = {
  id: string
  name: string
  barcode: string
  amount: number
  dueDate?: ISODate
  status: 'open' | 'paid'
}
