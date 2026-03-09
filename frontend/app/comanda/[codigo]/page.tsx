'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Receipt, Clock, CheckCircle2, XCircle, Plus, Home } from 'lucide-react';
import Link from 'next/link';

interface Pedido {
    id: string;
    numeroPedido: number;
    status: string;
    total: number;
    createdAt: string;
    itens: {
        quantidade: number;
        produto: {
            nome: string;
        };
    }[];
}

export default function HistoricoComandaPage() {
    const params = useParams();
    const codigo = params.codigo as string;

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalGeral, setTotalGeral] = useState(0);

    useEffect(() => {
        carregarPedidos();
    }, [codigo]);

    const carregarPedidos = async () => {
        try {
            // Buscar comanda pelo código
            const responseComanda = await fetch(`http://localhost:3001/api/comandas/codigo/${codigo}`);
            const comanda = await responseComanda.json();

            if (comanda && comanda.pedidos) {
                setPedidos(comanda.pedidos);

                // Calcular total geral
                const total = comanda.pedidos.reduce((acc: number, pedido: Pedido) => {
                    return acc + Number(pedido.total);
                }, 0);
                setTotalGeral(total);
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { label: string; icon: any; color: string }> = {
            criado: { label: 'Criado', icon: Clock, color: 'text-blue-600' },
            em_preparo: { label: 'Em Preparo', icon: Clock, color: 'text-orange-600' },
            pronto: { label: 'Pronto', icon: CheckCircle2, color: 'text-green-600' },
            entregue: { label: 'Entregue', icon: CheckCircle2, color: 'text-gray-600' },
            cancelado: { label: 'Cancelado', icon: XCircle, color: 'text-red-600' },
        };
        return statusMap[status] || statusMap.criado;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Carregando histórico...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Receipt className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Histórico da Comanda</h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Código: <span className="font-semibold text-blue-600">{codigo}</span>
                    </p>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="container mx-auto px-4 py-6">
                {/* Total Geral */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Total da Comanda</p>
                            <p className="text-4xl font-bold">R$ {totalGeral.toFixed(2)}</p>
                            <p className="text-blue-100 text-sm mt-1">
                                {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
                            </p>
                        </div>
                        <Receipt className="w-16 h-16 text-blue-200 opacity-50" />
                    </div>
                </div>

                {/* Lista de Pedidos */}
                {pedidos.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Nenhum pedido realizado ainda</p>
                        <Link
                            href={`/cardapio?comanda=${codigo}`}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Fazer Primeiro Pedido
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pedidos.map((pedido) => {
                            const statusInfo = getStatusInfo(pedido.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div key={pedido.id} className="bg-white rounded-lg shadow overflow-hidden">
                                    {/* Header do Pedido */}
                                    <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="font-bold text-blue-600">#{pedido.numeroPedido}</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Pedido #{pedido.numeroPedido}</p>
                                                <p className="text-xs text-gray-600">
                                                    {new Date(pedido.createdAt).toLocaleString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-2 ${statusInfo.color}`}>
                                            <StatusIcon className="w-5 h-5" />
                                            <span className="font-medium text-sm">{statusInfo.label}</span>
                                        </div>
                                    </div>

                                    {/* Itens do Pedido */}
                                    <div className="p-4">
                                        <div className="space-y-2 mb-3">
                                            {pedido.itens.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span className="text-gray-700">
                                                        {item.quantidade}x {item.produto.nome}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t pt-3 flex items-center justify-between">
                                            <span className="font-semibold text-gray-900">Total</span>
                                            <span className="text-xl font-bold text-blue-600">
                                                R$ {pedido.total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="bg-gray-50 px-4 py-3 border-t">
                                        <Link
                                            href={`/pedido/${pedido.id}?comanda=${codigo}`}
                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
                                        >
                                            Ver Detalhes →
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Botões Fixos */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
                <div className="container mx-auto px-4 py-4 space-y-3">
                    <Link
                        href={`/cardapio?comanda=${codigo}`}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Fazer Novo Pedido
                    </Link>
                    <Link
                        href="/"
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Voltar ao Início
                    </Link>
                </div>
            </div>
        </div>
    );
}
