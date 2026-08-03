/**
 * api.ts — Cliente HTTP base centralizado
 * Todos os services devem usar esta instância para garantir
 * baseURL consistente e injeção automática do token JWT.
 */
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type FetchOptions = RequestInit & {
    skipAuth?: boolean;
};

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
    };

    if (!skipAuth && typeof window !== 'undefined') {
        const token = Cookies.get('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || errorData.message || `Erro HTTP ${response.status}`);
    }

    // Respostas 204 (No Content) não têm corpo
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { method: 'GET', ...options }),

    post: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
        apiFetch<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        }),

    put: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
        apiFetch<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        }),

    patch: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
        apiFetch<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        }),

    delete: <T>(endpoint: string, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { method: 'DELETE', ...options }),
};
