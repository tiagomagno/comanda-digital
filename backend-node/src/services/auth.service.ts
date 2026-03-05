import { createHash } from 'crypto'
import prisma from '../lib/prisma'
import { FastifyInstance } from 'fastify'

export async function loginUser(
  app: FastifyInstance,
  identifier: string,
  password: string
) {
  const envUser = process.env.REDACAO_USER
  const envPass = process.env.REDACAO_PASSWORD
  const emailLogin = identifier.trim()

  // Login com usuário de ambiente (quando configurado)
  if (envUser && envPass && emailLogin === envUser) {
    if (password !== envPass) {
      throw new Error('E-mail ou senha inválidos.')
    }
    let userRow = await prisma.user.findFirst({ where: { email: emailLogin } })
    if (!userRow) {
      const roleEnv = process.env.REDACAO_ROLE || 'GESTOR'
      const nomeEnv = process.env.REDACAO_NOME || envUser || 'Usuário'
      userRow = await prisma.user.create({
        data: {
          email: emailLogin,
          passwordHash: 'env-auth',
          nome: nomeEnv,
          role: roleEnv,
        },
      })
    }
    const token = app.jwt.sign({ id: userRow.id, email: userRow.email, role: userRow.role })
    return {
      jwt: token,
      user: { id: userRow.id, email: userRow.email, nome: userRow.nome, role: userRow.role },
    }
  }

  // Login com usuários do banco (senha em SHA-256)
  const userRow = await prisma.user.findFirst({ where: { email: emailLogin } })
  if (!userRow) {
    throw new Error('E-mail ou senha inválidos.')
  }
  const passwordHash = createHash('sha256').update(password).digest('hex')
  if (userRow.passwordHash !== 'env-auth' && userRow.passwordHash !== passwordHash) {
    throw new Error('E-mail ou senha inválidos.')
  }

  const token = app.jwt.sign({ id: userRow.id, email: userRow.email, role: userRow.role })
  return {
    jwt: token,
    user: { id: userRow.id, email: userRow.email, nome: userRow.nome, role: userRow.role },
  }
}
