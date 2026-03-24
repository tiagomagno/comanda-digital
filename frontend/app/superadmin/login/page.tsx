'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';

export default function SuperAdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErro('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await res.json();

            if (!res.ok) {
                setErro(data.error || 'Credenciais inválidas');
            } else {
                if (data.user?.role !== 'SUPERADMIN') {
                    setErro('Acesso Negado: Conta não possui privilégios de Super Administrador.');
                    return;
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/superadmin/dashboard');
            }
        } catch (error) {
            setErro('Erro de conexão com o servidor. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 relative overflow-hidden">
            {/* Decoração de Fundo */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px] opacity-20 -mr-40 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[100px] opacity-20 -ml-40 -mb-20"></div>

            <div className="w-full max-w-md p-8 bg-white rounded-[20px] shadow-2xl relative z-10 mx-4 border border-indigo-100">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4 border border-indigo-200 shadow-inner">
                        <ShieldAlert className="w-10 h-10 text-indigo-600" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600">
                        Super Admin
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Acesso restrito à gestão da plataforma</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {erro && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-3 shadow-sm">
                            <ShieldAlert className="w-5 h-5 shrink-0" />
                            <span className="font-medium">{erro}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail Corporativo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-gray-50 focus:bg-white"
                                placeholder="admin@comanda.digital"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Senha de Segurança</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'}`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Autenticando acesso...
                                </span>
                            ) : (
                                'Acessar Painel Global'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-xs text-gray-400 font-medium">
                        Ambiente protegido e monitorado.<br /> Acessos não autorizados serão registrados.
                    </p>
                </div>
            </div>
        </div>
    );
}
