'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, DollarSign, Lock, Clock, ChefHat, AlertCircle } from 'lucide-react';
import { garcomService, Comanda } from '@/services/garcom.service';
import { toast } from 'react-hot-toast';

export default function ComandaDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [comanda, setComanda] = useState<Comanda | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchComanda = async () => {
        try {
            const data = await garcomService.obterComanda(params.id as string);
            setComanda(data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar comanda');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchComanda();
        }
    }, [params.id]);

    const handleAprovar = async (pedidoId: string) => {
        try {
            await garcomService.aprovarPedido(pedidoId);
            toast.success('Pedido aprovado');
            fetchComanda();
        } catch (error) {
            toast.error('Erro ao aprovar pedido');
        }
    };

    const handleRejeitar = async (pedidoId: string) => {
        const motivo = prompt('Motivo da rejeição:');
        if (motivo === null) return;

        try {
            await garcomService.rejeitarPedido(pedidoId, motivo);
            toast.success('Pedido rejeitado');
            fetchComanda();
        } catch (error) {
            toast.error('Erro ao rejeitar pedido');
        }
    };

    const handlePagamento = async (metodo: string) => {
        if (!comanda) return;
        if (!confirm(`Confirmar pagamento via ${metodo}?`)) return;

        setProcessing(true);
        try {
            await garcomService.processarPagamento(comanda.id, metodo);
            toast.success('Pagamento registrado');
            fetchComanda();
        } catch (error) {
            toast.error('Erro ao registrar pagamento');
        } finally {
            setProcessing(false);
        }
    };

    const handleFechar = async () => {
        if (!comanda) return;
        if (!confirm('Tem certeza que deseja fechar esta comanda?')) return;

        setProcessing(true);
        try {
            await garcomService.fecharComanda(comanda.id);
            toast.success('Comanda fechada com sucesso');
            router.push('/garcom');
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Erro ao fechar comanda';
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!comanda) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <p className="text-xl text-gray-600 mb-4">Comanda não encontrada</p>
                <Link href="/garcom" className="text-blue-600 hover:underline">
                    Voltar para lista
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/garcom" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    Mesa {comanda.mesaRelacao?.numero}
                                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        #{comanda.codigo}
                                    </span>
                                </h1>
                                <p className="text-sm text-gray-500">{comanda.nomeCliente}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-medium">Total</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(comanda.totalEstimado))}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Status Bar */}
                <div className={`p-4 rounded-lg flex items-center justify-between ${comanda.status === 'ativa' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        comanda.status === 'paga' ? 'bg-green-50 text-green-700 border border-green-100' :
                            'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Status: {comanda.status.toUpperCase()}</span>
                    </div>
                    {comanda.status === 'paga' && (
                        <button
                            onClick={handleFechar}
                            disabled={processing}
                            className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <Lock className="w-4 h-4" />
                            Fechar Comanda
                        </button>
                    )}
                </div>

                {/* Pedidos */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Pedidos</h2>
                    {comanda.pedidos.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                            <p className="text-gray-500">Nenhum pedido realizado ainda.</p>
                        </div>
                    ) : (
                        comanda.pedidos.map((pedido) => (
                            <div key={pedido.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center border border-gray-200 text-gray-600 font-bold text-sm">
                                            #{pedido.numeroPedido}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(pedido.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className={`text-xs font-bold ${pedido.status === 'criado' ? 'text-blue-600' :
                                                    pedido.status === 'cancelado' ? 'text-red-600' :
                                                        'text-green-600'
                                                }`}>
                                                {pedido.status.toUpperCase().replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>

                                    {pedido.status === 'criado' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRejeitar(pedido.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Rejeitar"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleAprovar(pedido.id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Aprovar"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 space-y-3">
                                    {pedido.itens.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className="bg-gray-100 text-gray-600 font-semibold h-6 w-6 rounded flex items-center justify-center text-xs mt-0.5">
                                                    {item.quantidade}x
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 text-sm font-medium">{item.produto.nome}</p>
                                                    {item.observacoes && (
                                                        <p className="text-xs text-red-500 italic mt-0.5">Obs: {item.observacoes}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-700 text-sm font-medium">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}
                                            </p>
                                        </div>
                                    ))}
                                    <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Total do Pedido</span>
                                        <span className="text-base font-bold text-gray-900">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(pedido.total))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            {comanda.status === 'ativa' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
                    <div className="container mx-auto max-w-lg flex gap-3">
                        <button
                            onClick={() => handlePagamento('dinheiro')}
                            disabled={processing}
                            className="flex-1 bg-green-100 text-green-700 py-3 rounded-xl font-semibold hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <DollarSign className="w-5 h-5" />
                            Dinheiro
                        </button>
                        <button
                            onClick={() => handlePagamento('cartao')}
                            disabled={processing}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-blue-200 shadow-lg"
                        >
                            <DollarSign className="w-5 h-5" />
                            Cartão
                        </button>
                        <button
                            onClick={() => handlePagamento('pix')}
                            disabled={processing}
                            className="flex-1 bg-purple-100 text-purple-700 py-3 rounded-xl font-semibold hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                        >
                            PIX
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
