import { api } from './api';
import { AuthResponse, User } from '@/types/auth';

export const authService = {
    login: async (codigo: string) => {
        return api.post<AuthResponse>('/auth/login', { codigo });
    },

    me: async () => {
        return api.get<User>('/auth/me');
    },
};
