'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginAdminPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !senha.trim()) {
            toast.error('Por favor, preencha e-mail e senha');
            return;
        }

        setIsLoading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        try {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const errMsg =
                    typeof data.error === 'string'
                        ? data.error
                        : data.error?.message || data.message || 'Credenciais inválidas';
                throw new Error(errMsg);
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            toast.success('Bem-vindo!');
            window.location.href = '/admin/dashboard';
        } catch (error: any) {
            const rawMsg = error?.message ?? error;
            const msg = typeof rawMsg === 'string' ? rawMsg : 'Erro ao realizar login';
            if (msg.includes('fetch') || error?.name === 'TypeError') {
                toast.error('Não foi possível conectar ao servidor.');
            } else {
                toast.error(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#F8F9FA] h-screen overflow-hidden flex flex-row font-sans">

            {/* ── Painel esquerdo: formulário ── */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white flex flex-col relative z-10">

                {/* Logo */}
                <div className="px-8 pt-8 lg:px-16 xl:px-24">
                    <div className="flex items-center gap-2 text-[#0B241E]">
                        <div className="w-8 h-8 bg-[#FF5C01] rounded-lg flex items-center justify-center text-white shadow-sm">
                            <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                        </div>
                        <span className="font-bold text-xl tracking-wide font-display">Comanda Digital</span>
                    </div>
                </div>

                {/* Formulário */}
                <div className="flex-grow flex flex-col justify-center px-8 py-8 lg:px-16 xl:px-24">
                    <div className="mb-10 max-w-md mx-auto w-full">
                        <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
                            Acesse sua conta
                        </h1>
                        <p className="text-gray-500 text-lg font-light">
                            Por favor, insira seus dados de acesso
                        </p>
                    </div>

                    <form
                        className="flex flex-col max-w-md mx-auto w-full space-y-6"
                        onSubmit={handleSubmit}
                    >
                        {/* E-mail */}
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

                        {/* Senha */}
                        <div>
                            <label
                                className="block text-sm font-semibold text-gray-700 mb-2"
                                htmlFor="password"
                            >
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01] focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none pr-12"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword
                                        ? <EyeOff className="h-5 w-5" />
                                        : <Eye className="h-5 w-5" />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <Link
                                href="/"
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
                                    : 'Entrar'
                                }
                            </button>
                        </div>

                        {/* Links adicionais */}
                        <div className="text-center pt-2 space-y-2">
                            <Link
                                href="/cadastro"
                                className="block text-gray-400 hover:text-gray-600 text-sm transition-colors"
                            >
                                Ainda não tem uma conta?{' '}
                                <span className="text-[#FF5C01] font-semibold hover:underline">
                                    Cadastre-se aqui
                                </span>
                            </Link>
                            <Link
                                href="/operacao/login"
                                className="block text-gray-400 hover:text-gray-600 text-sm transition-colors"
                            >
                                É da equipe?{' '}
                                <span className="text-[#FF5C01] font-semibold hover:underline">
                                    Acesso operacional
                                </span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── Painel direito: cor sólida ── */}
            <div className="hidden lg:flex lg:w-1/2 h-full bg-[#0B241E] flex-col items-center justify-center gap-8 relative overflow-hidden">

                {/* Círculos decorativos */}
                <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-[#14423b] opacity-60" />
                <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-[#14423b] opacity-40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-white/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-white/5" />

                {/* Card central */}
                <div className="relative z-10 flex flex-col items-center gap-6 text-center px-12">
                    <div className="w-20 h-20 bg-[#FF5C01] rounded-2xl flex items-center justify-center shadow-2xl">
                        <span className="material-symbols-outlined text-white text-4xl">restaurant_menu</span>
                    </div>
                    <div>
                        <span className="block font-bold text-4xl tracking-wide font-display text-white">
                            Comanda Digital
                        </span>
                        <span className="block text-white/60 text-base font-light tracking-wider mt-2">
                            Gestão Inteligente para Restaurantes
                        </span>
                    </div>

                    {/* Mini features */}
                    <div className="mt-4 flex flex-col gap-3 w-full max-w-xs text-left">
                        {[
                            { icon: 'receipt_long', text: 'Comandas digitais em tempo real' },
                            { icon: 'groups', text: 'Controle por garçom, bar e cozinha' },
                            { icon: 'bar_chart', text: 'Relatórios e gestão simplificada' },
                        ].map(({ icon, text }) => (
                            <div key={icon} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[#FF5C01] text-lg">{icon}</span>
                                </div>
                                <span className="text-white/70 text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
