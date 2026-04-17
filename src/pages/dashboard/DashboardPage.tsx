import { useEffect, useMemo, useState } from 'react'
import { useAiProjections } from '../../hooks/useAiProjections'
import { useFinanceComputed, useFinanceStore } from '../../store/financeStore'
import { formatBRL } from '../../shared/format/money'
import { Card } from '../../ui/primitives/Card'
import { NumberField } from '../../ui/primitives/NumberField.tsx'
import { SimpleChart } from '../../ui/viz/SimpleChart'
import { SparkBars } from '../../ui/viz/SparkBars'
import { StackBar } from '../../ui/viz/StackBar'
import './dashboard.css'

export function DashboardPage() {
  const { netMonthlyIncome, fixedExpensesMonthly, boletoOpenMonthly, monthlyBalance } =
    useFinanceComputed()

  const setNetMonthlyIncome = useFinanceStore((s) => s.setNetMonthlyIncome)

  const [months, setMonths] = useState(12)

  const projections = useAiProjections()

  const payload = useMemo(
    () => ({
      netMonthlyIncome,
      fixedExpensesMonthly,
      boletoOpenMonthly,
      months,
    }),
    [netMonthlyIncome, fixedExpensesMonthly, boletoOpenMonthly, months],
  )

  useEffect(() => {
    projections.mutate(payload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload])
  const points = useMemo(
    () => (projections.data?.ok ? projections.data.data.months : []),
    [projections.data],
  )
  const summary = useMemo(
    () => (projections.data?.ok ? projections.data.data.summary : null),
    [projections.data],
  )
  const insights = useMemo(
    () => (projections.data?.ok ? projections.data.data.insights : []),
    [projections.data],
  )

  const savingsRateNow = netMonthlyIncome > 0 ? monthlyBalance / netMonthlyIncome : 0

  const composition = useMemo(
    () => [
      { label: 'Fixos', value: fixedExpensesMonthly, color: 'rgba(170,59,255,0.85)' },
      { label: 'Boletos', value: boletoOpenMonthly, color: 'rgba(255, 159, 67, 0.85)' },
      {
        label: 'Saldo',
        value: Math.max(0, monthlyBalance),
        color: 'rgba(15, 118, 110, 0.85)',
      },
    ],
    [fixedExpensesMonthly, boletoOpenMonthly, monthlyBalance],
  )

  const cashflowPreview = useMemo(() => {
    // 12 barras: usa projeção quando disponível; senão, repete saldo mensal atual.
    const projected = points.map((p) => p.projectedBalance)
    if (projected.length >= 2) {
      const diffs = projected.map((v, i) => (i === 0 ? v : v - projected[i - 1]))
      return diffs.slice(0, 12)
    }
    return Array.from({ length: 12 }, () => monthlyBalance)
  }, [points, monthlyBalance])

  return (
    <div className="grid">
      <div className="grid__row">
        <Card title="Renda líquida mensal">
          <NumberField
            label="Valor (R$)"
            value={netMonthlyIncome}
            onChange={setNetMonthlyIncome}
            min={0}
            step={50}
          />
        </Card>
        <Card title="Gastos fixos (mês)">
          <div className="big">{formatBRL(fixedExpensesMonthly)}</div>
          <div className="muted">Atualize em Gestão → Gastos fixos</div>
        </Card>
        <Card title="Boletos abertos (mês)">
          <div className="big">{formatBRL(boletoOpenMonthly)}</div>
          <div className="muted">Atualize em Gestão → Boletos</div>
        </Card>
        <Card title="Saldo mensal">
          <div className={monthlyBalance >= 0 ? 'big big--pos' : 'big big--neg'}>
            {formatBRL(monthlyBalance)}
          </div>
          <div className="muted">Renda - fixos - boletos</div>
        </Card>
      </div>

      <div className="grid__row grid__row--3">
        <Card title="Taxa de poupança (agora)">
          <div className="big">{Math.round(savingsRateNow * 100)}%</div>
          <div className="muted">Saldo mensal ÷ renda</div>
          <div style={{ marginTop: 10 }}>
            <StackBar items={composition} />
          </div>
        </Card>

        <Card title="Fluxo de caixa (12 meses)">
          <div className="muted">Barras mensais (saldo estimado)</div>
          <div style={{ marginTop: 10 }}>
            <SparkBars values={cashflowPreview} />
          </div>
        </Card>

        <Card
          title="Projeção (IA)"
          right={
            <div className="inline">
              <label className="muted" htmlFor="months">
                Meses
              </label>
              <select id="months" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
                {[6, 12, 18, 24, 36].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          }
        >
          {projections.isPending && <div className="muted">Calculando projeções…</div>}
          {projections.data?.ok === false && (
            <div className="error">{projections.data.error}</div>
          )}
          {summary && (
            <div className="summary">
              <div>
                <div className="muted">Saldo ao final</div>
                <div className="big">{formatBRL(summary.projectedEndBalance)}</div>
              </div>
              <div>
                <div className="muted">Taxa de poupança</div>
                <div className="big">{Math.round(summary.savingsRate * 100)}%</div>
              </div>
            </div>
          )}
          <SimpleChart points={points.map((p) => p.projectedBalance)} />
          {!!insights.length && (
            <ul className="insights">
              {insights.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
