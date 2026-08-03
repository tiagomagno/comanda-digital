import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusPedido =
    | 'criado'
    | 'aguardando_pagamento'
    | 'pago'
    | 'em_preparo'
    | 'pronto'
    | 'entregue'
    | 'cancelado';

export interface ItemPedidoDto {
    produtoId: string;
    quantidade: number;
    observacoes?: string;
}

export interface CriarPedidoDto {
    comandaCodigo: string;
    itens: ItemPedidoDto[];
    observacoes?: string;
}

export interface ItemPedido {
    id: string;
    quantidade: number;
    precoUnitario: number;
    observacoes?: string;
    produto: { id: string; nome: string; preco: number };
}

export interface Pedido {
    id: string;
    numeroPedido: number;
    status: StatusPedido;
    observacoes?: string;
    itens: ItemPedido[];
    createdAt: string;
    updatedAt: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const pedidoService = {
    /**
     * Cria um novo pedido para uma comanda ativa.
     * Não exige autenticação (cliente faz o próprio pedido).
     */
    async criar(dados: CriarPedidoDto): Promise<Pedido> {
        return api.post<Pedido>('/pedidos', dados, { skipAuth: true });
    },

    /**
     * Busca detalhes de um pedido específico.
     */
    async buscarPorId(id: string): Promise<Pedido> {
        return api.get<Pedido>(`/pedidos/${id}`, { skipAuth: true });
    },

    /**
     * Lista todos os pedidos ativos (para cozinha/garçom).
     */
    async listarAtivos(): Promise<Pedido[]> {
        return api.get<Pedido[]>('/pedidos/ativos');
    },

    /**
     * Atualiza o status de um pedido (requer autenticação de garçom/cozinha/admin).
     */
    async atualizarStatus(id: string, status: StatusPedido): Promise<Pedido> {
        return api.patch<Pedido>(`/pedidos/${id}/status`, { status });
    },

    /**
     * Cancela um pedido.
     */
    async cancelar(id: string, motivo?: string): Promise<Pedido> {
        return api.patch<Pedido>(`/pedidos/${id}/cancelar`, { motivo });
    },

    /**
     * Lista pedidos de uma comanda específica.
     */
    async listarPorComanda(comandaId: string): Promise<Pedido[]> {
        return api.get<Pedido[]>(`/pedidos/comanda/${comandaId}`);
    },
};
