import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { X } from 'lucide-react'
import { ContentHeader } from '@/components/Layout/ContentHeader'

// ─── Types ────────────────────────────────────────────────────────────────────

type NotaTipo = 'urgente' | 'manual' | 'pauta' | 'aviso' | 'comunicado'

interface NotaEditorial {
    id: number
    tipo: NotaTipo
    titulo: string
    conteudo: string
    autor: string
    autorInitials: string
    criadoEm: string
    lida: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<NotaTipo, { label: string; color: string; textColor: string; dot?: string }> = {
    urgente: { label: 'Urgente', color: 'bg-primary/10', textColor: 'text-primary', dot: 'bg-primary' },
    manual: { label: 'Manual', color: 'bg-blue-50', textColor: 'text-blue-600' },
    pauta: { label: 'Pauta Especial', color: 'bg-emerald-50', textColor: 'text-emerald-600' },
    aviso: { label: 'Aviso', color: 'bg-amber-50', textColor: 'text-amber-600' },
    comunicado: { label: 'Comunicado', color: 'bg-violet-50', textColor: 'text-violet-600' },
}

const MOCK_NOTAS: NotaEditorial[] = [
    {
        id: 1, tipo: 'urgente', lida: false,
        titulo: 'Diretrizes de Cobertura: Eleições 2024',
        conteudo: 'Atenção a todos os repórteres e editores: Segue o manual atualizado com as novas regras do TSE para a cobertura das eleições municipais. Leitura obrigatória antes do fechamento de pautas políticas.',
        autor: 'Editoria Geral', autorInitials: 'EG', criadoEm: 'Hoje, 08:30',
    },
    {
        id: 2, tipo: 'manual', lida: true,
        titulo: 'Atualização do Manual de Redação: Uso de IA',
        conteudo: 'Novas políticas sobre o uso de ferramentas de Inteligência Artificial generativa na apuração e redação de notícias. Fica proibida a publicação de imagens geradas por IA sem a devida marcação d\'água padronizada.',
        autor: 'Tecnologia', autorInitials: 'TI', criadoEm: 'Ontem, 14:15',
    },
    {
        id: 3, tipo: 'pauta', lida: true,
        titulo: 'Cobertura Especial: COP30 no Brasil',
        conteudo: 'Iniciamos hoje o planejamento estratégico para a cobertura da COP30. Jornalistas interessados em integrar o núcleo especial de sustentabilidade devem enviar propostas de pauta até a próxima sexta-feira.',
        autor: 'Meio Ambiente', autorInitials: 'MA', criadoEm: '10 Mar, 09:00',
    },
    {
        id: 4, tipo: 'aviso', lida: true,
        titulo: 'Manutenção do Sistema de Publicação (CMS)',
        conteudo: 'Informamos que o sistema principal de publicação passará por manutenção programada neste fim de semana, das 02h às 04h de domingo. Por favor, programem suas postagens de madrugada com antecedência.',
        autor: 'Operações', autorInitials: 'OP', criadoEm: '05 Mar, 16:45',
    },
    {
        id: 5, tipo: 'comunicado', lida: false,
        titulo: 'Novo Fluxo de Revisão Editorial',
        conteudo: 'A partir desta semana entra em vigor o novo fluxo de aprovação em duas etapas para matérias de capa. Todas as notícias de destaque deverão passar pelo Editor-Chefe antes da publicação final.',
        autor: 'Gestão', autorInitials: 'GE', criadoEm: '03 Mar, 11:00',
    },
    {
        id: 6, tipo: 'pauta', lida: true,
        titulo: 'Planejamento Editorial — Semana do Meio Ambiente',
        conteudo: 'Reforçamos a grade de pautas para a semana dedicada ao Meio Ambiente. Cada editoria deverá apresentar ao menos uma matéria relacionada ao tema. Reunião de pauta amanhã às 10h.',
        autor: 'Editor-Chefe', autorInitials: 'EC', criadoEm: '01 Mar, 10:20',
    },
]

type Filtro = 'todas' | NotaTipo

// ─── Card Component ───────────────────────────────────────────────────────────

function NotaCard({ nota, onExpand }: { nota: NotaEditorial; onExpand: (n: NotaEditorial) => void }) {
    const cfg = TIPO_CONFIG[nota.tipo]
    return (
        <div
            className={`bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_4px_16px_0_rgba(31,38,135,0.04)] rounded-[24px] p-6 flex flex-col group hover:shadow-lg transition-all cursor-pointer ${nota.tipo === 'urgente' ? 'border-l-4 border-l-primary' : ''}`}
            onClick={() => onExpand(nota)}
        >
            {/* Ponto não lida */}
            {!nota.lida && (
                <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full" />
            )}

            <div className="flex items-center gap-2 mb-4">
                <span className={`px-2.5 py-1 ${cfg.color} ${cfg.textColor} text-[10px] font-black rounded-xl uppercase tracking-[0.15em] font-sans`}>
                    {cfg.label}
                </span>
                <span className="text-[11px] text-[#94A3B8] font-medium ml-auto">{nota.criadoEm}</span>
            </div>

            <h3 className={`text-[15px] font-bold text-[#1E293B] mb-3 leading-tight line-clamp-2 group-hover:${cfg.textColor} transition-colors font-sans`}>
                {nota.titulo}
            </h3>

            <p className="text-[13px] text-[#64748B] mb-5 line-clamp-3 font-medium leading-relaxed flex-1">
                {nota.conteudo}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]/50 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-[#64748B]">
                        {nota.autorInitials}
                    </div>
                    <span className="text-[11px] font-semibold text-[#94A3B8]">Por {nota.autor}</span>
                </div>
                <button
                    className={`${cfg.textColor} text-[12px] font-bold flex items-center gap-1 hover:underline underline-offset-2`}
                    onClick={e => { e.stopPropagation(); onExpand(nota) }}
                >
                    Ler
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function NotasEditoriais() {
    const { user: currentUser } = useAuth()

    const [notas, setNotas] = useState<NotaEditorial[]>(MOCK_NOTAS)
    const [filtro, setFiltro] = useState<Filtro>('todas')
    const [busca, setBusca] = useState('')
    const [expandida, setExpandida] = useState<NotaEditorial | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ tipo: 'comunicado' as NotaTipo, titulo: '', conteudo: '' })

    // Filtrar notas
    const notasFiltradas = notas.filter(n => {
        const matchFiltro = filtro === 'todas' || n.tipo === filtro
        const matchBusca = !busca || n.titulo.toLowerCase().includes(busca.toLowerCase()) || n.conteudo.toLowerCase().includes(busca.toLowerCase())
        return matchFiltro && matchBusca
    })

    const handleCriar = () => {
        if (!form.titulo.trim() || !form.conteudo.trim()) return
        const nova: NotaEditorial = {
            id: notas.length + 1,
            tipo: form.tipo,
            titulo: form.titulo,
            conteudo: form.conteudo,
            autor: currentUser?.nome || 'Redação',
            autorInitials: (currentUser?.nome?.[0] || 'A').toUpperCase(),
            criadoEm: 'Agora',
            lida: true,
        }
        setNotas(prev => [nova, ...prev])
        setShowModal(false)
        setForm({ tipo: 'comunicado', titulo: '', conteudo: '' })
    }

    const handleExpand = (nota: NotaEditorial) => {
        setNotas(prev => prev.map(n => n.id === nota.id ? { ...n, lida: true } : n))
        setExpandida(nota)
    }

    const naoLidas = notas.filter(n => !n.lida).length

    return (
        <div className="px-8 pt-8 pb-10 max-w-[1600px] mx-auto min-h-full relative">

            <ContentHeader
                title="Notas Editoriais"
                subtitle="Diretrizes, comunicados e avisos internos da redação."
                searchPlaceholder="Buscar notas..."
                searchValue={busca}
                onSearchChange={setBusca}
            />

            {/* Área de conteúdo: ação principal + filtros */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-secondary text-white hover:bg-secondary/90 px-6 py-2.5 rounded-full font-bold inline-flex items-center gap-2 transition-all shadow-md font-sans text-[12px] uppercase tracking-[0.1em]"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Nova Nota
                </button>
            </div>

            {/* FILTROS */}
            <div className="flex flex-wrap gap-2 mb-8">
                {([
                    { id: 'todas', label: 'Todas' },
                    { id: 'urgente', label: 'Urgentes' },
                    { id: 'manual', label: 'Manuais' },
                    { id: 'pauta', label: 'Pautas' },
                    { id: 'aviso', label: 'Avisos' },
                    { id: 'comunicado', label: 'Comunicados' },
                ] as { id: Filtro; label: string }[]).map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFiltro(f.id)}
                        className={`px-5 py-2 rounded-full text-[12px] font-bold font-sans transition-all ${filtro === f.id
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white/60 text-[#64748B] hover:bg-white/90 border border-white/60'}`}
                    >
                        {f.label}
                        {f.id === 'urgente' && notas.filter(n => n.tipo === 'urgente' && !n.lida).length > 0 && (
                            <span className="ml-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-black inline-flex items-center justify-center">
                                {notas.filter(n => n.tipo === 'urgente' && !n.lida).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* GRID DE CARDS */}
            {notasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-[#94A3B8]">
                    <span className="material-symbols-outlined text-[56px] mb-4">edit_note</span>
                    <p className="text-[14px] font-medium">Nenhuma nota encontrada.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {notasFiltradas.map(nota => (
                        <div key={nota.id} className="relative">
                            <NotaCard nota={nota} onExpand={handleExpand} />
                        </div>
                    ))}
                </div>
            )}

            {/* ── MODAL LEITURA ── */}
            {expandida && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setExpandida(null)} />
                    <div className="relative z-10 w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl p-10 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className={`px-3 py-1.5 ${TIPO_CONFIG[expandida.tipo].color} ${TIPO_CONFIG[expandida.tipo].textColor} text-[10px] font-black rounded-xl uppercase tracking-[0.15em]`}>
                                    {TIPO_CONFIG[expandida.tipo].label}
                                </span>
                                <span className="text-[12px] text-[#94A3B8] font-medium">{expandida.criadoEm}</span>
                            </div>
                            <button
                                onClick={() => setExpandida(null)}
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#64748B] transition-all flex-shrink-0 ml-4"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold text-[#1E293B] mb-4 font-sans leading-snug">{expandida.titulo}</h2>
                        <p className="text-[14px] text-[#475569] leading-relaxed mb-8">{expandida.conteudo}</p>

                        <div className="flex items-center gap-3 pt-6 border-t border-[#E2E8F0]/60">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[12px] font-black text-[#64748B]">
                                {expandida.autorInitials}
                            </div>
                            <div>
                                <p className="text-[12px] font-bold text-[#334155]">Por {expandida.autor}</p>
                                <p className="text-[11px] text-[#94A3B8]">{expandida.criadoEm}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL NOVA NOTA ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative z-10 w-full max-w-xl bg-white/95 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl p-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-[14px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                Nova Nota Editorial
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#64748B] transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2 font-sans">Tipo</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-5 py-3.5 rounded-2xl bg-white border border-[#E2E8F0] focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-[#334155] appearance-none"
                                        value={form.tipo}
                                        onChange={e => setForm(f => ({ ...f, tipo: e.target.value as NotaTipo }))}
                                    >
                                        {Object.entries(TIPO_CONFIG).map(([key, val]) => (
                                            <option key={key} value={key}>{val.label}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2 font-sans">Título *</label>
                                <input
                                    className="w-full px-5 py-3.5 rounded-2xl bg-white border border-[#E2E8F0] focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-[#334155]"
                                    placeholder="Título da nota editorial"
                                    value={form.titulo}
                                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2 font-sans">Conteúdo *</label>
                                <textarea
                                    className="w-full px-5 py-3.5 rounded-2xl bg-white border border-[#E2E8F0] focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-[#334155] resize-none"
                                    rows={5}
                                    placeholder="Descreva as diretrizes, aviso ou comunicado..."
                                    value={form.conteudo}
                                    onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 rounded-full font-bold text-[12px] uppercase tracking-[0.1em] text-[#64748B] bg-slate-100 hover:bg-slate-200 transition-all font-sans"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCriar}
                                    disabled={!form.titulo.trim() || !form.conteudo.trim()}
                                    className="bg-primary text-white hover:bg-primary/90 px-8 py-3 rounded-full font-bold inline-flex items-center gap-2 transition-all shadow-md font-sans text-[12px] uppercase tracking-[0.1em] disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                    Publicar Nota
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
