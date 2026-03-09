import prisma from '../config/database.js';
import { CriarCategoriaDTO } from '../types/dto.js';
import { NotFoundError, BadRequestError, ConflictError } from '../types/errors.js';
import { logger } from '../utils/logger.js';

export class CategoriaService {
    /**
     * Listar categorias
     */
    async listar(estabelecimentoId?: string) {
        const categorias = await prisma.categoria.findMany({
            where: {
                ...(estabelecimentoId && { estabelecimentoId }),
                ativo: true,
            },
            include: {
                _count: {
                    select: { produtos: true },
                },
            },
            orderBy: {
                ordem: 'asc',
            },
        });

        return categorias;
    }

    /**
     * Buscar categoria por ID
     */
    async buscarPorId(id: string) {
        const categoria = await prisma.categoria.findUnique({
            where: { id },
            include: {
                produtos: {
                    where: { disponivel: true },
                    orderBy: { ordem: 'asc' },
                },
            },
        });

        if (!categoria) {
            throw new NotFoundError('Categoria não encontrada');
        }

        return categoria;
    }

    /**
     * Criar categoria
     */
    async criar(data: CriarCategoriaDTO) {
        logger.info('Criando nova categoria', { nome: data.nome, estabelecimentoId: data.estabelecimentoId });

        // Verificar se estabelecimento existe
        const estabelecimento = await prisma.estabelecimento.findUnique({
            where: { id: data.estabelecimentoId },
        });

        if (!estabelecimento) {
            throw new NotFoundError('Estabelecimento não encontrado');
        }

        try {
            const categoria = await prisma.categoria.create({
                data: {
                    estabelecimentoId: data.estabelecimentoId,
                    nome: data.nome,
                    descricao: data.descricao,
                    destino: data.destino,
                    cor: data.cor || '#3b82f6',
                    icone: data.icone,
                    ordem: data.ordem || 0,
                },
            });

            logger.info('Categoria criada com sucesso', { categoriaId: categoria.id });
            return categoria;
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new ConflictError('Já existe uma categoria com este nome neste estabelecimento');
            }
            throw error;
        }
    }

    /**
     * Atualizar categoria
     */
    async atualizar(id: string, data: Partial<CriarCategoriaDTO & { ativo?: boolean }>) {
        // Verificar se categoria existe
        await this.buscarPorId(id);

        const categoria = await prisma.categoria.update({
            where: { id },
            data: {
                ...(data.nome && { nome: data.nome }),
                ...(data.descricao !== undefined && { descricao: data.descricao }),
                ...(data.destino && { destino: data.destino }),
                ...(data.cor && { cor: data.cor }),
                ...(data.icone !== undefined && { icone: data.icone }),
                ...(data.ordem !== undefined && { ordem: data.ordem }),
                ...(data.ativo !== undefined && { ativo: data.ativo }),
            },
        });

        logger.info('Categoria atualizada', { categoriaId: id });
        return categoria;
    }

    /**
     * Deletar categoria (soft delete)
     */
    async deletar(id: string) {
        // Verificar se categoria existe
        await this.buscarPorId(id);

        // Verificar se tem produtos
        const produtosCount = await prisma.produto.count({
            where: { categoriaId: id },
        });

        if (produtosCount > 0) {
            throw new BadRequestError('Não é possível deletar categoria com produtos cadastrados');
        }

        const categoria = await prisma.categoria.update({
            where: { id },
            data: { ativo: false },
        });

        logger.info('Categoria deletada (soft delete)', { categoriaId: id });
        return categoria;
    }

    /**
     * Reordenar categorias
     */
    async reordenar(categorias: Array<{ id: string; ordem: number }>) {
        if (!Array.isArray(categorias) || categorias.length === 0) {
            throw new BadRequestError('Categorias deve ser um array não vazio');
        }

        // Atualizar ordem de cada categoria
        await Promise.all(
            categorias.map((cat) =>
                prisma.categoria.update({
                    where: { id: cat.id },
                    data: { ordem: cat.ordem },
                })
            )
        );

        logger.info('Categorias reordenadas', { quantidade: categorias.length });
        return { message: 'Categorias reordenadas com sucesso' };
    }
}

export const categoriaService = new CategoriaService();
