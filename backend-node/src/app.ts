import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import formbody from '@fastify/formbody'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import view from '@fastify/view'
import fastifyStatic from '@fastify/static'
import ejs from 'ejs'
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { appRoutes } from './routes'
import { errorHandler } from './utils/errors'
import { logger } from './lib/logger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const adminDist = path.join(rootDir, 'admin-ui', 'dist')
const uploadsDir = path.join(rootDir, 'uploads')

const server = Fastify({
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV === 'development' ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
            },
        } : undefined,
    },
})

// Configurar validação com Zod
server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

// Error handler global
server.setErrorHandler(errorHandler)

// CORS
server.register(cors, {
    origin: '*',
})

// Cookie (para sessão do painel)
server.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'noticias360-admin-secret'
})

// JWT para autenticação
server.register(jwt, {
    secret: process.env.JWT_SECRET || 'noticias360-jwt-secret-change-in-production',
    sign: {
        expiresIn: '7d',
    },
})

// Form body (para POST login do painel)
server.register(formbody)
// Multipart (upload de mídias no painel)
server.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }) // 10 MB

// Templates EJS (fallback; painel principal é o SPA em /admin)
server.register(view, {
    engine: { ejs },
    root: path.join(rootDir, 'views'),
    viewExt: 'ejs',
})

// Rotas da API (antes de qualquer static – evita 404 em POST)
server.register(appRoutes)

// Arquivos enviados (mídias) em /uploads
server.register(fastifyStatic, { root: uploadsDir, prefix: '/uploads/', decorateReply: false })

// SPA do painel admin (Vite + React) em /admin – static último; fallback para rotas do SPA
server.register(fastifyStatic, {
    root: adminDist,
    prefix: '/admin/',
    decorateReply: false,
    index: ['index.html'],
})
server.setNotFoundHandler(async (request, reply) => {
    const url = request.url?.split('?')[0] ?? ''
    // Debug: log requisições que caem no 404 (POST /api/admin/* não deveria chegar aqui)
    if (process.env.NODE_ENV !== 'production' && (request.method === 'POST' && url.startsWith('/api/'))) {
        request.log.warn({ method: request.method, url }, '404 em rota de API – verifique se o backend foi reiniciado')
    }
    if (request.method !== 'GET' || !url.startsWith('/admin') || url.startsWith('/admin/assets/')) {
        return reply.status(404).send({ message: 'Not Found' })
    }
    const html = fs.readFileSync(path.join(adminDist, 'index.html'), 'utf-8')
    return reply.type('text/html').send(html)
})

export const app = server.withTypeProvider<ZodTypeProvider>()
