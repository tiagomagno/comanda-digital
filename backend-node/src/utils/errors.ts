import { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { logger } from '../lib/logger'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  logger.error({ err: error, url: request.url, method: request.method }, 'Request error')

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: {
        message: 'Dados inválidos',
        details: error.errors,
      },
    })
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        message: error.message,
        code: error.code,
      },
    })
  }

  // Erro não esperado
  return reply.status(500).send({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Erro interno do servidor' 
        : error.message,
    },
  })
}
