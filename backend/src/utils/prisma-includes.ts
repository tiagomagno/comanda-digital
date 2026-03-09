/**
 * Helpers para includes comuns do Prisma
 * Evita duplicação de código em queries
 */

export const pedidoInclude = {
    itens: {
        include: {
            produto: {
                include: {
                    categoria: true,
                },
            },
        },
    },
    comanda: {
        include: {
            estabelecimento: true,
            mesaRelacao: true,
        },
    },
} as const;

export const comandaInclude = {
    pedidos: {
        include: {
            itens: {
                include: {
                    produto: {
                        include: {
                            categoria: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc' as const,
        },
    },
    estabelecimento: true,
    mesaRelacao: true,
} as const;

export const produtoInclude = {
    categoria: true,
} as const;
