import { pipeline } from 'stream/promises'
import fs from 'fs'
import path from 'path'
import { FastifyRequest } from 'fastify'
import prisma from '../lib/prisma'
import { logger } from '../lib/logger'

export async function uploadMedia(
  request: FastifyRequest,
  uploadsDir: string
) {
  const data = await request.file()
  if (!data) {
    throw new Error('Nenhum arquivo enviado')
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  const ext = path.extname(data.filename) || '.bin'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const filepath = path.join(uploadsDir, filename)

  // Upload assíncrono usando pipeline
  await pipeline(data.file, fs.createWriteStream(filepath))

  const stats = await fs.promises.stat(filepath)
  const relativePath = `uploads/${filename}`

  const media = await prisma.media.create({
    data: {
      filename: data.filename,
      path: relativePath,
      mimeType: data.mimetype || 'application/octet-stream',
      size: stats.size,
    },
  })

  logger.info({ mediaId: media.id, filename: data.filename }, 'Media uploaded')
  return media
}
