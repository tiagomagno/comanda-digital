import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUsuarios, useCreateUsuario } from '@/hooks/useUsuarios'
import { getRoleLabel, ROLE_OPTIONS, type UserRole, useAuth } from '@/contexts/AuthContext'
import { X, Eye, EyeOff } from 'lucide-react'
import { getAdminStats } from '@/lib/api'
import { ContentHeader } from '@/components/Layout/ContentHeader'

export function UsuariosList() {
  const navigate = useNavigate()
  const { user: currentUser, logout } = useAuth()
  const { data: usuarios = [], isLoading } = useUsuarios()
  const createMutation = useCreateUsuario()

  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', password: '', role: 'JORNALISTA' })
  const [formError, setFormError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<{ noticiasEmRevisao?: number } | null>(null)

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => setStats(null))
  }, [])

  const handleSearchSubmit = () => {
    const q = searchQuery.trim()
    if (q) navigate(`/noticias?q=${encodeURIComponent(q)}`)
    else navigate('/noticias')
  }

  const handleOpenModal = () => {
    setForm({ nome: '', email: '', password: '', role: 'JORNALISTA' })
    setFormError('')
    setShowPassword(false)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.nome.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('Preencha todos os campos obrigatórios.')
      return
    }
    if (form.password.length < 6) {
      setFormError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    try {
      await createMutation.mutateAsync(form)
      setShowModal(false)
    } catch {
      // toast de erro já disparado pelo hook
    }
  }

  return (
    <div className="px-8 pt-8 pb-8 max-w-[1600px] mx-auto min-h-full">

      <ContentHeader
        title="Jornalistas"
        subtitle="Equipe de redação e colaboradores do portal."
        searchPlaceholder="Buscar conteúdos..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Botão Novo Jornalista acima da listagem */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pl-4">
        <button
          type="button"
          onClick={handleOpenModal}
          className="bg-secondary text-white hover:bg-secondary/90 px-6 py-2.5 rounded-full font-bold inline-flex items-center gap-2 transition-all shadow-md font-sans text-[12px] uppercase tracking-[0.1em]"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Novo Jornalista
        </button>
      </div>

      {/* TABELA */}
      <div className="backdrop-blur-xl rounded-[32px] border border-white/60 bg-white/40 overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">

        {/* Barra topo */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#E2E8F0]/50">
          <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] font-sans">
            {isLoading ? 'Carregando...' : `${usuarios.length} membro${usuarios.length !== 1 ? 's' : ''} na equipe`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8FAFC]/50 border-b border-[#E2E8F0]/50">
              <tr>
                <th className="py-4 px-8 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] font-sans whitespace-nowrap">Jornalista</th>
                <th className="py-4 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] font-sans whitespace-nowrap">E-mail</th>
                <th className="py-4 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] font-sans whitespace-nowrap">Função</th>
                <th className="py-4 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] font-sans whitespace-nowrap text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]/40">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                      <span className="text-[13px] font-medium text-[#94A3B8]">Carregando equipe...</span>
                    </div>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-[#94A3B8]">
                      <span className="material-symbols-outlined text-[48px]">group</span>
                      <p className="text-[13px] font-medium">Nenhum jornalista cadastrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-white/30 transition-colors group">
                    <td className="py-4 px-8 align-middle">
                      <div className="flex items-center gap-3">
                        <Link to={`/usuarios/${u.id}`} className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[13px] flex-shrink-0 ring-2 ring-white hover:ring-primary/30 transition-all">
                          {u.nome?.substring(0, 1).toUpperCase()}
                        </Link>
                        <Link to={`/usuarios/${u.id}`} className="font-semibold text-[#334155] text-[14px] font-sans hover:text-secondary transition-colors">{u.nome}</Link>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[13px] text-[#64748B] font-medium font-sans whitespace-nowrap align-middle">
                      {u.email}
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <RolePill role={u.role as UserRole} />
                    </td>
                    <td className="py-4 px-6 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Link
                          to={`/usuarios/${u.id}`}
                          className="inline-flex items-center px-4 py-2 rounded-full text-[12px] font-bold tracking-[0.08em] font-sans whitespace-nowrap border border-[#E2E8F0] bg-white/60 text-[#64748B] hover:text-secondary hover:border-secondary/30 hover:bg-secondary/5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px] mr-1">person</span>
                          Ver Perfil
                        </Link>
                        <Link
                          to={`/usuarios/${u.id}/editar`}
                          className="inline-flex items-center px-4 py-2 rounded-full text-[12px] font-bold tracking-[0.08em] font-sans whitespace-nowrap border border-[#E2E8F0] bg-white/60 text-[#64748B] hover:text-secondary hover:border-secondary/30 hover:bg-secondary/5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL CRIAR JORNALISTA ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Card Modal */}
          <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[14px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#E11D48]">person_add</span>
                Novo Jornalista
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#64748B] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2 font-sans">Nome completo *</label>
                <input
                  className="w-full px-5 py-3.5 rounded-2xl bg-white border border-[#E2E8F0] focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-[#334155]"
                  placeholder="Ex: Maria Silva"
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2 font-sans">E-mail *</label>
                <input
                  type="email"
                  className="w-full px-5 py-3.5 rounded-2xl bg-white border border-[#E2E8F0] focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-[#334155]"
                  placeholder="email@noticias360.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2 font-sans">Senha inicial *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-white border border-[#E2E8F0] focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-[#334155]"
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#94A3B8] hover:text-secondary hover:bg-slate-100 transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2 font-sans">Função</label>
                <div className="relative">
                  <select
                    className="w-full px-5 py-3.5 rounded-2xl bg-white border border-[#E2E8F0] focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-[#334155] appearance-none"
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  >
                    {ROLE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">expand_more</span>
                </div>
              </div>

              {formError && (
                <p className="text-[13px] font-medium text-[#E11D48]">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-full font-bold text-[12px] uppercase tracking-[0.1em] text-[#64748B] bg-slate-100 hover:bg-slate-200 transition-all font-sans"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-secondary text-white hover:bg-secondary/90 px-8 py-3 rounded-full font-bold inline-flex items-center gap-2 transition-all shadow-md font-sans text-[12px] uppercase tracking-[0.1em] disabled:opacity-60"
                >
                  {createMutation.isPending ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                  )}
                  {createMutation.isPending ? 'Criando...' : 'Criar Jornalista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

function RolePill({ role }: { role: UserRole }) {
  const styles: Record<string, string> = {
    JORNALISTA: 'bg-blue-50 text-blue-700',
    EDITOR_CHEFE: 'bg-purple-50 text-purple-700',
    MARKETING_SEO: 'bg-teal-50 text-teal-700',
    GESTOR: 'bg-primary/5 text-primary',
  }
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider font-sans ${styles[role] ?? 'bg-slate-100 text-slate-600'}`}>
      {getRoleLabel(role)}
    </span>
  )
}
