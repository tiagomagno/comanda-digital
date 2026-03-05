import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import prisma from '../../lib/prisma'
import { authenticate } from '../../middleware/authenticate'
import { noticiasQuerySchema, noticiaIdSchema, updateNoticiaSchema, createNoticiaSchema } from '../../schemas/noticias.schema'
import { AppError } from '../../utils/errors'
import { logger } from '../../lib/logger'

export async function noticiasRoutes(app: FastifyInstance) {
  // Listar notícias com filtros e paginação
  app.get('/api/admin/noticias', {
    preHandler: [authenticate],
    schema: {
      querystring: noticiasQuerySchema,
    },
  }, async (request) => {
    const q = request.query as z.infer<typeof noticiasQuerySchema>
    const where: Record<string, unknown> = {}

    if (q.editoriaId) where.editoriaId = q.editoriaId
    if (q.autorId) where.autorId = q.autorId

    if (q.dataInicio || q.dataFim) {
      where.updatedAt = {}
      if (q.dataInicio) {
        (where.updatedAt as Record<string, Date>).gte = new Date(q.dataInicio)
      }
      if (q.dataFim) {
        (where.updatedAt as Record<string, Date>).lte = new Date(q.dataFim + 'T23:59:59.999Z')
      }
    }

    if (q.q?.trim()) {
      const term = q.q.trim()
      where.OR = [
        { titulo: { contains: term } },
        { subtitulo: { contains: term } },
        { conteudo: { contains: term } },
      ]
    }

    const skip = (q.page - 1) * q.pageSize
    const [total, list] = await Promise.all([
      prisma.noticia.count({ where }),
      prisma.noticia.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: { editoria: true, autor: true },
        skip,
        take: q.pageSize,
      }),
    ])

    return {
      data: list,
      meta: {
        total,
        page: q.page,
        pageSize: q.pageSize,
        pageCount: Math.ceil(total / q.pageSize),
      },
    }
  })

  // Criar notícia (admin: define createdById)
  app.post('/api/admin/noticias', {
    preHandler: [authenticate],
    schema: {
      body: z.object({ data: createNoticiaSchema }),
    },
  }, async (request) => {
    const body = request.body as { data: z.infer<typeof createNoticiaSchema> }
    const data = body.data
    let { slug } = data
    if (!slug?.trim()) {
      const slugify = (await import('slugify')).default
      slug = slugify(data.titulo, { lower: true, strict: true })
    }
    const existing = await prisma.noticia.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }
    const noticia = await prisma.noticia.create({
      data: {
        titulo: data.titulo.trim(),
        subtitulo: data.subtitulo?.trim() || null,
        conteudo: data.conteudo.trim(),
        slug,
        imagemDestaque: data.imagemDestaque?.trim() || null,
        editoriaId: data.editoriaId,
        autorId: data.autorId,
        status: 'rascunho',
        createdById: request.user?.id ?? null,
        metaTitle: data.metaTitle?.trim() || null,
        metaDescription: data.metaDescription?.trim() || null,
        metaKeywords: data.metaKeywords?.trim() || null,
      },
      include: { editoria: true, autor: true },
    })
    logger.info({ noticiaId: noticia.id, userId: request.user?.id }, 'Noticia created')
    return { data: noticia }
  })

  // Obter uma notícia por ID
  app.get('/api/admin/noticias/:id', {
    preHandler: [authenticate],
    schema: {
      params: noticiaIdSchema,
    },
  }, async (request) => {
    const { id } = request.params as z.infer<typeof noticiaIdSchema>
    const noticia = await prisma.noticia.findUnique({
      where: { id },
      include: { editoria: true, autor: true },
    })

    if (!noticia) {
      throw new AppError(404, 'Notícia não encontrada', 'NOT_FOUND')
    }

    return { data: noticia }
  })

  // Atualizar notícia
  app.patch('/api/admin/noticias/:id', {
    preHandler: [authenticate],
    schema: {
      params: noticiaIdSchema,
      body: updateNoticiaSchema,
    },
  }, async (request) => {
    const { id } = request.params as z.infer<typeof noticiaIdSchema>
    const body = request.body as z.infer<typeof updateNoticiaSchema>

    const updateData: Record<string, unknown> = {}
    const allowedKeys = [
      'titulo', 'subtitulo', 'conteudo', 'imagemDestaque', 'status',
      'observacaoRevisao', 'destaqueOrdem', 'metaTitle', 'metaDescription',
      'metaKeywords', 'editoriaId', 'autorId', 'publishedAt',
    ] as const

    for (const key of allowedKeys) {
      if (key in body && body[key] !== undefined) {
        updateData[key] = body[key]
      }
    }

    if (updateData.status === 'publicado' && !updateData.publishedAt) {
      updateData.publishedAt = new Date()
    }

    const noticia = await prisma.noticia.update({
      where: { id },
      data: updateData,
      include: { editoria: true, autor: true },
    })

    logger.info({ noticiaId: id, userId: request.user?.id }, 'Noticia updated')
    return { data: noticia }
  })
}
