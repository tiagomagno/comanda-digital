import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useUsuario } from '@/hooks/useUsuarios'
import { useAuth, getRoleLabel, type UserRole } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Edit } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ArtigoRecente {
    id: number
    titulo: string
    categoria: string
    categoriaColor: string
    tempo: string
    views: string
    comentarios: number
    emAlta?: boolean
}

// ─── Mock articles (to be replaced with real API later) ────────────────────────

const ARTIGOS_MOCK: ArtigoRecente[] = [
    {
        id: 1, titulo: 'Novas medidas econômicas aprovadas no congresso: o que muda para o cidadão',
        categoria: 'Política', categoriaColor: 'bg-blue-100 text-blue-600',
        tempo: 'Há 2 horas', views: '12.5k', comentarios: 84, emAlta: true,
    },
    {
        id: 2, titulo: 'Exclusivo: Os bastidores do esquema de corrupção revelado na capital',
        categoria: 'Investigação', categoriaColor: 'bg-purple-100 text-purple-600',
        tempo: 'Ontem', views: '45.2k', comentarios: 342,
    },
    {
        id: 3, titulo: 'O impacto das novas tecnologias na educação básica pública do país',
        categoria: 'Sociedade', categoriaColor: 'bg-orange-100 text-orange-600',
        tempo: '12 Mar, 2025', views: '8.9k', comentarios: 45,
    },
]

