
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import prisma from '../lib/prisma'

export async function getNoticias(request: FastifyRequest, reply: FastifyReply) {
    const querySchema = z.object({
        page: z.coerce.number().default(1),
        pageSize: z.coerce.number().default(10),
        editoriaSlug: z.string().optional(),
        q: z.string().optional(), // busca por termo (titulo, subtitulo, conteudo)
    })

    const { page, pageSize, editoriaSlug, q } = querySchema.parse(request.query)

    const where: any = {}
    if (editoriaSlug) {
        where.editoria = { slug: editoriaSlug }
    }
    if (q && q.trim()) {
        const term = q.trim()
        where.OR = [
            { titulo: { contains: term } },
            { subtitulo: { contains: term } },
            { conteudo: { contains: term } },
        ]
    }

    const [total, noticias] = await Promise.all([
        prisma.noticia.count({ where }),
        prisma.noticia.findMany({
            where,
            take: pageSize,
            skip: (page - 1) * pageSize,
            orderBy: { publishedAt: 'desc' as const },
            include: {
                editoria: true,
                autor: true,
            }
        })
    ])

    return {
        data: noticias,
        meta: {
            page,
            pageSize,
            total,
            pageCount: Math.ceil(total / pageSize)
        }
    }
}

export async function getNoticiaBySlug(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        slug: z.string(),
    })

    const { slug } = paramsSchema.parse(request.params)

    const noticia = await prisma.noticia.findFirst({
        where: { slug, status: 'publicado' },
        include: {
            editoria: true,
            autor: true,
        }
    })

    if (!noticia) {
        return reply.status(404).send({ message: 'Notícia não encontrada' })
    }

    return { data: noticia } // Mantendo um wrap 'data' leve para consistência
}

const createNoticiaSchema = z.object({
    titulo: z.string().min(1),
    subtitulo: z.string().optional(),
    conteudo: z.string().min(1),
    slug: z.string().optional(),
    imagemDestaque: z.string().url().optional().or(z.literal('')),
    editoriaId: z.number().int().positive(),
    autorId: z.number().int().positive(),
})

export async function createNoticia(request: FastifyRequest, reply: FastifyReply) {
    const body = await request.body as any
    const data = body?.data ?? body
    const parsed = createNoticiaSchema.safeParse({
        ...data,
        editoriaId: data?.editoria ?? data?.editoriaId,
        autorId: data?.autor ?? data?.autorId,
        imagemDestaque: data?.imagemDestaque || undefined,
    })
    if (!parsed.success) {
        return reply.status(400).send({
            message: 'Dados inválidos',
            errors: parsed.error.flatten(),
        })
    }
    const { titulo, subtitulo, conteudo, imagemDestaque, editoriaId, autorId } = parsed.data
    let { slug } = parsed.data
    if (!slug || !slug.trim()) {
        const slugify = (await import('slugify')).default
        slug = slugify(titulo, { lower: true, strict: true })
    }
    const existing = await prisma.noticia.findUnique({ where: { slug } })
    if (existing) {
        slug = `${slug}-${Date.now()}`
    }
    const noticia = await prisma.noticia.create({
        data: {
            titulo: titulo.trim(),
            subtitulo: subtitulo?.trim() || null,
            conteudo: conteudo.trim(),
            slug,
            imagemDestaque: imagemDestaque && imagemDestaque.trim() ? imagemDestaque.trim() : null,
            editoriaId,
            autorId,
        },
        include: { editoria: true, autor: true },
    })
    return reply.status(201).send({ data: noticia })
}
