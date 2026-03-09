import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware de validação usando Zod
 */
export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validar body, query e params
            const data = {
                body: req.body,
                query: req.query,
                params: req.params,
            };

            const validated = schema.parse(data);
            
            // Atualizar req com dados validados
            if (validated.body) req.body = validated.body;
            if (validated.query) req.query = validated.query;
            if (validated.params) req.params = validated.params;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json({
                    error: {
                        message: 'Dados de entrada inválidos',
                        details: errors,
                    },
                });
                return;
            }

            next(error);
        }
    };
};
