import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminNoticias, getNoticiaById, updateNoticia, createNoticia, type NoticiasFilters, type CreateNoticiaPayload } from '@/lib/api'
import { toast } from 'sonner'

export function useNoticias(filters?: NoticiasFilters) {
  return useQuery({
    queryKey: ['noticias', filters],
    queryFn: () => getAdminNoticias(filters),
  })
}

export function useNoticia(id: number | null) {
  return useQuery({
    queryKey: ['noticia', id],
    queryFn: () => getNoticiaById(id!),
    enabled: !!id,
  })
}

export function useUpdateNoticia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateNoticia>[1] }) =>
      updateNoticia(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
      queryClient.invalidateQueries({ queryKey: ['noticia'] })
      toast.success('Notícia atualizada com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar notícia')
    },
  })
}

export function useCreateNoticia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateNoticiaPayload) => createNoticia(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
      toast.success('Notícia criada com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar notícia')
    },
  })
}
