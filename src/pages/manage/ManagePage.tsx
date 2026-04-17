import { useMemo, useState } from 'react'
import { useParseBoletoCode } from '../../hooks/useParseBoletoCode'
import { isValidBoletoCode, normalizeBoletoCode } from '../../domain/billing/boletoBarcode'
import { useFinanceStore } from '../../store/financeStore'
import { formatBRL } from '../../shared/format/money'
import { Card } from '../../ui/primitives/Card'
import { NumberField } from '../../ui/primitives/NumberField.tsx'
import { TextField } from '../../ui/primitives/TextField.tsx'
import './manage.css'

export function ManagePage() {
  return (
    <div className="manage">
      <BoletosSection />
      <FixedExpensesSection />
      <SalarySection />
    </div>
  )
}

function BoletosSection() {
  const parse = useParseBoletoCode()
  const addBoleto = useFinanceStore((s) => s.addBoleto)
  const markPaid = useFinanceStore((s) => s.markBoletoPaid)
  const remove = useFinanceStore((s) => s.removeBoleto)
  const boletos = useFinanceStore((s) => s.boletos)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [amount, setAmount] = useState(0)

  const normalized = useMemo(() => normalizeBoletoCode(code), [code])
  const valid = useMemo(() => isValidBoletoCode(code), [code])

  async function onParse() {
    const res = await parse.mutateAsync({ code })
    if (res.ok) setCode(res.data.normalized)
  }

  return (
    <Card
      title="Boletos (código de barras / linha digitável)"
      subtitle="Sem OCR: cole ou digite o código e registre o valor."
    >
      <div className="formRow">
        <TextField label="Nome" value={name} onChange={setName} placeholder="Ex.: Energia" />
        <TextField
          label="Código"
          value={code}
          onChange={setCode}
          placeholder="44/47/48 dígitos"
        />
        <NumberField label="Valor (R$)" value={amount} onChange={setAmount} min={0} step={1} />
      </div>

      <div className="actions">
        <button disabled={!valid || parse.isPending} onClick={onParse}>
          Validar/Normalizar
        </button>
        <button
          disabled={!valid || !name || amount <= 0}
          onClick={() => {
            addBoleto({ name, barcode: normalized.digits, amount })
            setName('')
            setCode('')
            setAmount(0)
          }}
        >
          Registrar boleto
        </button>
        <div className="mutedSmall">
          Tipo: {normalized.kind ?? '—'} | dígitos: {normalized.digits.length}
        </div>
      </div>      {parse.data?.ok === false && <div className="error">{parse.data.error}</div>}

      <div className="list">
        {boletos.length === 0 && <div className="mutedSmall">Nenhum boleto registrado.</div>}
        {boletos.map((b) => (
          <div key={b.id} className="item">
            <div className="item__main">
              <div className="item__title">{b.name}</div>
              <div className="item__meta">
                {formatBRL(b.amount)} • {b.status === 'open' ? 'aberto' : 'pago'}
              </div>
              <div className="item__code">{b.barcode}</div>
            </div>
            <div className="item__actions">
              {b.status === 'open' && <button onClick={() => markPaid(b.id)}>Marcar pago</button>}
              <button className="danger" onClick={() => remove(b.id)}>
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function FixedExpensesSection() {
  const add = useFinanceStore((s) => s.addFixedExpense)
  const remove = useFinanceStore((s) => s.removeFixedExpense)
  const fixed = useFinanceStore((s) => s.fixedExpenses)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)
  const [dueDay, setDueDay] = useState(5)

  return (
    <Card title="Gastos fixos" subtitle="Registre mensalidades e contas recorrentes.">
      <div className="formRow">
        <TextField label="Nome" value={name} onChange={setName} placeholder="Ex.: Aluguel" />
        <NumberField label="Valor (R$)" value={amount} onChange={setAmount} min={0} step={1} />
        <NumberField
          label="Dia venc."
          value={dueDay}
          onChange={setDueDay}
          min={1}
          max={31}
          step={1}
        />
      </div>
      <div className="actions">
        <button
          disabled={!name || amount <= 0}
          onClick={() => {
            add(name, amount, dueDay)
            setName('')
            setAmount(0)
          }}
        >
          Adicionar
        </button>
      </div>

      <div className="list">
        {fixed.map((x) => (
          <div key={x.id} className="item">
            <div className="item__main">
              <div className="item__title">{x.name}</div>
              <div className="item__meta">
                {formatBRL(x.amount)} • dia {x.dueDay}
              </div>
            </div>
            <div className="item__actions">
              <button className="danger" onClick={() => remove(x.id)}>
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SalarySection() {
  const add = useFinanceStore((s) => s.addSalaryChange)
  const remove = useFinanceStore((s) => s.removeSalaryChange)
  const items = useFinanceStore((s) => s.salaryChanges)

  const [effectiveFrom, setEffectiveFrom] = useState('')
  const [newNetMonthly, setNewNetMonthly] = useState(0)

  return (
    <Card title="Mudança salarial" subtitle="Registre alterações futuras na renda (MVP).">
      <div className="formRow">
        <TextField
          label="Válido a partir de"
          value={effectiveFrom}
          onChange={setEffectiveFrom}
          placeholder="YYYY-MM-DD"
        />
        <NumberField
          label="Nova renda líquida (R$)"
          value={newNetMonthly}
          onChange={setNewNetMonthly}
          min={0}
          step={50}
        />
      </div>
      <div className="actions">
        <button
          disabled={!effectiveFrom || newNetMonthly <= 0}
          onClick={() => {
            add(effectiveFrom, newNetMonthly)
            setEffectiveFrom('')
            setNewNetMonthly(0)
          }}
        >
          Registrar mudança
        </button>
      </div>

      <div className="list">
        {items.length === 0 && <div className="mutedSmall">Sem mudanças registradas.</div>}
        {items.map((x) => (
          <div key={x.id} className="item">
            <div className="item__main">
              <div className="item__title">{x.effectiveFrom}</div>
              <div className="item__meta">{formatBRL(x.newNetMonthly)}</div>
            </div>
            <div className="item__actions">
              <button className="danger" onClick={() => remove(x.id)}>
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
