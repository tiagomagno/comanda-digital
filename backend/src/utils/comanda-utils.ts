import prisma from '../config/database.js';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Gera um código único para comanda
 * Verifica colisão e tenta novamente se necessário
 */
export async function gerarCodigoComanda(tentativas = 10): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    for (let i = 0; i < tentativas; i++) {
        let codigo = '';
        for (let j = 0; j < 6; j++) {
            codigo += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Verificar se código já existe
        const existe = await prisma.comanda.findUnique({
            where: { codigo },
            select: { id: true },
        });

        if (!existe) {
            return codigo;
        }
    }

    throw new Error('Não foi possível gerar código único para comanda');
}

/**
 * Calcula o total de uma comanda baseado nos pedidos
 */
export function calcularTotalComanda(pedidos: Array<{ total: number | string | Decimal }>): number {
    return pedidos.reduce((acc, pedido) => {
        return acc + Number(pedido.total);
    }, 0);
}
