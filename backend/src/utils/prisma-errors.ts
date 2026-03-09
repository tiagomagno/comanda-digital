import { Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ConflictError } from '../types/errors.js';

/**
 * Mapeia erros do Prisma para erros da aplicação
 */
export function handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                // Unique constraint violation
                throw new ConflictError('Já existe um registro com estes dados');
            
            case 'P2025':
                // Record not found
                throw new NotFoundError('Registro não encontrado');
            
            case 'P2003':
                // Foreign key constraint violation
                throw new BadRequestError('Não é possível realizar esta operação devido a dependências');
            
            case 'P2014':
                // Required relation violation
                throw new BadRequestError('Relacionamento obrigatório não fornecido');
            
            default:
                throw new BadRequestError(`Erro no banco de dados: ${error.message}`);
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError('Dados inválidos fornecidos');
    }

    // Se não for um erro conhecido do Prisma, re-lança
    throw error;
}
