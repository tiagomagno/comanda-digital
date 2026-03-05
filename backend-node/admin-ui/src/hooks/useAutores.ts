import { useQuery } from '@tanstack/react-query'
import { getAutores } from '@/lib/api'

export function useAutores() {
  return useQuery({
    queryKey: ['autores'],
    queryFn: getAutores,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}
