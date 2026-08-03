import { Request, Response } from 'express';
import prisma from '../config/database.js';

export class RecepcaoController {
  // -------------------------------------------------------------
  // FILA DE ESPERA
  // -------------------------------------------------------------

  async adicionarFila(req: Request, res: Response) {
    try {
      const estabelecimentoId = (req as any).user?.estabelecimentoId;
      if (!estabelecimentoId) return res.status(400).json({ error: 'Estabelecimento inválido' });

      const { nomeCliente, telefone, quantidadePessoas } = req.body;

      if (!nomeCliente || !quantidadePessoas) {
        return res.status(400).json({ error: 'Nome e quantidade de pessoas são obrigatórios' });
      }

      const fila = await prisma.filaEspera.create({
        data: {
          estabelecimentoId,
          nomeCliente,
          telefone: telefone || null,
          quantidadePessoas: Number(quantidadePessoas)
        }
      });

      return res.status(201).json(fila);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao adicionar cliente na fila de espera' });
    }
  }

  async listarFila(req: Request, res: Response) {
    try {
      const estabelecimentoId = (req as any).user?.estabelecimentoId;
      if (!estabelecimentoId) return res.status(400).json({ error: 'Estabelecimento inválido' });

      const fila = await prisma.filaEspera.findMany({
        where: { estabelecimentoId },
        orderBy: { createdAt: 'asc' }
      });

      return res.json(fila);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar fila de espera' });
    }
  }

  async atualizarStatusFila(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const filaAtualizada = await prisma.filaEspera.update({
        where: { id },
        data: { status }
      });

      return res.json(filaAtualizada);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar status na fila' });
    }
  }

  async removerFila(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.filaEspera.delete({ where: { id } });
      return res.json({ message: 'Apagado com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover cliente da fila' });
    }
  }

  // -------------------------------------------------------------
  // RESERVAS
  // -------------------------------------------------------------

  async criarReserva(req: Request, res: Response) {
    try {
      const estabelecimentoId = (req as any).user?.estabelecimentoId;
      if (!estabelecimentoId) return res.status(400).json({ error: 'Estabelecimento inválido' });

      const { nomeCliente, telefone, quantidadePessoas, dataHora, observacoes } = req.body;

      if (!nomeCliente || !telefone || !quantidadePessoas || !dataHora) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      const reserva = await prisma.reserva.create({
        data: {
          estabelecimentoId,
          nomeCliente,
          telefone,
          quantidadePessoas: Number(quantidadePessoas),
          dataHora: new Date(dataHora),
          observacoes: observacoes || null
        }
      });

      return res.status(201).json(reserva);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar reserva' });
    }
  }

  async listarReservas(req: Request, res: Response) {
    try {
      const estabelecimentoId = (req as any).user?.estabelecimentoId;
      if (!estabelecimentoId) return res.status(400).json({ error: 'Estabelecimento inválido' });

      const reservas = await prisma.reserva.findMany({
        where: { estabelecimentoId },
        orderBy: { dataHora: 'asc' }
      });

      return res.json(reservas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar reservas' });
    }
  }

  async atualizarStatusReserva(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const reservaAtualizada = await prisma.reserva.update({
        where: { id },
        data: { status }
      });

      return res.json(reservaAtualizada);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar status da reserva' });
    }
  }

  async removerReserva(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.reserva.delete({ where: { id } });
      return res.json({ message: 'Apagado com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover reserva' });
    }
  }
}
