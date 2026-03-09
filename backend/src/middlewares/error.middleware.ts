import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors.js';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from '../utils/prisma-errors.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware de tratamento de erros global
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log do erro
    logger.error('Erro capturado', err, {
        path: req.path,
        method: req.method,
    });

    // Se já é um AppError, usar diretamente
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                message: err.message,
                status: err.statusCode,
            },
        });
    }

    // Tratar erros do Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        try {
            handlePrismaError(err);
        } catch (appError) {
            if (appError instanceof AppError) {
                return res.status(appError.statusCode).json({
                    error: {
                        message: appError.message,
                        status: appError.statusCode,
                    },
                });
            }
        }
    }

    // Erro não tratado - erro interno do servidor
    const statusCode = 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : err.message;

    res.status(statusCode).json({
        error: {
            message,
            status: statusCode,
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack,
            }),
        },
    });
    return;
};

/**
 * Wrapper para async handlers - captura erros automaticamente
 */
export const asyncHandler = <T = Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req as T, res, next)).catch(next);
    };
};
