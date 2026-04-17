// Front-only mock backend using Vite dev server middleware.
// This keeps UI + "backend" contract in place without needing a real server yet.

import type { Plugin } from 'vite'
import { isValidBoletoCode, normalizeBoletoCode } from '../../domain/billing/boletoBarcode'

export function mockServer(): Plugin {
  return {
    name: 'finansaas-mock-server',
    configureServer(server) {
      server.middlewares.use('/api/boleto/parse', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', () => {
          try {
            const json = JSON.parse(body || '{}') as { code?: string }
            const code = json.code ?? ''
            if (!isValidBoletoCode(code)) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'text/plain; charset=utf-8')
              res.end('Código inválido. Informe 44, 47 ou 48 dígitos.')
              return
            }

            const norm = normalizeBoletoCode(code)
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                normalized: norm.digits,
                kind: norm.kind,
              }),
            )
          } catch {
            res.statusCode = 400
            res.end('Bad request')
          }
        })
      })

      server.middlewares.use('/api/ai/projections', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', () => {
          try {
            const json = JSON.parse(body || '{}') as {
              netMonthlyIncome?: number
              fixedExpensesMonthly?: number
              boletoOpenMonthly?: number
              months?: number
            }

            const net = Math.max(0, Number(json.netMonthlyIncome ?? 0))
            const fixed = Math.max(0, Number(json.fixedExpensesMonthly ?? 0))
            const boletos = Math.max(0, Number(json.boletoOpenMonthly ?? 0))
            const months = Math.min(36, Math.max(3, Number(json.months ?? 12)))

            const monthlyBalance = net - fixed - boletos

            const points = Array.from({ length: months }, (_, i) => {
              const projectedBalance = monthlyBalance * (i + 1)
              return { monthIndex: i + 1, projectedBalance }
            })

            const end = points.at(-1)?.projectedBalance ?? 0
            const savingsRate = net > 0 ? Math.max(0, monthlyBalance / net) : 0

            const insights: string[] = []
            if (monthlyBalance < 0) {
              insights.push('Sua projeção está negativa: revise gastos fixos e boletos abertos.')
            } else {
              insights.push('Mantendo o padrão atual, você acumula saldo positivo mês a mês.')
            }
            if (savingsRate < 0.1) insights.push('Meta: tente elevar a taxa de poupança acima de 10%.')
            if (boletos > 0) insights.push('Boletos abertos impactam diretamente seu caixa mensal.')

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                months: points,
                summary: { projectedEndBalance: end, savingsRate },
                insights,
              }),
            )
          } catch {
            res.statusCode = 400
            res.end('Bad request')
          }
        })
      })
    },
  }
}
