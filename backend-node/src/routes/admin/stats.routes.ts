import { FastifyInstance } from 'fastify'
import prisma from '../../lib/prisma'
import { authenticate } from '../../middleware/authenticate'

function getStartOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // segunda = 1
  return new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0, 0)
}

export async function statsRoutes(app: FastifyInstance) {
  app.get('/api/admin/stats', {
    preHandler: [authenticate],
  }, async () => {
    const [rascunho, emRevisao, publicado, total] = await Promise.all([
      prisma.noticia.count({ where: { status: 'rascunho' } }),
      prisma.noticia.count({ where: { status: 'em_revisao' } }),
      prisma.noticia.count({ where: { status: 'publicado' } }),
      prisma.noticia.count(),
    ])

    return {
      data: {
        noticiasRascunho: rascunho,
        noticiasEmRevisao: emRevisao,
        noticiasPublicadas: publicado,
        noticiasTotal: total,
      },
    }
  })

  app.get('/api/admin/stats/me', {
    preHandler: [authenticate],
  }, async (request) => {
    const userId = request.user?.id
    if (!userId) {
      return { data: { artigosCriadosEstaSemana: 0, atividadePorDia: [0, 0, 0, 0, 0] } }
    }
    const now = new Date()
    const startOfWeek = getStartOfWeek(now)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    const noticiasSemana = await prisma.noticia.findMany({
      where: {
        createdById: userId,
        createdAt: { gte: startOfWeek, lt: endOfWeek },
      },
      select: { createdAt: true },
    })

    const artigosCriadosEstaSemana = noticiasSemana.length
    const atividadePorDia = [0, 0, 0, 0, 0] // Seg a Sex
    for (const n of noticiasSemana) {
      const d = new Date(n.createdAt)
      const day = d.getDay()
      const idx = day === 0 ? 4 : day - 1
      if (idx >= 0 && idx <= 4) atividadePorDia[idx] += 1
    }

    return {
      data: {
        artigosCriadosEstaSemana,
        atividadePorDia,
      },
    }
  })
}
