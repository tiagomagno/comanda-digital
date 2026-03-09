'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wine, Clock, RefreshCw, Flame } from 'lucide-react';
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

export default function BarPage() {
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

            const response = await fetch('http://localhost:3001/api/bar/pedidos?destino=BAR', {
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
            const response = await fetch(`http://localhost:3001/api/bar/pedidos/${pedidoId}`, {
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
        const isUrgente = tempoDecorrido > 10; // Bar é mais rápido que cozinha

        return (
            <div className={`bg-white rounded-xl shadow-lg p-5 mb-4 border-l-[6px] transition-all hover:shadow-xl ${isUrgente ? 'border-red-500 bg-red-50' : 'border-purple-500'
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
                                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-lg font-bold min-w-[50px] text-center">
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
                        className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all active:scale-95 shadow-md hover:shadow-lg ${proximoStatus === 'em_preparo' ? 'bg-purple-500 hover:bg-purple-600' :
                                proximoStatus === 'pronto' ? 'bg-green-500 hover:bg-green-600' :
                                    'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        {proximoStatus === 'em_preparo' ? '🍹 Iniciar Preparo' :
                            proximoStatus === 'pronto' ? '✅ Marcar como Pronto' :
                                '📦 Entregar'}
                    </button>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                                <Wine className="w-10 h-10 text-purple-600" />
                                Bar
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Gerencie os pedidos de bebidas
                            </p>
                        </div>
                        <button
                            onClick={carregarPedidos}
                            className="bg-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Atualizar
                        </button>
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <p className="text-gray-600 text-sm">Novos</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.novos}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <p className="text-gray-600 text-sm">Em Preparo</p>
                        <p className="text-3xl font-bold text-purple-600">{stats.emPreparo}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <p className="text-gray-600 text-sm">Prontos</p>
                        <p className="text-3xl font-bold text-green-600">{stats.prontos}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <p className="text-gray-600 text-sm">Total</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                </div>

                {/* Kanban */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Coluna: Novos */}
                    <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                                🆕 Novos
                            </h2>
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {pedidos.novos.length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {pedidos.novos.length === 0 ? (
                                <p className="text-center text-blue-600 py-8">Nenhum pedido novo</p>
                            ) : (
                                pedidos.novos.map((pedido) => (
                                    <PedidoCard key={pedido.id} pedido={pedido} proximoStatus="em_preparo" />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Coluna: Em Preparo */}
                    <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                                🔄 Em Preparo
                            </h2>
                            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {pedidos.emPreparo.length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {pedidos.emPreparo.length === 0 ? (
                                <p className="text-center text-purple-600 py-8">Nenhum pedido em preparo</p>
                            ) : (
                                pedidos.emPreparo.map((pedido) => (
                                    <PedidoCard key={pedido.id} pedido={pedido} proximoStatus="pronto" />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Coluna: Prontos */}
                    <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
                                ✅ Prontos
                            </h2>
                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {pedidos.prontos.length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {pedidos.prontos.length === 0 ? (
                                <p className="text-center text-green-600 py-8">Nenhum pedido pronto</p>
                            ) : (
                                pedidos.prontos.map((pedido) => (
                                    <PedidoCard key={pedido.id} pedido={pedido} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
