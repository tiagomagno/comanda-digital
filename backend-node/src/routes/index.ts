import { FastifyInstance } from 'fastify'
import { noticiasRoutes } from './admin/noticias.routes'
import { usuariosRoutes } from './admin/usuarios.routes'
import { midiasRoutes } from './admin/midias.routes'
import { statsRoutes } from './admin/stats.routes'
import { settingsRoutes } from './admin/settings.routes'
import { authRoutes } from './auth.routes'
import { publicRoutes } from './public.routes'

export async function appRoutes(app: FastifyInstance) {
  // Diagnóstico: GET /api/ping (sem auth) – se retornar 200, a API está viva
  app.get('/api/ping', async () => ({ ok: true }))
  // Rotas públicas (sem autenticação)
  await app.register(publicRoutes)
  await app.register(authRoutes)

  // Rotas administrativas (com autenticação)
  await app.register(noticiasRoutes)
  await app.register(usuariosRoutes)
  await app.register(midiasRoutes)
  await app.register(statsRoutes)
  await app.register(settingsRoutes)
}
