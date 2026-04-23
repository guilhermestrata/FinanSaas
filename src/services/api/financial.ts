import { apiPost } from './client'

export type ParseBoletoRequest = { code: string }

export type ParseBoletoResponse = {
  normalized: string
  kind: 'barcode44' | 'linhaDigitavel47' | 'convenio48'
}

export async function parseBoletoCode(
  req: ParseBoletoRequest
): Promise<ParseBoletoResponse> {
  return apiPost<ParseBoletoResponse>('/api/boleto/parse', req)
}


export type ProjectionRequest = {
  netMonthlyIncome: number
  fixedExpensesMonthly: number
  boletoOpenMonthly: number
  months: number
}

export type ProjectionResponse = {
  months: Array<{ monthIndex: number; projectedBalance: number }>
  summary: { projectedEndBalance: number; savingsRate: number }
  insights: string[]
}

export async function getAiProjections(
  req: ProjectionRequest
): Promise<ProjectionResponse> {
  return apiPost<ProjectionResponse>('/api/ai/projections', req)
}