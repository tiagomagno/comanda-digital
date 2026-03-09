'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusPedido =
    | 'criado'
    | 'aguardando_pagamento'
    | 'pago'
    | 'em_preparo'
    | 'pronto'
    | 'entregue'
    | 'cancelado';

interface ItemPedido {
    id: string;
    quantidade: number;
    precoUnitario: number;
    produto: { nome: string; preco: number };
}

interface Pedido {
    id: string;
    numeroPedido: number;
    status: StatusPedido;
    itens: ItemPedido[];
    observacoes?: string;
    createdAt: string;
}

interface Comanda {
    id: string;
    codigo: string;
    nomeCliente: string;
    mesaRelacao?: { numero: string };
    pedidos: Pedido[];
    totalEstimado: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface StatusInfo {
    label: string;
    icon: string;
    badgeClass: string;
    description: string;
    stepIndex: number;        // 0 = recebido, 1 = preparo, 2 = pronto, 3 = entregue
}

function getStatusInfo(status: StatusPedido): StatusInfo {
    switch (status) {
        case 'criado':
            return { label: 'Recebido', icon: 'assignment_turned_in', badgeClass: 'bg-orange-100 text-[#FF6B00]', description: 'Seu pedido foi recebido e está na fila', stepIndex: 0 };
        case 'aguardando_pagamento':
            return { label: 'Aguardando Pagamento', icon: 'schedule', badgeClass: 'bg-yellow-100 text-yellow-700', description: 'Aguardando confirmação do pagamento', stepIndex: 0 };
        case 'pago':
            return { label: 'Pago', icon: 'check_circle', badgeClass: 'bg-green-100 text-green-700', description: 'Pagamento confirmado, entrando em preparo', stepIndex: 1 };
        case 'em_preparo':
            return { label: 'Em Preparo', icon: 'restaurant', badgeClass: 'bg-orange-100 text-[#FF6B00]', description: 'Estamos preparando seu pedido!', stepIndex: 1 };
        case 'pronto':
            return { label: 'Pronto', icon: 'check_circle', badgeClass: 'bg-green-100 text-green-700', description: 'Seu pedido está pronto para retirada!', stepIndex: 2 };
        case 'entregue':
            return { label: 'Entregue', icon: 'done_all', badgeClass: 'bg-blue-100 text-blue-700', description: 'Pedido entregue. Bom apetite! 🍽️', stepIndex: 3 };
        case 'cancelado':
            return { label: 'Cancelado', icon: 'cancel', badgeClass: 'bg-red-100 text-red-600', description: 'Este pedido foi cancelado', stepIndex: -1 };
        default:
            return { label: 'Aguardando', icon: 'schedule', badgeClass: 'bg-slate-100 text-slate-500', description: 'Aguardando confirmação', stepIndex: 0 };
    }
}

// ─── Componente: Stepper de Status ────────────────────────────────────────────

const STEPS = [
    { label: 'Recebido', icon: 'assignment_turned_in' },
    { label: 'Em Preparo', icon: 'restaurant' },
    { label: 'Pronto', icon: 'check_circle' },
    { label: 'Entregue', icon: 'done_all' },
];

function StatusStepper({ stepIndex }: { stepIndex: number }) {
    const progress = stepIndex < 0 ? 0 : Math.min((stepIndex / (STEPS.length - 1)) * 100, 100);

    return (
        <div className="relative flex justify-between mb-8 px-2">
            {/* Trilha */}
            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
            <div
                className="absolute top-5 left-0 h-1 bg-[#FF6B00] -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${progress}%` }}
            />

            {STEPS.map((step, i) => {
                const done = i <= stepIndex;
                return (
                    <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white transition-colors duration-300 ${done
                                ? 'bg-[#FF6B00] text-white'
                                : 'bg-slate-100 text-slate-400'
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">{step.icon}</span>
                        </div>
                        <span className={`text-[10px] font-bold text-center leading-tight max-w-[60px] ${done ? 'text-[#FF6B00]' : 'text-slate-400'}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Componente: Card de Pedido ───────────────────────────────────────────────

function PedidoCard({ pedido, index }: { pedido: Pedido; index: number }) {
    const info = getStatusInfo(pedido.status);
    const subtotal = pedido.itens.reduce(
        (s, i) => s + Number(i.precoUnitario || i.produto.preco) * i.quantidade,
        0
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h3 className="text-base font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Status do Pedido #{index + 1}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${info.badgeClass}`}>
                    {info.label}
                </span>
            </div>

            {/* Stepper */}
            <div className="px-6 pt-6 pb-2">
                <StatusStepper stepIndex={info.stepIndex} />
            </div>

            {/* Mensagem de status */}
            <div className="mx-6 mb-5 flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="material-symbols-outlined text-[#FF6B00] animate-pulse">schedule</span>
                <p className="text-sm font-medium text-slate-600">{info.description}</p>
            </div>

            {/* Itens */}
            <div className="px-6 pb-5 space-y-2">
                {pedido.itens.map((item) => {
                    const preco = Number(item.precoUnitario || item.produto.preco);
                    return (
                        <div
                            key={item.id}
                            className="flex items-center justify-between border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF6B00] font-bold text-sm flex-shrink-0">
                                    {item.quantidade}x
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 text-sm">{item.produto.nome}</h4>
                                    <p className="text-xs text-slate-400">R$ {preco.toFixed(2)} cada</p>
                                </div>
                            </div>
                            <p className="font-bold text-slate-900 text-sm">
                                R$ {(preco * item.quantidade).toFixed(2)}
                            </p>
                        </div>
                    );
                })}

                {pedido.observacoes && (
                    <p className="text-xs text-slate-400 italic px-1 pt-1">Obs: {pedido.observacoes}</p>
                )}
            </div>
        </div>
    );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

function AcompanharPedidoContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const comandaCodigo = searchParams.get('comanda');

    const [comanda, setComanda] = useState<Comanda | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFecharModal, setShowFecharModal] = useState(false);

    const carregarComanda = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/comandas/codigo/${comandaCodigo}`);
            if (response.ok) {
                const data = await response.json();
                setComanda({ ...data, totalEstimado: Number(data.totalEstimado) });
            } else {
                toast.error('Erro ao carregar comanda');
            }
        } catch {
            toast.error('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (comandaCodigo) {
            carregarComanda();
            const interval = setInterval(carregarComanda, 10000);
            return () => clearInterval(interval);
        }
    }, [comandaCodigo]);

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Carregando pedidos...</p>
                </div>
            </div>
        );
    }

    if (!comanda) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
                <div className="text-center">
                    <span className="material-symbols-outlined text-slate-300 text-7xl block mb-4">receipt_long</span>
                    <p className="text-slate-500 mb-4">Comanda não encontrada</p>
                    <button onClick={() => router.push('/')} className="text-[#FF6B00] font-bold">
                        Voltar ao início
                    </button>
                </div>
            </div>
        );
    }

    const totalItens = comanda.pedidos.reduce((s, p) => s + p.itens.reduce((si, i) => si + i.quantidade, 0), 0);

    return (
        <div
            className="bg-[#F8FAFC] text-slate-900 min-h-screen"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap');
                @keyframes pulse-green {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                }
                .animate-pulse-green { animation: pulse-green 2s ease-in-out infinite; }
            `}</style>

            <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">

                {/* ── Header ───────────────────────────────────────────── */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/cardapio?comanda=${comandaCodigo}`)}
                            className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                            aria-label="Voltar"
                        >
                            <span className="material-symbols-outlined text-2xl">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Meus Pedidos
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">
                                Comanda:{' '}
                                <span className="text-[#FF6B00] font-bold">{comanda.codigo}</span>
                                {comanda.mesaRelacao && ` · Mesa ${comanda.mesaRelacao.numero}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={carregarComanda}
                        className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                        aria-label="Atualizar"
                    >
                        <span className="material-symbols-outlined text-slate-500">refresh</span>
                    </button>
                </header>

                {/* ── Card Resumo ───────────────────────────────────────── */}
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Cliente</p>
                        <h2 className="text-xl font-semibold">{comanda.nomeCliente}</h2>
                    </div>
                    <div className="md:text-right">
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Total Consumido</p>
                        <p className="text-3xl font-bold text-[#FF6B00]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            R$ {comanda.totalEstimado.toFixed(2)}
                        </p>
                    </div>
                </section>

                {/* ── Pedidos ──────────────────────────────────────────── */}
                {comanda.pedidos.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-slate-300 text-7xl block mb-4">receipt_long</span>
                        <p className="text-slate-500 mb-6">Nenhum pedido ainda</p>
                        <button
                            onClick={() => router.push(`/cardapio?comanda=${comandaCodigo}`)}
                            className="bg-[#FF6B00] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                        >
                            Fazer Pedido
                        </button>
                    </div>
                ) : (
                    <>
                        <section className="space-y-6 mb-36">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">
                                Itens Solicitados
                            </h3>
                            {comanda.pedidos.map((pedido, index) => (
                                <PedidoCard key={pedido.id} pedido={pedido} index={index} />
                            ))}
                        </section>

                        {/* ── Footer Fixo ──────────────────────────────── */}
                        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#F8FAFC] border-t border-slate-200 p-4 md:p-6 shadow-lg">
                            <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
                                <button
                                    id="btn-novo-pedido"
                                    onClick={() => router.push(`/cardapio?comanda=${comandaCodigo}`)}
                                    className="w-full bg-[#FF6B00] hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Fazer Novo Pedido
                                </button>

                                <button
                                    id="btn-fechar-comanda"
                                    onClick={() => setShowFecharModal(true)}
                                    className="w-full bg-white hover:bg-red-50 border border-red-200 text-red-600 font-bold py-3.5 px-8 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-xl">receipt</span>
                                    Fechar Comanda
                                </button>

                                {/* Indicador de auto-refresh */}
                                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 animate-pulse-green" />
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        Atualizando automaticamente
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Modal: Confirmar Fechamento ───────────────── */}
                        {showFecharModal && (
                            <div
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
                                onClick={() => setShowFecharModal(false)}
                            >
                                <div
                                    className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Ícone */}
                                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                        <span className="material-symbols-outlined text-red-500 text-4xl">receipt_long</span>
                                    </div>

                                    {/* Título */}
                                    <h2 className="text-xl font-bold text-center text-slate-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Fechar Comanda?
                                    </h2>
                                    <p className="text-sm text-slate-500 text-center mb-6">
                                        Você será direcionado para a tela de pagamento e não poderá fazer novos pedidos.
                                    </p>

                                    {/* Resumo */}
                                    <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Cliente</span>
                                            <span className="font-semibold text-slate-800">{comanda?.nomeCliente}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Comanda</span>
                                            <span className="font-semibold text-[#FF6B00]">{comanda?.codigo}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                                            <span className="text-slate-700 font-semibold">Total a pagar</span>
                                            <span className="text-xl font-black text-slate-900">
                                                R$ {comanda?.totalEstimado.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Botões */}
                                    <div className="flex flex-col gap-3">
                                        <button
                                            id="btn-confirmar-fechar"
                                            onClick={() => router.push(`/pedido/pagamento?comanda=${comandaCodigo}`)}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">payments</span>
                                            Ir para Pagamento
                                        </button>
                                        <button
                                            onClick={() => setShowFecharModal(false)}
                                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function AcompanharPedidoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
            <AcompanharPedidoContent />
        </Suspense>
    );
}
