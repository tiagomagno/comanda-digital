import api from '@/lib/api';

// Cliente usa endpoints públicos, então removemos o token se necessário ou mantemos se o cliente tiver login opcional
// Por enquanto api.ts manda token se tiver localStorage, mas o cliente pode ser anônimo
// O backend aceita requests públicos para essas rotas

export const clienteService = {
    escanearMesa: async (estabelecimentoId: string, mesaId: string) => {
        const response = await api.get(`/cliente/mesa/${estabelecimentoId}/${mesaId}`);
        return response.data;
    },

    criarComanda: async (dados: any) => {
        const response = await api.post('/cliente/comandas', dados);
        return response.data;
    },

    visualizarCardapio: async (estabelecimentoId: string) => {
        const response = await api.get(`/cliente/cardapio/${estabelecimentoId}`);
        return response.data;
    },

    criarPedido: async (dados: { comandaId: string, itens: any[], observacoes?: string }) => {
        const response = await api.post('/cliente/pedidos', dados);
        return response.data;
    },

    obterComanda: async (codigo: string) => {
        const response = await api.get(`/cliente/comandas/${codigo}`);
        return response.data;
    }
};
