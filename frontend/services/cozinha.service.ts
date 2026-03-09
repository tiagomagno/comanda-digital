import api from '@/lib/api';

export interface PedidoItem {
    id: string;
    produto: {
        nome: string;
        categoria: {
            nome: string;
        };
    };
    quantidade: number;
    observacoes?: string;
}

export interface PedidoCozinha {
    id: string;
    numeroPedido: number;
    status: 'pago' | 'em_preparo' | 'pronto' | 'entregue';
    createdAt: string;
    emPreparoAt?: string;
    comanda: {
        mesaRelacao?: {
            numero: string;
        };
        nomeCliente: string;
    };
    itens: PedidoItem[];
}

export interface KanbanData {
    novos: PedidoCozinha[];
    emPreparo: PedidoCozinha[];
    prontos: PedidoCozinha[];
}

export const cozinhaService = {
    listarPedidos: async (destino?: 'COZINHA' | 'BAR') => {
        const response = await api.get<KanbanData>('/cozinha/pedidos', {
            params: { destino }
        });
        return response.data;
    },

    atualizarStatus: async (id: string, status: string) => {
        const response = await api.put(`/cozinha/pedidos/${id}/status`, { status });
        return response.data;
    },

    obterEstatisticas: async () => {
        const response = await api.get('/cozinha/estatisticas');
        return response.data;
    }
};
