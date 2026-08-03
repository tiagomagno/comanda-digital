'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Plus, Trash2, Play, Clock, Users, ChevronDown, ChevronRight, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Regra {
    id: string;
    nome: string;
    tipo: 'apos_entrega' | 'cliente_inativo';
    delayMinutos: number;
    diasInatividade?: number;
    acao: { tipo: 'avaliacao' | 'cupom' | 'mensagem'; cupomCodigo?: string; mensagem?: string };
    ativo: boolean;
    _count: { execucoes: number };
    createdAt: string;
}

interface Execucao {
    id: string;
    referencia: string;
    status: string;
    resultado: any;
    criadoAt: string;
}

const FORM_VAZIO = {
    nome: '', tipo: 'apos_entrega' as 'apos_entrega' | 'cliente_inativo',
    delayMinutos: 30, diasInatividade: 15,
    acaoTipo: 'avaliacao' as 'avaliacao' | 'cupom' | 'mensagem',
    cupomCodigo: '', mensagem: '',
};

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');

export default function AutomacoesPage() {
    const router = useRouter();
    const [regras, setRegras] = useState<Regra[]>([]);
    const [loading, setLoading] = useState(true);
    const [processando, setProcessando] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [form, setForm] = useState(FORM_VAZIO);
    const [expandido, setExpandido] = useState<string | null>(null);
    const [execucoes, setExecucoes] = useState<Execucao[]>([]);
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);

    const h = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

    useEffect(() => { carregar(); }, []);

    const carregar = async () => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/auth/login'); return; }
        const res = await fetch(`${API}/api/automacoes`, { headers: h() });
        if (res.ok) setRegras(await res.json());
        setLoading(false);
    };

    const salvar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
        setSalvando(true);
        const payload = {
            nome: form.nome,
            tipo: form.tipo,
            delayMinutos: form.delayMinutos,
            diasInatividade: form.tipo === 'cliente_inativo' ? form.diasInatividade : undefined,
            acao: {
                tipo: form.acaoTipo,
                cupomCodigo: form.acaoTipo === 'cupom' ? form.cupomCodigo : undefined,
                mensagem: form.acaoTipo === 'mensagem' ? form.mensagem : undefined,
            },
        };
        const res = await fetch(`${API}/api/automacoes`, { method: 'POST', headers: h(), body: JSON.stringify(payload) });
        if (res.ok) {
            const nova = await res.json();
            setRegras(prev => [{ ...nova, _count: { execucoes: 0 } }, ...prev]);
            setShowModal(false);
            setForm(FORM_VAZIO);
            toast.success('Regra criada!');
        } else {
            const err = await res.json();
            toast.error(err.error || 'Erro ao criar regra');
        }
        setSalvando(false);
    };

    const toggleAtivo = async (regra: Regra) => {
        const res = await fetch(`${API}/api/automacoes/${regra.id}`, {
            method: 'PUT', headers: h(), body: JSON.stringify({ ativo: !regra.ativo }),
        });
        if (res.ok) setRegras(prev => prev.map(r => r.id === regra.id ? { ...r, ativo: !r.ativo } : r));
    };

    const deletar = async (id: string) => {
        if (!confirm('Remover esta regra?')) return;
        await fetch(`${API}/api/automacoes/${id}`, { method: 'DELETE', headers: h() });
        setRegras(prev => prev.filter(r => r.id !== id));
        toast.success('Regra removida');
    };

    const processar = async () => {
        setProcessando(true);
        const res = await fetch(`${API}/api/automacoes/processar`, { method: 'POST', headers: h() });
        if (res.ok) {
            const resultado = await res.json();
            toast.success(`${resultado.processadas} regras processadas · ${resultado.acoes} ações executadas`);
            carregar();
        } else toast.error('Erro ao processar');
        setProcessando(false);
    };

    const verHistorico = async (regraId: string) => {
        if (expandido === regraId) { setExpandido(null); return; }
        setExpandido(regraId);
        setCarregandoHistorico(true);
        const res = await fetch(`${API}/api/automacoes/${regraId}/historico`, { headers: h() });
        if (res.ok) setExecucoes(await res.json());
        setCarregandoHistorico(false);
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Zap className="w-7 h-7 text-[#FF5C01]" /> Automação de Marketing</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Dispare ações automáticas baseadas no comportamento do cliente</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={processar}
                        disabled={processando}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium disabled:opacity-60"
                    >
                        {processando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Processar Agora
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5C01] text-white font-semibold hover:bg-[#e05101] text-sm shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Nova Regra
                    </button>
                </div>
            </div>

            {regras.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-600 mb-1">Nenhuma regra criada</h3>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">
                        Crie regras para enviar cupons de recompra, pedidos de avaliação e muito mais automaticamente
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {regras.map(regra => (
                        <div key={regra.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 flex items-center gap-4">
                                {/* Ícone */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${regra.tipo === 'apos_entrega' ? 'bg-green-100' : 'bg-amber-100'}`}>
                                    {regra.tipo === 'apos_entrega'
                                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                                        : <Users className="w-5 h-5 text-amber-600" />
                                    }
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900">{regra.nome}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${regra.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {regra.ativo ? 'Ativa' : 'Inativa'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {regra.tipo === 'apos_entrega'
                                            ? `⏱ ${regra.delayMinutos}min após entrega`
                                            : `👤 Clientes inativos há ${regra.diasInatividade} dias`
                                        }
                                        {' · '}
                                        {regra.acao.tipo === 'avaliacao' ? '⭐ Solicitação de avaliação' :
                                         regra.acao.tipo === 'cupom' ? `🎟️ Cupom: ${regra.acao.cupomCodigo}` :
                                         `💬 Mensagem`}
                                    </p>
                                </div>
                                {/* Stats */}
                                <div className="text-right flex-shrink-0">
                                    <p className="text-lg font-bold text-gray-900">{regra._count.execucoes}</p>
                                    <p className="text-xs text-gray-400">execuções</p>
                                </div>
                                {/* Ações */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => toggleAtivo(regra)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${regra.ativo ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                        {regra.ativo ? 'Ativa' : 'Inativa'}
                                    </button>
                                    <button onClick={() => verHistorico(regra.id)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                                        {expandido === regra.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => deletar(regra.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Histórico de execuções */}
                            {expandido === regra.id && (
                                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Últimas execuções</p>
                                    {carregandoHistorico ? (
                                        <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-[#FF5C01] border-t-transparent rounded-full animate-spin" /></div>
                                    ) : execucoes.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-3">Nenhuma execução ainda</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {execucoes.slice(0, 10).map(exec => (
                                                <div key={exec.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-gray-100">
                                                    <span className="text-gray-500 font-mono">{exec.referencia.slice(0, 12)}...</span>
                                                    <span className={`px-2 py-0.5 rounded-full font-medium ${exec.status === 'executado' ? 'bg-green-100 text-green-700' : exec.status === 'erro' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        {exec.status}
                                                    </span>
                                                    <span className="text-gray-400">{new Date(exec.criadoAt).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal nova regra */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-lg text-gray-900">Nova Regra de Automação</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={salvar} className="p-5 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome da regra *</label>
                                <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                                    placeholder="Ex: Cupom de recompra 7 dias"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Gatilho</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { val: 'apos_entrega', label: '✅ Após entrega', desc: 'X minutos após pedido entregue' },
                                        { val: 'cliente_inativo', label: '👤 Cliente inativo', desc: 'X dias sem comprar' },
                                    ].map(opt => (
                                        <button type="button" key={opt.val}
                                            onClick={() => setForm(p => ({ ...p, tipo: opt.val as any }))}
                                            className={`p-3 rounded-xl border-2 text-left transition-colors ${form.tipo === opt.val ? 'border-[#FF5C01] bg-[#FF5C01]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <p className="font-semibold text-sm text-gray-800">{opt.label}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {form.tipo === 'apos_entrega' ? (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delay (minutos)</label>
                                    <input type="number" min="5" value={form.delayMinutos}
                                        onChange={e => setForm(p => ({ ...p, delayMinutos: parseInt(e.target.value) || 30 }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none" />
                                    <p className="text-xs text-gray-400 mt-1">Sugestão: 30 min após entrega para pedir avaliação</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dias de inatividade</label>
                                    <input type="number" min="1" value={form.diasInatividade}
                                        onChange={e => setForm(p => ({ ...p, diasInatividade: parseInt(e.target.value) || 15 }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none" />
                                    <p className="text-xs text-gray-400 mt-1">Clientes que não compram há X dias receberão a ação</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ação a executar</label>
                                <div className="space-y-2">
                                    {[
                                        { val: 'avaliacao', label: '⭐ Solicitar avaliação', desc: 'Registra pedido de avaliação para envio futuro' },
                                        { val: 'cupom', label: '🎟️ Enviar cupom', desc: 'Gera cupom personalizado por cliente' },
                                        { val: 'mensagem', label: '💬 Mensagem personalizada', desc: 'Mensagem de texto para envio futuro' },
                                    ].map(opt => (
                                        <label key={opt.val} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${form.acaoTipo === opt.val ? 'border-[#FF5C01] bg-[#FF5C01]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input type="radio" name="acao" value={opt.val} checked={form.acaoTipo === opt.val}
                                                onChange={() => setForm(p => ({ ...p, acaoTipo: opt.val as any }))}
                                                className="mt-0.5 accent-[#FF5C01]" />
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800">{opt.label}</p>
                                                <p className="text-xs text-gray-500">{opt.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {form.acaoTipo === 'cupom' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código do cupom template *</label>
                                    <input value={form.cupomCodigo} onChange={e => setForm(p => ({ ...p, cupomCodigo: e.target.value.toUpperCase() }))}
                                        placeholder="Ex: VOLTA10 (deve existir em Cupons)"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none" />
                                    <p className="text-xs text-amber-600 mt-1">⚠️ O cupom template deve existir em Marketing → Cupons</p>
                                </div>
                            )}
                            {form.acaoTipo === 'mensagem' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Texto da mensagem</label>
                                    <textarea value={form.mensagem} onChange={e => setForm(p => ({ ...p, mensagem: e.target.value }))}
                                        rows={3} placeholder="Olá! Sentimos sua falta. Volte e ganhe um desconto especial..."
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none resize-none" />
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">Cancelar</button>
                                <button type="submit" disabled={salvando} className="flex-1 py-2.5 bg-[#FF5C01] text-white rounded-xl font-bold hover:bg-[#e05101] disabled:opacity-70 flex items-center justify-center gap-2">
                                    {salvando ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : 'Criar Regra'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
