import { useState, useRef } from 'react'
import { ContentHeader } from '@/components/Layout/ContentHeader'
import { Mail, MessageCircle, BookOpen, CloudUpload, Plus } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIAS_TICKET = [
  { value: '', label: 'Selecione uma categoria...' },
  { value: 'tecnico', label: 'Problema técnico' },
  { value: 'conteudo', label: 'Conteúdo ou publicação' },
  { value: 'acesso', label: 'Acesso ou login' },
  { value: 'midia', label: 'Upload de mídia' },
  { value: 'outro', label: 'Outro' },
] as const

const MAX_FILE_SIZE_MB = 10
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']

export function Suporte() {
  const [busca, setBusca] = useState('')
  const [assunto, setAssunto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Arquivo deve ter no máximo ${MAX_FILE_SIZE_MB}MB`)
      return
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Formatos permitidos: PNG, JPG, PDF')
      return
    }
    setArquivo(file)
  }

  const handleRemoveFile = () => {
    setArquivo(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assunto || !descricao.trim()) {
      toast.error('Preencha o assunto e a descrição do problema.')
      return
    }
    setEnviando(true)
    try {
      // Placeholder: integrar com API de tickets quando existir
      await new Promise((r) => setTimeout(r, 800))
      toast.success('Ticket enviado com sucesso. Nossa equipe responderá em breve.')
      setAssunto('')
      setDescricao('')
      setArquivo(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch {
      toast.error('Não foi possível enviar o ticket. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="px-8 pt-8 pb-24 max-w-[1600px] mx-auto min-h-full font-sans">
      <ContentHeader
        title="Suporte e Tickets"
        subtitle="Precisa de ajuda? Envie um ticket para nossa equipe técnica ou entre em contato pelos canais alternativos."
        searchPlaceholder="Buscar no portal..."
        searchValue={busca}
        onSearchChange={setBusca}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Formulário Novo Ticket ─── */}
        <div className="lg:col-span-2">
          <section className="card-panel p-8">
            <h2 className="text-[13px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center gap-2 mb-8">
              <Plus className="w-[18px] h-[18px]" />
              Novo Ticket de Suporte
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] font-sans">
                  Assunto do Ticket
                </label>
                <select
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/80 border border-[#E2E8F0] focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-[#334155] appearance-none cursor-pointer"
                >
                  {CATEGORIAS_TICKET.map((opt) => (
                    <option key={opt.value || 'vazio'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] font-sans">
                  Descrição do Problema
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva detalhadamente o problema que você está enfrentando..."
                  rows={6}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/80 border border-[#E2E8F0] focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-[#334155] placeholder-[#94A3B8] resize-y min-h-[140px]"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] font-sans">
                  Anexar Print/Arquivo (Opcional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-slate-50/80 flex flex-col items-center justify-center py-10 px-4 cursor-pointer hover:bg-white hover:border-primary/50 transition-all group"
                >
                  <CloudUpload className="w-10 h-10 text-[#94A3B8] group-hover:text-primary mb-3" />
                  <p className="text-[13px] font-medium text-[#64748B] text-center">
                    Clique para fazer upload ou arraste o arquivo
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-1">PNG, JPG, PDF (Máx. {MAX_FILE_SIZE_MB}MB)</p>
                  {arquivo && (
                    <p className="mt-3 text-[13px] font-semibold text-primary">
                      {arquivo.name}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveFile() }}
                        className="ml-2 text-[#94A3B8] hover:text-primary underline"
                      >
                        Remover
                      </button>
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 px-8 py-3 rounded-2xl font-bold text-[13px] uppercase tracking-wider transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {enviando ? 'Enviando...' : 'Enviar Ticket'}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          </section>
        </div>

        {/* ─── Coluna direita: Canais + Central ─── */}
        <div className="space-y-6">
          <section className="card-panel p-8">
            <h2 className="text-[15px] font-bold text-card-foreground font-sans mb-6">
              Canais de Atendimento
            </h2>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="font-semibold text-[#334155] text-[13px]">E-mail de Suporte</p>
                  <a
                    href="mailto:suporte@noticias360.com.br"
                    className="text-[13px] text-secondary hover:underline"
                  >
                    suporte@noticias360.com.br
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#059669]" />
                </div>
                <div>
                  <p className="font-semibold text-[#334155] text-[13px]">Chat Online</p>
                  <p className="text-[12px] text-[#64748B]">Disponível Seg-Sex, 9h às 18h</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div>
                  <p className="font-semibold text-[#334155] text-[13px]">Base de Conhecimento</p>
                  <a href="#" className="text-[13px] text-secondary hover:underline">
                    Ver tutoriais e FAQs
                  </a>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
