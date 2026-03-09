import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, TrendingUp, Edit3, CheckCircle, MoreHorizontal, Plus, Edit, UploadCloud, CheckSquare } from 'lucide-react'
import { getAdminStats, getAdminStatsMe, getAdminNoticias } from '@/lib/api'
import type { NoticiaRow } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { ContentHeader } from '@/components/Layout/ContentHeader'

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

export function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<{
    noticiasRascunho: number
    noticiasEmRevisao: number
    noticiasPublicadas: number
    noticiasTotal: number
  } | null>(null)
  const [profileStats, setProfileStats] = useState<{ artigosCriadosEstaSemana: number; atividadePorDia: number[] } | null>(null)
  const [ultimasNoticias, setUltimasNoticias] = useState<NoticiaRow[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  useEffect(() => {
    getAdminStatsMe()
      .then(setProfileStats)
      .catch(() => setProfileStats(null))
  }, [])

  useEffect(() => {
    getAdminNoticias({ page: '1', pageSize: '12' })
      .then(({ data }) => setUltimasNoticias(data || []))
      .catch(() => setUltimasNoticias([]))
  }, [])

  const handleSearchSubmit = () => {
    const q = searchQuery.trim()
    if (q) navigate(`/noticias?q=${encodeURIComponent(q)}`)
    else navigate('/noticias')
  }

  const CARDS_PER_PAGE = 3
  const totalCarouselPages = Math.max(1, Math.ceil(ultimasNoticias.length / CARDS_PER_PAGE))
  const canPrev = carouselIndex > 0
  const canNext = carouselIndex < totalCarouselPages - 1
  const sliceStart = carouselIndex * CARDS_PER_PAGE
  const carouselSlice = ultimasNoticias.slice(sliceStart, sliceStart + CARDS_PER_PAGE)

  const maxBar = Math.max(1, ...(profileStats?.atividadePorDia ?? [0]))
  const formatDate = (s?: string | null) => {
    if (!s) return '—'
    const d = new Date(s)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="flex-1 px-8 pt-8 pb-8 max-w-[1600px] mx-auto w-full">
      <ContentHeader
        title="Admin Dashboard"
        subtitle="Visão geral do conteúdo e métricas do Notícias 360"
        searchPlaceholder="Pesquisar..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <div className="backdrop-blur-xl rounded-3xl p-10 relative overflow-hidden bg-gradient-to-br from-slate-50/90 to-slate-200/30 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#004796]/[0.03] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#E30614]/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <p className="text-[10px] font-bold text-primary mb-4 uppercase tracking-[0.2em]">Painel de Conteúdo</p>
                <h2 className="text-3xl font-medium mb-8 leading-tight text-primary">Visão geral do conteúdo e métricas do Notícias 360</h2>
                <Link
                  to="/noticias/nova"
                  className="bg-slate-200/50 text-secondary hover:bg-secondary hover:text-white px-6 py-2.5 rounded-full font-semibold inline-flex items-center gap-2 transition-all duration-300 tracking-wider text-[13px]"
                >
                  Criar Notícia
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="w-full md:w-auto flex-1 max-w-[200px] mr-4">
                <div className="h-32 w-full flex items-end gap-3 justify-end opacity-80">
                  {(profileStats?.atividadePorDia ?? [0, 0, 0, 0, 0]).map((val, i) => (
                    <div
                      key={i}
                      className="w-2.5 bg-gradient-to-t from-[#004796]/60 to-transparent rounded-t-full transition-all"
                      style={{ height: `${(val / maxBar) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group hover:shadow-sm transition-all border border-white/60 bg-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">
              <div className="absolute top-6 right-6 text-slate-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-semibold text-slate-500 tracking-wider mb-6">Total de notícias</p>
              <div className="flex items-end gap-3 mb-6">
                <h3 className="text-4xl font-medium text-primary">{stats?.noticiasTotal ?? '—'}</h3>
                {stats?.noticiasTotal != null && <span className="text-[11px] text-emerald-500 font-semibold mb-1.5">Ativas</span>}
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: stats?.noticiasTotal ? `${Math.min(70, (stats.noticiasTotal / 100) * 70)}%` : '70%' }} />
              </div>
            </div>

            <Link to="/noticias?status=rascunho" className="block">
              <div className="backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group hover:shadow-sm transition-all border border-white/60 bg-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">
                <div className="absolute top-6 right-6 text-slate-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-semibold text-slate-500 tracking-wider mb-6">Rascunhos</p>
                <div className="flex items-end gap-3 mb-6">
                  <h3 className="text-4xl font-medium text-primary">{stats?.noticiasRascunho ?? '—'}</h3>
                  <div className="flex flex-col mb-1">
                    <span className="text-[10px] text-slate-500 font-medium leading-none mb-1">Pendente</span>
                    <span className="text-[10px] text-slate-500 font-medium leading-none">finalização</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: stats?.noticiasRascunho ? `${Math.min(40, (stats.noticiasRascunho / 100) * 40)}%` : '40%' }} />
                </div>
              </div>
            </Link>

            <Link to="/noticias?status=publicado" className="block">
              <div className="backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group hover:shadow-sm transition-all border border-white/60 bg-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">
                <div className="absolute top-6 right-6 text-slate-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-semibold text-slate-500 tracking-wider mb-6">Publicadas</p>
                <div className="flex items-end gap-3 mb-6">
                  <h3 className="text-4xl font-medium text-primary">{stats?.noticiasPublicadas ?? '—'}</h3>
                  {stats?.noticiasPublicadas != null && <span className="text-[11px] text-slate-500 font-semibold mb-1.5">Online</span>}
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: stats?.noticiasPublicadas ? `${Math.min(60, (stats.noticiasPublicadas / 50) * 60)}%` : '60%' }} />
                </div>
              </div>
            </Link>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between mb-8 pl-2">
              <h2 className="text-xl font-medium tracking-wide text-primary">Últimas Notícias</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))}
                  disabled={!canPrev}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm',
                    canPrev ? 'bg-white/60 text-slate-400 hover:text-secondary' : 'bg-white/30 text-slate-300 cursor-not-allowed'
                  )}
                  aria-label="Anterior"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCarouselIndex((i) => Math.min(totalCarouselPages - 1, i + 1))}
                  disabled={!canNext}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm',
                    canNext ? 'bg-white/60 text-slate-400 hover:text-secondary' : 'bg-white/30 text-slate-300 cursor-not-allowed'
                  )}
                  aria-label="Próximo"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {carouselSlice.length > 0 ? (
                carouselSlice.map((noticia) => (
                  <Link
                    key={noticia.id}
                    to={`/noticias/${noticia.id}/editar`}
                    className="backdrop-blur-xl rounded-3xl overflow-hidden group hover:shadow-md transition-all border border-white/60 bg-white/40 flex flex-col shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]"
                  >
                    <div className="h-56 bg-[#F1F0EA] relative overflow-hidden shrink-0">
                      {noticia.imagemDestaque ? (
                        <img
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={noticia.imagemDestaque}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-slate-500 text-sm">Sem imagem</div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1 bg-white/30">
                      <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-3">
                        {noticia.editoria?.nome ?? 'Sem editoria'}
                      </p>
                      <h3 className="font-medium text-slate-700 mb-6 line-clamp-2 group-hover:text-secondary transition-colors leading-relaxed text-[15px] flex-1">
                        {noticia.titulo}
                      </h3>
                      <div className="flex items-center justify-start gap-4 pt-4 border-t border-slate-200/50">
                        <div className="w-6 h-6 rounded-full bg-slate-200" />
                        <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                          {noticia.autor?.nome ?? '—'} <span className="text-slate-400 ml-1">{formatDate(noticia.updatedAt)}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="backdrop-blur-xl rounded-3xl overflow-hidden border border-white/60 bg-white/40 flex flex-col shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">
                    <div className="h-56 bg-slate-200 rounded-xl m-4" />
                    <div className="p-6 flex flex-col flex-1">
                      <div className="h-3 w-20 bg-slate-200 rounded mb-3" />
                      <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8 pl-0 xl:pl-4 flex flex-col">
          <div className="backdrop-blur-xl rounded-3xl p-8 border border-white/60 bg-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] order-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-lg tracking-wide text-primary">Acesso Rápido</h2>
              <button type="button" className="w-7 h-7 rounded-full bg-white/60 flex items-center justify-center text-slate-400 hover:text-secondary transition-all shadow-sm" aria-label="Adicionar atalho">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <Link to="/noticias/nova" className="flex items-center p-4 rounded-3xl bg-white/80 border border-white hover:border-white/50 hover:shadow-sm transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-secondary mr-4 group-hover:scale-105 transition-transform">
                  <Edit className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-slate-700 group-hover:text-secondary transition-colors tracking-wide">Nova Notícia</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] mt-1 font-semibold">Criar conteúdo</p>
                </div>
                <ArrowRight className="text-slate-300 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link to="/midias" className="flex items-center p-4 rounded-3xl bg-white/80 border border-white hover:border-white/50 hover:shadow-sm transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-secondary mr-4 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-slate-700 group-hover:text-secondary transition-colors tracking-wide">Enviar Mídia</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] mt-1 font-semibold">Biblioteca</p>
                </div>
                <ArrowRight className="text-slate-300 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link to="/noticias" className="flex items-center p-4 rounded-3xl bg-white/80 border border-white hover:border-white/50 hover:shadow-sm transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-secondary mr-4 group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-slate-700 group-hover:text-secondary transition-colors tracking-wide">Revisar</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] mt-1 font-semibold">{stats?.noticiasEmRevisao ?? 0} pendentes</p>
                </div>
                <ArrowRight className="text-slate-300 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="backdrop-blur-xl rounded-3xl p-8 border border-white/60 bg-white/40 relative overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] order-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-medium text-lg tracking-wide text-primary">Status Overview</h2>
              <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/50 transition-colors" aria-label="Mais opções">
                <MoreHorizontal className="text-lg w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-10 relative mt-4">
              <div className="w-32 h-32 rounded-full flex items-center justify-center relative mb-6 p-1 bg-white/50 shadow-sm">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-transparent" cx="50" cy="50" fill="transparent" r="48" stroke="currentColor" strokeWidth="2" />
                  <circle
                    className="text-secondary transition-all duration-1000 ease-out"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="48"
                    stroke="currentColor"
                    strokeDasharray="289"
                    strokeDashoffset={100 - (profileStats ? Math.min(100, (profileStats.artigosCriadosEstaSemana / 10) * 100) : 0)}
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                </svg>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-[3px] border-white" />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-primary text-3xl font-bold border-[3px] border-white">
                    {user?.nome?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Bem-vindo(a)</p>
                <h3 className="font-medium text-2xl text-primary mb-3">{user?.nome || 'Admin'}</h3>
                <p className="text-[12px] text-slate-500 tracking-wide max-w-[180px] mx-auto leading-relaxed">
                  +{profileStats?.artigosCriadosEstaSemana ?? 0} artigos criados esta semana
                </p>
              </div>
            </div>

            <div className="pt-8 pb-4">
              <div className="flex items-end justify-between h-20 gap-2 mb-4 px-4 max-w-[200px] mx-auto">
                {(profileStats?.atividadePorDia ?? [0, 0, 0, 0, 0]).map((val, i) => (
                  <div key={i} className="w-full flex flex-col justify-end items-center group cursor-pointer h-full">
                    <div
                      className="w-1.5 rounded-full transition-colors"
                      style={{
                        height: `${(val / maxBar) * 100}%`,
                        backgroundColor: val > 0 ? 'rgb(0, 71, 150)' : 'rgb(203, 213, 225)',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-bold px-4 uppercase tracking-[0.2em] max-w-[200px] mx-auto">
                {DIAS_SEMANA.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
