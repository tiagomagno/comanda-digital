'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EsqueciSenhaPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Informe seu e-mail');
            return;
        }

        setIsLoading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        try {
            const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errMsg = typeof data.error === 'string'
                    ? data.error
                    : data.error?.message || data.message || 'Erro ao processar solicitação';
                throw new Error(errMsg);
            }

            toast.success(data.message);

            if (data.resetToken) {
                window.location.href = `/auth/resetar-senha?token=${encodeURIComponent(data.resetToken)}`;
            } else {
                toast.success('Verifique seu e-mail para redefinir a senha.');
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Não foi possível conectar ao servidor.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#F8F9FA] h-screen overflow-hidden flex flex-row font-sans">
            <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white flex flex-col relative z-10">
                <div className="px-8 pt-8 lg:px-16 xl:px-24">
                    <div className="flex items-center gap-2 text-[#0B241E]">
                        <div className="w-8 h-8 bg-[#FF5C01] rounded-lg flex items-center justify-center text-white shadow-sm">
                            <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                        </div>
                        <span className="font-bold text-xl tracking-wide font-display">Comanda Digital</span>
                    </div>
                </div>

                <div className="flex-grow flex flex-col justify-center px-8 py-8 lg:px-16 xl:px-24">
                    <div className="mb-10 max-w-md mx-auto w-full">
                        <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
                            Esqueceu a senha?
                        </h1>
                        <p className="text-gray-500 text-lg font-light">
                            Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
                        </p>
                    </div>

                    <form
                        className="flex flex-col max-w-md mx-auto w-full space-y-6"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <label
                                className="block text-sm font-semibold text-gray-700 mb-2"
                                htmlFor="email"
                            >
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemplo@email.com"
                                disabled={isLoading}
                                autoComplete="email"
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01] focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <Link
                                href="/auth/login"
                                className="flex items-center justify-center border-2 border-[#FFAD7D] text-[#FF5C01] font-semibold py-3.5 px-6 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                            >
                                Voltar
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-black text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading
                                    ? <Loader2 className="animate-spin h-5 w-5" />
                                    : 'Enviar'
                                }
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <Link
                                href="/auth/login"
                                className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
                            >
                                Lembrou a senha?{' '}
                                <span className="text-[#FF5C01] font-semibold hover:underline">
                                    Voltar ao login
                                </span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 h-full bg-[#0B241E] flex-col items-center justify-center gap-8 relative overflow-hidden">
                <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-[#14423b] opacity-60" />
                <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-[#14423b] opacity-40" />
                <div className="relative z-10 flex flex-col items-center gap-6 text-center px-12">
                    <div className="w-20 h-20 bg-[#FF5C01] rounded-2xl flex items-center justify-center shadow-2xl">
                        <span className="material-symbols-outlined text-white text-4xl">lock_reset</span>
                    </div>
                    <div>
                        <span className="block font-bold text-2xl text-white">
                            Recuperação de senha
                        </span>
                        <span className="block text-white/60 text-base mt-2">
                            Siga as instruções enviadas para redefinir sua senha com segurança.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
