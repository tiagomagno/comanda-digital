import { z } from 'zod';

export const criarComandaSchema = z.object({
    body: z.object({
        estabelecimentoId: z.string().min(1, 'ID do estabelecimento é obrigatório'),
        nomeCliente: z.string().min(1, 'Nome do cliente é obrigatório'),
        telefoneCliente: z.string().min(1, 'Telefone do cliente é obrigatório'),
        emailCliente: z.string().email('Email inválido').optional().or(z.literal('')),
        mesa: z.string().optional(),
        mesaId: z.string().min(1).optional(),
    }),
});

export const buscarComandaSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
});

export const buscarComandaPorCodigoSchema = z.object({
    params: z.object({
        codigo: z.string().min(1, 'Código é obrigatório'),
    }),
});

export const atualizarStatusComandaSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
    body: z.object({
        status: z.enum(['ativa', 'aguardando_pagamento', 'paga', 'finalizada', 'cancelada']),
    }),
});
