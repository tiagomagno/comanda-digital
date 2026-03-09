import { z } from 'zod';

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
        tipoComanda: z.enum(['mesa', 'individual'], {
            errorMap: () => ({ message: 'Tipo de comanda deve ser "mesa" ou "individual"' }),
        }),
        nomeCliente: z.string().min(1, 'Nome do cliente é obrigatório'),
        telefoneCliente: z.string().min(1, 'Telefone do cliente é obrigatório'),
        emailCliente: z.string().email('Email inválido').optional().or(z.literal('')),
        formaPagamento: z.enum(['imediato', 'final']).optional(),
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
