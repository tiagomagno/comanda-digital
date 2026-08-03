export const superAdminService = {
    async getDashboard() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Falha ao carregar dashboard');
        return response.json();
    },

    async listarEstabelecimentos(params?: any) {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/superadmin/estabelecimentos`;
        if (params) {
            const queryParams = new URLSearchParams(params);
            url += `?${queryParams.toString()}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Falha ao carregar estabelecimentos');
        return response.json();
    },

    async getEstabelecimento(id: string) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/estabelecimentos/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Falha ao carregar dados do estabelecimento');
        return response.json();
    },

    async criarEstabelecimento(dados: any) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/estabelecimentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(dados)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Falha ao criar estabelecimento');
        }
        return response.json();
    },

    async atualizarEstabelecimento(id: string, dados: any) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/estabelecimentos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(dados)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Falha ao atualizar estabelecimento');
        }
        return response.json();
    },

    async toggleAtivo(id: string) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/estabelecimentos/${id}/toggle`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Falha ao alterar status');
        return response.json();
    },

    async listarUsuarios(params?: { limit?: number; busca?: string }) {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/superadmin/usuarios`;
        if (params) {
            const queryParams = new URLSearchParams(
                Object.fromEntries(
                    Object.entries(params)
                        .filter(([, v]) => v !== undefined)
                        .map(([k, v]) => [k, String(v)])
                )
            );
            if (queryParams.toString()) url += `?${queryParams.toString()}`;
        }
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Falha ao listar usuários');
        return response.json();
    }
};

