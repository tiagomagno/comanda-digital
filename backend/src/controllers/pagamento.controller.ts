import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PagamentoParcialController {
  // Criar um pagamento parcial
  async criar(req: Request, res: Response) {
    try {
      const { comandaId } = req.params;
      const { telefoneCliente, nomeCliente, valor, metodoPagamento } = req.body;

      const pagamento = await prisma.pagamentoParcial.create({
        data: {
          comandaId,
          telefoneCliente,
          nomeCliente,
          valor,
          metodoPagamento,
          status: 'pago' // Assumimos pago direto neste MVP, caso não tenha integração com split de gateway ainda
        }
      });

      res.status(201).json(pagamento);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar pagamento parcial' });
    }
  }

  // Obter pagamentos de uma comanda
  async listarPorComanda(req: Request, res: Response) {
    try {
      const { comandaId } = req.params;
      const pagamentos = await prisma.pagamentoParcial.findMany({
        where: { comandaId },
        orderBy: { createdAt: 'desc' }
      });
      res.json(pagamentos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar pagamentos' });
    }
  }
}
