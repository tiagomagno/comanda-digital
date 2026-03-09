'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { clienteService } from '@/services/cliente.service';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, X, ChevronDown, ChevronRight, Receipt, Clock, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CardapioPage() {
    const params = useParams();
    const [comanda, setComanda] = useState<any>(null);
    const [cardapio, setCardapio] = useState<any[]>([]);
    const [carrinho, setCarrinho] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [showCarrinho, setShowCarrinho] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            // 1. Buscar comanda
            try {
                const comandaData = await clienteService.obterComanda(params.codigo as string);
                setComanda(comandaData);

                // 2. Buscar cardápio
                const cardapioData = await clienteService.visualizarCardapio(comandaData.estabelecimentoId);
                setCardapio(cardapioData);

                if (cardapioData.length > 0) setActiveCategory(cardapioData[0].id);
            } catch (error) {
                toast.error('Erro ao carregar dados');
            } finally {
                setLoading(false);
            }
        };

        if (params.codigo) loadData();
    }, [params]);

    const addToCart = (produto: any) => {
        setCarrinho(prev => {
            const existing = prev.find(item => item.produtoId === produto.id);
            if (existing) {
                return prev.map(item =>
                    item.produtoId === produto.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                );
            }
            return [...prev, { produtoId: produto.id, produto, quantidade: 1 }];
        });
        toast.success(`Adicionado: ${produto.nome}`, { duration: 1500, icon: '🛒' });
    };

    const updateQuantity = (produtoId: string, delta: number) => {
        setCarrinho(prev => prev.map(item => {
            if (item.produtoId === produtoId) {
                const newQty = item.quantidade + delta;
                return newQty > 0 ? { ...item, quantidade: newQty } : item;
            }
            return item;
        }));
    };

    const removeItem = (produtoId: string) => {
        setCarrinho(prev => prev.filter(item => item.produtoId !== produtoId));
    };

    const enviarPedido = async () => {
        if (carrinho.length === 0) return;
        setSending(true);
        try {
            await clienteService.criarPedido({
                comandaId: comanda.id,
                itens: carrinho.map(item => ({
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    observacoes: item.observacoes
                }))
            });
            toast.success('Pedido enviado para a cozinha! 👨‍🍳');
            setCarrinho([]);
            setShowCarrinho(false);

            // Recarregar comanda para ver histórico
            const comandaData = await clienteService.obterComanda(params.codigo as string);
            setComanda(comandaData);
        } catch (error) {
            toast.error('Erro ao enviar pedido');
        } finally {
            setSending(false);
        }
    };

    const cartTotal = carrinho.reduce((acc, item) => {
        const preco = item.produto.precoPromocional || item.produto.preco;
        return acc + (Number(preco) * item.quantidade);
    }, 0);

    const cartCount = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

    if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!comanda) return <div className="p-8 text-center text-gray-500">Comanda não encontrada</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-20 shadow-sm">
                <div className="px-4 py-3 flex justify-between items-center">
                    <div>
                        <h1 className="font-bold text-gray-900">Mesa {comanda.mesaRelacao?.numero}</h1>
                        <p className="text-xs text-gray-500">Olá, {comanda.nomeCliente}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCarrinho(!showCarrinho)}
                            className="relative p-2 bg-blue-50 rounded-full text-blue-600"
                        >
                            <Receipt className="w-6 h-6" />
                            {comanda.pedidos?.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {comanda.pedidos.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Categorias Tabs */}
                <div className="flex overflow-x-auto gap-2 px-4 pb-3 scrollbar-hide">
                    {cardapio.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200'
                                }`}
                        >
                            {cat.nome}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Produtos */}
            <div className="px-4 py-4 space-y-6">
                {cardapio.map(cat => (
                    <div key={cat.id} id={cat.id} className={activeCategory === cat.id ? 'block' : 'hidden'}>
                        <h2 className="font-bold text-lg text-gray-800 mb-3">{cat.nome}</h2>
                        <div className="space-y-4">
                            {cat.produtos.map((prod: any) => (
                                <div key={prod.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                                    {prod.imagemUrl && (
                                        <div className="w-24 h-24 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                                            <img src={prod.imagemUrl} alt={prod.nome} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight mb-1">{prod.nome}</h3>
                                            <p className="text-gray-500 text-xs line-clamp-2">{prod.descricao}</p>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="font-bold text-blue-600 text-lg">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(prod.precoPromocional || prod.preco))}
                                                {prod.precoPromocional && (
                                                    <span className="text-gray-400 text-xs line-through ml-2">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(prod.preco))}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => addToCart(prod)}
                                                className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Floating Cart */}
            {carrinho.length > 0 && !showCarrinho && (
                <div className="fixed bottom-4 left-4 right-4 z-30">
                    <button
                        onClick={() => setShowCarrinho(true)}
                        className="w-full bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-200 flex justify-between items-center"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                {cartCount}
                            </div>
                            <span className="font-semibold">Ver Carrinho</span>
                        </div>
                        <span className="font-bold text-lg">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                        </span>
                    </button>
                </div>
            )}

            {/* Modal/Drawer Carrinho */}
            {showCarrinho && (
                <div className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 flex flex-col justify-end">
                    <div className="bg-white rounded-t-2xl max-h-[90vh] flex flex-col shadow-xl animate-slide-up">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-blue-600" />
                                Seu Pedido
                            </h2>
                            <button onClick={() => setShowCarrinho(false)} className="bg-gray-100 p-2 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-4 flex-1 space-y-4">
                            {carrinho.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    Seu carrinho está vazio
                                </div>
                            ) : (
                                carrinho.map(item => (
                                    <div key={item.produtoId} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{item.produto.nome}</p>
                                            <p className="text-blue-600 text-sm font-medium">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.produto.precoPromocional || item.produto.preco) * item.quantidade)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                            <button
                                                onClick={() => item.quantidade > 1 ? updateQuantity(item.produtoId, -1) : removeItem(item.produtoId)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 font-bold disabled:opacity-50"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold w-4 text-center">{item.quantidade}</span>
                                            <button
                                                onClick={() => updateQuantity(item.produtoId, 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-blue-600 font-bold"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Histórico Recente (Resumo) */}
                            {comanda.pedidos.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 text-xs">Total Consumido</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">Total da Comanda</span>
                                        <span className="font-bold text-xl text-green-600">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(comanda.totalAcumulado))}
                                        </span>
                                    </div>
                                    <Link href="#" className="text-blue-600 text-sm mt-2 block text-center">Ver histórico detalhado</Link>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-t-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium text-gray-600">Total do Pedido</span>
                                <span className="font-bold text-xl text-gray-900">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                                </span>
                            </div>
                            <button
                                onClick={enviarPedido}
                                disabled={sending || carrinho.length === 0}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-700 disabled:opacity-70 flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                                {sending ? (
                                    <>Enviando... <Loader2 className="animate-spin" /></>
                                ) : (
                                    <>Confirmar Pedido <CheckCircle className="w-6 h-6" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
