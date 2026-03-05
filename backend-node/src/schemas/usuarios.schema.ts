import { z } from 'zod'

export const usuarioIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const updateUsuarioSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['JORNALISTA', 'EDITOR_CHEFE', 'MARKETING_SEO', 'GESTOR']).optional(),
})

export const createUsuarioSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['JORNALISTA', 'EDITOR_CHEFE', 'MARKETING_SEO', 'GESTOR']).default('JORNALISTA'),
})

export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
})
