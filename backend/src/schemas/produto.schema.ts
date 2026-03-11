import { z } from 'zod';

export const criarProdutoSchema = z.object({
    body: z.object({
        categoriaId: z.string().uuid('ID da categoria inválido'),
        codigo: z.string().optional(),
        nome: z.string().min(1, 'Nome é obrigatório'),
        descricao: z.string().optional(),
        preco: z.number().positive('Preço deve ser maior que zero'),
        precoPromocional: z.number().positive().optional(),
        imagemUrl: z.string().url('URL inválida').optional().or(z.literal('')),
        videoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
        disponivel: z.boolean().optional(),
        destaque: z.boolean().optional(),
        ordem: z.number().int().optional(),
        estoqueControlado: z.boolean().optional(),
        quantidadeEstoque: z.number().int().min(0).optional(),
    }),
});

export const atualizarProdutoSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
    body: z.object({
        categoriaId: z.string().uuid().optional(),
        codigo: z.string().optional(),
        nome: z.string().min(1).optional(),
        descricao: z.string().optional(),
        preco: z.number().positive().optional(),
        precoPromocional: z.number().positive().optional(),
        imagemUrl: z.string().url().optional().or(z.literal('')),
        videoUrl: z.string().url().optional().or(z.literal('')),
        disponivel: z.boolean().optional(),
        destaque: z.boolean().optional(),
        ordem: z.number().int().optional(),
        estoqueControlado: z.boolean().optional(),
        quantidadeEstoque: z.number().int().min(0).optional(),
    }),
});

export const buscarProdutoSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
});

export const toggleDisponibilidadeSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
});
