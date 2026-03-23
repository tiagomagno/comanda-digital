import { z } from 'zod';

// ---------- Schemas existentes (mantidos) ----------

export const escanearQRCodeSchema = z.object({
    params: z.object({
        estabelecimentoId: z.string().uuid('ID do estabelecimento inválido'),
        mesaId: z.string().uuid('ID da mesa inválido'),
    }),
});

export const criarComandaClienteSchema = z.object({
    body: z.object({
        estabelecimentoId: z.string().uuid('ID do estabelecimento inválido'),
        mesaId: z.string().uuid().optional(),
        tipoComanda: z.enum(['mesa', 'individual', 'delivery'], {
            errorMap: () => ({ message: 'Tipo de comanda inválido' }),
        }),
        nomeCliente: z.string().min(1, 'Nome do cliente é obrigatório'),
        telefoneCliente: z.string().min(1, 'Telefone do cliente é obrigatório'),
        emailCliente: z.string().email('Email inválido').optional().or(z.literal('')),
        formaPagamento: z.enum(['imediato', 'final']).optional(),
        // Delivery
        clienteId: z.string().uuid().optional(),
        enderecoEntregaId: z.string().uuid().optional(),
        taxaEntrega: z.number().min(0).optional(),
    }),
});

export const visualizarCardapioSchema = z.object({
    params: z.object({
        estabelecimentoId: z.string().uuid('ID do estabelecimento inválido'),
    }),
});

export const criarPedidoClienteSchema = z.object({
    body: z.object({
        comandaId: z.string().uuid('ID da comanda inválido'),
        itens: z.array(
            z.object({
                produtoId: z.string().uuid('ID do produto inválido'),
                quantidade: z.number().int().positive('Quantidade deve ser maior que zero'),
                observacoes: z.string().optional(),
            })
        ).min(1, 'É necessário pelo menos um item no pedido'),
        observacoes: z.string().optional(),
    }),
});

export const visualizarComandaSchema = z.object({
    params: z.object({
        codigo: z.string().min(1, 'Código é obrigatório'),
    }),
});

// ---------- Novos schemas de Delivery ----------

export const registrarClienteSchema = z.object({
    body: z.object({
        estabelecimentoId: z.string().uuid('ID do estabelecimento inválido'),
        nome: z.string().min(2, 'Nome é obrigatório'),
        telefone: z.string().min(10, 'Telefone é obrigatório'),
        email: z.string().email('Email inválido').optional().or(z.literal('')),
        senha: z.string().min(6, 'Senha mínima 6 caracteres').optional().or(z.literal('')),
        cpf: z.string().optional(),
    }),
});

export const loginClienteDeliverySchema = z.object({
    body: z.object({
        estabelecimentoId: z.string().uuid('ID do estabelecimento inválido'),
        telefone: z.string().min(10, 'Telefone é obrigatório'),
        senha: z.string().optional(),
    }),
});

export const criarEnderecoClienteSchema = z.object({
    body: z.object({
        clienteId: z.string().uuid('ID do cliente inválido'),
        cep: z.string().min(8, 'CEP inválido'),
        logradouro: z.string().min(2, 'Logradouro é obrigatório'),
        numero: z.string().min(1, 'Número é obrigatório'),
        complemento: z.string().optional(),
        bairro: z.string().min(1, 'Bairro é obrigatório'),
        cidade: z.string().min(1, 'Cidade é obrigatória'),
        estado: z.string().min(2, 'Estado é obrigatório'),
        referencia: z.string().optional(),
        padrao: z.boolean().optional(),
    }),
});

export const iniciarPedidoDeliverySchema = z.object({
    body: z.object({
        estabelecimentoId: z.string().uuid('ID do estabelecimento inválido'),
        cliente: z.object({
            nome: z.string().min(2, 'Nome é obrigatório'),
            telefone: z.string().min(10, 'Telefone é obrigatório'),
            email: z.string().email().optional().or(z.literal('')),
            senha: z.string().optional(),
        }),
        endereco: z.object({
            cep: z.string().min(8, 'CEP inválido'),
            logradouro: z.string().min(2, 'Logradouro é obrigatório'),
            numero: z.string().min(1, 'Número é obrigatório'),
            complemento: z.string().optional(),
            bairro: z.string().min(1, 'Bairro é obrigatório'),
            cidade: z.string().min(1, 'Cidade é obrigatória'),
            estado: z.string().min(2, 'Estado é obrigatório'),
            referencia: z.string().optional(),
        }),
        itens: z.array(
            z.object({
                produtoId: z.string().uuid('ID do produto inválido'),
                quantidade: z.number().int().positive(),
                observacoes: z.string().optional(),
            })
        ).min(1, 'É necessário pelo menos um item no pedido'),
        observacoes: z.string().optional(),
        formaPagamento: z.enum(['imediato', 'final']).optional(),
        taxaEntrega: z.number().min(0).optional(),
    }),
});

export const buscarClienteSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID do cliente inválido'),
    }),
});

export const listarEnderecosClienteSchema = z.object({
    params: z.object({
        clienteId: z.string().uuid('ID do cliente inválido'),
    }),
});
