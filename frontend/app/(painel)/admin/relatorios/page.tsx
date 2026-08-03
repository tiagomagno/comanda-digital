'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, DollarSign, Users, RefreshCw, UtensilsCrossed, Star, Truck, ShoppingBag, RotateCcw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
    receitaTotal: number; totalPedidos: number; ticketMedio: number;
    salao: number; paraLevar: number; comandasAtivas: number;
    produtosEmAlta: Array<{ nome: string; pedidos: number }>;
    avaliacoes: { total: number; mediaAtendimento: number; mediaComida: number };
}

interface Analytics {
    canais: { mesa: { receita: number; pedidos: number }; delivery: { receita: number; pedidos: number } };
    evolucaoDiaria: Array<{ data: string; receita: number }>;
    taxaRecompra: number;
    ltv: number;
    topClientes: Array<{ nome: string; telefone: string; totalGasto: number; totalPedidos: number }>;
    taxaChargeback: number;
}

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');
const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function RelatoriosPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    const h = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });

    const carregar = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/auth/login'); return; }
        setLoading(true);

        const [statsRes, analyticsRes] = await Promise.allSettled([
            fetch(`${API}/api/gestor/dashboard`, { headers: h() }),
            fetch(`${API}/api/gestor/analytics`, { headers: h() }),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.ok)
            setStats(await statsRes.value.json());
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok)
            setAnalytics(await analyticsRes.value.json());
        else toast.error('Erro ao carregar analytics');

        setLoading(false);
    }, [router]);

    useEffect(() => { carregar(); }, [carregar]);

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

    const totalReceita30d = (analytics?.canais.mesa.receita ?? 0) + (analytics?.canais.delivery.receita ?? 0);
    const pctMesa = totalReceita30d > 0 ? ((analytics?.canais.mesa.receita ?? 0) / totalReceita30d) * 100 : 0;
    const pctDelivery = 100 - pctMesa;
    const maxEvolucao = Math.max(...(analytics?.evolucaoDiaria.map(d => d.receita) ?? [1]), 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-7 h-7 text-[#FF5C01]" /> Relatórios & Analytics
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Indicadores de desempenho do estabelecimento</p>
                </div>
                <button onClick={carregar} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium">
                    <RefreshCw className="w-4 h-4" /> Atualizar
                </button>
            </div>

            {/* KPIs do dia */}
            {stats && (
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">📅 Hoje</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Receita', val: formatBRL(stats.receitaTotal), icon: <DollarSign className="w-4 h-4" />, cor: 'text-green-700 bg-green-50' },
                            { label: 'Pedidos', val: stats.totalPedidos, icon: <ShoppingBag className="w-4 h-4" />, cor: 'text-blue-700 bg-blue-50' },
                            { label: 'Ticket Médio', val: formatBRL(stats.ticketMedio), icon: <TrendingUp className="w-4 h-4" />, cor: 'text-purple-700 bg-purple-50' },
                            { label: 'Salão', val: stats.salao, icon: <UtensilsCrossed className="w-4 h-4" />, cor: 'text-amber-700 bg-amber-50' },
                            { label: 'Delivery', val: stats.paraLevar, icon: <Truck className="w-4 h-4" />, cor: 'text-orange-700 bg-orange-50' },
                            { label: 'Mesas Ativas', val: stats.comandasAtivas, icon: <Users className="w-4 h-4" />, cor: 'text-teal-700 bg-teal-50' },
                        ].map((k, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium mb-2 ${k.cor}`}>{k.icon}{k.label}</div>
                                <p className="text-2xl font-bold text-gray-900">{k.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {analytics && (
                <>
                    {/* Indicadores de retenção */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">📊 Retenção (últimos 30 dias)</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Taxa de Recompra', val: `${analytics.taxaRecompra}%`, sub: 'clientes que repetiram', icon: <RotateCcw className="w-5 h-5" />, cor: analytics.taxaRecompra >= 30 ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200' },
                                { label: 'LTV Médio', val: formatBRL(analytics.ltv), sub: 'valor médio por cliente', icon: <Users className="w-5 h-5" />, cor: 'text-purple-700 bg-purple-50 border-purple-200' },
                                { label: 'Receita Mesa', val: formatBRL(analytics.canais.mesa.receita), sub: `${pctMesa.toFixed(0)}% do total · ${analytics.canais.mesa.pedidos} pedidos`, icon: <UtensilsCrossed className="w-5 h-5" />, cor: 'text-blue-700 bg-blue-50 border-blue-200' },
                                { label: 'Receita Delivery', val: formatBRL(analytics.canais.delivery.receita), sub: `${pctDelivery.toFixed(0)}% do total · ${analytics.canais.delivery.pedidos} pedidos`, icon: <Truck className="w-5 h-5" />, cor: 'text-orange-700 bg-orange-50 border-orange-200' },
                            ].map((k, i) => (
                                <div key={i} className={`rounded-xl border p-4 shadow-sm ${k.cor}`}>
                                    <div className="flex items-center gap-2 mb-2">{k.icon}<p className="text-sm font-semibold">{k.label}</p></div>
                                    <p className="text-2xl font-bold">{k.val}</p>
                                    <p className="text-xs opacity-70 mt-0.5">{k.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Evolução diária + Canal breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Evolução 7 dias */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="font-semibold text-gray-800 mb-4">📈 Evolução de Receita (7 dias)</h3>
                            <div className="flex items-end gap-2 h-32">
                                {analytics.evolucaoDiaria.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full relative flex items-end" style={{ height: '96px' }}>
                                            <div
                                                className="w-full bg-[#FF5C01] rounded-t-md transition-all duration-500"
                                                style={{ height: `${Math.max((d.receita / maxEvolucao) * 96, d.receita > 0 ? 4 : 0)}px` }}
                                                title={formatBRL(d.receita)}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{d.data}</span>
                                    </div>
                                ))}
                            </div>
                            {analytics.evolucaoDiaria.every(d => d.receita === 0) && (
                                <p className="text-sm text-gray-400 text-center mt-2">Sem dados de receita nos últimos 7 dias</p>
                            )}
                        </div>

                        {/* Breakdown canal */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="font-semibold text-gray-800 mb-4">🎯 Receita por Canal</h3>
                            {totalReceita30d === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">Sem dados disponíveis</p>
                            ) : (
                                <div className="space-y-4">
                                    {[
                                        { label: 'Salão / Mesa', pct: pctMesa, val: analytics.canais.mesa.receita, cor: 'bg-blue-500' },
                                        { label: 'Delivery', pct: pctDelivery, val: analytics.canais.delivery.receita, cor: 'bg-orange-500' },
                                    ].map((c, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">{c.label}</span>
                                                <span className="text-gray-500">{c.pct.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-3">
                                                <div className={`${c.cor} h-3 rounded-full transition-all duration-700`} style={{ width: `${c.pct}%` }} />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatBRL(c.val)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {analytics.taxaChargeback > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">Taxa de chargeback: {analytics.taxaChargeback}%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top clientes + Produtos em alta */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top clientes */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="font-semibold text-gray-800 mb-4">👑 Top 5 Clientes</h3>
                            {analytics.topClientes.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6">Nenhum cliente com compras registradas</p>
                            ) : (
                                <div className="space-y-3">
                                    {analytics.topClientes.map((c, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500'}`}>{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate">{c.nome}</p>
                                                <p className="text-xs text-gray-400">{c.totalPedidos} pedidos</p>
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm">{formatBRL(c.totalGasto)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Produtos em alta */}
                        {stats && stats.produtosEmAlta.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="font-semibold text-gray-800 mb-4">🔥 Produtos Mais Pedidos (hoje)</h3>
                                <div className="space-y-3">
                                    {stats.produtosEmAlta.map((p, i) => {
                                        const maxQty = stats.produtosEmAlta[0].pedidos;
                                        return (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium text-gray-700 truncate">{p.nome}</span>
                                                    <span className="text-gray-500 ml-2 flex-shrink-0">{p.pedidos}x</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className="bg-[#FF5C01] h-2 rounded-full" style={{ width: `${(p.pedidos / maxQty) * 100}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Avaliações */}
                        {stats && stats.avaliacoes.total > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="font-semibold text-gray-800 mb-4">⭐ Avaliações</h3>
                                <p className="text-xs text-gray-400 mb-3">{stats.avaliacoes.total} avaliações no total</p>
                                {[
                                    { label: 'Atendimento', val: stats.avaliacoes.mediaAtendimento },
                                    { label: 'Comida', val: stats.avaliacoes.mediaComida },
                                ].map((av, i) => (
                                    <div key={i} className="mb-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">{av.label}</span>
                                            <span className="font-bold text-[#FF5C01]">{av.val.toFixed(1)} / 5</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div className="bg-[#FF5C01] h-2.5 rounded-full" style={{ width: `${(av.val / 5) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
