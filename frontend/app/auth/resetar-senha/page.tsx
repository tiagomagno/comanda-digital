'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ResetarSenhaPage() {
    const searchParams = useSearchParams();
    const tokenFromUrl = searchParams.get('token');

    const [token, setToken] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (tokenFromUrl) setToken(tokenFromUrl);
    }, [tokenFromUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token.trim()) {
            toast.error('Token inválido. Solicite novamente a recuperação de senha.');
            return;
        }

        if (novaSenha.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            toast.error('As senhas não coincidem');
            return;
        }

        setIsLoading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        try {
            const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, novaSenha }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errMsg = typeof data.error === 'string'
                    ? data.error
                    : data.error?.message || data.message || 'Erro ao redefinir senha';
                throw new Error(errMsg);
            }

            toast.success(data.message);
            window.location.href = '/auth/login';
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Não foi possível conectar ao servidor.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!tokenFromUrl && !token) {
        return (
            <div className="bg-[#F8F9FA] min-h-screen flex items-center justify-center p-8">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-amber-600 text-3xl">link_off</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Link inválido</h1>
                    <p className="text-gray-500 mb-6">
                        O link de recuperação de senha está ausente ou expirado. Solicite novamente em Esqueci a senha.
                    </p>
                    <Link
                        href="/auth/esqueci-senha"
                        className="inline-flex items-center justify-center bg-[#FF5C01] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#e55200] transition-colors"
                    >
                        Solicitar novamente
                    </Link>
                </div>
            </div>
        );
    }

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
                            Nova senha
                        </h1>
                        <p className="text-gray-500 text-lg font-light">
                            Digite e confirme sua nova senha.
                        </p>
                    </div>

                    <form
                        className="flex flex-col max-w-md mx-auto w-full space-y-6"
                        onSubmit={handleSubmit}
                    >
                        {!tokenFromUrl && (
                            <div>
                                <label
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                    htmlFor="token"
                                >
                                    Token
                                </label>
                                <input
                                    id="token"
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Cole o token recebido por e-mail"
                                    disabled={isLoading}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01] focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none"
                                />
                            </div>
                        )}

                        <div>
                            <label
                                className="block text-sm font-semibold text-gray-700 mb-2"
                                htmlFor="novaSenha"
                            >
                                Nova senha
                            </label>
                            <div className="relative">
                                <input
                                    id="novaSenha"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                    minLength={6}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01] focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none pr-12"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                className="block text-sm font-semibold text-gray-700 mb-2"
                                htmlFor="confirmarSenha"
                            >
                                Confirmar nova senha
                            </label>
                            <input
                                id="confirmarSenha"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                placeholder="Repita a senha"
                                disabled={isLoading}
                                autoComplete="new-password"
                                minLength={6}
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01] focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <Link
                                href="/auth/login"
                                className="flex items-center justify-center border-2 border-[#FFAD7D] text-[#FF5C01] font-semibold py-3.5 px-6 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-black text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading
                                    ? <Loader2 className="animate-spin h-5 w-5" />
                                    : 'Redefinir senha'
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 h-full bg-[#0B241E] flex-col items-center justify-center gap-8 relative overflow-hidden">
                <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-[#14423b] opacity-60" />
                <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-[#14423b] opacity-40" />
                <div className="relative z-10 flex flex-col items-center gap-6 text-center px-12">
                    <div className="w-20 h-20 bg-[#FF5C01] rounded-2xl flex items-center justify-center shadow-2xl">
                        <span className="material-symbols-outlined text-white text-4xl">password</span>
                    </div>
                    <div>
                        <span className="block font-bold text-2xl text-white">
                            Defina uma senha forte
                        </span>
                        <span className="block text-white/60 text-base mt-2">
                            Use letras, números e caracteres especiais para maior segurança.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
