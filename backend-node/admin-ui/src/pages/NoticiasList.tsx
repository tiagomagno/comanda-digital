import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, ChevronDown, Plus, MoreVertical, Image as ImageIcon, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react'
import { useNoticias, useUpdateNoticia } from '@/hooks/useNoticias'
import { useEditorias } from '@/hooks/useEditorias'
import { useAutores } from '@/hooks/useAutores'
import type { NoticiasFilters } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { ContentHeader } from '@/components/Layout/ContentHeader'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const STATUS_CONFIG: Record<string, { label: string; colorClass: string; bgClass: string }> = {
  rascunho: { label: 'Rascunho', colorClass: 'text-[#F59E0B]', bgClass: 'bg-[#F59E0B]/10' },
  em_revisao: { label: 'Em Revisão', colorClass: 'text-[#3B82F6]', bgClass: 'bg-[#3B82F6]/10' },
  publicado: { label: 'Publicado', colorClass: 'text-[#10B981]', bgClass: 'bg-[#10B981]/10' },
  arquivado: { label: 'Arquivado', colorClass: 'text-[#64748B]', bgClass: 'bg-[#64748B]/10' },
}

const PERIOD_OPTIONS = [
  { value: '', label: 'Período: Todos' },
  { value: '1_semana', label: '1 Semana (7 dias)' },
  { value: 'quinzena', label: 'Quinzena (15 dias)' },
  { value: 'mes_atual', label: 'Mês atual' },
  { value: 'ultimo_mes', label: 'Último mês' },
] as const

type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value']

function getDateRangeForPeriod(period: PeriodValue): { dataInicio?: string; dataFim?: string } {
  if (!period) return {}
  const today = new Date()
  const toYYYYMMDD = (d: Date) => d.toISOString().slice(0, 10)
  switch (period) {
    case '1_semana': {
      const from = new Date(today)
      from.setDate(from.getDate() - 7)
      return { dataInicio: toYYYYMMDD(from), dataFim: toYYYYMMDD(today) }
    }
    case 'quinzena': {
      const from = new Date(today)
      from.setDate(from.getDate() - 15)
      return { dataInicio: toYYYYMMDD(from), dataFim: toYYYYMMDD(today) }
    }
    case 'mes_atual': {
      const from = new Date(today.getFullYear(), today.getMonth(), 1)
      return { dataInicio: toYYYYMMDD(from), dataFim: toYYYYMMDD(today) }
    }
    case 'ultimo_mes': {
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const to = new Date(today.getFullYear(), today.getMonth(), 0)
      return { dataInicio: toYYYYMMDD(from), dataFim: toYYYYMMDD(to) }
    }
    default:
      return {}
  }
}

