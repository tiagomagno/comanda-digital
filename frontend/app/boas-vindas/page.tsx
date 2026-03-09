'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function BoasVindasPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/auth/login');
            return;
        }

        const fetchUser = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const baseUrl = apiUrl.replace(/\/api\/?$/, '');

                const response = await fetch(`${baseUrl}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    localStorage.removeItem('token');
                    router.replace('/auth/login');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/auth/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#FF5C01] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const operaLocal = user?.estabelecimento?.operaLocal;
    const operaHospedado = user?.estabelecimento?.operaHospedado;
    const operaDelivery = user?.estabelecimento?.operaDelivery;

    const temMesas = operaLocal || operaHospedado;
    const apenasDelivery = operaDelivery && !operaLocal && !operaHospedado;

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans">
            {/* Header */}
            <header className="w-full bg-[#fdfdfd] px-8 py-4 flex items-center justify-between shadow-sm border-b border-gray-100">
                <div className="flex items-center gap-2 text-[#0B241E]">
                    <div className="w-8 h-8 bg-[#feefe6] rounded-lg flex items-center justify-center text-[#FF5C01] shadow-sm">
                        <span className="material-symbols-outlined text-lg">restaurant</span>
                    </div>
                    <span className="font-bold text-lg tracking-wide font-display text-gray-900">Comanda Digital</span>
                </div>
                <div className="flex items-center gap-6">
                    {user && (
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{user.estabelecimento?.nome || 'Meu Negócio'}</p>
                                <p className="text-xs text-gray-500">{user.nome}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#FF5C01]/10 text-[#FF5C01] font-bold flex items-center justify-center text-sm border border-[#FF5C01]/20">
                                {user.nome?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    )}
                    <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Sair
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Hero Banner */}
                <div
                    className="w-full min-h-[220px] rounded-2xl mb-8 overflow-hidden relative shadow-md"
                >
                    <img
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Restaurant"
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
                    />
                    <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end text-white relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold font-display mb-2 drop-shadow-sm">
                            Bem-vindo, {user?.nome?.split(' ')[0] || 'Gestor'}!
                        </h1>
                        <p className="text-white/90 text-sm md:text-base max-w-2xl font-light drop-shadow-sm">Estamos felizes em ter você aqui. Vamos configurar seu negócio para o sucesso.</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column (Steps) */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold font-display text-gray-900 mb-6">Comece por aqui</h2>

                        <div className="space-y-4">
                            {/* Step 0 - Completar Perfil */}
                            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-4 flex gap-6 items-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/boas-vindas/completar-perfil')}>
                                <div className="w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100 hidden sm:block relative">
                                    <div className="absolute inset-0 bg-black/5 z-10" />
                                    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" alt="Perfil" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 py-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Completar Perfil</h3>
                                    <p className="text-sm text-gray-500 font-light mb-4">Adicione o endereço, logomarca e demais informações do seu estabelecimento.</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); router.push('/boas-vindas/completar-perfil'); }}
                                        className="bg-[#FF5C01] hover:bg-[#e05101] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                                    >
                                        Continuar
                                    </button>
                                </div>
                                <div className="px-4 hidden md:block text-[#FF5C01]">
                                    <span className="material-symbols-outlined text-2xl font-light">arrow_forward</span>
                                </div>
                            </div>

                            {/* Step 1 - Cardápio */}
                            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-4 flex gap-6 items-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/produtos')}>
                                <div className="w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100 hidden sm:block relative">
                                    <div className="absolute inset-0 bg-black/5 z-10" />
                                    <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" alt="Cardápio" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 py-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Configurar meu Cardápio</h3>
                                    <p className="text-sm text-gray-500 font-light mb-4">Adicione pratos, bebidas e organize suas categorias de forma intuitiva.</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); router.push('/admin/produtos'); }}
                                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                                    >
                                        Começar
                                    </button>
                                </div>
                                <div className="px-4 hidden md:block text-[#FF5C01]">
                                    <span className="material-symbols-outlined text-2xl font-light">arrow_forward</span>
                                </div>
                            </div>

                            {/* Step 2 - Mesas (ONLY IF NOT ONLY DELIVERY) */}
                            {temMesas && (
                                <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-4 flex gap-6 items-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/mesas')}>
                                    <div className="w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100 hidden sm:block relative">
                                        <div className="absolute inset-0 bg-black/5 z-10" />
                                        <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80" alt="Mesas" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 py-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Cadastrar minhas Mesas</h3>
                                        <p className="text-sm text-gray-500 font-light mb-4">Mapeie seu salão e gere QR codes para cada mesa.</p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); router.push('/admin/mesas'); }}
                                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                                        >
                                            Configurar
                                        </button>
                                    </div>
                                    <div className="px-4 hidden md:block text-[#FF5C01]">
                                        <span className="material-symbols-outlined text-2xl font-light">arrow_forward</span>
                                    </div>
                                </div>
                            )}

                            {/* Step 3 - Equipe / Entregadores */}
                            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-4 flex gap-6 items-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/equipe')}>
                                <div className="w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100 hidden sm:block relative">
                                    <div className="absolute inset-0 bg-black/5 z-10" />
                                    <img src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&q=80" alt="Equipe" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 py-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {apenasDelivery ? 'Cadastrar Entregadores' : (operaDelivery ? 'Cadastrar Equipe e Entregadores' : 'Cadastrar Equipe')}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-light mb-4">
                                        {apenasDelivery ? 'Gerencie seus motoboys e entregadores para os pedidos.' : (operaDelivery ? 'Insira seus garçons, funcionários e motoboys.' : 'Insira seus garçons e funcionários para acesso ao sistema.')}
                                    </p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); router.push('/admin/equipe'); }}
                                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                                    >
                                        Configurar
                                    </button>
                                </div>
                                <div className="px-4 hidden md:block text-[#FF5C01]">
                                    <span className="material-symbols-outlined text-2xl font-light">arrow_forward</span>
                                </div>
                            </div>

                            {/* Step 4 - Dashboard */}
                            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-4 flex gap-6 items-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/dashboard')}>
                                <div className="w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100 hidden sm:block relative">
                                    <div className="absolute inset-0 bg-black/5 z-10" />
                                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" alt="Dashboard" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 py-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Conhecer o Dashboard</h3>
                                    <p className="text-sm text-gray-500 font-light mb-4">Veja como acompanhar suas vendas e métricas em tempo real.</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); router.push('/admin/dashboard'); }}
                                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                                    >
                                        Explorar
                                    </button>
                                </div>
                                <div className="px-4 hidden md:block text-[#FF5C01]">
                                    <span className="material-symbols-outlined text-2xl font-light">arrow_forward</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidecards) */}
                    <div className="w-full lg:w-[320px] flex flex-col gap-6">
                        {/* Progress */}
                        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-7">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-gray-900">Progresso da Configuração</h3>
                                <span className="text-[#FF5C01] font-bold text-sm">10%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-5 overflow-hidden">
                                <div className="bg-[#FF5C01] h-full rounded-full" style={{ width: '10%' }}></div>
                            </div>
                            <p className="text-[13px] text-gray-500 font-light leading-relaxed mb-6">
                                Complete seu perfil para começar a vender. Faltam poucos passos!
                            </p>

                            <ul className="space-y-4">
                                <li className="flex gap-3 items-center">
                                    <div className="w-5 h-5 rounded-full bg-[#FF5C01] flex items-center justify-center text-white shrink-0">
                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                    </div>
                                    <span className="text-sm text-gray-400 line-through">Criar conta</span>
                                </li>
                                <li className="flex gap-3 items-center">
                                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center shrink-0"></div>
                                    <span className="text-sm text-gray-700">Completar Perfil</span>
                                </li>
                                <li className="flex gap-3 items-center">
                                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center shrink-0"></div>
                                    <span className="text-sm text-gray-700">Cadastrar Cardápio</span>
                                </li>
                                {temMesas && (
                                    <li className="flex gap-3 items-center">
                                        <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center shrink-0"></div>
                                        <span className="text-sm text-gray-700">Configurar Mesas / Unidades</span>
                                    </li>
                                )}
                                <li className="flex gap-3 items-center">
                                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center shrink-0"></div>
                                    <span className="text-sm text-gray-700">{apenasDelivery ? 'Cadastrar Entregadores' : (operaDelivery ? 'Equipe e Entregadores' : 'Cadastrar Equipe')}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Tips */}
                        <div className="bg-[#fff8f3] rounded-xl border border-orange-100 p-6 flex gap-4">
                            <div className="shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-[#FF5C01] text-[20px] filled">lightbulb</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1.5">Dica Rápida</h4>
                                <p className="text-[13px] text-gray-600 font-light leading-relaxed">
                                    Capriche nas fotos dos pratos! Itens com fotos vendem até 30% mais.
                                </p>
                            </div>
                        </div>

                        {/* Fake gap filler to push chat down if needed */}
                        <div className="flex-1 min-h-[40px]"></div>

                        {/* FAQ/Help Tooltip */}
                        <div className="flex justify-end">
                            <div className="bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-gray-100 py-2.5 px-4 flex items-center gap-3 cursor-pointer hover:shadow-xl transition-shadow w-fit relative z-20">
                                <span className="text-sm font-semibold text-gray-800">Precisa de ajuda?</span>
                                <div className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-[18px]">chat</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

