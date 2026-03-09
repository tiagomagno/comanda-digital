import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMidia, getApiUrlForAssets } from '@/lib/api'
import { useNoticia, useUpdateNoticia, useCreateNoticia } from '@/hooks/useNoticias'
import { useEditorias } from '@/hooks/useEditorias'
import { useAutores } from '@/hooks/useAutores'
import { RichTextEditor } from '@/components/RichTextEditor'
import { AlertCircle } from 'lucide-react'

const API_URL = getApiUrlForAssets()

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'noticia'
}

const STATUS_OPTIONS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_revisao', label: 'Em revisão' },
  { value: 'revisao_seo', label: 'Revisão Marketing/SEO' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'arquivado', label: 'Arquivado' },
] as const

const STATUS_PILL_CLASS: Record<string, string> = {
  rascunho: 'bg-amber-100 text-amber-800',
  em_revisao: 'bg-blue-100 text-blue-800',
  revisao_seo: 'bg-purple-100 text-purple-800',
  publicado: 'bg-emerald-100 text-emerald-800',
  arquivado: 'bg-slate-100 text-slate-600',
}

function DestaqueHomeDialog({
  destaqueOrdem,
  onSelect,
}: {
  destaqueOrdem: number | ''
  onSelect: (v: number | '') => void
}) {
  const [open, setOpen] = useState(false)
  const label =
    destaqueOrdem === ''
      ? 'Não exibir na área de destaques'
      : destaqueOrdem === 1
        ? 'Destaque: Manchete Principal'
        : `Destaque: Lateral ${destaqueOrdem}`

  return (
    <>
      <button
        type="button"
        className="w-full px-6 py-4 rounded-2xl bg-white/60 border border-transparent hover:border-primary/30 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none text-[15px] font-medium font-sans text-primary transition-all text-left flex items-center justify-between group"
        onClick={() => setOpen(true)}
      >
        <span>{label}</span>
        <span className="material-symbols-outlined text-[#94A3B8] group-hover:text-secondary transition-colors">star</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all"
          onClick={() => setOpen(false)}
        >
          <div
            className="backdrop-blur-xl bg-white/90 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] rounded-3xl max-w-md w-full p-8 space-y-6 animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-2xl font-bold font-sans text-primary mb-2">
                Destaque na Tela Inicial
              </h2>
              <p className="text-[13px] text-[#64748B] font-medium leading-relaxed">
                Escolha a posição desejada para esta notícia no portal 360.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  onSelect(1)
                  setOpen(false)
                }}
                className={`col-span-2 aspect-[3/1] rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${destaqueOrdem === 1
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-white/60 bg-white/50 hover:border-primary/30 hover:bg-white text-[#64748B]'
                  }`}
              >
                <span className="font-bold text-lg">1</span>
                <span className="text-[12px] font-medium uppercase tracking-wider">Manchete Principal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelect(2)
                  setOpen(false)
                }}
                className={`aspect-[4/3] rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${destaqueOrdem === 2
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-white/60 bg-white/50 hover:border-primary/30 hover:bg-white text-[#64748B]'
                  }`}
              >
                <span className="font-bold text-lg">2</span>
                <span className="text-[12px] font-medium uppercase tracking-wider">Lateral Sup.</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelect(3)
                  setOpen(false)
                }}
                className={`aspect-[4/3] rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${destaqueOrdem === 3
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-white/60 bg-white/50 hover:border-primary/30 hover:bg-white text-[#64748B]'
                  }`}
              >
                <span className="font-bold text-lg">3</span>
                <span className="text-[12px] font-medium uppercase tracking-wider">Lateral Inf.</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                className="text-[13px] font-bold text-[#94A3B8] hover:text-secondary uppercase tracking-[0.1em] transition-colors"
                onClick={() => {
                  onSelect('')
                  setOpen(false)
                }}
              >
                Remover Destaque
              </button>
              <button
                type="button"
                className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-8 py-3 text-[13px] font-semibold font-sans transition-colors"
                onClick={() => setOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function NoticiaEdit() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { canPublish, canReview, canSetDestaque, user } = useAuth()

  const isNew = pathname.endsWith('/nova') || id === undefined || id === 'nova'
  const noticiaId = isNew ? null : Number(id)

  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [imagemUrl, setImagemUrl] = useState('')
  const [editoriaId, setEditoriaId] = useState<number | ''>('')
  const [autorId, setAutorId] = useState<number | ''>('')
  const [status, setStatus] = useState<string>('rascunho')
  const [observacaoRevisao, setObservacaoRevisao] = useState('')
  const [destaqueOrdem, setDestaqueOrdem] = useState<number | ''>('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')

  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)

  const { data: noticia, isLoading } = useNoticia(noticiaId)
  const { data: editorias = [] } = useEditorias()
  const { data: autores = [] } = useAutores()
  const updateMutation = useUpdateNoticia()
  const createMutation = useCreateNoticia()

  useEffect(() => {
    if (noticia) {
      setTitulo(noticia.titulo)
      setSubtitulo(noticia.subtitulo ?? '')
      setConteudo(noticia.conteudo ?? '')
      setImagemUrl(noticia.imagemDestaque ?? '')
      setEditoriaId(noticia.editoria?.id ?? '')
      setAutorId(noticia.autor?.id ?? '')
      setStatus(noticia.status ?? 'rascunho')
      setObservacaoRevisao(noticia.observacaoRevisao ?? '')
      setDestaqueOrdem(noticia.destaqueOrdem ?? '')
      setMetaTitle(noticia.metaTitle ?? '')
      setMetaDescription(noticia.metaDescription ?? '')
      setMetaKeywords(noticia.metaKeywords ?? '')
    }
  }, [noticia])

  useEffect(() => {
    if (editorias.length && !editoriaId) setEditoriaId(editorias[0].id)
    if (autores.length && !autorId) setAutorId(autores[0].id)
  }, [editorias, autores, editoriaId, autorId])

  const handleSave = async (newStatus?: string) => {
    if (!titulo.trim() || !conteudo.trim() || !editoriaId || !autorId) {
      setError('Por favor, preencha o título, conteúdo, categoria e autor.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setError('')
    setSaving(true)
    try {
      if (isNew) {
        await createMutation.mutateAsync({
          titulo: titulo.trim(),
          slug: slugify(titulo),
          subtitulo: subtitulo.trim() || undefined,
          conteudo: conteudo.trim(),
          imagemDestaque: imagemUrl.trim() || undefined,
          editoriaId: Number(editoriaId),
          autorId: Number(autorId),
          status: newStatus ?? 'rascunho',
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
          metaKeywords: metaKeywords.trim() || undefined,
        })
        navigate('/noticias', { replace: true })
      } else {
        await updateMutation.mutateAsync({
          id: noticiaId!,
          payload: {
            titulo: titulo.trim(),
            subtitulo: subtitulo.trim() || undefined,
            conteudo: conteudo.trim(),
            imagemDestaque: imagemUrl.trim() || undefined,
            editoriaId: Number(editoriaId),
            autorId: Number(autorId),
            status: newStatus ?? status,
            observacaoRevisao: observacaoRevisao.trim() || undefined,
            destaqueOrdem: destaqueOrdem === '' ? null : Number(destaqueOrdem),
            metaTitle: metaTitle.trim() || undefined,
            metaDescription: metaDescription.trim() || undefined,
            metaKeywords: metaKeywords.trim() || undefined,
            ...(newStatus === 'publicado' ? { publishedAt: new Date().toISOString() } : {}),
          },
        })
        if (newStatus) {
          setStatus(newStatus)
          navigate('/noticias', { replace: true })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao salvar.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    e.target.value = ''
    setError('')
    setUploadingImage(true)
    try {
      const data = await uploadMidia(file)
      const url = `${API_URL}/${data.path}`
      setImagemUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload da imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const emRevisao = status === 'em_revisao'

  if (isLoading && !isNew) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-white animate-spin"></div>
    </div>
  )

  return (
    <div className="px-8 pt-8 pb-8 max-w-[1600px] mx-auto min-h-full">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-medium font-sans tracking-wide mb-2 text-primary">
            {isNew ? 'Nova Notícia' : 'Editor de Notícia'}
          </h1>
          <p className="text-[13px] text-[#64748B] font-medium tracking-wide">
            Crie e edite o conteúdo das suas notícias.
          </p>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-[#94A3B8] hover:text-secondary transition-all shadow-sm relative">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm bg-secondary text-white flex items-center justify-center font-bold text-sm">
                {user?.nome?.substring(0, 1).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-secondary/10 border border-secondary/20 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <p className="text-[14px] text-secondary font-medium font-sans leading-relaxed">{error}</p>
        </div>
      )}

      <form className="flex flex-col lg:flex-row gap-8 items-start relative w-full" onSubmit={(e) => e.preventDefault()}>
        {/* LEFT CONTENT */}
        <div className="flex-1 w-full flex flex-col gap-8 min-w-0">
          <div className="space-y-8">
            {/* TÍTULO */}
            <div>
              <input
                type="text"
                placeholder="Insira o título principal da notícia aqui..."
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                maxLength={200}
                required
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[28px] md:text-[36px] font-bold font-sans text-primary placeholder-[#94A3B8]/60 leading-tight p-0"
              />
            </div>

            {/* SUBTÍTULO */}
            <div>
              <input
                type="text"
                placeholder="Adicione um breve subtítulo, linha fina ou complemento..."
                value={subtitulo}
                onChange={e => setSubtitulo(e.target.value)}
                maxLength={300}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[16px] md:text-[18px] font-medium font-sans text-[#475569] placeholder-[#94A3B8]/50 leading-relaxed p-0"
              />
            </div>

            {/* SEO (apenas esta seção abaixo dos títulos) */}
            <div className="space-y-6">
              <h3 className="text-[12px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#E11D48]">travel_explore</span>
                SEO
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] mb-2 font-sans">Meta Título</label>
                  <input
                    className="w-full px-5 py-3 rounded-xl bg-white/80 border border-[#E2E8F0] shadow-sm focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-[#334155] placeholder-[#94A3B8]"
                    placeholder="Título para resultados do Google (60 chars)"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] mb-2 font-sans">Meta Descrição</label>
                  <textarea
                    className="w-full px-5 py-3 rounded-xl bg-white/80 border border-[#E2E8F0] shadow-sm focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-[#334155] placeholder-[#94A3B8] resize-none"
                    rows={2}
                    placeholder="Resumo atraente (até 160 caracteres)"
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    maxLength={160}
                  />
                </div>
              </div>
            </div>

            {/* EDITOR (CONTEÚDO) */}
            <div className="pt-8 border-t border-slate-200/50">
              <div className="w-full rounded-2xl bg-white/60 shadow-sm overflow-hidden flex flex-col border border-white/40 min-h-[400px]">
                <RichTextEditor value={conteudo} onChange={setConteudo} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (Detalhes, Organização, Imagem — mantidas no local original) */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-6 sticky top-8">
            {/* BOTÕES DE AÇÃO */}
            <div className="flex flex-col gap-4">
              <Link to="/noticias" className="text-[#94A3B8] font-bold hover:text-secondary transition-all font-sans tracking-[0.1em] text-[12px] uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Voltar à Listagem
              </Link>
              <div className="flex flex-wrap gap-3">
                {emRevisao && canReview ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSave('rascunho')}
                      disabled={saving}
                      className="text-[#64748B] hover:text-secondary bg-transparent hover:bg-secondary/10 px-6 py-3 rounded-full font-bold transition-all font-sans text-[12px] uppercase flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">unpublished</span> Reprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave('revisao_seo')}
                      disabled={saving}
                      className="bg-secondary text-white hover:bg-secondary/90 px-6 py-3 rounded-full font-bold inline-flex items-center gap-2 font-sans text-[12px] uppercase"
                    >
                      <span className="material-symbols-outlined text-[16px]">task_alt</span> Aprovar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSave('rascunho')}
                      disabled={saving}
                      className="text-[#334155] hover:text-secondary bg-white hover:bg-slate-50 px-5 py-3 rounded-full font-bold transition-all shadow-sm font-sans text-[12px] uppercase border border-slate-200"
                    >
                      {saving ? 'Salvando...' : 'Salvar Rascunho'}
                    </button>
                    {!isNew && status === 'publicado' && (
                      <button
                        type="button"
                        onClick={() => handleSave('publicado')}
                        disabled={saving}
                        className="bg-secondary text-white hover:bg-secondary/90 px-6 py-3 rounded-full font-bold inline-flex items-center gap-2 font-sans text-[12px] uppercase"
                      >
                        <span className="material-symbols-outlined text-[16px]">published_with_changes</span> Salvar
                      </button>
                    )}
                    {canPublish && !isNew && status !== 'publicado' && (
                      <button
                        type="button"
                        onClick={() => handleSave('publicado')}
                        disabled={saving}
                        className="bg-secondary text-white hover:bg-secondary/90 px-6 py-3 rounded-full font-bold inline-flex items-center gap-2 font-sans text-[12px] uppercase"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span> Publicar
                      </button>
                    )}
                    {((canReview && !emRevisao) || (!canReview && isNew)) && (
                      <button
                        type="button"
                        onClick={() => handleSave('em_revisao')}
                        disabled={saving}
                        className="bg-secondary text-white hover:bg-secondary/90 px-6 py-3 rounded-full font-bold inline-flex items-center gap-2 font-sans text-[12px] uppercase"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        {isNew ? 'Submeter Matéria' : 'Enviar à Revisão'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Detalhes da Publicação */}
            <div className="space-y-6">
              <h3 className="text-[12px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#E11D48]">info</span>
                Detalhes da Publicação
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] mb-2 font-sans">Status da publicação</label>
                  <span
                    className={[
                      'inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider',
                      STATUS_PILL_CLASS[status] ?? 'bg-slate-100 text-slate-600',
                    ].join(' ')}
                  >
                    {STATUS_OPTIONS.find(o => o.value === status)?.label ?? status}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] mb-3 font-sans">
                    Autor
                  </label>
                  <div className="relative">
                    <select
                      value={autorId}
                      onChange={e => setAutorId(e.target.value ? Number(e.target.value) : '')}
                      required
                      className="w-full px-5 py-3.5 rounded-xl bg-white/80 border border-white shadow-sm focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans transition-all appearance-none text-[#334155]"
                    >
                      <option value="" disabled>Selecionar autor...</option>
                      {autores.map((a) => (
                        <option key={a.id} value={a.id}>{a.nome}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[20px] pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Organização */}
            <div className="space-y-6">
              <h3 className="text-[12px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#E11D48]">sell</span>
                Organização
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] mb-3 font-sans">Categoria</label>
                  <div className="relative">
                    <select
                      value={editoriaId}
                      onChange={(e) => setEditoriaId(e.target.value ? Number(e.target.value) : '')}
                      required
                      className="w-full px-5 py-3.5 rounded-xl bg-white/80 border border-[#E2E8F0] shadow-sm focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans transition-all appearance-none text-[#334155]"
                    >
                      <option value="" disabled>Selecionar categoria...</option>
                      {editorias.map((e) => (
                        <option key={e.id} value={e.id}>{e.nome}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[20px] pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] mb-3 font-sans">
                    Tags
                  </label>
                  <div className="p-3 bg-white/80 border border-white rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:outline-none transition-all flex flex-wrap gap-2 items-center min-h-[50px]">
                    {metaKeywords.split(',').filter(t => t.trim()).map((tag, i) => (
                      <span key={i} className="bg-white shadow-sm border border-slate-100 text-[#475569] text-[12px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        {tag.trim()}
                        <button type="button" onClick={() => {
                          const newTags = metaKeywords.split(',').filter(t => t.trim() !== tag.trim())
                          setMetaKeywords(newTags.join(', '))
                        }} className="text-[#94A3B8] hover:text-secondary focus:outline-none flex items-center">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder={!metaKeywords ? "Ex: IA, Saúde, Mercado..." : ""}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          const val = e.currentTarget.value.trim().replace(/,/g, '')
                          if (val) {
                            const tags = metaKeywords ? metaKeywords.split(',').map(t => t.trim()) : []
                            if (!tags.includes(val)) {
                              setMetaKeywords([...tags, val].join(', '))
                            }
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                      className="flex-1 min-w-[80px] bg-transparent border-none p-0 text-[13px] font-medium text-[#475569] placeholder-[#94A3B8] focus:ring-0"
                    />
                  </div>
                  <p className="text-[10px] text-[#94A3B8] font-medium mt-2">Pressione Enter ou vírgula para separar as tags</p>
                </div>
              </div>
            </div>

            {/* Imagem de Destaque */}
            <div className="space-y-6">
              <h3 className="text-[12px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[18px] text-[#E11D48]">image</span>
                Imagem de Destaque
              </h3>
              
              <div className="space-y-4">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                
                {!imagemUrl ? (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full aspect-[4/3] rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-dashed border-[#CBD5E1] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white hover:border-secondary/50 transition-all text-[#94A3B8] hover:text-secondary shadow-sm group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[24px] text-primary/60">cloud_upload</span>
                    </div>
                    <span className="text-[13px] font-medium font-sans tracking-wide">
                      {uploadingImage ? 'Enviando...' : 'Upload de imagem'}
                    </span>
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] rounded-2xl bg-white border border-white shadow-sm overflow-hidden relative group">
                    <img src={imagemUrl} alt="Capa da Notícia" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-primary/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="bg-white px-5 py-2.5 rounded-full font-bold text-secondary text-[12px] uppercase tracking-wider shadow-lg hover:bg-secondary hover:text-white transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">imagesmode</span> Alterar
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="relative pt-2">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[20px] mt-1">link</span>
                  <input
                    type="url"
                    placeholder="Ou link direto da imagem..."
                    value={imagemUrl}
                    onChange={e => setImagemUrl(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/60 border border-white shadow-sm focus:ring-2 focus:ring-primary focus:outline-none text-[13px] font-medium font-sans text-[#334155] placeholder-[#94A3B8] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* WIDGETS DINÂMICOS (Destaque ou Revisão) */}
            {emRevisao && canReview ? (
               <div className="bg-secondary/5 border border-secondary/10 rounded-[32px] p-8 shadow-inner">
                <label className="block text-[11px] font-bold text-secondary uppercase tracking-[0.2em] font-sans flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  Comentário da Revisão
                </label>
                <textarea
                  className="w-full min-h-[140px] px-6 py-5 rounded-2xl bg-white/60 border border-secondary/20 shadow-sm focus:ring-2 focus:ring-secondary focus:outline-none text-[14px] font-medium font-sans text-secondary placeholder-secondary/50 transition-all resize-none"
                  placeholder="Informe as pendências para publicação..."
                  value={observacaoRevisao}
                  onChange={e => setObservacaoRevisao(e.target.value)}
                />
              </div>
            ) : canSetDestaque && !isNew ? (
               <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-8 shadow-inner text-center">
                <label className="block text-[11px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center justify-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Destaque Inicial
                </label>
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-[40px] text-primary/30 mb-3 mx-auto">monitoring</span>
                  <p className="text-[13px] font-medium text-[#64748B] mb-6 text-balance leading-relaxed">
                    Evoque atenção posicionando nos painéis principais do portal.
                  </p>
                  <div className="w-full">
                    <DestaqueHomeDialog destaqueOrdem={destaqueOrdem} onSelect={setDestaqueOrdem} />
                  </div>
                </div>
              </div>
            ) : null}
        </div>
      </form>
    </div>
  )
}
