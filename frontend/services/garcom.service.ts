import api from '@/lib/api';

export interface Mesa {
    id: string;
    numero: string;
    capacidade: number;
}

export interface PedidoItem {
    id: string;
    produto: {
        nome: string;
        preco: number;
    };
    quantidade: number;
    observacoes?: string;
    subtotal: number;
}

export interface Pedido {
    id: string;
    numeroPedido: number;
    status: 'criado' | 'pago' | 'em_preparo' | 'pronto' | 'entregue' | 'cancelado';
    total: number;
    createdAt: string;
    itens: PedidoItem[];
}

export interface Comanda {
    id: string;
    codigo: string;
    nomeCliente: string;
    mesaRelacao?: Mesa;
    mesaId?: string;
    status: 'ativa' | 'paga' | 'finalizada';
    totalEstimado: number;
    createdAt: string;
    pedidos: Pedido[];
}

export const garcomService = {
    listarComandas: async (status?: string) => {
        const response = await api.get<Comanda[]>('/garcom/comandas', {
            params: { status }
        });
        return response.data;
    },

    obterComanda: async (id: string) => {
        const response = await api.get<Comanda>(`/garcom/comandas/${id}`);
        return response.data;
    },

    aprovarPedido: async (pedidoId: string) => {
        const response = await api.post(`/garcom/pedidos/${pedidoId}/aprovar`);
        return response.data;
    },

    rejeitarPedido: async (pedidoId: string, motivo?: string) => {
        const response = await api.post(`/garcom/pedidos/${pedidoId}/rejeitar`, { motivo });
        return response.data;
    },

    processarPagamento: async (comandaId: string, metodoPagamento: string) => {
        const response = await api.post(`/garcom/comandas/${comandaId}/pagar`, { metodoPagamento });
        return response.data;
    },

    fecharComanda: async (comandaId: string) => {
        const response = await api.post(`/garcom/comandas/${comandaId}/fechar`);
        return response.data;
    }
};
