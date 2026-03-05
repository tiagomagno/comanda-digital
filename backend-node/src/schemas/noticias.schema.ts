import { z } from 'zod'

export const noticiasQuerySchema = z.object({
  editoriaId: z.coerce.number().optional(),
  autorId: z.coerce.number().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(5).max(100).default(10),
})

export const noticiaIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const updateNoticiaSchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  subtitulo: z.string().max(300).optional(),
  conteudo: z.string().min(1).optional(),
  imagemDestaque: z.string().url().optional().or(z.literal('')),
  status: z.enum(['rascunho', 'em_revisao', 'revisao_seo', 'publicado', 'arquivado']).optional(),
  observacaoRevisao: z.string().optional().nullable(),
  destaqueOrdem: z.number().int().positive().optional().nullable(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().max(255).optional(),
  editoriaId: z.number().int().positive().optional(),
  autorId: z.number().int().positive().optional(),
  publishedAt: z.string().datetime().optional(),
})

export const createNoticiaSchema = z.object({
  titulo: z.string().min(1).max(200),
  slug: z.string().optional(),
  subtitulo: z.string().max(300).optional(),
  conteudo: z.string().min(1),
  imagemDestaque: z.string().url().optional(),
  editoriaId: z.number().int().positive(),
  autorId: z.number().int().positive(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().max(255).optional(),
})
