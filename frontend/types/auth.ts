export type UserRole = 'ADMIN' | 'GESTOR' | 'GARCOM' | 'COZINHA' | 'BAR' | 'CAIXA' | 'CLIENTE';

export interface User {
    id: string;
    nome: string;
    email?: string;
    role: UserRole;
    estabelecimentoId: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
