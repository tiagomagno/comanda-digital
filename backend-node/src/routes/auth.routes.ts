import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { loginSchema } from '../schemas/usuarios.schema'
import { loginUser } from '../services/auth.service'
import { AppError } from '../utils/errors'

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/login', {
    schema: {
      body: loginSchema,
    },
  }, async (request, reply) => {
    try {
      const { identifier, password } = request.body as z.infer<typeof loginSchema>
      const result = await loginUser(app, identifier, password)
      return result
    } catch (error) {
      if (error instanceof Error && error.message.includes('inválidos')) {
        throw new AppError(401, error.message, 'INVALID_CREDENTIALS')
      }
      throw error
    }
  })
}
