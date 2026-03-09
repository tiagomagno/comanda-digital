'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PaymentChoice from '@/components/PaymentChoice';

// ─── Helper ───────────────────────────────────────────────────────────────────

function mascararTelefone(valor: string): string {
    const digits = valor.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'cliente' | 'admin';
type StepCliente = 'dados' | 'pagamento';

// ─── Página ───────────────────────────────────────────────────────────────────

function NovaComandaContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mesaUrl = searchParams.get('mesa');

    // --- Estado geral ---
    const [dark, setDark] = useState(false);
    const [tab, setTab] = useState<Tab>('cliente');

    // --- Estado fluxo cliente ---
    const [stepCliente, setStepCliente] = useState<StepCliente>('dados');
    const [loadingCliente, setLoadingCliente] = useState(false);
    const [formCliente, setFormCliente] = useState({ nomeCliente: '', telefoneCliente: '' });

    // --- Estado fluxo admin ---
    const [loadingAdmin, setLoadingAdmin] = useState(false);
    const [formAdmin, setFormAdmin] = useState({ email: '', senha: '' });

    // ── Handlers cliente ─────────────────────────────────────────────────────

    const handleContinuarParaPagamento = (e: React.FormEvent) => {
        e.preventDefault();
        if (formCliente.nomeCliente && formCliente.telefoneCliente) setStepCliente('pagamento');
    };

    const handleSelecionarPagamento = (formaPagamento: 'imediato' | 'final') => {
        handleSubmitCliente(formaPagamento);
    };

    const handleSubmitCliente = async (formaPagamento: 'imediato' | 'final') => {
        setLoadingCliente(true);
        try {
            const response = await fetch('http://localhost:3001/api/comandas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nomeCliente: formCliente.nomeCliente,
                    telefoneCliente: formCliente.telefoneCliente,
                    formaPagamento,
                    estabelecimentoId: 'estab-seed-001',
                }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(`Comanda criada! ${formaPagamento === 'imediato' ? '💳' : '📋'}`);
                localStorage.setItem('comandaCodigo', data.codigo);
                localStorage.setItem('comandaId', data.id);
                localStorage.setItem('formaPagamento', formaPagamento);
                if (mesaUrl) localStorage.setItem('mesa', mesaUrl);
                router.push(`/cardapio?comanda=${data.codigo}`);
            } else {
                const msg = typeof data.error === 'string' ? data.error : data.error?.message || data.message || 'Erro ao criar comanda';
                toast.error(msg);
            }
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Erro ao conectar com o servidor');
        } finally {
            setLoadingCliente(false);
        }
    };

    // ── Handler admin ─────────────────────────────────────────────────────────

    const handleSubmitAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAdmin(true);
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formAdmin),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Acesso autorizado!');
                router.push('/painel/admin/dashboard');
            } else {
                toast.error(data.message || 'Credenciais inválidas');
            }
        } catch {
            toast.error('Erro ao conectar com o servidor');
        } finally {
            setLoadingAdmin(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className={dark ? 'dark' : ''}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                .tab-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            `}</style>

            <div className="bg-[#F8F9FA] dark:bg-[#0F172A] font-[Inter,sans-serif] min-h-screen flex items-center justify-center p-4 transition-colors duration-300">

                <div className={`w-full transition-all duration-300 ${stepCliente === 'pagamento' && tab === 'cliente' ? 'max-w-2xl' : 'max-w-md'}`}>

                    {/* ── Card principal ──────────────────────────────────── */}
                    <div className="bg-white dark:bg-slate-900 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden p-8 md:p-10">

                        {/* ── Header ──────────────────────────────────────── */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-[#FF5C01]/10 flex items-center justify-center rounded-2xl mb-4">
                                <span className="material-icons-round text-[#FF5C01] text-4xl">restaurant_menu</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Comanda Digital
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                                {tab === 'cliente'
                                    ? stepCliente === 'dados' ? 'Crie sua comanda para começar' : 'Escolha como deseja pagar'
                                    : 'Acesso ao painel administrativo'}
                            </p>
                        </div>

                        {/* ── Tab switcher ────────────────────────────────── */}
                        {stepCliente === 'dados' && (
                            <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl mb-8">
                                <button
                                    id="btn-tab-cliente"
                                    onClick={() => setTab('cliente')}
                                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg tab-transition ${tab === 'cliente'
                                        ? 'bg-white dark:bg-slate-700 text-[#FF5C01] shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Criar Comanda
                                </button>
                                <button
                                    id="btn-tab-admin"
                                    onClick={() => setTab('admin')}
                                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg tab-transition ${tab === 'admin'
                                        ? 'bg-white dark:bg-slate-700 text-[#FF5C01] shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Admin
                                </button>
                            </div>
                        )}

                        {/* ══ TAB: CRIAR COMANDA ══════════════════════════════ */}
                        {tab === 'cliente' && (
                            <>
                                {/* Step: Dados */}
                                {stepCliente === 'dados' && (
                                    <div className="space-y-6">
                                        {/* Nome */}
                                        <div>
                                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nome completo
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                                    <span className="material-icons-round text-xl">person</span>
                                                </span>
                                                <input
                                                    id="nome"
                                                    type="text"
                                                    required
                                                    value={formCliente.nomeCliente}
                                                    onChange={(e) => setFormCliente({ ...formCliente, nomeCliente: e.target.value })}
                                                    placeholder="Ex: João Silva"
                                                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] transition-all outline-none text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Telefone */}
                                        <div>
                                            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Telefone
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                                    <span className="material-icons-round text-xl">phone</span>
                                                </span>
                                                <input
                                                    id="telefone"
                                                    type="tel"
                                                    required
                                                    value={formCliente.telefoneCliente}
                                                    onChange={(e) => setFormCliente({ ...formCliente, telefoneCliente: mascararTelefone(e.target.value) })}
                                                    maxLength={15}
                                                    placeholder="(11) 98765-4321"
                                                    inputMode="numeric"
                                                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] transition-all outline-none text-sm"
                                                />
                                            </div>
                                        </div>

                                        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                                            Seus dados são usados apenas para identificar seu pedido.
                                        </p>

                                        <button
                                            onClick={handleContinuarParaPagamento as unknown as React.MouseEventHandler}
                                            disabled={!formCliente.nomeCliente || !formCliente.telefoneCliente}
                                            className="w-full mt-2 bg-[#FF5C01] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#FF5C01]/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            <span className="material-icons-round">arrow_forward</span>
                                            Continuar
                                        </button>
                                    </div>
                                )}

                                {/* Step: Pagamento */}
                                {stepCliente === 'pagamento' && (
                                    <div>
                                        <button
                                            onClick={() => setStepCliente('dados')}
                                            className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#FF5C01] transition-colors"
                                        >
                                            <span className="material-icons-round text-base">arrow_back</span>
                                            Voltar
                                        </button>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                            Olá, <span className="font-semibold text-gray-800 dark:text-white">{formCliente.nomeCliente}</span>! Como deseja pagar?
                                        </p>
                                        <PaymentChoice
                                            onSelect={handleSelecionarPagamento}
                                            loading={loadingCliente}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* ══ TAB: ADMIN ══════════════════════════════════════ */}
                        {tab === 'admin' && (
                            <form onSubmit={handleSubmitAdmin} className="space-y-4">
                                {/* E-mail */}
                                <div>
                                    <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        E-mail
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <span className="material-icons-round text-xl">alternate_email</span>
                                        </span>
                                        <input
                                            id="admin-email"
                                            type="email"
                                            required
                                            value={formAdmin.email}
                                            onChange={(e) => setFormAdmin({ ...formAdmin, email: e.target.value })}
                                            placeholder="admin@exemplo.com"
                                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] transition-all outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Senha */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label htmlFor="admin-senha" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Senha
                                        </label>
                                        <Link
                                            href="#"
                                            className="text-xs font-semibold text-[#FF5C01] hover:text-orange-600 transition-colors"
                                        >
                                            Esqueceu a senha?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <span className="material-icons-round text-xl">lock_open</span>
                                        </span>
                                        <input
                                            id="admin-senha"
                                            type="password"
                                            required
                                            value={formAdmin.senha}
                                            onChange={(e) => setFormAdmin({ ...formAdmin, senha: e.target.value })}
                                            placeholder="••••••••"
                                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] transition-all outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loadingAdmin}
                                    className="w-full mt-6 bg-[#FF5C01] hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#FF5C01]/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {loadingAdmin ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Entrando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons-round">login</span>
                                            Entrar
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* ── Footer do card ───────────────────────────────── */}
                        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tab === 'cliente'
                                    ? 'Você também pode escanear o QR Code na mesa para abrir a comanda automaticamente.'
                                    : 'Ainda não tem acesso? Escaneie o QR Code na mesa ou procure o gerente.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Dark Mode toggle (fixed) ─────────────────────────────── */}
                <button
                    aria-label="Alternar modo escuro"
                    onClick={() => setDark(!dark)}
                    className="fixed bottom-6 right-6 p-3 bg-white dark:bg-slate-800 shadow-xl rounded-full border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform"
                >
                    {dark
                        ? <span className="material-icons-round">light_mode</span>
                        : <span className="material-icons-round">dark_mode</span>
                    }
                </button>
            </div>
        </div>
    );
}

export default function NovaComandaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
            <NovaComandaContent />
        </Suspense>
    );
}
