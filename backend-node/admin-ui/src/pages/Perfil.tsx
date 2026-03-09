import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { User, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth, ROLE_OPTIONS, type UserRole } from '@/contexts/AuthContext'
import { uploadMidia, updateUsuario, getApiUrlForAssets } from '@/lib/api'
import { cn } from '@/lib/utils'
import { applyTelefoneMask, formatTelefoneBR, isValidEmail } from '@/lib/masks'

const API_URL = getApiUrlForAssets()

export function Perfil() {
  const { user, updateUser } = useAuth()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('JORNALISTA')
  const [telefone, setTelefone] = useState('')
  const [bio, setBio] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [saved, setSaved] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [senhaMsg, setSenhaMsg] = useState('')
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    if (user) {
      setNome(user.nome ?? '')
      setEmail(user.email ?? '')
      setRole(user.role)
      setTelefone(user.telefone ? formatTelefoneBR(user.telefone) : '')
      setBio(user.bio ?? '')
      setAtivo(user.ativo !== false)
    }
  }, [user?.id, user?.nome, user?.email, user?.role, user?.telefone, user?.bio, user?.ativo])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    if (!user) return
    const emailTrim = email.trim()
    if (emailTrim && !isValidEmail(emailTrim)) {
      setEmailError('Informe um e-mail válido (ex: nome@dominio.com).')
      return
    }
    const payload = {
      nome: nome.trim() || undefined,
      email: emailTrim || user.email,
      role,
      telefone: telefone.trim() || undefined,
      bio: bio.trim() || undefined,
      ativo,
    }
    try {
      await updateUsuario(user.id, { nome: payload.nome ?? nome, email: payload.email ?? user.email, role })
      updateUser(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setEmailError('Não foi possível salvar no servidor. Tente novamente.')
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    e.target.value = ''
    setAvatarUploading(true)
    try {
      const data = await uploadMidia(file)
      const url = `${API_URL}/${data.path}`
      updateUser({ avatar: url })
    } catch {
      // falha silenciosa ou toast
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (novaSenha !== confirmarSenha) {
      setSenhaMsg('A nova senha e a confirmação não coincidem.')
      return
    }
    if (novaSenha.length < 6) {
      setSenhaMsg('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }
    // Em produção: chamar API POST /api/admin/me/change-password
    setSenhaMsg('Alteração de senha será validada no servidor. Em produção, use o endpoint configurado.')
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmarSenha('')
  }

  if (!user) {
    return (
      <div className="px-6 pt-8 pb-6 max-w-xl">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          ← Voltar
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Dados do perfil não disponíveis. Faça login novamente para editar seu perfil.
            </p>
            <Button asChild className="mt-4">
              <Link to="/">Ir ao Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const avatarUrl = user.avatar || null

  return (
    <div className="px-6 pt-8 pb-6 w-full min-w-0">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        ← Voltar
      </Link>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr,20rem]">
        {/* Dados pessoais + Função + Avatar + Status – ocupa todo o espaço à esquerda */}
        <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Meu perfil</CardTitle>
          <CardDescription>
            Dados exibidos no menu e regras de visualização conforme a função.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={cn(
                    'w-20 h-20 rounded-full flex items-center justify-center overflow-hidden bg-muted border-2 border-border',
                    avatarUploading && 'opacity-60'
                  )}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-secondary text-white shadow hover:bg-secondary/90"
                  title="Trocar avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="font-medium">Foto do perfil</p>
                <p className="text-xs text-muted-foreground">
                  Clique no ícone da câmera para enviar uma imagem. JPG ou PNG.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                  placeholder="seu@email.com"
                  className={cn('mt-1.5', emailError && 'border-destructive')}
                />
                {emailError && (
                  <p className="text-xs text-destructive mt-1">{emailError}</p>
                )}
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(applyTelefoneMask(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="mt-1.5"
                  maxLength={16}
                />
                <p className="text-xs text-muted-foreground mt-1">(00) 00000-0000 ou (00) 0000-0000</p>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="funcao">Função</Label>
                <select
                  id="funcao"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  A função define o que você pode ver e fazer no painel (criar, revisar, publicar, configurar).
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="bio">Observações / Bio</Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Breve descrição ou observações sobre o perfil"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="ativo" className="font-normal cursor-pointer">
                  Conta ativa
                </Label>
                <span className="text-xs text-muted-foreground">
                  Desmarque para desativar o acesso (em produção, o login será bloqueado).
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saved}>
                {saved ? 'Salvo!' : 'Salvar alterações'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

        {/* Alterar senha – ao lado em xl; em telas menores fica abaixo com 100% de largura */}
        <Card className="h-fit min-w-0 xl:w-80">
          <CardHeader>
            <CardTitle>Alterar senha</CardTitle>
            <CardDescription>
              Informe a senha atual e a nova senha. Em produção, a alteração é validada no servidor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="senhaAtual">Senha atual</Label>
              <Input
                id="senhaAtual"
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="mt-1.5"
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label htmlFor="novaSenha">Nova senha</Label>
              <Input
                id="novaSenha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="mt-1.5"
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="mt-1.5"
                autoComplete="new-password"
              />
            </div>
            {senhaMsg && (
              <p className="text-sm text-muted-foreground">{senhaMsg}</p>
            )}
              <Button type="submit" variant="secondary">
                Alterar senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
