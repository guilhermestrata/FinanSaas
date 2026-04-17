import { create } from 'zustand'
import type { Boleto, FixedExpense, SalaryChange } from '../domain/types'

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

type FinanceState = {
  netMonthlyIncome: number
  salaryChanges: SalaryChange[]
  fixedExpenses: FixedExpense[]
  boletos: Boleto[]

  setNetMonthlyIncome: (value: number) => void

  addSalaryChange: (effectiveFrom: string, newNetMonthly: number) => void
  removeSalaryChange: (id: string) => void

  addFixedExpense: (name: string, amount: number, dueDay: number) => void
  removeFixedExpense: (id: string) => void

  addBoleto: (boleto: Omit<Boleto, 'id' | 'status'>) => void
  markBoletoPaid: (id: string) => void
  removeBoleto: (id: string) => void
}

export const useFinanceStore = create<FinanceState>((set) => ({
  netMonthlyIncome: 5000,
  salaryChanges: [],
  fixedExpenses: [
    { id: uid('fx'), name: 'Aluguel', amount: 1800, dueDay: 5 },
    { id: uid('fx'), name: 'Internet', amount: 120, dueDay: 10 },
  ],
  boletos: [],

  setNetMonthlyIncome: (value) => set({ netMonthlyIncome: value }),

  addSalaryChange: (effectiveFrom, newNetMonthly) =>
    set((s) => ({
      salaryChanges: [
        { id: uid('sal'), effectiveFrom, newNetMonthly },
        ...s.salaryChanges,
      ],
    })),
  removeSalaryChange: (id) =>
    set((s) => ({ salaryChanges: s.salaryChanges.filter((x) => x.id !== id) })),

  addFixedExpense: (name, amount, dueDay) =>
    set((s) => ({
      fixedExpenses: [{ id: uid('fx'), name, amount, dueDay }, ...s.fixedExpenses],
    })),
  removeFixedExpense: (id) =>
    set((s) => ({ fixedExpenses: s.fixedExpenses.filter((x) => x.id !== id) })),

  addBoleto: (boleto) =>
    set((s) => ({
      boletos: [{ id: uid('bol'), status: 'open', ...boleto }, ...s.boletos],
    })),
  markBoletoPaid: (id) =>
    set((s) => ({
      boletos: s.boletos.map((b) => (b.id === id ? { ...b, status: 'paid' } : b)),
    })),
  removeBoleto: (id) =>
    set((s) => ({ boletos: s.boletos.filter((b) => b.id !== id) })),
}))

export function useFinanceComputed() {
  const netMonthlyIncome = useFinanceStore((s) => s.netMonthlyIncome)
  const fixedExpensesMonthly = useFinanceStore((s) =>
    s.fixedExpenses.reduce((acc, x) => acc + x.amount, 0),
  )
  const boletoOpenMonthly = useFinanceStore((s) =>
    s.boletos.filter((b) => b.status === 'open').reduce((acc, b) => acc + b.amount, 0),
  )

  const monthlyBalance = netMonthlyIncome - fixedExpensesMonthly - boletoOpenMonthly

  return { netMonthlyIncome, fixedExpensesMonthly, boletoOpenMonthly, monthlyBalance }
}
