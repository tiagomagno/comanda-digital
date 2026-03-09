import { FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from '../utils/errors'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number
      email: string
      role: string
    }
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify()
    // O JWT adiciona o payload em request.user após verificação
    // Garantir que está no formato esperado
    const payload = request.user as { id: number; email: string; role: string } | undefined
    if (!payload || !payload.id) {
      throw new AppError(401, 'Token inválido', 'INVALID_TOKEN')
    }
    request.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    }
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError(401, 'Não autenticado. Faça login novamente.', 'UNAUTHORIZED')
  }
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new AppError(401, 'Não autenticado', 'UNAUTHORIZED')
    }
    if (!roles.includes(request.user.role)) {
      throw new AppError(403, 'Acesso negado. Permissão insuficiente.', 'FORBIDDEN')
    }
  }
}
