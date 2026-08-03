'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, RefreshCw, Send, TrendingUp, ShoppingBag, Clock, AlertTriangle, UserCheck, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ClienteMetricas {
    id: string;
    nome: string;
    telefone: string;
    email?: string;
    totalPedidos: number;
    totalGasto: number;
    ticketMedio: number;
    ultimaCompra: string | null;
    diasSemComprar: number;
    segmento: 'ativo' | 'em_risco' | 'inativo' | 'novo';
}

interface Resumo {
    total: number; ativos: number; emRisco: number; inativos: number; novos: number;
    ltv: number; taxaRecompra: number;
}

const SEGMENTOS = [
    { val: 'todos', label: 'Todos', cor: 'bg-gray-100 text-gray-700' },
    { val: 'novo',     label: '🌱 Novos',     cor: 'bg-blue-100 text-blue-700' },
    { val: 'ativo',    label: '🟢 Ativos',     cor: 'bg-green-100 text-green-700' },
    { val: 'em_risco', label: '⚠️ Em risco',  cor: 'bg-amber-100 text-amber-700' },
    { val: 'inativo',  label: '❌ Inativos',   cor: 'bg-red-100 text-red-600' },
];

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');

export default function ClientesPage() {
    const router = useRouter();
    const [clientes, setClientes] = useState<ClienteMetricas[]>([]);
    const [resumo, setResumo] = useState<Resumo | null>(null);
    const [loading, setLoading] = useState(true);
    const [segmentoAtivo, setSegmentoAtivo] = useState('todos');
    const [busca, setBusca] = useState('');
    const [showCampanha, setShowCampanha] = useState(false);
    const [campanha, setCampanha] = useState({ cupomTemplate: '', diasValidade: 7 });
    const [enviando, setEnviando] = useState(false);

    const h = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

    const carregar = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/auth/login'); return; }

        const params = new URLSearchParams();
        if (segmentoAtivo !== 'todos') params.set('segmento', segmentoAtivo);
        if (busca) params.set('busca', busca);

        const [clientesRes, resumoRes] = await Promise.allSettled([
            fetch(`${API}/api/crm/clientes?${params}`, { headers: h() }),
            fetch(`${API}/api/crm/resumo`, { headers: h() }),
        ]);

        if (clientesRes.status === 'fulfilled' && clientesRes.value.ok)
            setClientes(await clientesRes.value.json());
        if (resumoRes.status === 'fulfilled' && resumoRes.value.ok)
            setResumo(await resumoRes.value.json());

        setLoading(false);
    }, [segmentoAtivo, busca, router]);

    useEffect(() => { carregar(); }, [carregar]);

    const enviarCampanha = async () => {
        if (!campanha.cupomTemplate.trim()) { toast.error('Informe o código do cupom template'); return; }
        setEnviando(true);
        try {
            const res = await fetch(`${API}/api/crm/campanha`, {
                method: 'POST', headers: h(),
                body: JSON.stringify({
                    segmento: segmentoAtivo,
                    cupomTemplate: campanha.cupomTemplate,
                    diasValidade: campanha.diasValidade,
                }),
            });
            if (res.ok) {
                const resultado = await res.json();
                toast.success(`✅ ${resultado.cuponsGerados} cupons gerados para ${resultado.clientesAlcancados} clientes!`);
                setShowCampanha(false);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Erro ao criar campanha');
            }
        } catch { toast.error('Erro de rede'); }
        finally { setEnviando(false); }
    };

    const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    const formatData = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Users className="w-7 h-7 text-[#FF5C01]" /> CRM — Clientes</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Visão completa da sua base de clientes e estratégias de retenção</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => carregar()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium">
                        <RefreshCw className="w-4 h-4" /> Atualizar
                    </button>
                    {clientes.length > 0 && (
                        <button onClick={() => setShowCampanha(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5C01] text-white font-semibold hover:bg-[#e05101] text-sm shadow-sm">
                            <Send className="w-4 h-4" /> Enviar Campanha
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs */}
            {resumo && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {[
                        { label: 'Total',     val: resumo.total,                    icon: <Users className="w-4 h-4" />,      cor: 'text-gray-700',   bg: 'bg-gray-50' },
                        { label: 'Ativos',    val: resumo.ativos,                   icon: <UserCheck className="w-4 h-4" />,   cor: 'text-green-700',  bg: 'bg-green-50' },
                        { label: 'Em risco',  val: resumo.emRisco,                  icon: <AlertTriangle className="w-4 h-4" />, cor: 'text-amber-700', bg: 'bg-amber-50' },
                        { label: 'Inativos',  val: resumo.inativos,                 icon: <Clock className="w-4 h-4" />,       cor: 'text-red-600',    bg: 'bg-red-50' },
                        { label: 'Novos',     val: resumo.novos,                    icon: <TrendingUp className="w-4 h-4" />,  cor: 'text-blue-700',   bg: 'bg-blue-50' },
                        { label: 'LTV Médio', val: formatBRL(resumo.ltv),           icon: <ShoppingBag className="w-4 h-4" />, cor: 'text-purple-700', bg: 'bg-purple-50', text: true },
                        { label: 'Recompra',  val: `${resumo.taxaRecompra.toFixed(0)}%`, icon: <RefreshCw className="w-4 h-4" />, cor: 'text-teal-700', bg: 'bg-teal-50', text: true },
                    ].map((kpi, i) => (
                        <div key={i} className={`${kpi.bg} rounded-xl p-3 border border-gray-100`}>
                            <div className={`flex items-center gap-1.5 ${kpi.cor} mb-1`}>{kpi.icon}<span className="text-xs font-medium">{kpi.label}</span></div>
                            <p className={`text-xl font-bold ${kpi.cor}`}>{kpi.val}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2 flex-wrap">
                    {SEGMENTOS.map(s => (
                        <button key={s.val}
                            onClick={() => setSegmentoAtivo(s.val)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${segmentoAtivo === s.val ? s.cor + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {s.label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 min-w-48 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={busca} onChange={e => setBusca(e.target.value)}
                        placeholder="Buscar por nome ou telefone..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none" />
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {clientes.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Nenhum cliente encontrado</p>
                        <p className="text-gray-400 text-sm mt-1">Clientes aparecerão aqui após realizarem o primeiro pedido</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    {['Cliente', 'Segmento', 'Pedidos', 'Total Gasto', 'Ticket Médio', 'Última Compra', 'Dias sem comprar'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {clientes.map(cliente => {
                                    const seg = SEGMENTOS.find(s => s.val === cliente.segmento);
                                    return (
                                        <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{cliente.nome}</p>
                                                <p className="text-xs text-gray-400">{cliente.telefone}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${seg?.cor ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {seg?.label ?? cliente.segmento}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-700">{cliente.totalPedidos}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-700">{formatBRL(cliente.totalGasto)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{formatBRL(cliente.ticketMedio)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{formatData(cliente.ultimaCompra)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-sm font-semibold ${
                                                    cliente.diasSemComprar <= 14 ? 'text-green-600' :
                                                    cliente.diasSemComprar <= 30 ? 'text-amber-600' : 'text-red-600'
                                                }`}>
                                                    {cliente.diasSemComprar >= 9999 ? 'Nunca comprou' : `${cliente.diasSemComprar}d`}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal campanha */}
            {showCampanha && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-lg text-gray-900">Enviar Campanha</h2>
                                <p className="text-sm text-gray-500">
                                    Segmento: <strong>{SEGMENTOS.find(s => s.val === segmentoAtivo)?.label}</strong>
                                    {' · '}<strong>{clientes.length}</strong> clientes
                                </p>
                            </div>
                            <button onClick={() => setShowCampanha(false)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código do cupom template *</label>
                                <input
                                    value={campanha.cupomTemplate}
                                    onChange={e => setCampanha(p => ({ ...p, cupomTemplate: e.target.value.toUpperCase() }))}
                                    placeholder="Ex: VOLTA10"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">O sistema gera um cupom único para cada cliente baseado neste template</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Validade dos cupons (dias)</label>
                                <input
                                    type="number" min="1" max="90"
                                    value={campanha.diasValidade}
                                    onChange={e => setCampanha(p => ({ ...p, diasValidade: parseInt(e.target.value) || 7 }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none"
                                />
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                                ⚠️ Os cupons serão criados na base. O envio via WhatsApp/SMS requer integração adicional.
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowCampanha(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                                    Cancelar
                                </button>
                                <button onClick={enviarCampanha} disabled={enviando} className="flex-1 py-2.5 bg-[#FF5C01] text-white rounded-xl font-bold hover:bg-[#e05101] disabled:opacity-70 flex items-center justify-center gap-2">
                                    {enviando ? <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</> : `Criar ${clientes.length} Cupons`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
