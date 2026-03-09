import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminUsuarios, getUsuarioById, updateUsuario, createUsuario } from '@/lib/api'
import { toast } from 'sonner'

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: getAdminUsuarios,
  })
}

export function useUsuario(id: number | null) {
  return useQuery({
    queryKey: ['usuario', id],
    queryFn: () => getUsuarioById(id!),
    enabled: !!id,
  })
}

export function useCreateUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { nome: string; email: string; password: string; role: string }) =>
      createUsuario(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Jornalista criado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar jornalista')
    },
  })
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { nome?: string; email?: string; role?: string } }) =>
      updateUsuario(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['usuario'] })
      toast.success('Usuário atualizado com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar usuário')
    },
  })
}
