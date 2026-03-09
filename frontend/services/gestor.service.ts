import api from '@/lib/api';

export const gestorService = {
    listarMesas: async () => {
        const response = await api.get('/gestor/mesas');
        return response.data;
    },

    criarMesa: async (dados: { numero: string; capacidade: number }) => {
        const response = await api.post('/gestor/mesas', dados);
        return response.data;
    },

    regenerarQRCode: async (id: string) => {
        const response = await api.post(`/gestor/mesas/${id}/regenerate-qr`);
        return response.data;
    },

    baixarQRCode: async (id: string) => {
        const response = await api.get(`/gestor/mesas/${id}/qrcode`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