function formatDate(s?: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function NoticiasList() {
  const [searchParams] = useSearchParams()
  const qFromUrl = searchParams.get('q') ?? ''
  const editoriaIdFromUrl = searchParams.get('editoriaId') ?? ''

  const { canReview } = useAuth()

  const [filters, setFilters] = useState<NoticiasFilters>(() => ({
    page: '1',
    pageSize: '10',
    ...(qFromUrl && { q: qFromUrl }),
    ...(editoriaIdFromUrl && { editoriaId: editoriaIdFromUrl }),
  }))

  const [searchInput, setSearchInput] = useState(qFromUrl)
  const [period, setPeriod] = useState<PeriodValue>('')
  const [sendingId, setSendingId] = useState<number | null>(null)

  useEffect(() => {
    if (qFromUrl && (searchInput !== qFromUrl || filters.q !== qFromUrl)) {
      setSearchInput(qFromUrl)
      setFilters((f) => ({ ...f, q: qFromUrl, page: '1' }))
    }
  }, [qFromUrl])

  useEffect(() => {
    if (editoriaIdFromUrl && filters.editoriaId !== editoriaIdFromUrl) {
      setFilters((f) => ({ ...f, editoriaId: editoriaIdFromUrl, page: '1' }))
    }
  }, [editoriaIdFromUrl])

  const debouncedSearch = useDebounce(searchInput, 500)

  useEffect(() => {
    if (debouncedSearch !== (filters.q || '')) {
      setFilters((f) => ({ ...f, q: debouncedSearch.trim() || undefined, page: '1' }))
    }
  }, [debouncedSearch])

  const { data: noticiasData, isLoading, error: queryError } = useNoticias(filters)
  const { data: editorias = [] } = useEditorias()
  const { data: autores = [] } = useAutores()
  const updateNoticiaMutation = useUpdateNoticia()

  const noticias = noticiasData?.data ?? []
  const meta = noticiasData?.meta ?? { total: 0, page: 1, pageSize: 10, pageCount: 0 }
  const error = queryError instanceof Error ? queryError.message : ''

  const handlePeriodChange = (value: PeriodValue) => {
    setPeriod(value)
    const range = getDateRangeForPeriod(value)
    setFilters((f) => ({ ...f, dataInicio: range.dataInicio, dataFim: range.dataFim, page: '1' }))
  }

  const setPage = (p: number) => setFilters((f) => ({ ...f, page: String(Math.max(1, p)) }))

  const handleEnviarParaRevisao = async (id: number) => {
    setSendingId(id)
    try {
      await updateNoticiaMutation.mutateAsync({ id, payload: { status: 'em_revisao' } })
    } finally {
      setSendingId(null)
    }
  }

  const displayMeta = noticias.length > 0 && meta.total === 0
    ? { ...meta, total: noticias.length, pageCount: 1 }
    : meta

  const from = displayMeta.total === 0 ? 0 : (displayMeta.page - 1) * displayMeta.pageSize + 1
  const to = Math.min(displayMeta.page * displayMeta.pageSize, displayMeta.total)
  const displayNoticias = noticias.slice(0, displayMeta.pageSize)

  if (error) return <div className="p-8 text-destructive">{error}</div>

  return (
    <div className="px-8 pt-8 pb-8 max-w-[1600px] mx-auto min-h-full">

      <ContentHeader
        title="Gerenciamento de Notícias"
        subtitle="Gerencie, revise e edite todo o conteúdo de notícias."
        searchPlaceholder="Buscar conteúdos..."
        searchValue={searchInput}
        onSearchChange={setSearchInput}
      />

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">

              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Filter className="text-[#94A3B8] w-4 h-4" />
                </div>
                <select
                  className="appearance-none pl-11 pr-10 py-2.5 bg-white/80 border border-[#E2E8F0] rounded-full text-[13px] font-medium text-[#64748B] font-sans hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer"
                  value={period}
                  onChange={(e) => handlePeriodChange(e.target.value as PeriodValue)}
                >
                  {PERIOD_OPTIONS.map((o) => (
                    <option key={o.value || 'todos'} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  className="appearance-none pl-5 pr-10 py-2.5 bg-white/80 border border-[#E2E8F0] rounded-full text-[13px] font-medium text-[#64748B] font-sans hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer"
                  value={filters.editoriaId ?? ''}
                  onChange={(e) => setFilters(f => ({ ...f, editoriaId: e.target.value || undefined, page: '1' }))}
                >
                  <option value="">Todas as Categorias</option>
                  {editorias.map(e => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  className="appearance-none pl-5 pr-10 py-2.5 bg-white/80 border border-[#E2E8F0] rounded-full text-[13px] font-medium text-[#64748B] font-sans hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer"
                  value={filters.autorId ?? ''}
                  onChange={(e) => setFilters(f => ({ ...f, autorId: e.target.value || undefined, page: '1' }))}
                >
                  <option value="">Todos os Autores</option>
                  {autores.map(a => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4 pointer-events-none" />
              </div>

            </div>

            <Link
              to="/noticias/nova"
              className="bg-secondary text-white hover:bg-secondary/90 px-6 py-2.5 rounded-full font-semibold inline-flex items-center gap-2 transition-all duration-300 font-sans tracking-wider text-[13px] shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Criar Notícia
            </Link>
          </div>

          {/* Table Container */}
          <div className="backdrop-blur-xl rounded-3xl border border-white/60 bg-white/40 overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8FAFC]/50 border-b border-white/60">
                  <tr>
                    <th className="py-4 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider font-sans whitespace-nowrap">Título</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider font-sans whitespace-nowrap">Categoria</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider font-sans whitespace-nowrap">Autor</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider font-sans whitespace-nowrap">Data</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider font-sans whitespace-nowrap">Status</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider font-sans text-right whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]/50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#94A3B8] font-medium text-[13px]">
                        Carregando as últimas notícias...
                      </td>
                    </tr>
                  ) : displayNoticias.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#94A3B8] font-medium text-[13px]">
                        Nenhuma notícia encontrada com estes filtros.
                      </td>
                    </tr>
                  ) : (
                    displayNoticias.map(noticia => {
                      const status = noticia.status || 'rascunho'
                      const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.rascunho
                      const isRascunho = status === 'rascunho'
                      const isSending = sendingId === noticia.id

                      return (
                        <tr key={noticia.id} className="hover:bg-white/50 transition-colors group">
                          <td className="py-4 px-6 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-[#E2E8F0] overflow-hidden flex-shrink-0 flex items-center justify-center text-[#94A3B8]">
                                {noticia.imagemDestaque ? (
                                  <img
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    src={noticia.imagemDestaque}
                                    alt="Capa thumbnail"
                                  />
                                ) : (
                                  <ImageIcon className="w-5 h-5 opacity-60" />
                                )}
                              </div>
                              <Link
                                to={`/noticias/${noticia.id}/editar`}
                                className="font-semibold text-[#334155] font-sans text-[14px] hover:text-secondary transition-colors line-clamp-2 leading-tight"
                              >
                                {noticia.titulo}
                              </Link>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-[13px] text-[#64748B] font-medium font-sans whitespace-nowrap align-middle">
                            {noticia.editoria?.nome ?? '—'}
                          </td>
                          <td className="py-4 px-6 text-[13px] text-[#64748B] font-medium font-sans whitespace-nowrap align-middle">
                            {noticia.autor?.nome ?? 'Desconhecido'}
                          </td>
                          <td className="py-4 px-6 text-[13px] text-[#64748B] font-medium font-sans whitespace-nowrap align-middle">
                            {formatDate(noticia.updatedAt)}
                          </td>
                          <td className="py-4 px-6 align-middle">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-sans whitespace-nowrap",
                              statusConf.bgClass,
                              statusConf.colorClass
                            )}>
                              {statusConf.label}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right align-middle">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-[#94A3B8] hover:text-secondary transition-colors w-8 h-8 rounded-full hover:bg-white flex items-center justify-center ml-auto">
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border-white/60">
                                <DropdownMenuItem asChild>
                                  <Link to={`/noticias/${noticia.id}/editar`} className="cursor-pointer flex items-center gap-2 font-medium text-slate-600 hover:text-secondary">
                                    <Edit3 className="w-4 h-4" /> Editar Notícia
                                  </Link>
                                </DropdownMenuItem>
                                {canReview && isRascunho && (
                                  <DropdownMenuItem
                                    disabled={isSending}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleEnviarParaRevisao(noticia.id)
                                    }}
                                    className="cursor-pointer flex items-center gap-2 font-medium text-[#3B82F6]"
                                  >
                                    <Bell className="w-4 h-4" />
                                    {isSending ? 'Aguarde...' : 'Enviar para revisão'}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && displayMeta.total > 0 && (
              <div className="px-6 py-4 border-t border-[#E2E8F0]/50 flex items-center justify-between">
                <span className="text-[13px] text-[#64748B] font-medium font-sans">
                  Mostrando {from} a {to} de {displayMeta.total}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={displayMeta.page <= 1}
                    onClick={() => setPage(displayMeta.page - 1)}
                    className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] hover:text-secondary hover:border-secondary disabled:opacity-50 disabled:hover:border-[#E2E8F0] disabled:hover:text-[#94A3B8] transition-colors bg-white/50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex px-2 space-x-1">
                    <span className="text-sm text-muted-foreground">
                      Página {displayMeta.page} de {displayMeta.pageCount || 1}
                    </span>
                  </div>

                  <button
                    disabled={displayMeta.page >= displayMeta.pageCount}
                    onClick={() => setPage(displayMeta.page + 1)}
                    className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] hover:text-secondary hover:border-secondary disabled:opacity-50 disabled:hover:border-[#E2E8F0] disabled:hover:text-[#94A3B8] transition-colors bg-white/50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
