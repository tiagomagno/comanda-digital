'use client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { config } from "@/lib/config";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Wine, Clock, RefreshCw, Flame } from 'lucide-react';
import toast from 'react-hot-toast';

// SLA do bar em segundos (bebidas são mais rápidas)
const SLA_ATENCAO = 5 * 60;  // 5min → amarelo
const SLA_URGENTE = 10 * 60; // 10min → vermelho

interface PedidoItem {
    id: string;
    quantidade: number;
    produto: { nome: string };
    observacoes?: string;
}

interface Pedido {
    id: string;
    numeroPedido: number;
    status: string;
    comanda: {
        codigo: string;
        nomeCliente: string;
        mesaRelacao?: { numero: string };
    };
    itens: PedidoItem[];
    createdAt: string;
    emPreparoAt?: string;
}

interface KanbanData {
    novos: Pedido[];
    emPreparo: Pedido[];
    prontos: Pedido[];
}

function formatTempo(segundos: number): string {
    if (segundos < 60) return `${segundos}s`;
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return s > 0 ? `${m}min ${s}s` : `${m}min`;
}

function getSlaInfo(segundos: number) {
    if (segundos >= SLA_URGENTE) return {
        cor: 'border-red-500',
        bg: 'bg-red-50',
        timerBg: 'bg-red-100',
        timerText: 'text-red-700',
        progresso: Math.min(segundos / SLA_URGENTE, 2),
        barCor: 'bg-red-500',
        urgente: true,
    };
    if (segundos >= SLA_ATENCAO) return {
        cor: 'border-amber-400',
        bg: 'bg-amber-50',
        timerBg: 'bg-amber-100',
        timerText: 'text-amber-700',
        progresso: segundos / SLA_URGENTE,
        barCor: 'bg-amber-400',
        urgente: false,
    };
    return {
        cor: 'border-purple-500',
        bg: 'bg-white',
        timerBg: 'bg-gray-100',
        timerText: 'text-gray-700',
        progresso: segundos / SLA_URGENTE,
        barCor: 'bg-purple-500',
        urgente: false,
    };
}

