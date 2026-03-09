import prisma from '../config/database.js';
import { CriarProdutoDTO } from '../types/dto.js';
import { NotFoundError, BadRequestError } from '../types/errors.js';
import { produtoInclude } from '../utils/prisma-includes.js';
import { logger } from '../utils/logger.js';

export class ProdutoService {
    /**
     * Listar produtos
     */
    async listar(filtros?: { estabelecimentoId?: string; categoriaId?: string; disponivel?: boolean }) {
        const produtos = await prisma.produto.findMany({
            where: {
                ...(filtros?.estabelecimentoId && { categoria: { estabelecimentoId: filtros.estabelecimentoId } }),
                ...(filtros?.categoriaId && { categoriaId: filtros.categoriaId }),
                ...(filtros?.disponivel !== undefined && { disponivel: filtros.disponivel }),
            },
            include: produtoInclude,
            orderBy: {
                ordem: 'asc',
            },
        });

        return produtos;
    }

    /**
     * Buscar produto por ID
     */
    async buscarPorId(id: string) {
        const produto = await prisma.produto.findUnique({
            where: { id },
            include: produtoInclude,
        });

        if (!produto) {
            throw new NotFoundError('Produto não encontrado');
        }

        return produto;
    }

    /**
     * Criar produto
     */
    async criar(data: CriarProdutoDTO) {
        logger.info('Criando novo produto', { nome: data.nome, categoriaId: data.categoriaId });

        // Verificar se categoria existe
        const categoria = await prisma.categoria.findUnique({
            where: { id: data.categoriaId },
        });

        if (!categoria) {
            throw new NotFoundError('Categoria não encontrada');
        }

        const produto = await prisma.produto.create({
            data: {
                categoriaId: data.categoriaId,
                codigo: data.codigo,
                nome: data.nome,
                descricao: data.descricao,
                preco: data.preco,
                precoPromocional: data.precoPromocional,
                imagemUrl: data.imagemUrl || undefined,
                videoUrl: data.videoUrl || undefined,
                disponivel: data.disponivel !== undefined ? data.disponivel : true,
                destaque: data.destaque || false,
                ordem: data.ordem || 0,
                estoqueControlado: data.estoqueControlado || false,
                quantidadeEstoque: data.quantidadeEstoque || 0,
            },
            include: produtoInclude,
        });

        logger.info('Produto criado com sucesso', { produtoId: produto.id });
        return produto;
    }

    /**
     * Atualizar produto
     */
    async atualizar(id: string, data: Partial<CriarProdutoDTO>) {
        // Verificar se produto existe
        await this.buscarPorId(id);

        // Se categoriaId está sendo atualizado, verificar se existe
        if (data.categoriaId) {
            const categoria = await prisma.categoria.findUnique({
                where: { id: data.categoriaId },
            });

            if (!categoria) {
                throw new NotFoundError('Categoria não encontrada');
            }
        }

        const produto = await prisma.produto.update({
            where: { id },
            data: {
                ...(data.categoriaId && { categoriaId: data.categoriaId }),
                ...(data.codigo !== undefined && { codigo: data.codigo }),
                ...(data.nome && { nome: data.nome }),
                ...(data.descricao !== undefined && { descricao: data.descricao }),
                ...(data.preco && { preco: data.preco }),
                ...(data.precoPromocional !== undefined && { precoPromocional: data.precoPromocional }),
                ...(data.imagemUrl !== undefined && { imagemUrl: data.imagemUrl || null }),
                ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl || null }),
                ...(data.disponivel !== undefined && { disponivel: data.disponivel }),
                ...(data.destaque !== undefined && { destaque: data.destaque }),
                ...(data.ordem !== undefined && { ordem: data.ordem }),
                ...(data.estoqueControlado !== undefined && { estoqueControlado: data.estoqueControlado }),
                ...(data.quantidadeEstoque !== undefined && { quantidadeEstoque: data.quantidadeEstoque }),
            },
            include: produtoInclude,
        });

        logger.info('Produto atualizado', { produtoId: id });
        return produto;
    }

    /**
     * Deletar produto
     */
    async deletar(id: string) {
        // Verificar se produto existe
        await this.buscarPorId(id);

        try {
            await prisma.produto.delete({
                where: { id },
            });

            logger.info('Produto deletado', { produtoId: id });
            return { message: 'Produto deletado com sucesso' };
        } catch (error: any) {
            if (error.code === 'P2003') {
                throw new BadRequestError('Não é possível deletar produto que já foi pedido');
            }
            throw error;
        }
    }

    /**
     * Toggle disponibilidade
     */
    async toggleDisponibilidade(id: string) {
        const produtoAtual = await this.buscarPorId(id);

        const produto = await prisma.produto.update({
            where: { id },
            data: {
                disponivel: !produtoAtual.disponivel,
            },
            include: produtoInclude,
        });

        logger.info('Disponibilidade do produto alterada', {
            produtoId: id,
            disponivel: produto.disponivel,
        });

        return produto;
    }

    /**
     * Buscar cardápio completo (público)
     */
    async buscarCardapio(estabelecimentoId: string) {
        const categorias = await prisma.categoria.findMany({
            where: {
                estabelecimentoId,
                ativo: true,
            },
            include: {
                produtos: {
                    where: {
                        disponivel: true,
                    },
                    orderBy: {
                        ordem: 'asc',
                    },
                },
            },
            orderBy: {
                ordem: 'asc',
            },
        });

        return categorias;
    }
}

export const produtoService = new ProdutoService();
