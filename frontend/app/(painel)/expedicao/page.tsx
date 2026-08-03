'use client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { config } from '@/lib/config';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PackageCheck, Clock, RefreshCw, Flame, CheckCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

// SLA da expedição em segundos
const SLA_ATENCAO = 4 * 60;  // 4min → âmbar
const SLA_URGENTE = 8 * 60;  // 8min → vermelho

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
    destino?: string;
    comanda: {
        codigo: string;
        nomeCliente: string;
        tipoComanda: string;
        mesaRelacao?: { numero: string };
        enderecoEntrega?: { logradouro: string; numero: string; bairro: string } | null;
    };
    itens: PedidoItem[];
    createdAt: string;
    prontoAt?: string;
    emExpedicaoAt?: string;
}

interface KanbanData {
    prontos: Pedido[];
    emExpedicao: Pedido[];
}

function formatTempo(segundos: number): string {
    if (segundos < 60) return `${segundos}s`;
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return s > 0 ? `${m}min ${s}s` : `${m}min`;
}

function getSlaColor(segundos: number) {
    if (segundos >= SLA_URGENTE)  return { border: 'border-red-500',   bg: 'bg-red-50',   text: 'text-red-700',   bar: 'bg-red-500',   urgente: true };
    if (segundos >= SLA_ATENCAO)  return { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-400', urgente: false };
    return { border: 'border-teal-500', bg: 'bg-white', text: 'text-gray-700', bar: 'bg-teal-500', urgente: false };
}

export default function ExpedicaoPage() {
    const router = useRouter();
    const [pedidos, setPedidos] = useState<KanbanData>({ prontos: [], emExpedicao: [] });
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    const carregarPedidos = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) { router.push('/auth/login'); return; }

            const res = await fetch(`${config.apiUrl}/expedicao/pedidos`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (res.ok) setPedidos(await res.json());
            else if (res.status === 401) { router.push('/auth/login'); }
        } catch { toast.error('Erro ao carregar pedidos'); }
        finally { setLoading(false); }
    }, [router]);

    useEffect(() => {
        carregarPedidos();
        const interval = setInterval(carregarPedidos, 10000);
        return () => clearInterval(interval);
    }, [carregarPedidos]);

    const atualizarStatus = async (pedidoId: string, novoStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${config.apiUrl}/expedicao/pedidos/${pedidoId}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus }),
            });
            if (res.ok) {
                const label = novoStatus === 'em_expedicao' ? 'Em expedição' : 'Enviado!';
                toast.success(label);
                carregarPedidos();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Erro ao atualizar');
            }
        } catch { toast.error('Erro ao atualizar pedido'); }
    };

    const getSegundos = (dataInicio: string) =>
        Math.floor((now.getTime() - new Date(dataInicio).getTime()) / 1000);

    const PedidoCard = ({ pedido, proximoStatus }: { pedido: Pedido; proximoStatus?: string }) => {
        const ref = pedido.emExpedicaoAt || pedido.prontoAt || pedido.createdAt;
        const seg = getSegundos(ref);
        const sla = getSlaColor(seg);
        const pct = Math.min((seg / SLA_URGENTE) * 100, 100);
        const isDelivery = pedido.comanda.tipoComanda === 'delivery';

        return (
            <div className={`rounded-xl shadow-lg p-4 mb-4 border-l-[6px] transition-all hover:shadow-xl ${sla.border} ${sla.bg}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-900">
                            {pedido.comanda.mesaRelacao?.numero
                                ? `Mesa ${pedido.comanda.mesaRelacao.numero}`
                                : pedido.comanda.nomeCliente}
                        </span>
                        {isDelivery && (
                            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                <Send className="w-3 h-3" /> Delivery
                            </span>
                        )}
                        {sla.urgente && (
                            <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                                <Flame className="w-3 h-3" /> Urgente
                            </span>
                        )}
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100`}>
                        <Clock className={`w-4 h-4 ${sla.text}`} />
                        <span className={`text-sm font-bold tabular-nums ${sla.text}`}>{formatTempo(seg)}</span>
                    </div>
                </div>

                {/* Barra SLA */}
                <div className="w-full bg-gray-200 rounded-full h-1 mb-3 overflow-hidden">
                    <div className={`h-1 rounded-full transition-all duration-1000 ${sla.bar} ${sla.urgente ? 'animate-pulse' : ''}`} style={{ width: `${pct}%` }} />
                </div>

                {/* Endereço delivery */}
                {isDelivery && pedido.comanda.enderecoEntrega && (
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        📍 {pedido.comanda.enderecoEntrega.logradouro}, {pedido.comanda.enderecoEntrega.numero} — {pedido.comanda.enderecoEntrega.bairro}
                    </p>
                )}

                {/* Itens */}
                <div className="space-y-1.5 mb-3">
                    {pedido.itens.map(item => (
                        <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                            <span className={`text-white text-xs font-bold px-2 py-0.5 rounded-full ${pedido.destino === 'BAR' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                                {item.quantidade}x
                            </span>
                            <span className="font-medium text-sm text-gray-900">{item.produto.nome}</span>
                            {item.observacoes && (
                                <span className="ml-auto text-xs text-amber-600 font-medium">⚠️ {item.observacoes}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Ação */}
                {proximoStatus && (
                    <button
                        onClick={() => atualizarStatus(pedido.id, proximoStatus)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white transition-all active:scale-95 ${
                            proximoStatus === 'em_expedicao'
                                ? 'bg-teal-500 hover:bg-teal-600'
                                : 'bg-green-500 hover:bg-green-600'
                        }`}
                    >
                        {proximoStatus === 'em_expedicao'
                            ? '📋 Conferir e Embalar'
                            : '🚀 Pronto para Sair'}
                    </button>
                )}
            </div>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center"><LoadingSpinner size="lg" /><p className="text-gray-500 mt-2">Carregando...</p></div>
        </div>
    );

    const total = pedidos.prontos.length + pedidos.emExpedicao.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <PackageCheck className="w-7 h-7 text-teal-600" />
                        Expedição
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Conferência e embalagem antes da saída</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                        {total} pedido{total !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={carregarPedidos}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4" /> Atualizar
                    </button>
                </div>
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" /> Até 4min</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> 4–8min</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Acima de 8min</span>
            </div>

            {/* Kanban 2 colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prontos — aguardando conferência */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-blue-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Prontos — Aguardando Conferência
                        </h2>
                        <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-sm font-medium">{pedidos.prontos.length}</span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto min-h-[200px]">
                        {pedidos.prontos.length === 0
                            ? <p className="text-center text-gray-400 py-8 text-sm">Nenhum pedido aguardando conferência</p>
                            : pedidos.prontos.map(p => <PedidoCard key={p.id} pedido={p} proximoStatus="em_expedicao" />)
                        }
                    </div>
                </div>

                {/* Em Expedição — sendo embalados */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-teal-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-500" />
                            Em Expedição
                        </h2>
                        <span className="bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full text-sm font-medium">{pedidos.emExpedicao.length}</span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto min-h-[200px]">
                        {pedidos.emExpedicao.length === 0
                            ? <p className="text-center text-gray-400 py-8 text-sm">Nenhum pedido em expedição</p>
                            : pedidos.emExpedicao.map(p => <PedidoCard key={p.id} pedido={p} proximoStatus="entregue" />)
                        }
                    </div>
                </div>
            </div>

            {/* Estado vazio total */}
            {total === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-teal-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-600 mb-1">Expedição em dia!</h3>
                    <p className="text-gray-400 text-sm">Nenhum pedido aguardando conferência ou embalagem</p>
                </div>
            )}
        </div>
    );
}