export default function BarPage() {
    const router = useRouter();
    const [pedidos, setPedidos] = useState<KanbanData>({ novos: [], emPreparo: [], prontos: [] });
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(() => new Date());

    // Tick por segundo
    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    const carregarPedidos = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) { router.push('/auth/login'); return; }

            const response = await fetch(`${config.apiUrl}/bar/pedidos?destino=BAR`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data: KanbanData = await response.json();
                setPedidos(data);
            } else if (response.status === 401) {
                toast.error('Sessão expirada. Faça login novamente.');
                router.push('/auth/login');
            }
        } catch {
            toast.error('Erro ao carregar pedidos');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        carregarPedidos();
        const interval = setInterval(carregarPedidos, 10000);
        return () => clearInterval(interval);
    }, [carregarPedidos]);

    const atualizarStatus = async (pedidoId: string, novoStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.apiUrl}/bar/pedidos/${pedidoId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus }),
            });
            if (response.ok) {
                toast.success(`Pedido ${novoStatus === 'em_preparo' ? 'iniciado' : 'pronto'}!`);
                carregarPedidos();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Erro ao atualizar pedido');
            }
        } catch {
            toast.error('Erro ao atualizar pedido');
        }
    };

    const getSegundosDecorridos = (dataInicio: string) =>
        Math.floor((now.getTime() - new Date(dataInicio).getTime()) / 1000);

    const tempoMedioSegundos = (() => {
        const emPreparo = pedidos.emPreparo.filter(p => p.emPreparoAt);
        if (emPreparo.length === 0) return null;
        const total = emPreparo.reduce((sum, p) => sum + getSegundosDecorridos(p.emPreparoAt!), 0);
        return Math.floor(total / emPreparo.length);
    })();

    const PedidoCard = ({ pedido, proximoStatus }: { pedido: Pedido; proximoStatus?: string }) => {
        const referencia = pedido.emPreparoAt || pedido.createdAt;
        const segundos = getSegundosDecorridos(referencia);
        const sla = getSlaInfo(segundos);
        const pct = Math.min(sla.progresso * 100, 100);

        return (
            <div className={`rounded-xl shadow-lg p-5 mb-4 border-l-[6px] transition-all hover:shadow-xl ${sla.cor} ${sla.bg}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-xl text-gray-900">
                            {pedido.comanda.mesaRelacao?.numero
                                ? `Mesa ${pedido.comanda.mesaRelacao.numero}`
                                : `#${pedido.comanda.codigo.slice(0, 6)}`}
                        </span>
                        {sla.urgente && (
                            <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
                                <Flame className="w-4 h-4 text-red-600 animate-pulse" />
                                <span className="text-xs font-bold text-red-700">URGENTE</span>
                            </div>
                        )}
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${sla.timerBg}`}>
                        <Clock className={`w-4 h-4 ${sla.timerText}`} />
                        <span className={`text-base font-bold tabular-nums ${sla.timerText}`}>
                            {formatTempo(segundos)}
                        </span>
                    </div>
                </div>

                {/* Barra de progresso SLA */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div
                        className={`h-1.5 rounded-full transition-all duration-1000 ${sla.barCor} ${sla.urgente ? 'animate-pulse' : ''}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>

                <div className="space-y-2 mb-4">
                    {pedido.itens.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-base font-bold min-w-[46px] text-center">
                                    {item.quantidade}x
                                </span>
                                <span className="font-semibold text-base text-gray-900">{item.produto.nome}</span>
                            </div>
                            {item.observacoes && (
                                <div className="mt-2 ml-14 bg-yellow-100 border-l-4 border-yellow-500 p-2 rounded">
                                    <p className="text-sm font-semibold text-yellow-900">⚠️ {item.observacoes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {proximoStatus && (
                    <button
                        onClick={() => atualizarStatus(pedido.id, proximoStatus)}
                        className={`w-full py-3 px-6 rounded-xl font-bold text-base text-white transition-all active:scale-95 shadow-md hover:shadow-lg ${
                            proximoStatus === 'em_preparo' ? 'bg-purple-500 hover:bg-purple-600' :
                            proximoStatus === 'pronto'     ? 'bg-green-500 hover:bg-green-600' :
                                                            'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        {proximoStatus === 'em_preparo' ? '🍹 Iniciar Preparo' :
                         proximoStatus === 'pronto'     ? '✅ Marcar como Pronto' : '📦 Entregar'}
                    </button>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600">Carregando pedidos...</p>
                </div>
            </div>
        );
    }

    const total = pedidos.novos.length + pedidos.emPreparo.length + pedidos.prontos.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Wine className="w-7 h-7 text-purple-600" />
                        Painel do Bar
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Dine · {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {pedidos.novos.some(p => getSegundosDecorridos(p.createdAt) > SLA_URGENTE) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium animate-pulse">
                            <Flame className="w-4 h-4" /> Modo Rush
                        </span>
                    )}
                    {tempoMedioSegundos !== null && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium tabular-nums">
                            <Clock className="w-4 h-4" />
                            Média: {formatTempo(tempoMedioSegundos)}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                        {total} pedido{total !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={carregarPedidos}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Legenda SLA */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Até 5min</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> 5–10min</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Acima de 10min</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-blue-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" /> Aguardando
                        </h2>
                        <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-sm font-medium">{pedidos.novos.length}</span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-4 min-h-[200px]">
                        {pedidos.novos.length === 0
                            ? <p className="text-center text-gray-400 py-8 text-sm">Nenhum pedido aguardando</p>
                            : pedidos.novos.map(p => <PedidoCard key={p.id} pedido={p} proximoStatus="em_preparo" />)
                        }
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-purple-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500" /> Em Preparo
                        </h2>
                        <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-sm font-medium">{pedidos.emPreparo.length}</span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-4 min-h-[200px]">
                        {pedidos.emPreparo.length === 0
                            ? <p className="text-center text-gray-400 py-8 text-sm">Nenhum pedido em preparo</p>
                            : pedidos.emPreparo.map(p => <PedidoCard key={p.id} pedido={p} proximoStatus="pronto" />)
                        }
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-green-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" /> Pronto
                        </h2>
                        <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-sm font-medium">{pedidos.prontos.length}</span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-4 min-h-[200px]">
                        {pedidos.prontos.length === 0
                            ? <p className="text-center text-gray-400 py-8 text-sm">Nenhum pedido pronto</p>
                            : pedidos.prontos.map(p => <PedidoCard key={p.id} pedido={p} />)
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
