import { z } from 'zod';

export const criarMesaSchema = z.object({
    body: z.object({
        numero: z.string().min(1, 'Número da mesa é obrigatório'),
        capacidade: z.number().int().positive('Capacidade deve ser maior que zero').optional(),
    }),
});

export const atualizarMesaSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
    body: z.object({
        numero: z.string().min(1).optional(),
        capacidade: z.number().int().positive().optional(),
        ativo: z.boolean().optional(),
    }),
});

export const buscarMesaSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
});

export const regenerarQRCodeSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
});
