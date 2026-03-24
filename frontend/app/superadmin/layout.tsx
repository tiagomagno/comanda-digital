'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Store, Users, LogOut, Settings } from 'lucide-react';

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [userName, setUserName] = useState('Super Admin');
    const [isLoading, setIsLoading] = useState(true);

    const isLoginRoute = pathname === '/superadmin/login';

    useEffect(() => {
        if (isLoginRoute) {
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/superadmin/login');
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.tipo !== 'superadmin') {
                        router.replace('/painel/admin/dashboard'); // Redireciona para o painel de admin normal
                        return;
                    }
                    if (data.nome) setUserName(data.nome);
                    setIsLoading(false);
                } else {
                    router.replace('/superadmin/login');
                }
            } catch (error) {
                console.error('Erro de autenticação SuperAdmin:', error);
                router.replace('/superadmin/login');
            }
        };

        fetchUser();
    }, [router, isLoginRoute, pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/superadmin/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Se for a tela de login, não mostra a sidebar
    if (isLoginRoute) {
        return <div className="min-h-screen bg-gray-50">{children}</div>;
    }

    const navigation = [
        { name: 'Dashboard Global', href: '/superadmin/dashboard', icon: LayoutDashboard },
        { name: 'Estabelecimentos', href: '/superadmin/estabelecimentos', icon: Store },
        { name: 'Gestores', href: '/superadmin/usuarios', icon: Users },
        { name: 'Configurações', href: '/superadmin/configuracoes', icon: Settings },
    ];

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar Exclusiva Super Admin */}
            <div className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl">
                <div className="p-6 border-b border-indigo-800">
                    <h1 className="text-xl font-black bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent flex items-center gap-2">
                        <span>🚀</span> Super Admin
                    </h1>
                    <p className="text-indigo-300 text-xs mt-1">Gestão da Plataforma</p>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    isActive 
                                    ? 'bg-indigo-700 text-white' 
                                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-300' : 'text-indigo-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-indigo-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-indigo-800/50">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                            {userName.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{userName}</p>
                            <p className="text-xs text-indigo-300">Admin Global</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
                    >
                        <LogOut className="w-5 h-5" /> Sair
                    </button>
                </div>
            </div>

            {/* Area de Conteúdo */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm sticky top-0 z-10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">
                        {navigation.find(n => pathname.startsWith(n.href))?.name || 'Super Admin'}
                    </h2>
                    <div className="text-sm text-gray-500 font-medium">
                        Ambiente de Gerenciamento da Plataforma Comanda Digital
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
