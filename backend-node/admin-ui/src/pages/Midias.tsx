import { useEffect, useState, useRef } from 'react'
import { getMidias, uploadMidia, deleteMidia, deleteMidiasBulk, getApiUrlForAssets, type MediaRow } from '@/lib/api'
import { toast } from 'sonner'
import { ContentHeader } from '@/components/Layout/ContentHeader'

const API_URL = getApiUrlForAssets()

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function Midias() {
  const [list, setList] = useState<MediaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all')
  const [selectedMedia, setSelectedMedia] = useState<MediaRow | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    setError('')
    getMidias()
      .then(setList)
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Erro ao carregar'
        if (msg.includes('Não autenticado') || msg.includes('Faça login')) return
        setError(msg)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setError('')
    setUploading(true)
    try {
      await uploadMidia(file)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setUploading(false)
    }
  }

  const copyUrl = (path: string) => {
    const url = `${API_URL}/${path}`
    navigator.clipboard.writeText(url).then(() => toast.success('URL copiada'))
  }

  const toggleSelectByClick = (m: MediaRow) => {
    const next = new Set(selectedIds)
    if (next.has(m.id)) next.delete(m.id)
    else next.add(m.id)
    setSelectedIds(next)
    if (next.has(m.id)) setSelectedMedia(m)
    else if (selectedMedia?.id === m.id) setSelectedMedia(null)
  }

  const selectAllFiltered = () => {
    const ids = filteredList.map((m) => m.id)
    const next: Set<number> = ids.length > 0 ? new Set(ids) : new Set()
    setSelectedIds(next)
    if (next.size === 0) setSelectedMedia(null)
  }

  const handleDeleteOne = async (m: MediaRow) => {
    if (!window.confirm(`Excluir "${m.filename}"?`)) return
    setDeleting(true)
    try {
      await deleteMidia(m.id)
      toast.success('Mídia excluída')
      if (selectedMedia?.id === m.id) setSelectedMedia(null)
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(m.id); return n })
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    const n = selectedIds.size
    if (n === 0) return
    if (!window.confirm(`Excluir ${n} mídia(s) selecionada(s)?`)) return
    setDeleting(true)
    try {
      const deleted = await deleteMidiasBulk(Array.from(selectedIds))
      toast.success(`${deleted} mídia(s) excluída(s)`)
      setSelectedIds(new Set())
      if (selectedMedia && selectedIds.has(selectedMedia.id)) setSelectedMedia(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeleting(false)
    }
  }

  const filteredList = list.filter((m) => {
    const matchesSearch = m.filename.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    if (filterType === 'image') return m.mimeType.startsWith('image/')
    if (filterType === 'video') return m.mimeType.startsWith('video/')
    if (filterType === 'document') return m.mimeType.startsWith('application/') || m.mimeType.startsWith('text/')
    return true
  })

  return (
    <div className="px-8 pt-8 pb-8 max-w-[1600px] mx-auto min-h-full">
      <ContentHeader
        title="Biblioteca de Mídia"
        subtitle="Gerencie imagens, vídeos e documentos das notícias"
        searchPlaceholder="Buscar mídia..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {error && (
        <div className="mb-6 p-4 bg-secondary/10 border border-secondary/20 rounded-2xl flex items-center gap-2 text-secondary font-medium font-sans text-sm">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      {/* BLOCo DE FILTROS + UPLOAD: largura total, topo abaixo do header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50/90 border border-slate-200/60 px-5 py-4 mb-6 w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mr-1">Filtro:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-[13px] font-sans font-semibold transition-all ${filterType === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-white text-[#64748B] hover:bg-white/90 border border-slate-200'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-4 py-2 rounded-full text-[13px] font-sans font-semibold transition-all ${filterType === 'image' ? 'bg-primary text-white shadow-sm' : 'bg-white text-[#64748B] hover:bg-white/90 border border-slate-200'}`}
          >
            Imagens
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-4 py-2 rounded-full text-[13px] font-sans font-semibold transition-all ${filterType === 'video' ? 'bg-primary text-white shadow-sm' : 'bg-white text-[#64748B] hover:bg-white/90 border border-slate-200'}`}
          >
            Vídeos
          </button>
          <button
            onClick={() => setFilterType('document')}
            className={`px-4 py-2 rounded-full text-[13px] font-sans font-semibold transition-all ${filterType === 'document' ? 'bg-primary text-white shadow-sm' : 'bg-white text-[#64748B] hover:bg-white/90 border border-slate-200'}`}
          >
            Documentos
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 text-[13px] font-sans font-semibold text-[#64748B] hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white/80">
            <span className="material-symbols-outlined text-lg">sort</span>
            Mais Recentes
          </button>
          {filteredList.length > 0 && (
            <>
              <button
                type="button"
                onClick={selectAllFiltered}
                className="flex items-center gap-2 text-[13px] font-sans font-semibold text-[#64748B] hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white/80"
              >
                <span className="material-symbols-outlined text-lg">check_box</span>
                {selectedIds.size === filteredList.length ? 'Desmarcar todas' : 'Selecionar todas'}
              </button>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 text-[13px] font-sans font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Excluir ({selectedIds.size})
                </button>
              )}
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 bg-secondary text-white hover:bg-secondary/90 px-6 py-2.5 rounded-full font-semibold transition-all font-sans text-[13px] shadow-md disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            )}
            {uploading ? 'Aguarde...' : 'Fazer Upload'}
          </button>
        </div>
      </div>

      {/* CONTEÚDO: coluna 1 listagem | coluna 2 detalhes */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
        {/* COLUNA 1: listagem de imagens */}
        <div className="xl:col-span-8 min-w-0">
          {/* GRID DE ARQUIVOS */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-white animate-spin"></div>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4">
              <span className="material-symbols-outlined text-6xl text-[#94A3B8] mb-4">folder_open</span>
              <p className="text-[#64748B] font-medium font-sans">Nenhuma mídia encontrada com este filtro.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredList.map((m) => {
                const isImage = m.mimeType.startsWith('image/')
                const isVideo = m.mimeType.startsWith('video/')
                const isSelected = selectedMedia?.id === m.id
                const isInSelection = selectedIds.has(m.id)
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleSelectByClick(m)}
                    className={`backdrop-blur-xl rounded-3xl overflow-hidden group hover:shadow-md transition-all border flex flex-col cursor-pointer
                         ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#F4F6F8] border-white bg-white/60' : 'border-white/60 bg-white/40'}`}
                  >
                    <div className="h-48 bg-[#E2E8F0]/50 relative overflow-hidden flex items-center justify-center p-4">
                      {isImage ? (
                        <img
                          alt={m.filename}
                          className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500"
                          src={`${API_URL}/${m.path}`}
                        />
                      ) : isVideo ? (
                        <span className="material-symbols-outlined text-[64px] text-[#94A3B8] group-hover:scale-110 transition-transform duration-500">smart_display</span>
                      ) : (
                        <span className="material-symbols-outlined text-[64px] text-[#94A3B8] group-hover:scale-110 transition-transform duration-500">description</span>
                      )}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-md">
                          <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] font-sans">
                            {isImage ? 'IMAGEM' : isVideo ? 'VÍDEO' : 'DOC'}
                          </span>
                        </div>
                      </div>
                      {isInSelection && (
                        <div className="absolute top-4 right-4 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1 bg-white/30">
                      <h3 className={`font-medium mb-4 truncate transition-colors text-[14px] font-sans ${isSelected ? 'text-primary' : 'text-[#334155] group-hover:text-secondary'}`} title={m.filename}>
                        {m.filename}
                      </h3>
                      <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]/50 mt-auto">
                        <span className="text-[11px] text-[#64748B] font-medium tracking-wide font-sans">{formatSize(m.size)}</span>
                        <span className="text-[11px] text-[#94A3B8] font-medium tracking-wide font-sans">{m.createdAt ? formatDate(m.createdAt) : ''}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* COLUNA 2: detalhes quando um item é clicado */}
        <div className="xl:col-span-4 pl-0 xl:pl-2">
          {selectedMedia && (
            <div className="backdrop-blur-xl rounded-3xl p-8 border border-white/60 bg-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg font-sans tracking-wide text-[#334155]">Detalhes</h2>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-white/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="mb-6 rounded-2xl overflow-hidden bg-[#E2E8F0]/50 flex items-center justify-center aspect-video p-2 relative">
                {selectedMedia.mimeType.startsWith('image/') ? (
                  <img
                    alt="Media Extra Details"
                    className="w-full h-full object-contain mix-blend-multiply opacity-90"
                    src={`${API_URL}/${selectedMedia.path}`}
                  />
                ) : selectedMedia.mimeType.startsWith('video/') ? (
                  <span className="material-symbols-outlined text-[48px] text-[#94A3B8]">smart_display</span>
                ) : (
                  <span className="material-symbols-outlined text-[48px] text-[#94A3B8]">description</span>
                )}
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-1 font-sans">NOME DO ARQUIVO</p>
                  <p className="text-[13px] text-[#334155] font-medium break-all font-sans leading-relaxed">{selectedMedia.filename}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-1 font-sans">TIPO</p>
                    <p className="text-[13px] text-[#334155] font-medium font-sans truncate">{selectedMedia.mimeType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-1 font-sans">TAMANHO</p>
                    <p className="text-[13px] text-[#334155] font-medium font-sans">{formatSize(selectedMedia.size)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-1 font-sans">URL DA MÍDIA</p>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      className="flex-1 bg-white/50 border border-white/60 rounded-lg px-3 py-2 text-[12px] text-[#64748B] focus:outline-none focus:border-primary font-sans transition-colors"
                      readOnly
                      type="text"
                      value={`${API_URL}/${selectedMedia.path}`}
                    />
                    <button
                      onClick={() => copyUrl(selectedMedia.path)}
                      className="w-9 h-9 shrink-0 rounded-lg bg-white/80 border border-white flex items-center justify-center text-[#64748B] hover:text-secondary hover:border-secondary/30 transition-all shadow-sm"
                      title="Copiar URL"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]/50">
                <button
                  type="button"
                  onClick={() => handleDeleteOne(selectedMedia)}
                  disabled={deleting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-sans font-bold text-[13px] transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Excluir mídia
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
