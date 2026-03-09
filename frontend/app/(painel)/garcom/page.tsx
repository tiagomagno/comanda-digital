'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, FileText, Clock, Users, DollarSign, RefreshCw, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comanda {
    id: string;
    codigo: string;
    nomeCliente: string;
    mesa?: string;
    mesaRelacao?: { numero: string };
    formaPagamento: 'imediato' | 'final';
    totalEstimado: number;
    status: string;
    pedidos: Array<{
        id: string;
        status: string;
        itens: Array<{
            quantidade: number;
            produto: { nome: string };
        }>;
    }>;
    createdAt: string;
}

export default function GarcomPage() {
    const router = useRouter();
    const [comandas, setComandas] = useState<Comanda[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'todas' | 'pagar_agora' | 'pagar_final'>('todas');
    const [showPagamentoModal, setShowPagamentoModal] = useState(false);
    const [comandaSelecionada, setComandaSelecionada] = useState<Comanda | null>(null);

    useEffect(() => {
        carregarComandas();
        const interval = setInterval(carregarComandas, 30000);
        return () => clearInterval(interval);
    }, []);

    const carregarComandas = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await fetch('http://localhost:3001/api/garcom/comandas?status=ativa', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setComandas(data);
            } else if (response.status === 401) {
                toast.error('Sessão expirada');
                router.push('/auth/login');
            }
        } catch (error) {
            console.error('Erro ao carregar comandas:', error);
            toast.error('Erro ao carregar comandas');
        } finally {
            setLoading(false);
        }
    };

    const abrirModalPagamento = (comanda: Comanda) => {
        setComandaSelecionada(comanda);
        setShowPagamentoModal(true);
    };

    const processarPagamento = async (metodoPagamento: string) => {
        if (!comandaSelecionada) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/garcom/comandas/${comandaSelecionada.id}/pagamento`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ metodoPagamento }),
            });

            if (response.ok) {
                toast.success('Pagamento processado!');
                setShowPagamentoModal(false);
                setComandaSelecionada(null);
                carregarComandas();
            } else {
                toast.error('Erro ao processar pagamento');
            }
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Erro ao processar pagamento');
        }
    };

    const fecharComanda = async (comandaId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/garcom/comandas/${comandaId}/fechar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success('Comanda fechada!');
                carregarComandas();
            } else {
                toast.error('Erro ao fechar comanda');
            }
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Erro ao fechar comanda');
        }
    };

    const comandasFiltradas = comandas.filter(c => {
        if (filter === 'pagar_agora') return c.formaPagamento === 'imediato';
        if (filter === 'pagar_final') return c.formaPagamento === 'final';
        return true;
    });

    const totalPagarAgora = comandas.filter(c => c.formaPagamento === 'imediato').length;
    const totalPagarFinal = comandas.filter(c => c.formaPagamento === 'final').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando comandas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Mobile */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Comandas Ativas</h1>
                            <p className="text-sm text-gray-600">{comandas.length} comandas abertas</p>
                        </div>
                        <button
                            onClick={carregarComandas}
                            className="p-3 bg-blue-50 text-blue-600 rounded-lg active:bg-blue-100"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Filtros - Mobile */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setFilter('todas')}
                            className={`py-3 rounded-lg text-sm font-medium transition-colors ${filter === 'todas'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            Todas
                            <span className="block text-xs mt-0.5">{comandas.length}</span>
                        </button>
                        <button
                            onClick={() => setFilter('pagar_agora')}
                            className={`py-3 rounded-lg text-sm font-medium transition-colors ${filter === 'pagar_agora'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            Pagar Agora
                            <span className="block text-xs mt-0.5">{totalPagarAgora}</span>
                        </button>
                        <button
                            onClick={() => setFilter('pagar_final')}
                            className={`py-3 rounded-lg text-sm font-medium transition-colors ${filter === 'pagar_final'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            Pagar Final
                            <span className="block text-xs mt-0.5">{totalPagarFinal}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de Comandas - Mobile Optimized */}
            <div className="px-4 py-4 space-y-3 pb-20">
                {comandasFiltradas.map((comanda) => {
                    const totalItens = comanda.pedidos.reduce((sum, p) =>
                        sum + p.itens.reduce((s, i) => s + i.quantidade, 0), 0
                    );

                    return (
                        <div
                            key={comanda.id}
                            className="bg-white rounded-xl shadow-sm overflow-hidden"
                        >
                            {/* Header do Card */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {comanda.codigo}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {comanda.nomeCliente}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${comanda.formaPagamento === 'imediato'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {comanda.formaPagamento === 'imediato' ? '💳 Pagar Agora' : '📋 Pagar Final'}
                                    </span>
                                </div>

                                {comanda.mesaRelacao && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="w-4 h-4" />
                                        Mesa {comanda.mesaRelacao.numero}
                                    </div>
                                )}
                            </div>

                            {/* Informações */}
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 mb-1">Total</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            R$ {Number(comanda.totalEstimado).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 mb-1">Itens</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {totalItens}
                                        </p>
                                    </div>
                                </div>

                                {/* Pedidos */}
                                {comanda.pedidos.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-gray-700 mb-2">
                                            Pedidos ({comanda.pedidos.length})
                                        </p>
                                        <div className="space-y-1">
                                            {comanda.pedidos.slice(0, 3).map((pedido) => (
                                                <div key={pedido.id} className="text-xs text-gray-600 flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${pedido.status === 'pronto' ? 'bg-green-500' :
                                                        pedido.status === 'preparando' ? 'bg-yellow-500' :
                                                            'bg-gray-400'
                                                        }`}></span>
                                                    {pedido.itens.map(i => `${i.quantidade}x ${i.produto.nome}`).join(', ')}
                                                </div>
                                            ))}
                                            {comanda.pedidos.length > 3 && (
                                                <p className="text-xs text-gray-500">
                                                    +{comanda.pedidos.length - 3} pedidos
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Ações - Mobile */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => abrirModalPagamento(comanda)}
                                        className="py-3 bg-green-600 text-white rounded-lg font-semibold text-sm active:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Registrar Pagamento
                                    </button>
                                    <button
                                        onClick={() => router.push(`/garcom/comanda/${comanda.id}`)}
                                        className="py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm active:bg-gray-200 flex items-center justify-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {comandasFiltradas.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma comanda encontrada</p>
                    </div>
                )}
            </div>

            {/* Modal de Pagamento - Mobile */}
            {showPagamentoModal && comandaSelecionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                    <div className="bg-white w-full rounded-t-3xl overflow-hidden">
                        <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Registrar Pagamento</h2>
                            <button
                                onClick={() => {
                                    setShowPagamentoModal(false);
                                    setComandaSelecionada(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-600 mb-1">Comanda</p>
                                <p className="text-lg font-bold text-gray-900">{comandaSelecionada.codigo}</p>
                                <p className="text-sm text-gray-600">{comandaSelecionada.nomeCliente}</p>
                                <p className="text-2xl font-bold text-blue-600 mt-2">
                                    R$ {Number(comandaSelecionada.totalEstimado).toFixed(2)}
                                </p>
                            </div>

                            <p className="text-sm font-semibold text-gray-700 mb-3">Método de Pagamento</p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => processarPagamento('dinheiro')}
                                    className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold active:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <DollarSign className="w-5 h-5" />
                                    Dinheiro
                                </button>
                                <button
                                    onClick={() => processarPagamento('cartao')}
                                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold active:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Cartão
                                </button>
                                <button
                                    onClick={() => processarPagamento('pix')}
                                    className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold active:bg-purple-700 flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    PIX
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
