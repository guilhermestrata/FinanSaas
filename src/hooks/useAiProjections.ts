import { useMutation } from '@tanstack/react-query'
import { getAiProjections } from '../services/api/financial'

export function useAiProjections() {
  return useMutation({
    mutationFn: getAiProjections,
  })
}
