import { useMutation } from '@tanstack/react-query'
import { parseBoletoCode } from '../services/api/financial'

export function useParseBoletoCode() {
  return useMutation({
    mutationFn: parseBoletoCode,
  })
}
