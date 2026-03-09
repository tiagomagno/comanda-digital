/**
 * Classe de erro customizada para a aplicação
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(
        statusCode: number,
        message: string,
        isOperational = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Mantém o stack trace correto
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Erros específicos da aplicação
 */
export class NotFoundError extends AppError {
    constructor(message = 'Recurso não encontrado') {
        super(404, message);
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Requisição inválida') {
        super(400, message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Não autorizado') {
        super(401, message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Acesso negado') {
        super(403, message);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflito de dados') {
        super(409, message);
    }
}
