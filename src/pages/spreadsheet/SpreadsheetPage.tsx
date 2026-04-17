import { useMemo, useState } from 'react'
import { useFinanceComputed, useFinanceStore } from '../../store/financeStore'
import { formatBRL } from '../../shared/format/money'
import { addMonths, formatMonthLabel, monthKeyFromDate } from '../../shared/date/month'
import { Card } from '../../ui/primitives/Card'
import './spreadsheet.css'

export function SpreadsheetPage() {
  const { netMonthlyIncome, fixedExpensesMonthly, boletoOpenMonthly, monthlyBalance } =
    useFinanceComputed()
  const fixed = useFinanceStore((s) => s.fixedExpenses)
  const boletos = useFinanceStore((s) => s.boletos)

  const [months, setMonths] = useState(12)

  const monthRows = useMemo(() => {
    const now = new Date()
    const baseIncome = netMonthlyIncome
    const baseFixed = fixedExpensesMonthly
    const baseBoletos = boletoOpenMonthly

    return Array.from({ length: months }, (_, i) => {
      const key = monthKeyFromDate(addMonths(now, i))
      const income = baseIncome
      const fixedExp = baseFixed
      const boletosOpen = baseBoletos
      const balance = income - fixedExp - boletosOpen

      return {
        key,
        label: formatMonthLabel(key),
        income,
        fixedExp,
        boletosOpen,
        balance,
      }
    })
  }, [months, netMonthlyIncome, fixedExpensesMonthly, boletoOpenMonthly])

  return (
    <div className="sheet">
      <Card
        title="Planilha por mês"
        subtitle="Visão mensal consolidada (atualiza automaticamente)."
        right={
          <div className="inline">
            <label className="muted" htmlFor="monthsSheet">
              Meses
            </label>
            <select
              id="monthsSheet"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            >
              {[6, 12, 18, 24, 36].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <table className="table">
          <thead>
            <tr>
              <th>Mês</th>
              <th style={{ width: 180, textAlign: 'right' }}>Renda</th>
              <th style={{ width: 180, textAlign: 'right' }}>Fixos</th>
              <th style={{ width: 180, textAlign: 'right' }}>Boletos</th>
              <th style={{ width: 180, textAlign: 'right' }}>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {monthRows.map((r) => (
              <tr key={r.key}>
                <td>{r.label}</td>
                <td style={{ textAlign: 'right' }}>{formatBRL(r.income)}</td>
                <td style={{ textAlign: 'right' }}>{formatBRL(-r.fixedExp)}</td>
                <td style={{ textAlign: 'right' }}>{formatBRL(-r.boletosOpen)}</td>
                <td style={{ textAlign: 'right' }}>{formatBRL(r.balance)}</td>
              </tr>
            ))}
            <tr className="total">
              <td>Total ({months}m)</td>
              <td style={{ textAlign: 'right' }}>{formatBRL(netMonthlyIncome * months)}</td>
              <td style={{ textAlign: 'right' }}>{formatBRL(-fixedExpensesMonthly * months)}</td>
              <td style={{ textAlign: 'right' }}>{formatBRL(-boletoOpenMonthly * months)}</td>
              <td style={{ textAlign: 'right' }}>{formatBRL(monthlyBalance * months)}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <div className="two">
        <Card title="Gastos fixos">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th style={{ width: 120, textAlign: 'right' }}>Valor</th>
                <th style={{ width: 90, textAlign: 'right' }}>Venc.</th>
              </tr>
            </thead>
            <tbody>
              {fixed.map((x) => (
                <tr key={x.id}>
                  <td>{x.name}</td>
                  <td style={{ textAlign: 'right' }}>{formatBRL(x.amount)}</td>
                  <td style={{ textAlign: 'right' }}>{x.dueDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Boletos">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th style={{ width: 120, textAlign: 'right' }}>Valor</th>
                <th style={{ width: 90, textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {boletos.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td style={{ textAlign: 'right' }}>{formatBRL(b.amount)}</td>
                  <td style={{ textAlign: 'right' }}>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