const ESPECIALIDADES_MOCK: Record<UserRole, string[]> = {
    JORNALISTA: ['Reportagem', 'Notícias', 'Entrevistas'],
    EDITOR_CHEFE: ['Edição', 'Política Editorial', 'Revisão'],
    MARKETING_SEO: ['SEO', 'Redes Sociais', 'Conteúdo Digital'],
    GESTOR: ['Gestão', 'Estratégia', 'Operações'],
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, bg, textColor }: {
    icon: string; label: string; value: string; bg: string; textColor: string
}) {
    return (
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[24px] p-6 shadow-[0_4px_16px_0_rgba(31,38,135,0.04)] flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${bg} ${textColor} flex items-center justify-center flex-shrink-0`}>
                <span className="material-symbols-outlined text-[28px]">{icon}</span>
            </div>
            <div>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] font-sans mb-1">{label}</p>
                <p className="text-2xl font-bold text-[#1E293B] font-sans">{value}</p>
            </div>
        </div>
    )
}

// ─── Article Item ───────────────────────────────────────────────────────────────

function ArtigoItem({ artigo }: { artigo: ArtigoRecente }) {
    return (
        <div className="px-6 py-5 flex gap-5 hover:bg-slate-50/60 transition-colors group">
            <div className="flex flex-col flex-1 justify-between min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg ${artigo.categoriaColor}`}>
                        {artigo.categoria}
                    </span>
                    <span className="text-[11px] text-[#94A3B8] font-medium">{artigo.tempo}</span>
                </div>
                <h4 className="text-[14px] font-bold text-[#1E293B] group-hover:text-primary transition-colors line-clamp-2 font-sans leading-snug mb-3">
                    {artigo.titulo}
                </h4>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[11px] text-[#94A3B8] font-medium">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        {artigo.views}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#94A3B8] font-medium">
                        <span className="material-symbols-outlined text-[14px]">forum</span>
                        {artigo.comentarios}
                    </div>
                    {artigo.emAlta && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold ml-auto">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            Em alta
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export function UsuarioPerfil() {
    const { id } = useParams()
    const { user: currentUser, canManageConfig } = useAuth()
    const userId = id ? Number(id) : null
    const { data: usuario, isLoading } = useUsuario(userId)

    const [busca, setBusca] = useState('')

    if (isLoading) return <LoadingSpinner />
    if (!userId || !usuario) {
        return (
            <div className="flex items-center justify-center h-64 text-[#94A3B8]">
                <div className="text-center">
                    <span className="material-symbols-outlined text-[56px] mb-3 block">person_off</span>
                    <p className="text-[14px] font-medium">Jornalista não encontrado.</p>
                    <Link to="/usuarios" className="mt-3 text-primary text-[13px] font-bold inline-block">← Voltar</Link>
                </div>
            </div>
        )
    }

    const initials = usuario.nome?.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase() || '?'
    const role = usuario.role as UserRole
    const especialidades = ESPECIALIDADES_MOCK[role] ?? ['Jornalismo']

    return (
        <div className="px-8 pt-8 pb-10 max-w-[1600px] mx-auto min-h-full">

            {/* HEADER */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <Link
                        to="/usuarios"
                        className="w-9 h-9 rounded-full bg-white/60 border border-white/60 flex items-center justify-center text-[#64748B] hover:text-secondary hover:border-secondary/30 transition-all shadow-sm"
                        title="Voltar para Jornalistas"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-medium font-sans tracking-wide mb-1 text-primary">
                            Perfil do Jornalista
                        </h1>
                        <p className="text-[13px] text-[#64748B] font-medium">
                            Detalhes, métricas e artigos publicados.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Busca */}
                    <form className="relative w-64" onSubmit={e => e.preventDefault()}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[20px] pointer-events-none">search</span>
                        <input
                            type="text"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full pl-11 pr-4 py-3 bg-white/60 rounded-full text-[13px] focus:ring-1 focus:ring-secondary focus:outline-none placeholder-[#94A3B8] border-none shadow-sm"
                        />
                    </form>

                    {/* Avatar do usuário logado */}
                    <div className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm bg-secondary text-white flex items-center justify-center font-bold text-sm">
                        {currentUser?.nome?.substring(0, 1).toUpperCase() || 'A'}
                    </div>

                    {/* Botão Editar (só para gestores) */}
                    {canManageConfig && (
                        <Link
                            to={`/usuarios/${userId}/editar`}
                            className="bg-secondary text-white hover:bg-secondary/90 px-6 py-2.5 rounded-full font-bold inline-flex items-center gap-2 transition-all shadow-md font-sans text-[12px] uppercase tracking-[0.1em]"
                        >
                            <Edit className="w-4 h-4" />
                            Editar Perfil
                        </Link>
                    )}
                </div>
            </header>

            {/* LAYOUT 2 COLUNAS */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* ── COLUNA ESQUERDA: Card do Perfil ── */}
                <div className="w-full lg:w-[340px] flex-shrink-0">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-[0_8px_32px_0_rgba(31,38,135,0.04)] p-8 flex flex-col items-center text-center">

                        {/* Avatar */}
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold ring-4 ring-white shadow-lg font-sans">
                                {initials}
                            </div>
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-white" title="Online" />
                        </div>

                        {/* Nome e função */}
                        <h2 className="text-2xl font-bold text-[#1E293B] mb-1 font-sans">{usuario.nome}</h2>
                        <p className="text-primary font-bold text-[13px] mb-1 font-sans uppercase tracking-wider">
                            {getRoleLabel(role)}
                        </p>
                        <p className="text-[12px] text-[#94A3B8] font-medium mb-6 flex items-center gap-1 justify-center">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            Membro desde 2024
                        </p>

                        {/* Links sociais */}
                        <div className="flex gap-3 mb-8 w-full justify-center border-y border-[#E2E8F0]/60 py-4">
                            {[
                                { icon: 'language', title: 'Site' },
                                { icon: 'share', title: 'Redes Sociais' },
                                { icon: 'mail', title: 'E-mail' },
                            ].map(({ icon, title }) => (
                                <button
                                    key={icon}
                                    title={title}
                                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#64748B] hover:bg-primary/10 hover:text-primary transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                </button>
                            ))}
                        </div>

                        {/* Bio */}
                        <div className="text-left w-full">
                            <h3 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-3 font-sans">Biografia</h3>
                            <p className="text-[13px] text-[#475569] leading-relaxed font-medium">
                                {usuario.nome} é um(a) profissional de comunicação com expertise em {especialidades.join(', ').toLowerCase()}.
                                Faz parte da equipe de redação do Notícias 360.
                            </p>
                        </div>

                        {/* Especialidades */}
                        <div className="mt-6 pt-6 border-t border-[#E2E8F0]/60 w-full text-left">
                            <h3 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-3 font-sans">Áreas de Especialização</h3>
                            <div className="flex flex-wrap gap-2">
                                {especialidades.map(esp => (
                                    <span
                                        key={esp}
                                        className="px-3 py-1.5 text-[11px] font-bold bg-slate-100 text-[#64748B] rounded-full font-sans tracking-wide"
                                    >
                                        {esp}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mt-6 pt-6 border-t border-[#E2E8F0]/60 w-full text-left">
                            <h3 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2 font-sans">E-mail</h3>
                            <a
                                href={`mailto:${usuario.email}`}
                                className="text-[13px] font-medium text-secondary hover:underline underline-offset-2 break-all"
                            >
                                {usuario.email}
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── COLUNA DIREITA: Stats + Artigos ── */}
                <div className="flex-1 min-w-0 flex flex-col gap-6">

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <StatCard icon="article" label="Total Artigos" value="—" bg="bg-blue-50" textColor="text-blue-500" />
                        <StatCard icon="visibility" label="Views Médias/Mês" value="—" bg="bg-emerald-50" textColor="text-emerald-500" />
                        <StatCard icon="favorite" label="Engajamento" value="—" bg="bg-orange-50" textColor="text-orange-500" />
                    </div>

                    {/* Artigos Recentes */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-[0_8px_32px_0_rgba(31,38,135,0.04)] overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-[#E2E8F0]/50 flex items-center justify-between">
                            <h3 className="text-[13px] font-bold text-primary uppercase tracking-[0.2em] font-sans">
                                Artigos Recentes
                            </h3>
                            <Link
                                to="/noticias"
                                className="text-[12px] font-bold text-secondary hover:underline underline-offset-2 flex items-center gap-1 transition-colors"
                            >
                                Ver todos
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </Link>
                        </div>

                        <div className="flex flex-col divide-y divide-[#E2E8F0]/40">
                            {ARTIGOS_MOCK.map(artigo => (
                                <ArtigoItem key={artigo.id} artigo={artigo} />
                            ))}
                        </div>

                        {/* Empty state (para quando integrar com a API) */}
                        {ARTIGOS_MOCK.length === 0 && (
                            <div className="py-16 flex flex-col items-center text-[#94A3B8]">
                                <span className="material-symbols-outlined text-[48px] mb-3">article</span>
                                <p className="text-[13px] font-medium">Nenhum artigo publicado ainda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
