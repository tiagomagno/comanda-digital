import api from '@/lib/api';
import { AuthResponse } from '@/types/auth';

export const authService = {
    login: async (codigo: string) => {
        const response = await api.post<AuthResponse>('/auth/login', { codigo });
        return response.data;
    },

    me: async () => {
        const response = await api.get<{ user: any }>('/auth/me');
        return response.data;
    },
};
