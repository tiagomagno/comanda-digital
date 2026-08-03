import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusComanda = 'aberta' | 'fechada' | 'paga';

export interface Comanda {
    id: string;
    codigo: string;
    nomeCliente: string;
    status: StatusComanda;
    totalEstimado: number;
    mesaRelacao?: { id: string; numero: string };
    pedidos: any[];
    createdAt: string;
}

export interface CriarComandaDto {
    nomeCliente: string;
    mesaId?: string;
    estabelecimentoId?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const comandaService = {
    /**
     * Cria uma nova comanda para o cliente.
     */
    async criar(dados: CriarComandaDto): Promise<Comanda> {
        return api.post<Comanda>('/comandas', dados, { skipAuth: true });
    },

    /**
     * Busca uma comanda pelo código (formato: ABC-123).
     * Usado pelo cliente para acompanhar seus pedidos.
     */
    async buscarPorCodigo(codigo: string): Promise<Comanda> {
        return api.get<Comanda>(`/comandas/codigo/${codigo}`, { skipAuth: true });
    },

    /**
     * Lista todas as comandas ativas (requer autenticação de garçom/admin).
     */
    async listarAtivas(): Promise<Comanda[]> {
        return api.get<Comanda[]>('/comandas/ativas');
    },

    /**
     * Fecha a comanda (inicia processo de pagamento).
     */
    async fechar(id: string, metodoPagamento: string): Promise<Comanda> {
        return api.post<Comanda>(`/comandas/${id}/fechar`, { metodoPagamento });
    },

    /**
     * Lista todas as comandas de um estabelecimento (admin).
     */
    async listarTodas(params?: { status?: StatusComanda; page?: number }): Promise<Comanda[]> {
        const query = params
            ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
            : '';
        return api.get<Comanda[]>(`/comandas${query}`);
    },
};
