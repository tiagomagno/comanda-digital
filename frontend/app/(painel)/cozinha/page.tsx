'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Clock, RefreshCw, Flame } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PedidoItem {
    id: string;
    quantidade: number;
    produto: {
        nome: string;
    };
    observacoes?: string;
}

interface Pedido {
    id: string;
    numeroPedido: number;
    status: string;
    comanda: {
        codigo: string;
        nomeCliente: string;
        mesaRelacao?: {
            numero: string;
        };
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

export default function CozinhaPage() {
    const router = useRouter();
    const [pedidos, setPedidos] = useState<KanbanData>({ novos: [], emPreparo: [], prontos: [] });
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ novos: 0, emPreparo: 0, prontos: 0, total: 0 });

    useEffect(() => {
        carregarPedidos();
        // Atualizar a cada 10 segundos
        const interval = setInterval(carregarPedidos, 10000);
        return () => clearInterval(interval);
    }, []);

    const carregarPedidos = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await fetch('http://localhost:3001/api/cozinha/pedidos?destino=COZINHA', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data: KanbanData = await response.json();
                setPedidos(data);
                setStats({
                    novos: data.novos.length,
                    emPreparo: data.emPreparo.length,
                    prontos: data.prontos.length,
                    total: data.novos.length + data.emPreparo.length + data.prontos.length,
                });
            } else if (response.status === 401) {
                toast.error('Sessão expirada. Faça login novamente.');
                router.push('/auth/login');
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            toast.error('Erro ao carregar pedidos');
        } finally {
            setLoading(false);
        }
    };

    const atualizarStatus = async (pedidoId: string, novoStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/cozinha/pedidos/${pedidoId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: novoStatus }),
            });

            if (response.ok) {
                toast.success(`Pedido atualizado para: ${novoStatus}`);
                carregarPedidos();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Erro ao atualizar pedido');
            }
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Erro ao atualizar pedido');
        }
    };

    const getTempoDecorrido = (dataInicio: string) => {
        const inicio = new Date(dataInicio);
        const agora = new Date();
        const diff = Math.floor((agora.getTime() - inicio.getTime()) / 1000 / 60);
        return diff;
    };

    const PedidoCard = ({ pedido, proximoStatus }: { pedido: Pedido; proximoStatus?: string }) => {
        const tempoDecorrido = getTempoDecorrido(pedido.emPreparoAt || pedido.createdAt);
        const isUrgente = tempoDecorrido > 15;

        return (
            <div className={`bg-white rounded-xl shadow-lg p-5 mb-4 border-l-[6px] transition-all hover:shadow-xl ${isUrgente ? 'border-red-500 bg-red-50' : 'border-green-500'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-xl text-gray-900">
                            {pedido.comanda.mesaRelacao?.numero
                                ? `Mesa ${pedido.comanda.mesaRelacao.numero}`
                                : `#${pedido.comanda.codigo.slice(0, 6)}`
                            }
                        </span>
                        {isUrgente && (
                            <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
                                <Flame className="w-5 h-5 text-red-600 animate-pulse" />
                                <span className="text-xs font-bold text-red-700">URGENTE</span>
                            </div>
                        )}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isUrgente ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                        <Clock className={`w-5 h-5 ${isUrgente ? 'text-red-600' : 'text-gray-600'}`} />
                        <span className={`text-lg font-bold ${isUrgente ? 'text-red-700' : 'text-gray-700'}`}>
                            {tempoDecorrido}min
                        </span>
                    </div>
                </div>

                {/* Itens */}
                <div className="space-y-3 mb-4">
                    {pedido.itens.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-lg font-bold min-w-[50px] text-center">
                                    {item.quantidade}x
                                </span>
                                <span className="font-semibold text-lg text-gray-900">
                                    {item.produto.nome}
                                </span>
                            </div>
                            {item.observacoes && (
                                <div className="mt-2 ml-14 bg-yellow-100 border-l-4 border-yellow-500 p-2 rounded">
                                    <p className="text-sm font-semibold text-yellow-900">
                                        ⚠️ {item.observacoes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Ação */}
                {proximoStatus && (
                    <button
                        onClick={() => atualizarStatus(pedido.id, proximoStatus)}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all active:scale-95 shadow-md hover:shadow-lg ${proximoStatus === 'em_preparo' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                proximoStatus === 'pronto' ? 'bg-green-500 hover:bg-green-600' :
                                    'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        {proximoStatus === 'em_preparo' ? '🔥 Iniciar Preparo' :
                            proximoStatus === 'pronto' ? '✅ Marcar como Pronto' :
                                '📦 Entregar'}
                    </button>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto mb-3" />
                    <p className="text-gray-600">Carregando pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header estilo Stitch: Painel da Cozinha Kanban */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Painel da Cozinha Kanban</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Comanda Digital • {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
                        <Flame className="w-4 h-4" />
                        Modo Rush Ativo
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Tempo Médio 12m 30s
                    </span>
                    <input
                        type="search"
                        placeholder="Buscar pedido #..."
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm w-48 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                        onClick={carregarPedidos}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Kanban - 3 colunas estilo Stitch */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Aguardando */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-red-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Aguardando
                        </h2>
                        <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
                            {pedidos.novos.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-4 min-h-[200px]">
                        {pedidos.novos.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">Nenhum pedido aguardando</p>
                        ) : (
                            pedidos.novos.map((pedido) => (
                                <PedidoCard key={pedido.id} pedido={pedido} proximoStatus="em_preparo" />
                            ))
                        )}
                    </div>
                </div>

                {/* Em Preparo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-amber-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Em Preparo
                        </h2>
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-sm font-medium">
                            {pedidos.emPreparo.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-4 min-h-[200px]">
                        {pedidos.emPreparo.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">Nenhum pedido em preparo</p>
                        ) : (
                            pedidos.emPreparo.map((pedido) => (
                                <PedidoCard key={pedido.id} pedido={pedido} proximoStatus="pronto" />
                            ))
                        )}
                    </div>
                </div>

                {/* Pronto */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-green-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Pronto
                        </h2>
                        <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
                            {pedidos.prontos.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-4 min-h-[200px]">
                        {pedidos.prontos.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">Nenhum pedido pronto</p>
                        ) : (
                            pedidos.prontos.map((pedido) => (
                                <PedidoCard key={pedido.id} pedido={pedido} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
