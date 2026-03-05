import { FastifyInstance } from 'fastify'
import prisma from '../lib/prisma'
import { getNoticias, getNoticiaBySlug, createNoticia } from '../controllers/noticias.controller'
import { getEditorias } from '../services/editorias.service'
import { getAutores } from '../services/autores.service'
import { getCached, setCached, CACHE_KEYS } from '../lib/cache'

export async function publicRoutes(app: FastifyInstance) {
  // Raiz: info da API
  app.get('/', async () => ({
    message: 'Notícias360 API',
    endpoints: [
      '/noticias',
      '/noticias/:slug',
      'POST /noticias',
      '/auth/login',
      '/home-config',
      '/editorias',
      '/autores',
      '/publicidades',
      'GET /admin (painel UI)',
    ],
  }))

  // Rotas de Notícias (públicas)
  app.get('/noticias', getNoticias)
  app.get('/noticias/:slug', getNoticiaBySlug)
  app.post('/noticias', createNoticia)

  // Home Config (apenas notícias publicadas)
  app.get('/home-config', async () => {
    const where = { status: 'publicado' as const }
    const manchete = await prisma.noticia.findFirst({
      where,
      orderBy: { publishedAt: 'desc' },
      include: { editoria: true, autor: true },
    })

    const destaquesLaterais = await prisma.noticia.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: 2,
      skip: 1,
      include: { editoria: true, autor: true },
    })

    return {
      destaque_principal: manchete,
      destaques_laterais: destaquesLaterais,
    }
  })

  // Editorias (com cache)
  app.get('/editorias', async () => {
    const data = await getEditorias()
    return { data }
  })

  // Autores (com cache)
  app.get('/autores', async () => {
    const data = await getAutores()
    return { data }
  })

  // Publicidades (com cache)
  app.get('/publicidades', async () => {
    const cached = getCached(CACHE_KEYS.publicidades)
    if (cached) return cached

    const data = await prisma.publicidade.findMany({
      where: { ativo: true },
    })

    setCached(CACHE_KEYS.publicidades, data)
    return data
  })
}
