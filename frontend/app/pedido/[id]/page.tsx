'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, ChefHat, Package, Home } from 'lucide-react';
import Link from 'next/link';
import { io } from 'socket.io-client';

interface Pedido {
    id: string;
    numeroPedido: number;
    status: string;
    total: number;
    createdAt: string;
    itens: {
        id: string;
        quantidade: number;
        precoUnitario: number;
        observacoes?: string;
        produto: {
            nome: string;
        };
    }[];
}

export default function AcompanhamentoPedidoPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const pedidoId = params.id as string;
    const comandaCodigo = searchParams.get('comanda');

    const [pedido, setPedido] = useState<Pedido | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarPedido();

        // Conectar ao WebSocket
        const socket = io('http://localhost:3001');

        // Entrar na sala do estabelecimento
        socket.emit('join:estabelecimento', 'estab-seed-001');

        // Escutar atualizações de pedido
        socket.on('pedido:atualizado', (data) => {
            if (data.id === pedidoId) {
                console.log('Pedido atualizado via WebSocket:', data);
                setPedido(data);
            }
        });

        // Cleanup ao desmontar
        return () => {
            socket.emit('leave:estabelecimento', 'estab-seed-001');
            socket.disconnect();
        };
    }, [pedidoId]);

    const carregarPedido = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}`);
            const data = await response.json();
            setPedido(data);
        } catch (error) {
            console.error('Erro ao carregar pedido:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
            criado: {
                label: 'Pedido Criado',
                icon: Package,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
            },
            aguardando_pagamento: {
                label: 'Aguardando Pagamento',
                icon: Clock,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
            },
            pago: {
                label: 'Pago - Aguardando Preparo',
                icon: Clock,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
            },
            em_preparo: {
                label: 'Em Preparo',
                icon: ChefHat,
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
            },
            pronto: {
                label: 'Pronto para Retirar',
                icon: CheckCircle2,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
            },
            entregue: {
                label: 'Entregue',
                icon: CheckCircle2,
                color: 'text-gray-600',
                bgColor: 'bg-gray-50',
            },
            cancelado: {
                label: 'Cancelado',
                icon: Package,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
            },
        };

        return statusMap[status] || statusMap.criado;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    <p className="mt-4 text-gray-600">Carregando pedido...</p>
                </div>
            </div>
        );
    }

    if (!pedido) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Pedido não encontrado</p>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(pedido.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Acompanhar Pedido</h1>
                    {comandaCodigo && (
                        <p className="text-sm text-gray-600">
                            Comanda: <span className="font-semibold text-red-600">{comandaCodigo}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Conteúdo */}
            <div className="container mx-auto px-4 py-6">
                {/* Status Atual */}
                <div className={`${statusInfo.bgColor} rounded-lg p-6 mb-6`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full ${statusInfo.bgColor} border-4 border-white flex items-center justify-center`}>
                            <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold ${statusInfo.color}`}>{statusInfo.label}</h2>
                            <p className="text-gray-600">Pedido #{pedido.numeroPedido}</p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Status do Pedido</h3>
                    <div className="space-y-4">
                        {/* Criado */}
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${pedido.status !== 'criado' ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                                <CheckCircle2 className={`w-6 h-6 ${pedido.status !== 'criado' ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Pedido Criado</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(pedido.createdAt).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </div>

                        {/* Em Preparo */}
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${['em_preparo', 'pronto', 'entregue'].includes(pedido.status) ? 'bg-orange-100' : 'bg-gray-100'} flex items-center justify-center`}>
                                <ChefHat className={`w-6 h-6 ${['em_preparo', 'pronto', 'entregue'].includes(pedido.status) ? 'text-orange-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Em Preparo</p>
                                <p className="text-sm text-gray-600">
                                    {['em_preparo', 'pronto', 'entregue'].includes(pedido.status) ? 'Seu pedido está sendo preparado' : 'Aguardando'}
                                </p>
                            </div>
                        </div>

                        {/* Pronto */}
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${['pronto', 'entregue'].includes(pedido.status) ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                                <Package className={`w-6 h-6 ${['pronto', 'entregue'].includes(pedido.status) ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Pronto</p>
                                <p className="text-sm text-gray-600">
                                    {['pronto', 'entregue'].includes(pedido.status) ? 'Seu pedido está pronto!' : 'Aguardando'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Itens do Pedido */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Itens do Pedido</h3>
                    <div className="space-y-3">
                        {pedido.itens.map((item) => (
                            <div key={item.id} className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        {item.quantidade}x {item.produto.nome}
                                    </p>
                                    {item.observacoes && (
                                        <p className="text-sm text-gray-600">Obs: {item.observacoes}</p>
                                    )}
                                </div>
                                <p className="font-semibold text-gray-900">
                                    R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t mt-4 pt-4">
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                            <span>Total</span>
                            <span>R$ {pedido.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Informações */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informações</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Esta página atualiza automaticamente em tempo real</li>
                        <li>• Você será notificado quando seu pedido estiver pronto</li>
                        <li>• O pagamento será feito com o garçom ao final</li>
                    </ul>
                </div>
            </div>

            {/* Botão Voltar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href={`/cardapio?comanda=${comandaCodigo}`}
                        className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Voltar ao Cardápio
                    </Link>
                </div>
            </div>
        </div>
    );
}
