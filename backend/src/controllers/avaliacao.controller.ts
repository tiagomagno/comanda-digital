import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AvaliacaoController {
  // Criar uma avaliação após fechar a conta
  async criar(req: Request, res: Response) {
    try {
      const { estabelecimentoId, comandaId, usuarioId, notaAtendimento, notaComida, comentario } = req.body;

      // Impede 2 avaliações da mesma comanda
      const existe = await prisma.avaliacao.findUnique({
        where: { comandaId }
      });

      if (existe) {
        return res.status(400).json({ error: 'Comanda já avaliada' });
      }

      const avaliacao = await prisma.avaliacao.create({
        data: {
          estabelecimentoId,
          comandaId,
          usuarioId: usuarioId || null,
          notaAtendimento,
          notaComida,
          comentario
        }
      });

      return res.status(201).json(avaliacao);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao registrar avaliação' });
    }
  }

  // Obter todas do estabelecimento (para o Dashboard)
  async listarPorEstabelecimento(req: Request, res: Response) {
    try {
      const { estabelecimentoId } = req.params;
      const avaliacoes = await prisma.avaliacao.findMany({
        where: { estabelecimentoId },
        include: { comanda: true, usuario: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(avaliacoes);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao carregar avaliações' });
    }
  }

  // Listar todas para o painel administrativo do gestor
  async listarGestor(req: Request, res: Response) {
    try {
      const estabelecimentoId = (req as any).user?.estabelecimentoId;
      if (!estabelecimentoId) {
          return res.status(400).json({ message: 'Estabelecimento não identificado' });
      }

      const avaliacoes = await prisma.avaliacao.findMany({
        where: { estabelecimentoId },
        include: { comanda: true, usuario: true },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(avaliacoes);
    } catch (error) {
      console.error('Erro no listarGestor:', error);
      return res.status(500).json({ error: 'Erro ao carregar avaliações do gestor' });
    }
  }
}
