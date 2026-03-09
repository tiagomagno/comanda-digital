'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ItemCarrinho {
    produtoId: string;
    nome: string;
    preco: number;
    quantidade: number;
    imagemUrl?: string;
    observacoes?: string;
}

// ─── Card de Item ─────────────────────────────────────────────────────────────

function ItemCard({
    item,
    index,
    onAlterar,
    onRemover,
}: {
    item: ItemCarrinho;
    index: number;
    onAlterar: (index: number, delta: number) => void;
    onRemover: (index: number) => void;
}) {
    const subtotal = item.preco * item.quantidade;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                {item.imagemUrl ? (
                    <img
                        src={item.imagemUrl}
                        alt={item.nome}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="material-symbols-outlined text-slate-300 text-3xl">restaurant</span>
                )}
            </div>

            {/* Conteúdo */}
            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                        <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">{item.nome}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                            R$ {item.preco.toFixed(2)} × {item.quantidade}
                        </p>
                    </div>
                    <button
                        onClick={() => onRemover(index)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                        aria-label="Remover item"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {item.observacoes && (
                    <p className="text-xs text-slate-400 mt-1 italic">Obs: {item.observacoes}</p>
                )}

                <div className="mt-3 flex justify-between items-center">
                    {/* Controles */}
                    <div className="flex items-center bg-slate-50 rounded-full p-1 border border-slate-200">
                        <button
                            onClick={() => onAlterar(index, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-shadow"
                            aria-label="Diminuir quantidade"
                        >
                            <span className="material-symbols-outlined text-lg">remove</span>
                        </button>
                        <span className="px-4 font-bold text-sm">{item.quantidade}</span>
                        <button
                            onClick={() => onAlterar(index, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-shadow"
                            aria-label="Aumentar quantidade"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                    </div>

                    {/* Subtotal */}
                    <span className="font-bold text-slate-900">R$ {subtotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

function ConfirmarPedidoContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const comandaCodigo = searchParams.get('comanda');

    const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
    const [observacaoGeral, setObservacaoGeral] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const carrinhoSalvo = localStorage.getItem('carrinho');
        if (carrinhoSalvo) {
            setCarrinho(JSON.parse(carrinhoSalvo));
        } else {
            toast.error('Carrinho vazio');
            router.push(`/cardapio?comanda=${comandaCodigo}`);
        }
    }, []);

    const alterarQuantidade = (index: number, delta: number) => {
        const novo = [...carrinho];
        novo[index].quantidade += delta;
        if (novo[index].quantidade <= 0) novo.splice(index, 1);
        setCarrinho(novo);
        localStorage.setItem('carrinho', JSON.stringify(novo));
    };

    const removerItem = (index: number) => {
        const novo = carrinho.filter((_, i) => i !== index);
        setCarrinho(novo);
        localStorage.setItem('carrinho', JSON.stringify(novo));
        toast.success('Item removido');
    };

    const calcularTotal = () =>
        carrinho.reduce((t, i) => t + i.preco * i.quantidade, 0);

    const totalItens = carrinho.reduce((s, i) => s + i.quantidade, 0);

    const finalizarPedido = async () => {
        if (carrinho.length === 0) { toast.error('Adicione itens ao pedido'); return; }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comandaCodigo,
                    itens: carrinho.map(i => ({
                        produtoId: i.produtoId,
                        quantidade: i.quantidade,
                        observacoes: i.observacoes,
                    })),
                    observacoes: observacaoGeral,
                }),
            });

            if (response.ok) {
                toast.success('Pedido enviado com sucesso!');
                localStorage.removeItem('carrinho');
                router.push(`/pedido/acompanhar?comanda=${comandaCodigo}`);
            } else {
                toast.error('Erro ao enviar pedido');
            }
        } catch {
            toast.error('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="bg-[#F8F9FA] text-slate-900 min-h-screen flex flex-col"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Voltar"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="ml-4">
                        <h1 className="text-xl font-bold tracking-tight">Confirmar Pedido</h1>
                        {comandaCodigo && (
                            <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">
                                Comanda: {comandaCodigo}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Main ─────────────────────────────────────────────────────── */}
            <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-6 pb-48">

                {/* Itens */}
                <section className="mb-8">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Seus Itens ({totalItens})
                    </h2>
                    <div className="space-y-3">
                        {carrinho.map((item, index) => (
                            <ItemCard
                                key={index}
                                item={item}
                                index={index}
                                onAlterar={alterarQuantidade}
                                onRemover={removerItem}
                            />
                        ))}

                        {carrinho.length === 0 && (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-slate-300 text-6xl block mb-3">
                                    shopping_cart
                                </span>
                                <p className="text-slate-500">Nenhum item no carrinho</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Observações */}
                <section className="mb-8">
                    <label
                        htmlFor="obs"
                        className="block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2"
                    >
                        Observações do Pedido
                    </label>
                    <textarea
                        id="obs"
                        value={observacaoGeral}
                        onChange={(e) => setObservacaoGeral(e.target.value)}
                        rows={3}
                        placeholder="Ex: Sem cebola, bem passado, etc..."
                        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C01] focus:border-transparent transition-all resize-none shadow-sm"
                    />
                </section>

                {/* Banner tempo de preparo */}
                <section className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
                    <div className="bg-blue-500/10 p-2 rounded-full text-blue-600 flex-shrink-0">
                        <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">Tempo de Preparo</h4>
                        <p className="text-xs text-blue-700 leading-relaxed mt-0.5">
                            Seu pedido será preparado em aproximadamente 15-30 minutos.
                            Você pode acompanhar o status em tempo real.
                        </p>
                    </div>
                </section>
            </main>

            {/* ── Footer Fixo ──────────────────────────────────────────────── */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-4 pb-8">
                <div className="max-w-2xl mx-auto">
                    {/* Total */}
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total do Pedido</p>
                            <p className="text-xs text-slate-400">
                                {totalItens} {totalItens === 1 ? 'item' : 'itens'}
                            </p>
                        </div>
                        <span className="text-2xl font-black text-[#FF5C01]">
                            R$ {calcularTotal().toFixed(2)}
                        </span>
                    </div>

                    {/* Botão confirmar */}
                    <button
                        id="btn-confirmar-pedido"
                        onClick={finalizarPedido}
                        disabled={loading || carrinho.length === 0}
                        className="w-full bg-[#FF5C01] hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">check_circle</span>
                                Confirmar Pedido
                            </>
                        )}
                    </button>

                    {/* Link adicionar mais itens */}
                    <div className="text-center mt-4">
                        <Link
                            href={`/cardapio?comanda=${comandaCodigo}`}
                            className="text-sm font-bold text-[#FF5C01] hover:underline underline-offset-4"
                        >
                            Adicionar mais itens
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function ConfirmarPedidoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
            <ConfirmarPedidoContent />
        </Suspense>
    );
}
