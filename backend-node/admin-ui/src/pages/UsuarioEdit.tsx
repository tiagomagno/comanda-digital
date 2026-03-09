import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUsuario, useUpdateUsuario } from '@/hooks/useUsuarios'
import { ROLE_OPTIONS, type UserRole } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function UsuarioEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const userId = id ? Number(id) : null
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('JORNALISTA')
  const [error, setError] = useState('')

  const { data: usuario, isLoading } = useUsuario(userId)
  const updateMutation = useUpdateUsuario()

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome)
      setEmail(usuario.email)
      setRole((usuario.role as UserRole) || 'JORNALISTA')
    }
  }, [usuario])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    if (!nome.trim() || !email.trim()) {
      setError('Preencha nome e e-mail.')
      return
    }
    setError('')
    try {
      await updateMutation.mutateAsync({
        id: userId,
        payload: { nome: nome.trim(), email: email.trim(), role },
      })
      navigate('/usuarios')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  if (isLoading && userId) return <LoadingSpinner />
  if (!userId) return <div className="p-8">ID inválido.</div>

  return (
    <div className="px-6 pt-8 pb-6 max-w-xl">
      <Link
        to="/usuarios"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        ← Voltar
      </Link>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Editar usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Função</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
            )}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Salvando…' : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/usuarios">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
