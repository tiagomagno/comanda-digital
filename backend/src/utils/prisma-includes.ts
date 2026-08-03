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
            adicionais: {
                include: { adicional: true },
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
    adicionalGrupos: {
        orderBy: { ordem: 'asc' as const },
        include: {
            opcoes: {
                where: { disponivel: true },
                orderBy: { ordem: 'asc' as const },
            },
        },
    },
} as const;
