'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { clienteService } from '@/services/cliente.service';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, X, ChevronDown, ChevronRight, Receipt, Clock, CheckCircle, Loader2, Star } from 'lucide-react';
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
    const [pedidoMinimo, setPedidoMinimo] = useState<number | null>(null);

    // Modal de adicionais
    const [produtoModal, setProdutoModal] = useState<any | null>(null);
    const [selecoes, setSelecoes] = useState<Record<string, string[]>>({}); // grupoId → [adicionalIds]

    // Cupom
    const [cupomInput, setCupomInput] = useState('');
    const [cupomAplicado, setCupomAplicado] = useState<{ codigo: string; desconto: number; mensagem: string } | null>(null);
    const [validandoCupom, setValidandoCupom] = useState(false);

    // Módulo Fase 1: Divisão de Contas e Avaliações
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [splitOption, setSplitOption] = useState<'integral'|'pessoas'|'itens'>('integral');
    const [peopleCount, setPeopleCount] = useState(2);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [ratingAtm, setRatingAtm] = useState(0);
    const [ratingFood, setRatingFood] = useState(0);
    const [comentario, setComentario] = useState('');

    useEffect(() => {
        const loadData = async () => {
            // 1. Buscar comanda
            try {
                const comandaData = await clienteService.obterComanda(params.codigo as string);
                setComanda(comandaData);

                // 2. Buscar cardápio
                const cardapioData = await clienteService.visualizarCardapio(comandaData.estabelecimentoId);
                setCardapio(cardapioData.categorias);
                setPedidoMinimo(cardapioData.pedidoMinimo);

                if (cardapioData.categorias.length > 0) setActiveCategory(cardapioData.categorias[0].id);
            } catch (error) {
                toast.error('Erro ao carregar dados');
            } finally {
                setLoading(false);
            }
        };

        if (params.codigo) loadData();
    }, [params]);

    const addToCart = (produto: any, adicionaisIds: string[] = [], adicionaisLabels: string[] = [], adicionaisTotal = 0) => {
        // Produtos com adicionais sempre criam nova linha no carrinho (combinações diferentes)
        const temAdicionais = adicionaisIds.length > 0;
        setCarrinho(prev => {
            if (!temAdicionais) {
                const existing = prev.find(item => item.produtoId === produto.id && !item.adicionaisIds?.length);
                if (existing) {
                    return prev.map(item =>
                        item === existing ? { ...item, quantidade: item.quantidade + 1 } : item
                    );
                }
            }
            return [...prev, { produtoId: produto.id, produto, quantidade: 1, adicionaisIds, adicionaisLabels, adicionaisTotal }];
        });
        toast.success(`Adicionado: ${produto.nome}`, { duration: 1500, icon: '🛒' });
    };

    const abrirModalAdicionais = (produto: any) => {
        if (!produto.adicionalGrupos?.length) { addToCart(produto); return; }
        setSelecoes({});
        setProdutoModal(produto);
    };

    const handleSelecionar = (grupoId: string, adicionalId: string, maxSelecoes: number) => {
        setSelecoes(prev => {
            const atual = prev[grupoId] ?? [];
            if (atual.includes(adicionalId)) {
                return { ...prev, [grupoId]: atual.filter(id => id !== adicionalId) };
            }
            if (maxSelecoes === 1) return { ...prev, [grupoId]: [adicionalId] };
            if (atual.length >= maxSelecoes) return prev;
            return { ...prev, [grupoId]: [...atual, adicionalId] };
        });
    };

    const confirmarAdicionais = () => {
        if (!produtoModal) return;
        // Valida grupos obrigatórios
        for (const grupo of produtoModal.adicionalGrupos) {
            if (grupo.obrigatorio && !(selecoes[grupo.id]?.length)) {
                toast.error(`Selecione uma opção em "${grupo.nome}"`);
                return;
            }
        }
        // Monta lista de adicional IDs e labels
        const todosIds: string[] = [];
        const todosLabels: string[] = [];
        let totalAdicionais = 0;
        for (const grupo of produtoModal.adicionalGrupos) {
            for (const opcaoId of selecoes[grupo.id] ?? []) {
                const opcao = grupo.opcoes.find((o: any) => o.id === opcaoId);
                if (opcao) {
                    todosIds.push(opcao.id);
                    todosLabels.push(Number(opcao.preco) > 0 ? `${opcao.nome} (+R$${Number(opcao.preco).toFixed(2)})` : opcao.nome);
                    totalAdicionais += Number(opcao.preco);
                }
            }
        }
        addToCart(produtoModal, todosIds, todosLabels, totalAdicionais);
        setProdutoModal(null);
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
                    observacoes: item.observacoes,
                    adicionaisIds: item.adicionaisIds?.length ? item.adicionaisIds : undefined,
                })),
                cupomCodigo: cupomAplicado?.codigo,
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

    const handlePagarParcial = async () => {
        setPaymentLoading(true);
        const valorPago = splitOption === 'pessoas' 
            ? (Number(comanda.totalAcumulado) / peopleCount) 
            : Number(comanda.totalAcumulado);
        
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/pagamentos-parciais/${comanda.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telefoneCliente: comanda.telefoneCliente,
                    nomeCliente: comanda.nomeCliente,
                    valor: valorPago,
                    metodoPagamento: 'pix'
                })
            });
            toast.success('Pagamento registrado com sucesso!');
            setShowPaymentModal(false);
            setShowRatingModal(true);
        } catch (e) {
            toast.error('Erro ao pagar');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleAvaliar = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/avaliacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estabelecimentoId: comanda.estabelecimentoId,
                    comandaId: comanda.id,
                    notaAtendimento: ratingAtm,
                    notaComida: ratingFood,
                    comentario
                })
            });
            toast.success('Obrigado pela sua avaliação! 🌟');
            setShowRatingModal(false);
        } catch(e) {
            toast.error('Erro ao salvar avaliação');
        }
    };

    const cartTotal = carrinho.reduce((acc, item) => {
        const preco = item.produto.precoPromocional || item.produto.preco;
        return acc + ((Number(preco) + (item.adicionaisTotal ?? 0)) * item.quantidade);
    }, 0);

    const cartCount = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

    const aplicarCupom = async () => {
        if (!cupomInput.trim() || !comanda) return;
        setValidandoCupom(true);
        try {
            const resultado = await clienteService.validarCupom({
                codigo: cupomInput.trim().toUpperCase(),
                estabelecimentoId: comanda.estabelecimentoId,
                total: cartTotal,
            });
            setCupomAplicado({ codigo: cupomInput.trim().toUpperCase(), desconto: resultado.desconto, mensagem: resultado.mensagem });
            toast.success(resultado.mensagem, { icon: '🎟️' });
        } catch (e: any) {
            toast.error(e?.response?.data?.error || 'Cupom inválido');
            setCupomAplicado(null);
        } finally {
            setValidandoCupom(false);
        }
    };

    const isDelivery = comanda?.tipoComanda === 'delivery';
    const abaixoDoMinimo = isDelivery && pedidoMinimo !== null && carrinho.length > 0 && cartTotal < pedidoMinimo;
    const faltaParaMinimo = pedidoMinimo !== null ? Math.max(0, pedidoMinimo - cartTotal) : 0;
    const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

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
                                                onClick={() => abrirModalAdicionais(prod)}
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
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-800">{item.produto.nome}</p>
                                            {item.adicionaisLabels?.length > 0 && (
                                                <p className="text-gray-400 text-xs mt-0.5 leading-snug">
                                                    {item.adicionaisLabels.join(' · ')}
                                                </p>
                                            )}
                                            <p className="text-blue-600 text-sm font-medium mt-0.5">
                                                {formatBRL((Number(item.produto.precoPromocional || item.produto.preco) + (item.adicionaisTotal ?? 0)) * item.quantidade)}
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
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-medium text-gray-900">Total da Comanda</span>
                                        <span className="font-bold text-xl text-green-600">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(comanda.totalAcumulado))}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="w-full bg-blue-100 text-blue-700 py-3 rounded-xl font-bold mb-2 hover:bg-blue-200 transition-colors"
                                    >
                                        Dividir e Pagar Conta
                                    </button>
                                    <Link href={`/cliente/comanda/${params.codigo}/historico`} className="text-gray-500 text-sm mt-2 block text-center">Ver histórico detalhado</Link>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-t-2xl">
                            {/* Input de cupom */}
                            {!cupomAplicado ? (
                                <div className="flex gap-2 mb-3">
                                    <input
                                        value={cupomInput}
                                        onChange={e => setCupomInput(e.target.value.toUpperCase())}
                                        onKeyDown={e => e.key === 'Enter' && aplicarCupom()}
                                        placeholder="Código do cupom"
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-white"
                                    />
                                    <button
                                        onClick={aplicarCupom}
                                        disabled={validandoCupom || !cupomInput.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {validandoCupom ? '...' : 'Aplicar'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between mb-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                                    <div>
                                        <p className="text-xs font-bold text-green-700">🎟️ {cupomAplicado.codigo}</p>
                                        <p className="text-xs text-green-600">{cupomAplicado.mensagem}</p>
                                    </div>
                                    <button onClick={() => { setCupomAplicado(null); setCupomInput(''); }} className="text-green-400 hover:text-green-700 text-sm font-bold">✕</button>
                                </div>
                            )}

                            {abaixoDoMinimo && (
                                <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                                    <span className="material-symbols-outlined text-amber-500 text-base mt-0.5">info</span>
                                    <p className="text-amber-700 text-sm leading-snug">
                                        Pedido mínimo: <strong>{formatBRL(pedidoMinimo!)}</strong>
                                        <br />
                                        <span className="text-amber-600">Faltam <strong>{formatBRL(faltaParaMinimo)}</strong> para continuar</span>
                                    </p>
                                </div>
                            )}
                            {cupomAplicado && (
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-gray-500">{formatBRL(cartTotal)}</span>
                                </div>
                            )}
                            {cupomAplicado && (
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="text-green-600 font-medium">Desconto</span>
                                    <span className="text-green-600 font-medium">- {formatBRL(cupomAplicado.desconto)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium text-gray-600">Total do Pedido</span>
                                <span className="font-bold text-xl text-gray-900">
                                    {formatBRL(Math.max(0, cartTotal - (cupomAplicado?.desconto ?? 0)))}
                                </span>
                            </div>
                            <button
                                onClick={enviarPedido}
                                disabled={sending || carrinho.length === 0 || abaixoDoMinimo}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-transform active:scale-95"
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

            {/* Modal Adicionais */}
            {produtoModal && (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-70 flex flex-col justify-end">
                    <div className="bg-white rounded-t-2xl max-h-[90vh] flex flex-col shadow-xl">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{produtoModal.nome}</h2>
                                <p className="text-sm text-gray-500">Personalize seu pedido</p>
                            </div>
                            <button onClick={() => setProdutoModal(null)} className="bg-gray-100 p-2 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-4 flex-1 space-y-5">
                            {produtoModal.adicionalGrupos.map((grupo: any) => {
                                const selecionados = selecoes[grupo.id] ?? [];
                                const isSingle = grupo.maxSelecoes === 1;
                                return (
                                    <div key={grupo.id}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-gray-800">{grupo.nome}</h3>
                                            {grupo.obrigatorio
                                                ? <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Obrigatório</span>
                                                : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Opcional</span>
                                            }
                                            {grupo.maxSelecoes > 1 && (
                                                <span className="text-xs text-gray-400">Até {grupo.maxSelecoes}</span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {grupo.opcoes.map((opcao: any) => {
                                                const sel = selecionados.includes(opcao.id);
                                                return (
                                                    <button
                                                        key={opcao.id}
                                                        onClick={() => handleSelecionar(grupo.id, opcao.id, grupo.maxSelecoes)}
                                                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${sel ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sel ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                                                {sel && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                                            </div>
                                                            <span className="font-medium text-gray-800">{opcao.nome}</span>
                                                        </div>
                                                        {Number(opcao.preco) > 0 && (
                                                            <span className="text-blue-600 font-bold text-sm">
                                                                +{formatBRL(Number(opcao.preco))}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            {(() => {
                                const totalAdic = produtoModal.adicionalGrupos.flatMap((g: any) =>
                                    (selecoes[g.id] ?? []).map((id: string) => {
                                        const op = g.opcoes.find((o: any) => o.id === id);
                                        return Number(op?.preco ?? 0);
                                    })
                                ).reduce((s: number, v: number) => s + v, 0);
                                const precoBase = Number(produtoModal.precoPromocional || produtoModal.preco);
                                return (
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-gray-600 font-medium">Total do item</span>
                                        <span className="font-bold text-lg text-gray-900">{formatBRL(precoBase + totalAdic)}</span>
                                    </div>
                                );
                            })()}
                            <button
                                onClick={confirmarAdicionais}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors active:scale-95"
                            >
                                Adicionar ao Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Pagamento / Divisão de Conta */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Como deseja pagar?</h2>
                            <button onClick={() => setShowPaymentModal(false)}><X className="text-gray-500" /></button>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer ${splitOption === 'integral' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                <input type="radio" name="split" value="integral" onChange={() => setSplitOption('integral')} checked={splitOption === 'integral'} className="w-5 h-5 text-blue-600 mr-3" />
                                <div>
                                    <p className="font-bold text-gray-900">Valor Integral</p>
                                    <p className="text-gray-500 text-sm">Pagar a conta inteira</p>
                                </div>
                            </label>
                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer ${splitOption === 'pessoas' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                <input type="radio" name="split" value="pessoas" onChange={() => setSplitOption('pessoas')} checked={splitOption === 'pessoas'} className="w-5 h-5 text-blue-600 mr-3" />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">Dividir igualmente</p>
                                    <p className="text-gray-500 text-sm">Dividir por quantidade de pessoas</p>
                                </div>
                            </label>
                        </div>

                        {splitOption === 'pessoas' && (
                            <div className="mb-6 bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                                <span className="font-medium text-gray-700">Número de pessoas</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setPeopleCount(Math.max(2, peopleCount - 1))} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">-</button>
                                    <span className="font-bold text-xl">{peopleCount}</span>
                                    <button onClick={() => setPeopleCount(peopleCount + 1)} className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">+</button>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mb-6">
                            <span className="text-gray-600 font-medium">Sua parte:</span>
                            <span className="text-3xl font-black text-green-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(splitOption === 'pessoas' ? (Number(comanda.totalAcumulado) / peopleCount) : Number(comanda.totalAcumulado))}
                            </span>
                        </div>

                        <button onClick={handlePagarParcial} disabled={paymentLoading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-70">
                            {paymentLoading ? 'Processando...' : 'Pagar via PIX'}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Avaliação / Review */}
            {showRatingModal && (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center animate-slide-up">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Registrado!</h2>
                        <p className="text-gray-500 mb-8">Como foi sua experiência com a gente hoje?</p>
                        
                        <div className="space-y-6 text-left mb-8">
                            <div>
                                <p className="font-medium text-gray-700 mb-2 text-center">Atendimento</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} onClick={() => setRatingAtm(star)} className="focus:outline-none transition-transform hover:scale-110 active:scale-95">
                                            <Star className={`w-10 h-10 ${ratingAtm >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700 mb-2 text-center">Comida / Qualidade</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} onClick={() => setRatingFood(star)} className="focus:outline-none transition-transform hover:scale-110 active:scale-95">
                                            <Star className={`w-10 h-10 ${ratingFood >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <p className="font-medium text-gray-700 mb-2">Comentários (Opcional)</p>
                                <textarea 
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                    rows={3} 
                                    placeholder="O que você mais gostou?"
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <button onClick={handleAvaliar} disabled={ratingAtm === 0 || ratingFood === 0} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition active:scale-95">
                            Enviar Avaliação
                        </button>
                        <button onClick={() => setShowRatingModal(false)} className="w-full text-gray-500 font-medium py-3 mt-2 hover:text-gray-800">
                            Pular
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
