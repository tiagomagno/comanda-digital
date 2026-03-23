import { z } from 'zod';

export const criarCategoriaSchema = z.object({
    body: z.object({
        estabelecimentoId: z.string().uuid('ID do estabelecimento inválido').optional(),
        nome: z.string().min(1, 'Nome é obrigatório'),
        descricao: z.string().optional(),
        destino: z.enum(['BAR', 'COZINHA'], {
            errorMap: () => ({ message: 'Destino deve ser BAR ou COZINHA' }),
        }).default('COZINHA'),
        cor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal').optional(),
        icone: z.string().optional(),
        ordem: z.number().int().optional(),
    }),
});

export const atualizarCategoriaSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
    body: z.object({
        nome: z.string().min(1).optional(),
        descricao: z.string().optional(),
        destino: z.enum(['BAR', 'COZINHA']).optional(),
        cor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        icone: z.string().optional(),
        ordem: z.number().int().optional(),
        ativo: z.boolean().optional(),
    }),
});

export const buscarCategoriaSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
});

export const reordenarCategoriasSchema = z.object({
    body: z.object({
        categorias: z.array(
            z.object({
                id: z.string().uuid('ID inválido'),
                ordem: z.number().int(),
            })
        ).min(1, 'É necessário pelo menos uma categoria'),
    }),
});
