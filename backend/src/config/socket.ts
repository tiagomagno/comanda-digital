import { Server } from 'socket.io';

let ioInstance: Server | null = null;

/**
 * Configura o Socket.IO (deve ser chamado uma vez no startup)
 */
export function setIO(io: Server) {
    ioInstance = io;
}

/**
 * Obtém a instância do Socket.IO
 * @throws Error se Socket.IO não foi inicializado
 */
export function getIO(): Server {
    if (!ioInstance) {
        throw new Error('Socket.IO não foi inicializado. Chame setIO() primeiro.');
    }
    return ioInstance;
}

/**
 * Verifica se Socket.IO está inicializado
 */
export function isIOInitialized(): boolean {
    return ioInstance !== null;
}
