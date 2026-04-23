import { create } from 'zustand'
import type { Boleto, FixedExpense, SalaryChange } from '../domain/types'
import { apiDelete, apiGet, apiPatch, apiPost } from '../services/api/client'

type FinanceResponse = {
  netMonthlyIncome: number
  salaryChanges: SalaryChange[]
  fixedExpenses: FixedExpense[]
  boletos: Boleto[]
}

type FinanceState = {
  netMonthlyIncome: number
  salaryChanges: SalaryChange[]
  fixedExpenses: FixedExpense[]
  boletos: Boleto[]
  loading: boolean

  fetchAll: () => Promise<void>

  setNetMonthlyIncome: (value: number) => Promise<void>

  addSalaryChange: (effectiveFrom: string, newNetMonthly: number) => Promise<void>
  removeSalaryChange: (id: string) => Promise<void>

  addFixedExpense: (name: string, amount: number, dueDay: number) => Promise<void>
  removeFixedExpense: (id: string) => Promise<void>

  addBoleto: (boleto: Omit<Boleto, 'id' | 'status'>) => Promise<void>
  markBoletoPaid: (id: string) => Promise<void>
  removeBoleto: (id: string) => Promise<void>
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  netMonthlyIncome: 0,
  salaryChanges: [],
  fixedExpenses: [],
  boletos: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true })
    try {
      const data = await apiGet<FinanceResponse>('/api/finance')

      set({
        netMonthlyIncome: data.netMonthlyIncome,
        salaryChanges: data.salaryChanges,
        fixedExpenses: data.fixedExpenses,
        boletos: data.boletos,
        loading: false,
      })
    } catch (e) {
      console.error(e)
      set({ loading: false })
    }
  },

  setNetMonthlyIncome: async (value) => {
    await apiPatch('/api/income', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    })

    set({ netMonthlyIncome: value })
  },

  addSalaryChange: async (effectiveFrom, newNetMonthly) => {
    const res = await apiPost('/api/salary-changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ effectiveFrom, newNetMonthly }),
    })

    const created = await (res as Response).json()

    set((s) => ({
      salaryChanges: [created, ...s.salaryChanges],
    }))
  },

  removeSalaryChange: async (id) => {
    await apiDelete(`/api/salary-changes/${id}`)

    set((s) => ({
      salaryChanges: s.salaryChanges.filter((x) => x.id !== id),
    }))
  },

  addFixedExpense: async (name, amount, dueDay) => {
    const res = await apiPost<{ item: FixedExpense }>(
      '/api/fixed-expenses',
      {
        name,
        amount,
        dueDay,
      }
    )

    const created = res.item

    set((s) => ({
      fixedExpenses: [created, ...s.fixedExpenses],
    }))
  },

  removeFixedExpense: async (id) => {
    await apiDelete(`/api/fixed-expenses/${id}`)
    await get().fetchAll()
  },

  addBoleto: async (boleto) => {
    const res = await apiPost('/api/boletos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(boleto),
    })

    const created = await (res as Response).json()

    set((s) => ({
      boletos: [created, ...s.boletos],
    }))
  },

  markBoletoPaid: async (id) => {
    await apiPatch(`/api/boletos/${id}/pay`, {
      method: 'PATCH',
    })

    set((s) => ({
      boletos: s.boletos.map((b) =>
        b.id === id ? { ...b, status: 'paid' } : b
      ),
    }))
  },

  removeBoleto: async (id) => {
    await apiDelete(`/api/boletos/${id}`)

    set((s) => ({
      boletos: s.boletos.filter((b) => b.id !== id),
    }))
  },
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
