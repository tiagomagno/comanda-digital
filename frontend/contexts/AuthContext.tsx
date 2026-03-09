'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            const token = Cookies.get('token');
            if (token) {
                try {
                    // Aqui poderíamos ter um endpoint /me no backend para validar o token e atualizar o user
                    // Por enquanto vamos assumir que se tem token, está logado, mas o ideal é persistir o user
                    // ou buscar do backend.
                    const userData = localStorage.getItem('user');
                    if (userData) {
                        setUser(JSON.parse(userData));
                    }
                } catch (error) {
                    logout();
                }
            }
            setIsLoading(false);
        };
        loadUser();
    }, []);

    const login = async (codigo: string) => {
        try {
            console.log('🚀 Starting login with code:', codigo);
            const response = await authService.login(codigo);
            console.log('🔐 Login response:', response);

            const { token, user } = response;

            console.log('🔑 Token:', token);
            console.log('👤 User:', user);

            if (!token) {
                throw new Error('Token not received from backend');
            }

            if (!user) {
                throw new Error('User data not received from backend');
            }

            try {
                Cookies.set('token', token, { expires: 1 }); // 1 dia
                console.log('✅ Token saved to cookies');
            } catch (cookieError) {
                console.error('❌ Error saving token to cookies:', cookieError);
            }

            try {
                localStorage.setItem('user', JSON.stringify(user));
                console.log('✅ User saved to localStorage');
            } catch (storageError) {
                console.error('❌ Error saving user to localStorage:', storageError);
            }

            try {
                localStorage.setItem('token', token); // Para o axios interceptor
                console.log('✅ Token saved to localStorage');
            } catch (storageError) {
                console.error('❌ Error saving token to localStorage:', storageError);
            }

            setUser(user);
            console.log('✅ User state updated');

            // Pequeno delay para garantir que o localStorage seja persistido
            await new Promise(resolve => setTimeout(resolve, 100));

            // Redirecionamento baseado no role
            console.log('🔄 Redirecting based on role:', user.role);
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
        localStorage.removeItem('token');
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
