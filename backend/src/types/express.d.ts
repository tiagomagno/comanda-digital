import { Request } from 'express';
import { TipoUsuario } from '@prisma/client';

/**
 * Estende o tipo Request do Express com dados de autenticação
 */
export interface AuthRequest extends Request {
    userId?: string;
    userTipo?: TipoUsuario;
    estabelecimentoId?: string;
    user?: {
        id: string;
        tipo: TipoUsuario;
        estabelecimentoId?: string;
    };
}
