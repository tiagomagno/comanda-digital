import { z } from 'zod';

export const criarPedidoSchema = z.object({
    body: z.object({
        comandaCodigo: z.string().min(1, 'Código da comanda é obrigatório'),
        itens: z
            .array(
                z.object({
                    produtoId: z.string().min(1, 'ID do produto é obrigatório'),
                    quantidade: z.number().int().positive('Quantidade deve ser maior que zero'),
                    observacoes: z.string().optional(),
                })
            )
            .min(1, 'É necessário pelo menos um item no pedido'),
        observacoes: z.string().optional(),
    }),
});

export const buscarPedidoSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
});

export const atualizarStatusPedidoSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
    body: z.object({
        status: z.enum([
            'criado',
            'aguardando_pagamento',
            'pago',
            'em_preparo',
            'pronto',
            'entregue',
            'cancelado',
        ]),
    }),
});
