'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Comanda {
    id: string;
    codigo: string;
    nomeCliente: string;
    mesaRelacao?: { numero: string };
    totalEstimado: number;
}

type MetodoPagamento = 'pix' | 'credito' | 'debito' | 'dinheiro';

interface OpcaoPagamento {
    id: MetodoPagamento;
    label: string;
    icon: string;
    descricao: string;
}

const OPCOES: OpcaoPagamento[] = [
    { id: 'pix', label: 'PIX', icon: 'qr_code_2', descricao: 'Pagamento instantâneo' },
    { id: 'credito', label: 'Crédito', icon: 'credit_card', descricao: 'À vista ou parcelado' },
    { id: 'debito', label: 'Débito', icon: 'credit_score', descricao: 'Débito em conta' },
    { id: 'dinheiro', label: 'Dinheiro', icon: 'payments', descricao: 'Pagamento em espécie' },
];

// ─── Chave PIX fake (substituir pela real da API) ─────────────────────────────
const CHAVE_PIX_ESTABELECIMENTO = '00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986';

// ─── Painel PIX ───────────────────────────────────────────────────────────────

function PainelPix({ total }: { total: number }) {
    const [copiado, setCopiado] = useState(false);
    const pixPayload = `${CHAVE_PIX_ESTABELECIMENTO}5802BR5925Cardapio Digital Ltda6009SAO PAULO62070503***6304`;

    const copiar = () => {
        navigator.clipboard.writeText(pixPayload);
        setCopiado(true);
        toast.success('Código PIX copiado!');
        setTimeout(() => setCopiado(false), 3000);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center">
                <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                    <QRCodeSVG
                        value={pixPayload}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                        level="M"
                        includeMargin={false}
                    />
                </div>
                <p className="text-sm text-slate-500 mt-3 text-center">
                    Escaneie o QR Code com o app do seu banco
                </p>
            </div>

            {/* Divisor */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">ou copie o código</span>
                <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Copia e cola */}
            <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">PIX Copia e Cola</p>
                <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 font-mono truncate">
                        {pixPayload.slice(0, 44)}...
                    </div>
                    <button
                        onClick={copiar}
                        className={`flex-shrink-0 px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${copiado
                            ? 'bg-green-500 text-white'
                            : 'bg-[#FF6B00] hover:bg-orange-600 text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">{copiado ? 'check' : 'content_copy'}</span>
                        {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                </div>
            </div>

            {/* Valor */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Valor a pagar</span>
                <span className="text-xl font-black text-[#FF6B00]">R$ {total.toFixed(2)}</span>
            </div>

            {/* Instrução */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <span className="material-symbols-outlined text-blue-500 flex-shrink-0 text-xl">info</span>
                <p className="text-xs text-blue-700 leading-relaxed">
                    Após o pagamento, o sistema confirmará automaticamente em alguns segundos. Não feche esta tela.
                </p>
            </div>
        </div>
    );
}

// ─── Painel Cartão ─────────────────────────────────────────────────────────────

function PainelCartao({ tipo }: { tipo: 'credito' | 'debito' }) {
    const [numero, setNumero] = useState('');
    const [nome, setNome] = useState('');
    const [validade, setValidade] = useState('');
    const [cvv, setCvv] = useState('');

    const formatarNumero = (v: string) => {
        const digits = v.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatarValidade = (v: string) => {
        const digits = v.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        return digits;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            {/* Preview do cartão */}
            <div className={`w-full aspect-[1.586/1] rounded-2xl p-5 flex flex-col justify-between text-white shadow-xl ${tipo === 'credito'
                ? 'bg-gradient-to-br from-slate-800 to-slate-950'
                : 'bg-gradient-to-br from-[#FF6B00] to-orange-800'
                }`}>
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-70">
                        {tipo === 'credito' ? 'Crédito' : 'Débito'}
                    </span>
                    <span className="material-symbols-outlined text-3xl opacity-60">credit_card</span>
                </div>
                <div>
                    <p className="font-mono text-lg tracking-widest mb-3 opacity-90">
                        {numero || '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] uppercase opacity-50 mb-0.5">Titular</p>
                            <p className="text-sm font-semibold tracking-wide uppercase">{nome || 'NOME DO TITULAR'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase opacity-50 mb-0.5">Validade</p>
                            <p className="text-sm font-mono">{validade || 'MM/AA'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Número */}
            <div>
                <label className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5" htmlFor="card-numero">
                    Número do Cartão
                </label>
                <input
                    id="card-numero"
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={numero}
                    onChange={(e) => setNumero(formatarNumero(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                />
            </div>

            {/* Nome */}
            <div>
                <label className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5" htmlFor="card-nome">
                    Nome do Titular
                </label>
                <input
                    id="card-nome"
                    type="text"
                    placeholder="Como está no cartão"
                    value={nome}
                    onChange={(e) => setNome(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent uppercase"
                />
            </div>

            {/* Validade + CVV */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5" htmlFor="card-validade">
                        Validade
                    </label>
                    <input
                        id="card-validade"
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/AA"
                        value={validade}
                        onChange={(e) => setValidade(formatarValidade(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5" htmlFor="card-cvv">
                        CVV
                    </label>
                    <input
                        id="card-cvv"
                        type="text"
                        inputMode="numeric"
                        placeholder="•••"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                    />
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="material-symbols-outlined text-slate-400 flex-shrink-0 text-xl">lock</span>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Seus dados são criptografados e protegidos. Não armazenamos informações do cartão.
                </p>
            </div>
        </div>
    );
}

// ─── Painel Dinheiro ──────────────────────────────────────────────────────────

function PainelDinheiro({ total, comanda }: { total: number; comanda: Comanda | null }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            {/* Ilustração */}
            <div className="flex flex-col items-center py-4">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <span className="material-symbols-outlined text-green-500" style={{ fontSize: 52 }}>payments</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Pague no Caixa</h3>
                <p className="text-sm text-slate-500 text-center leading-relaxed">
                    Dirija-se ao caixa com os dados abaixo para realizar o pagamento em dinheiro.
                </p>
            </div>

            {/* Dados para o caixa */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                <div className="flex justify-between items-center px-5 py-4">
                    <span className="text-sm text-slate-500">Cliente</span>
                    <span className="text-sm font-bold text-slate-800">{comanda?.nomeCliente}</span>
                </div>
                <div className="flex justify-between items-center px-5 py-4">
                    <span className="text-sm text-slate-500">Comanda</span>
                    <span className="text-sm font-bold text-[#FF6B00] tracking-widest">{comanda?.codigo}</span>
                </div>
                {comanda?.mesaRelacao && (
                    <div className="flex justify-between items-center px-5 py-4">
                        <span className="text-sm text-slate-500">Mesa</span>
                        <span className="text-sm font-bold text-slate-800">{comanda.mesaRelacao.numero}</span>
                    </div>
                )}
                <div className="flex justify-between items-center px-5 py-4 bg-orange-50">
                    <span className="text-sm font-bold text-slate-700">Total a pagar</span>
                    <span className="text-2xl font-black text-[#FF6B00]">R$ {total.toFixed(2)}</span>
                </div>
            </div>

            {/* Alerta */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="material-symbols-outlined text-amber-500 flex-shrink-0 text-xl">warning</span>
                <p className="text-xs text-amber-700 leading-relaxed">
                    Após clicar em <strong>"Confirmar Pagamento"</strong>, um atendente irá até você ou você poderá se dirigir ao caixa.
                </p>
            </div>
        </div>
    );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

function PagamentoContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const comandaCodigo = searchParams.get('comanda');

    const [comanda, setComanda] = useState<Comanda | null>(null);
    const [loading, setLoading] = useState(true);
    const [metodo, setMetodo] = useState<MetodoPagamento | null>(null);
    const [confirmando, setConfirmando] = useState(false);

    useEffect(() => {
        if (comandaCodigo) carregarComanda();
    }, [comandaCodigo]);

    const carregarComanda = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/comandas/codigo/${comandaCodigo}`);
            if (res.ok) {
                const data = await res.json();
                setComanda({ ...data, totalEstimado: Number(data.totalEstimado) });
            } else {
                toast.error('Comanda não encontrada');
            }
        } catch {
            toast.error('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const confirmarPagamento = async () => {
        if (!metodo) { toast.error('Selecione um método de pagamento'); return; }
        setConfirmando(true);
        try {
            // TODO: chamar API para fechar comanda
            // await fetch(`http://localhost:3001/api/comandas/${comanda?.id}/fechar`, { method: 'POST', body: JSON.stringify({ metodo }) })
            toast.success('Pagamento registrado! Obrigado! 🎉');
            setTimeout(() => router.push('/comanda/nova'), 1500);
        } catch {
            toast.error('Erro ao processar pagamento');
        } finally {
            setConfirmando(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Carregando...</p>
                </div>
            </div>
        );
    }

    const total = comanda?.totalEstimado ?? 0;

    return (
        <div
            className="bg-[#F8FAFC] text-slate-900 min-h-screen"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Voltar"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Pagamento
                        </h1>
                        {comandaCodigo && (
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                Comanda: <span className="text-[#FF6B00] font-bold">{comandaCodigo}</span>
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Conteúdo ────────────────────────────────────────────────── */}
            <main className="max-w-2xl mx-auto px-4 py-6 pb-48 space-y-6">

                {/* Resumo da comanda */}
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Cliente</p>
                            <p className="text-lg font-semibold text-slate-900">{comanda?.nomeCliente}</p>
                        </div>
                        {comanda?.mesaRelacao && (
                            <div className="bg-slate-100 rounded-xl px-3 py-2 text-center">
                                <p className="text-xs text-slate-400 font-bold uppercase">Mesa</p>
                                <p className="text-base font-bold text-slate-700">{comanda.mesaRelacao.numero}</p>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                        <p className="text-sm font-semibold text-slate-500">Total a pagar</p>
                        <p className="text-4xl font-black text-[#FF6B00]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            R$ {total.toFixed(2)}
                        </p>
                    </div>
                </section>

                {/* Seleção de método */}
                <section>
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-1">
                        Forma de Pagamento
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {OPCOES.map((opcao) => {
                            const ativo = metodo === opcao.id;
                            return (
                                <button
                                    key={opcao.id}
                                    onClick={() => setMetodo(opcao.id)}
                                    className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left ${ativo
                                        ? 'border-[#FF6B00] bg-orange-50 shadow-md shadow-orange-100'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${ativo ? 'bg-[#FF6B00] text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <span className="material-symbols-outlined text-2xl">{opcao.icon}</span>
                                    </div>
                                    <p className={`font-bold text-sm ${ativo ? 'text-[#FF6B00]' : 'text-slate-800'}`}>{opcao.label}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{opcao.descricao}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ── Painel do método selecionado ── */}
                {metodo === 'pix' && <PainelPix total={total} />}
                {(metodo === 'credito' || metodo === 'debito') && <PainelCartao tipo={metodo} />}
                {metodo === 'dinheiro' && <PainelDinheiro total={total} comanda={comanda} />}
            </main>

            {/* ── Footer Fixo ──────────────────────────────────────────────── */}
            <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-4 pb-8 shadow-lg">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-baseline mb-4">
                        <p className="text-slate-500 text-sm font-medium">Total</p>
                        <p className="text-2xl font-black text-[#FF6B00]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            R$ {total.toFixed(2)}
                        </p>
                    </div>
                    <button
                        id="btn-confirmar-pagamento"
                        onClick={confirmarPagamento}
                        disabled={!metodo || confirmando}
                        className="w-full bg-[#FF6B00] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                    >
                        {confirmando ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">check_circle</span>
                                {metodo === 'dinheiro' ? 'Solicitar Atendente' : 'Confirmar Pagamento'}
                            </>
                        )}
                    </button>
                </div>
            </footer>
        </div>
    );
}

export default function PagamentoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
            <PagamentoContent />
        </Suspense>
    );
}
