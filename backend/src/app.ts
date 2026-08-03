import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { setIO } from './config/socket.js';
import { errorHandler } from './middlewares/error.middleware.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const httpServer = createServer(app);
const corsOrigin = process.env.CORS_ORIGIN === '*' 
    ? '*' 
    : (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : 'http://localhost:3000');

const io = new Server(httpServer, {
    cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true
    },
});

// Middlewares
app.use(cors({
    origin: corsOrigin,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rota de health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Rota raiz
app.get('/', (_req, res) => {
    res.json({
        message: 'API do Sistema de Comandas Digitais',
        version: '1.0.0',
        docs: '/api/docs',
    });
});

// Usar rotas
app.use('/api', routes);

// WebSocket - Eventos
io.on('connection', (socket) => {
    logger.info('Cliente WebSocket conectado', { socketId: socket.id });

    // Entrar em uma sala (estabelecimento)
    socket.on('join:estabelecimento', (estabelecimentoId: string) => {
        socket.join(`estabelecimento:${estabelecimentoId}`);
        logger.debug('Socket entrou na sala', { socketId: socket.id, estabelecimentoId });
    });

    // Sair de uma sala
    socket.on('leave:estabelecimento', (estabelecimentoId: string) => {
        socket.leave(`estabelecimento:${estabelecimentoId}`);
        logger.debug('Socket saiu da sala', { socketId: socket.id, estabelecimentoId });
    });

    socket.on('disconnect', () => {
        logger.info('Cliente WebSocket desconectado', { socketId: socket.id });
    });
});

// Configurar Socket.IO para uso em serviços
setIO(io);

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Tratamento de erros não capturados globais
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', new Error(String(reason)), {
        promise: String(promise),
    });
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    process.exit(1);
});

export { app, httpServer };
