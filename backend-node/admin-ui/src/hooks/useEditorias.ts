import { useQuery } from '@tanstack/react-query'
import { getEditorias } from '@/lib/api'

export function useEditorias() {
  return useQuery({
    queryKey: ['editorias'],
    queryFn: getEditorias,
    staleTime: 10 * 60 * 1000, // 10 minutos (dados raramente mudam)
  })
}
