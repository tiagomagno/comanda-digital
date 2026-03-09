import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../types/errors.js';
import { TipoUsuario } from '@prisma/client';

// Re-exportar AuthRequest para uso em outros middlewares
export type { AuthRequest } from '../types/express.js';
import type { AuthRequest } from '../types/express.js';

interface JwtPayload {
    id: string;
    tipo: TipoUsuario;
    estabelecimentoId?: string;
}

/**
 * Middleware para verificar autenticação JWT
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next(new UnauthorizedError('Token não fornecido'));
        }

        const [, token] = authHeader.split(' ');

        if (!token) {
            return next(new UnauthorizedError('Token inválido'));
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                error: 'Erro de configuração do servidor',
            });
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        // Adicionar dados do usuário na requisição
        req.userId = decoded.id;
        req.userTipo = decoded.tipo;
        req.estabelecimentoId = decoded.estabelecimentoId;
        req.user = {
            id: decoded.id,
            tipo: decoded.tipo,
            estabelecimentoId: decoded.estabelecimentoId,
        };

        next();
    } catch (error) {
        if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
            return next(new UnauthorizedError('Token inválido ou expirado'));
        }
        return next(error);
    }
};

/**
 * Middleware para verificar se usuário é admin
 */
export const adminMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (req.userTipo !== 'admin') {
        return next(new ForbiddenError('Acesso negado. Apenas administradores'));
    }
    next();
};

/**
 * Middleware para verificar se usuário é garçom ou admin
 */
export const garcomMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (req.userTipo !== 'garcom' && req.userTipo !== 'admin') {
        return next(new ForbiddenError('Acesso negado. Apenas garçons ou administradores'));
    }
    next();
};

/**
 * Middleware para verificar se usuário é da cozinha, bar ou admin
 */
export const preparoMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userTipo || !['cozinha', 'bar', 'admin'].includes(req.userTipo as string)) {
        return next(new ForbiddenError('Acesso negado. Apenas cozinha, bar ou administradores'));
    }
    next();
};
