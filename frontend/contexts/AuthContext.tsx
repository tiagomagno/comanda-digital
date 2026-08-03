'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types/auth';
import { authService } from '@/services/auth.service';
import Cookies from 'js-cookie';

interface AuthContextType {
    user: User | null;
    login: (codigo: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Lista de rotas que não exigem login
const PUBLIC_ROUTES = [
    '/', 
    '/auth/login', 
    '/auth/esqueci-senha', 
    '/auth/resetar-senha', 
    '/cadastro', 
    '/boas-vindas',
    '/boas-vindas/completar-perfil',
    '/acesso'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const loadUser = async () => {
            const token = Cookies.get('token');
            const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname?.startsWith('/cardapio');

            if (token) {
                try {
                    const userData = await authService.me();
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error) {
                    if (!isPublicRoute) {
                        logout();
                    } else {
                        Cookies.remove('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                }
            } else {
                if (!isPublicRoute) {
                    logout();
                } else {
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        loadUser();
    }, [pathname]);

    const login = async (codigo: string) => {
        try {
            const response = await authService.login(codigo);
            const { token, user } = response;

            if (!token) throw new Error('Token não recebido do servidor');
            if (!user)  throw new Error('Dados do usuário não recebidos do servidor');

            Cookies.set('token', token, { expires: 1 });
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            switch (user.role) {
                case 'GESTOR':
                case 'ADMIN':
                    router.push('/admin');
                    break;
                case 'GARCOM':
                    router.push('/garcom');
                    break;
                case 'COZINHA':
                    router.push('/cozinha');
                    break;
                case 'BAR':
                    router.push('/bar');
                    break;
                case 'CAIXA':
                    router.push('/caixa');
                    break;
                default:
                    router.push('/');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        const userData = localStorage.getItem('user');
        let role = '';
        try {
            if (userData) role = JSON.parse(userData)?.role ?? '';
        } catch { /* noop */ }

        Cookies.remove('token');
        localStorage.removeItem('user');
        setUser(null);

        // Operacionais voltam para /operacao/login; admin/gestor para /auth/login
        const operacionalRoles = ['GARCOM', 'COZINHA', 'BAR', 'CAIXA'];
        if (operacionalRoles.includes(role)) {
            router.push('/operacao/login');
        } else {
            router.push('/auth/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
