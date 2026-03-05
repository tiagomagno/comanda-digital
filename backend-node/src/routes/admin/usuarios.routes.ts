import { z } from 'zod'
import { createHash } from 'crypto'
import { FastifyInstance } from 'fastify'
import prisma from '../../lib/prisma'
import { authenticate, requireRole } from '../../middleware/authenticate'
import { usuarioIdSchema, updateUsuarioSchema, createUsuarioSchema } from '../../schemas/usuarios.schema'
import { AppError } from '../../utils/errors'
import { logger } from '../../lib/logger'

export async function usuariosRoutes(app: FastifyInstance) {
  // Listar usuários (qualquer usuário autenticado)
  app.get('/api/admin/usuarios', {
    preHandler: [authenticate],
  }, async () => {
    const list = await prisma.user.findMany({
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return { data: list }
  })

  // Obter usuário por ID (qualquer usuário autenticado)
  app.get('/api/admin/usuarios/:id', {
    preHandler: [authenticate],
    schema: {
      params: usuarioIdSchema,
    },
  }, async (request) => {
    const { id } = request.params as z.infer<typeof usuarioIdSchema>
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new AppError(404, 'Usuário não encontrado', 'NOT_FOUND')
    }

    return { data: user }
  })

  // Atualizar usuário
  app.patch('/api/admin/usuarios/:id', {
    preHandler: [authenticate, requireRole('GESTOR')],
    schema: {
      params: usuarioIdSchema,
      body: updateUsuarioSchema,
    },
  }, async (request) => {
    const { id } = request.params as z.infer<typeof usuarioIdSchema>
    const body = request.body as z.infer<typeof updateUsuarioSchema>

    const updateData: Record<string, unknown> = {}
    if (body.nome !== undefined) updateData.nome = body.nome
    if (body.email !== undefined) updateData.email = body.email
    if (body.role !== undefined) updateData.role = body.role

    if (Object.keys(updateData).length === 0) {
      throw new AppError(400, 'Nenhum campo permitido para atualização', 'VALIDATION_ERROR')
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    logger.info({ userId: id, updatedBy: request.user?.id }, 'User updated')
    return { data: user }
  })

  // Criar novo usuário (qualquer usuário autenticado)
  app.post('/api/admin/usuarios', {
    preHandler: [authenticate],
    schema: { body: createUsuarioSchema },
  }, async (request) => {
    const body = request.body as z.infer<typeof createUsuarioSchema>

    const existing = await prisma.user.findFirst({ where: { email: body.email } })
    if (existing) {
      throw new AppError(409, 'Já existe um usuário com este e-mail.', 'CONFLICT')
    }

    const passwordHash = createHash('sha256').update(body.password).digest('hex')

    const user = await prisma.user.create({
      data: {
        nome: body.nome,
        email: body.email,
        passwordHash,
        role: body.role,
      },
      select: { id: true, email: true, nome: true, role: true, createdAt: true, updatedAt: true },
    })

    logger.info({ userId: user.id, createdBy: request.user?.id }, 'User created')
    return { data: user }
  })
}
