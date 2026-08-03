import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Produto {
    id: string;
    nome: string;
    descricao?: string;
    preco: number;
    imagemUrl?: string;
    disponivel: boolean;
    categoria: {
        id: string;
        nome: string;
    };
}

export interface Categoria {
    id: string;
    nome: string;
    ordem: number;
    produtos: Produto[];
}

export interface Estabelecimento {
    id: string;
    nome: string;
    slug: string;
    descricao?: string;
    logoUrl?: string;
    corPrimaria?: string;
    ativo: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const cardapioService = {
    /**
     * Busca dados do estabelecimento pelo código da comanda.
     * Usado para exibir nome, logo e personalização do cardápio.
     */
    async getEstabelecimentoPorComanda(comandaCodigo: string): Promise<Estabelecimento> {
        return api.get<Estabelecimento>(`/public/estabelecimento/por-comanda/${comandaCodigo}`, {
            skipAuth: true,
        });
    },

    /**
     * Busca o cardápio completo (categorias + produtos) de um estabelecimento.
     */
    async getCardapio(estabelecimentoSlug: string): Promise<Categoria[]> {
        return api.get<Categoria[]>(`/public/cardapio/${estabelecimentoSlug}`, {
            skipAuth: true,
        });
    },

    /**
     * Busca o cardápio via código de comanda (modo mais comum no fluxo de mesa).
     */
    async getCardapioPorComanda(comandaCodigo: string): Promise<{ estabelecimento: Estabelecimento; categorias: Categoria[] }> {
        return api.get(`/public/cardapio/por-comanda/${comandaCodigo}`, {
            skipAuth: true,
        });
    },
};
