'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface ItemCarrinho {
    id: string;
    produtoId: string;
    nome: string;
    preco: number;
    quantidade: number;
    observacoes?: string;
}

function CarrinhoContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const comandaCodigo = searchParams.get('comanda');

    const [itens, setItens] = useState<ItemCarrinho[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Carregar itens do localStorage
        const carrinhoSalvo = localStorage.getItem('carrinho');
        if (carrinhoSalvo) {
            setItens(JSON.parse(carrinhoSalvo));
        }
    }, []);

    const alterarQuantidade = (id: string, delta: number) => {
        const novosItens = itens.map(item => {
            if (item.id === id) {
                const novaQuantidade = item.quantidade + delta;
                return novaQuantidade > 0 ? { ...item, quantidade: novaQuantidade } : item;
            }
            return item;
        }).filter(item => item.quantidade > 0);

        setItens(novosItens);
        localStorage.setItem('carrinho', JSON.stringify(novosItens));
    };

    const removerItem = (id: string) => {
        const novosItens = itens.filter(item => item.id !== id);
        setItens(novosItens);
        localStorage.setItem('carrinho', JSON.stringify(novosItens));
    };

    const calcularSubtotal = () => {
        return itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    };

    const finalizarPedido = async () => {
        if (itens.length === 0) {
            alert('Carrinho vazio!');
            return;
        }

        setLoading(true);

        try {
            const comandaId = localStorage.getItem('comandaId');

            const response = await fetch('http://localhost:3001/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comandaId,
                    itens: itens.map(item => ({
                        produtoId: item.produtoId,
                        quantidade: item.quantidade,
                        observacoes: item.observacoes,
                    })),
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Limpar carrinho
                localStorage.removeItem('carrinho');

                // Redirecionar para acompanhamento
                router.push(`/pedido/${data.id}?comanda=${comandaCodigo}`);
            } else {
                alert('Erro ao finalizar pedido');
            }
        } catch (error) {
            alert('Erro ao finalizar pedido');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/cardapio?comanda=${comandaCodigo}`}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Carrinho</h1>
                            {comandaCodigo && (
                                <p className="text-sm text-gray-600">
                                    Comanda: <span className="font-semibold text-red-600">{comandaCodigo}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="container mx-auto px-4 py-6 pb-32">
                {itens.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Carrinho vazio</h2>
                        <p className="text-gray-600 mb-6">Adicione itens do cardápio para continuar</p>
                        <Link
                            href={`/cardapio?comanda=${comandaCodigo}`}
                            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                            Ver Cardápio
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Lista de Itens */}
                        {itens.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">{item.nome}</h3>
                                        {item.observacoes && (
                                            <p className="text-sm text-gray-600 mb-2">Obs: {item.observacoes}</p>
                                        )}
                                        <p className="text-lg font-bold text-gray-900">
                                            R$ {(item.preco * item.quantidade).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Controles */}
                                    <div className="flex flex-col items-end justify-between">
                                        <button
                                            onClick={() => removerItem(item.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => alterarQuantidade(item.id, -1)}
                                                className="w-8 h-8 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center hover:bg-red-50"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-lg font-bold w-8 text-center">{item.quantidade}</span>
                                            <button
                                                onClick={() => alterarQuantidade(item.id, 1)}
                                                className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Resumo */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Resumo do Pedido</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>R$ {calcularSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Taxa de serviço (10%)</span>
                                    <span>R$ {(calcularSubtotal() * 0.1).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>R$ {(calcularSubtotal() * 1.1).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Botão Fixo */}
            {itens.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
                    <div className="container mx-auto px-4 py-4">
                        <button
                            onClick={finalizarPedido}
                            disabled={loading}
                            className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Finalizando...
                                </>
                            ) : (
                                <>
                                    Finalizar Pedido
                                    <span>R$ {(calcularSubtotal() * 1.1).toFixed(2)}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CarrinhoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
            <CarrinhoContent />
        </Suspense>
    );
}
