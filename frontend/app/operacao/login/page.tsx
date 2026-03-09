'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { ChefHat, Loader2, Hash } from 'lucide-react';
import Link from 'next/link';

export default function OperacaoLoginPage() {
    const [codigo, setCodigo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!codigo.trim()) {
            toast.error('Por favor, digite seu código de acesso');
            return;
        }

        setIsLoading(true);
        try {
            await login(codigo);
            toast.success('Acesso liberado!');
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.error || 'Código inválido ou sem permissão';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-950 via-stone-900 to-slate-900 px-4">
            {/* Decorative blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/3 w-60 h-60 bg-orange-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-sm w-full">
                {/* Header badge */}
                <div className="flex justify-center mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-semibold tracking-wide uppercase">
                        <ChefHat className="h-3.5 w-3.5" />
                        Acesso Operacional
                    </span>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
                    <div className="text-center">
                        <div className="mx-auto h-14 w-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/30">
                            <ChefHat className="h-7 w-7 text-amber-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            Equipe Operacional
                        </h1>
                        <p className="text-stone-400 text-sm mt-1">
                            Garçom · Bar · Cozinha
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-stone-400 mb-1.5">
                                Código de acesso
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                                <input
                                    type="text"
                                    required
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all tracking-widest font-mono uppercase"
                                    placeholder="Ex: GARCOM01"
                                    disabled={isLoading}
                                    autoComplete="off"
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-stone-500 mt-1.5">
                                Use o código fornecido pelo seu gestor.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>
                </div>

                {/* Link para admin */}
                <p className="text-center text-stone-500 text-sm mt-6">
                    É administrador?{' '}
                    <Link
                        href="/auth/login"
                        className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                    >
                        Acesse o painel de gestão →
                    </Link>
                </p>
            </div>
        </div>
    );
}
