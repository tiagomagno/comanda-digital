import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express.js';

import { TipoUsuario } from '@prisma/client';

/**
 * Middleware factory para verificar roles específicos
 * @param allowedRoles - Array de roles permitidos
 */
export const requireRole = (...allowedRoles: TipoUsuario[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Não autenticado' });
            return;
        }

        if (!allowedRoles.includes(req.user.tipo)) {
            res.status(403).json({
                error: 'Acesso negado',
                requiredRoles: allowedRoles,
                userRole: req.user.tipo
            });
            return;
        }

        next();
    };
};

/**
 * Middleware para verificar se o usuário pertence ao mesmo estabelecimento
 */
export const requireSameEstabelecimento = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
    }

    const estabelecimentoId = req.params.estabelecimentoId || req.query.estabelecimentoId || req.body.estabelecimentoId;

    if (!estabelecimentoId) {
        return res.status(400).json({ error: 'estabelecimentoId não fornecido' });
    }

    // Admin pode acessar qualquer estabelecimento
    if (req.user.tipo === 'admin' && req.user.estabelecimentoId === estabelecimentoId) {
        return next();
    }

    // Outros usuários só podem acessar seu próprio estabelecimento
    if (req.user.estabelecimentoId !== estabelecimentoId) {
        return res.status(403).json({ error: 'Acesso negado ao estabelecimento' });
    }

    next();
};

// Atalhos para roles comuns
export const requireGestor = requireRole('admin');
export const requireGarcom = requireRole('garcom', 'admin');
export const requireCozinha = requireRole('cozinha', 'bar', 'admin');
export const requireCaixa = requireRole('admin'); // Por enquanto, apenas admin pode ser caixa
