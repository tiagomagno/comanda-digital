import fs from 'fs'
import { FastifyInstance } from 'fastify'
import path from 'path'
import { fileURLToPath } from 'url'
import prisma from '../../lib/prisma'
import { authenticate } from '../../middleware/authenticate'
import { uploadMedia } from '../../services/midias.service'
import { logger } from '../../lib/logger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const uploadsDir = path.join(rootDir, 'uploads')

async function deleteMediaFile(mediaPath: string) {
  const fullPath = path.join(rootDir, mediaPath)
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
  }
}

export async function midiasRoutes(app: FastifyInstance) {
  // Listar mídias
  app.get('/api/admin/midias', {
    preHandler: [authenticate],
  }, async () => {
    const list = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        path: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
    })
    return { data: list }
  })

  // Upload de mídia
  app.post('/api/admin/midias', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const media = await uploadMedia(request, uploadsDir)
      return reply.status(201).send({ data: media })
    } catch (error) {
      logger.error({ err: error }, 'Media upload failed')
      throw error
    }
  })

  // Excluir uma mídia
  app.delete('/api/admin/midias/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const id = Number((request.params as { id: string }).id)
    if (!Number.isInteger(id) || id < 1) {
      return reply.status(400).send({ error: { message: 'ID inválido' } })
    }
    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) {
      return reply.status(404).send({ error: { message: 'Mídia não encontrada' } })
    }
    try {
      deleteMediaFile(media.path)
    } catch (e) {
      logger.warn({ err: e, path: media.path }, 'Could not delete media file from disk')
    }
    await prisma.media.delete({ where: { id } })
    logger.info({ mediaId: id }, 'Media deleted')
    return reply.status(204).send()
  })

  // Exclusão em massa
  app.post('/api/admin/midias/bulk-delete', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { ids } = request.body as { ids: number[] }
    if (!Array.isArray(ids) || ids.length === 0) {
      return reply.status(400).send({ error: { message: 'Envie um array de IDs' } })
    }
    const validIds = ids.filter((id) => Number.isInteger(id) && id > 0)
    const list = await prisma.media.findMany({
      where: { id: { in: validIds } },
      select: { id: true, path: true },
    })
    for (const media of list) {
      try {
        deleteMediaFile(media.path)
      } catch (e) {
        logger.warn({ err: e, path: media.path }, 'Could not delete media file from disk')
      }
    }
    await prisma.media.deleteMany({ where: { id: { in: list.map((m) => m.id) } } })
    logger.info({ count: list.length, ids: list.map((m) => m.id) }, 'Media bulk deleted')
    return reply.send({ deleted: list.length })
  })
}
