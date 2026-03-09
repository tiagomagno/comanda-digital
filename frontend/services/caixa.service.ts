import api from '@/lib/api';

export const caixaService = {
    listarComandasPendentes: async () => {
        const response = await api.get('/caixa/comandas');
        return response.data;
    },

    processarPagamentoFinal: async (id: string, metodoPagamento: string) => {
        const response = await api.post(`/caixa/comandas/${id}/pagar`, { metodoPagamento });
        return response.data;
    },

    fecharComanda: async (id: string) => {
        const response = await api.post(`/caixa/comandas/${id}/fechar`);
        return response.data;
    },

    obterRelatorio: async (inicio?: string, fim?: string) => {
        const response = await api.get('/caixa/relatorio', {
            params: { dataInicio: inicio, dataFim: fim }
        });
        return response.data;
    }
};
