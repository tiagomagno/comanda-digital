'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, FileText, TrendingUp, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

interface Comanda {
    id: string;
    codigo: string;
    nomeCliente: string;
    telefoneCliente: string;
    mesa?: string;
    mesaRelacao?: { numero: string };
    formaPagamento: string;
    totalEstimado: number;
    totalCalculado?: number;
    pedidos: Array<{
        id: string;
        total: number;
        itens: Array<{
            quantidade: number;
            precoUnitario: number;
            subtotal: number;
            produto: { nome: string };
        }>;
    }>;
    createdAt: string;
}

export default function CaixaPage() {
    const router = useRouter();
    const [comandas, setComandas] = useState<Comanda[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalComanda, setModalComanda] = useState<Comanda | null>(null);
    const [metodoPagamento, setMetodoPagamento] = useState('');

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

            const response = await fetch(`${BASE_URL}/api/caixa/comandas`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setComandas(data);
            } else if (response.status === 401) {
                toast.error('Sessão expirada. Faça login novamente.');
                router.push('/auth/login');
            }
        } catch (error) {
            console.error('Erro ao carregar comandas:', error);
            toast.error('Erro ao carregar comandas');
        } finally {
            setLoading(false);
        }
    };

    const processarPagamento = async () => {
        if (!modalComanda || !metodoPagamento) {
            toast.error('Selecione um método de pagamento');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/caixa/comandas/${modalComanda.id}/pagar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ metodoPagamento }),
            });

            if (response.ok) {
                toast.success('Pagamento processado com sucesso!');
                setModalComanda(null);
                setMetodoPagamento('');
                carregarComandas();
            } else {
                toast.error('Erro ao processar pagamento');
            }
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Erro ao processar pagamento');
        }
    };

    const totalGeral = comandas.reduce((acc, c) => acc + (c.totalCalculado || Number(c.totalEstimado)), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent mx-auto mb-3" />
                    <p className="text-gray-600">Carregando comandas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header - mesmo padrão das demais páginas */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Caixa</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={carregarComandas}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                </button>
            </div>

            {/* KPIs - cards estilo painel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Comandas Pendentes</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{comandas.length}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-primary-100">
                            <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Valor Total</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">R$ {totalGeral.toFixed(2)}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-green-100">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                R$ {comandas.length > 0 ? (totalGeral / comandas.length).toFixed(2) : '0.00'}
                            </p>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-100">
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Comandas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Comandas Aguardando Pagamento</h2>

                {comandas.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Nenhuma comanda pendente</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {comandas.map((comanda) => (
                            <div
                                key={comanda.id}
                                className="rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow bg-gray-50/30"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {comanda.mesaRelacao?.numero
                                                    ? `Mesa ${comanda.mesaRelacao.numero}`
                                                    : `Individual #${comanda.codigo.slice(0, 6)}`
                                                }
                                            </h3>
                                            <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                                                {comanda.pedidos.length} pedido(s)
                                            </span>
                                        </div>
                                        <p className="font-medium text-gray-800">{comanda.nomeCliente}</p>
                                        <p className="text-sm text-gray-500">{comanda.telefoneCliente}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {comanda.formaPagamento === 'imediato' ? 'Pagar Agora' : 'Pagar no Final'}
                                        </p>
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500">Total</p>
                                        <p className="text-xl font-bold text-primary-600">
                                            R$ {(comanda.totalCalculado || Number(comanda.totalEstimado)).toFixed(2)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setModalComanda(comanda)}
                                        className="bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-600 transition-colors"
                                    >
                                        Fechar Conta
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

                {/* Modal de Fechamento - estilo alinhado ao painel */}
                {modalComanda && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg border border-gray-100">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Fechar Conta</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">Confirme os detalhes e registre o pagamento</p>
                                    </div>
                                    <button
                                        onClick={() => { setModalComanda(null); setMetodoPagamento(''); }}
                                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Cliente</p>
                                                <p className="font-semibold text-gray-900">{modalComanda.nomeCliente}</p>
                                                <p className="text-sm text-gray-600">{modalComanda.telefoneCliente}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Identificação</p>
                                                <p className="font-semibold text-gray-900">
                                                    {modalComanda.mesaRelacao?.numero ? `Mesa ${modalComanda.mesaRelacao.numero}` : `#${modalComanda.codigo.slice(0, 6)}`}
                                                </p>
                                                <p className="text-sm text-gray-600">{modalComanda.pedidos.length} pedido(s)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Itens consumidos</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto border border-gray-100">
                                        <div className="space-y-2">
                                            {modalComanda.pedidos.map((pedido) =>
                                                pedido.itens.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-primary-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                                                                {item.quantidade}x
                                                            </span>
                                                            <span className="text-gray-900">{item.produto.nome}</span>
                                                        </div>
                                                        <span className="font-medium text-gray-900">R$ {Number(item.subtotal).toFixed(2)}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-primary-500 text-white rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Total da conta</span>
                                            <span className="text-2xl font-bold">
                                                R$ {(modalComanda.totalCalculado || Number(modalComanda.totalEstimado)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Método de pagamento *</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['dinheiro', 'cartao', 'pix'].map((metodo) => (
                                            <button
                                                key={metodo}
                                                onClick={() => setMetodoPagamento(metodo)}
                                                className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${metodoPagamento === metodo
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                }`}
                                            >
                                                {metodo === 'dinheiro' && '💵 Dinheiro'}
                                                {metodo === 'cartao' && '💳 Cartão'}
                                                {metodo === 'pix' && '📱 PIX'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setModalComanda(null); setMetodoPagamento(''); }}
                                        className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={processarPagamento}
                                        disabled={!metodoPagamento}
                                        className="flex-1 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Confirmar pagamento
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
