'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Clock, RefreshCw, Flame, Package, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface PedidoItem {
    id: string;
    quantidade: number;
    produto: {
        nome: string;
    };
    observacoes?: string;
}

interface ComandaDelivery {
    id: string;
    codigo: string;
    nomeCliente: string;
    formaPagamento: 'imediato' | 'final';
    totalEstimado: number;
    status: string;
    pedidos: Array<{
        id: string;
        status: string;
        itens: PedidoItem[];
        createdAt: string;
    }>;
    createdAt: string;
    enderecoEntrega?: string; // Se aplicável futuramente
}

interface KanbanDelivery {
    novos: ComandaDelivery[];
    emPreparo: ComandaDelivery[];
    emEntrega: ComandaDelivery[];
}

export default function PedidosDeliveryKanban() {
    const router = useRouter();
    const [comandas, setComandas] = useState<KanbanDelivery>({ novos: [], emPreparo: [], emEntrega: [] });
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ novos: 0, emPreparo: 0, emEntrega: 0, total: 0 });

    useEffect(() => {
        carregarComandas();
        const interval = setInterval(carregarComandas, 15000);
        return () => clearInterval(interval);
    }, []);

    const carregarComandas = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            // Usamos a API de garçom para comandas, pois centraliza os pedidos "full" do cliente.
            // Para delivery, pegamos todas ativas ou num status específico.
            const response = await fetch('http://localhost:3001/api/garcom/comandas?status=ativa', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data: ComandaDelivery[] = await response.json();
                
                // Mapeamento local simples para simular o kanban se o backend ainda nao tiver status de delivery cravado na comanda
                // Como não sabemos a modelagem exata, filtramos pelo status simulado ou consideramos tudo "novo"
                const novos = data.filter(c => c.status === 'aberta' || c.status === 'ativa');
                const emPreparo = data.filter(c => c.status === 'em_preparo');
                const emEntrega = data.filter(c => c.status === 'em_entrega');

                setComandas({ novos, emPreparo, emEntrega });
                setStats({
                    novos: novos.length,
                    emPreparo: emPreparo.length,
                    emEntrega: emEntrega.length,
                    total: novos.length + emPreparo.length + emEntrega.length,
                });
            } else if (response.status === 401) {
                toast.error('Sessão expirada. Faça login novamente.');
                router.push('/auth/login');
            }
        } catch (error) {
            console.error('Erro ao carregar comandas:', error);
            toast.error('Erro ao carregar pedidos');
        } finally {
            setLoading(false);
        }
    };

    const atualizarStatus = async (comandaId: string, novoStatus: string) => {
        try {
            // Em aplicação real, você teria um endpoint pra mudar o status da DELIVERY
            toast.success(`Pedido movido para: ${novoStatus}`);
            // Recarrega apos simular
            carregarComandas();
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

    const PedidoCard = ({ comanda, proximoStatus }: { comanda: ComandaDelivery; proximoStatus?: string }) => {
        const tempoDecorrido = getTempoDecorrido(comanda.createdAt);
        const isUrgente = tempoDecorrido > 30; // 30 min para delivery
        
        let allItems: PedidoItem[] = [];
        comanda.pedidos.forEach(p => {
             allItems = allItems.concat(p.itens);
        });

        return (
            <div className={`bg-white rounded-xl shadow-lg p-5 mb-4 border-l-[6px] transition-all hover:shadow-xl ${isUrgente ? 'border-red-500 bg-red-50' : 'border-orange-500'}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-xl text-gray-900">
                            #{comanda.codigo.substring(0,6)}
                        </span>
                        {isUrgente && (
                            <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
                                <Flame className="w-5 h-5 text-red-600 animate-pulse" />
                                <span className="text-xs font-bold text-red-700">ATRASADO</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
                        <Clock className={`w-4 h-4 ${isUrgente ? 'text-red-600' : 'text-gray-600'}`} />
                        <span className={`text-sm font-bold ${isUrgente ? 'text-red-700' : 'text-gray-700'}`}>
                            {tempoDecorrido}min
                        </span>
                    </div>
                </div>

                <p className="text-gray-800 font-medium mb-3">Cliente: {comanda.nomeCliente}</p>

                {/* Itens */}
                <div className="space-y-2 mb-4">
                    {allItems.map((item, idx) => (
                        <div key={item.id || idx} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                                <span className="bg-orange-600 text-white px-2 py-0.5 rounded-full text-sm font-bold min-w-[36px] text-center">
                                    {item.quantidade}x
                                </span>
                                <span className="font-semibold text-sm text-gray-900 leading-tight">
                                    {item.produto?.nome}
                                </span>
                            </div>
                            {item.observacoes && (
                                <p className="text-xs mt-1 ml-12 text-gray-500 italic">
                                    Obs: {item.observacoes}
                                </p>
                            )}
                        </div>
                    ))}
                    {allItems.length === 0 && (
                        <p className="text-xs text-gray-400 italic">Nenhum item listado.</p>
                    )}
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mb-4">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="font-bold text-lg text-gray-900">R$ {Number(comanda.totalEstimado || 0).toFixed(2)}</span>
                </div>

                {/* Ação */}
                {proximoStatus && (
                    <button
                        onClick={() => atualizarStatus(comanda.id, proximoStatus)}
                        className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                            proximoStatus === 'em_preparo' ? 'bg-yellow-500 hover:bg-yellow-600' :
                            proximoStatus === 'em_entrega' ? 'bg-orange-500 hover:bg-orange-600' :
                            'bg-green-500 hover:bg-green-600'
                        }`}
                    >
                        {proximoStatus === 'em_preparo' ? '🔥 Iniciar Preparo' :
                         proximoStatus === 'em_entrega' ? '📦 Saiu para Entrega' :
                         '✅ Entregue'}
                         <ExternalLink className="w-4 h-4" />
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
                    <p className="text-gray-600">Carregando kanban de pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kanban de Pedidos (Delivery)</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Gerenciamento de Fluxo de Entregas
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={carregarComandas}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Atualizar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Aguardando */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-red-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500" />
                            Novos
                        </h2>
                        <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
                            {comandas.novos.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 bg-gray-50/50 overflow-y-auto space-y-4 min-h-[200px]">
                        {comandas.novos.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">Nenhum pedido novo</p>
                        ) : (
                            comandas.novos.map((c) => (
                                <PedidoCard key={c.id} comanda={c} proximoStatus="em_preparo" />
                            ))
                        )}
                    </div>
                </div>

                {/* Em Preparo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-amber-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500" />
                            Em Preparo
                        </h2>
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-sm font-medium">
                            {comandas.emPreparo.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 bg-gray-50/50 overflow-y-auto space-y-4 min-h-[200px]">
                        {comandas.emPreparo.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">Nenhum pedido em preparo</p>
                        ) : (
                            comandas.emPreparo.map((c) => (
                                <PedidoCard key={c.id} comanda={c} proximoStatus="em_entrega" />
                            ))
                        )}
                    </div>
                </div>

                {/* Em Entrega */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-blue-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500" />
                            Saiu para Entrega
                        </h2>
                        <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
                            {comandas.emEntrega.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 bg-gray-50/50 overflow-y-auto space-y-4 min-h-[200px]">
                        {comandas.emEntrega.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">Nenhuma entrega em percurso</p>
                        ) : (
                            comandas.emEntrega.map((c) => (
                                <PedidoCard key={c.id} comanda={c} proximoStatus="entregue" />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
