import { Router } from 'express';
import { PagamentoParcialController } from '../controllers/pagamento.controller';

const router = Router();
const pagamentoController = new PagamentoParcialController();

// /api/pagamentos-parciais/:comandaId
router.post('/:comandaId', (req, res) => pagamentoController.criar(req, res));
router.get('/:comandaId', (req, res) => pagamentoController.listarPorComanda(req, res));

export default router;
