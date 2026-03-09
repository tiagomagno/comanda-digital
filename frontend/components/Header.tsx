'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface HeaderProps {
    userName?: string;
    userRole?: string;
}

export default function Header({ userName, userRole }: HeaderProps) {
    const router = useRouter();

    const handleLogout = () => {
        // Limpa todos os dados do localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('comandaCodigo');
        localStorage.removeItem('comandaId');
        localStorage.removeItem('formaPagamento');
        localStorage.removeItem('mesa');

        toast.success('Logout realizado com sucesso!');

        // Redireciona para login
        router.push('/auth/login');
    };

    return (
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Info do Usuário */}
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        {userName && (
                            <p className="text-sm font-semibold text-gray-900">
                                {userName}
                            </p>
                        )}
                        {userRole && (
                            <p className="text-xs text-gray-500">
                                {userRole}
                            </p>
                        )}
                    </div>
                </div>

                {/* Botão de Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    Sair
                </button>
            </div>
        </div>
    );
}
