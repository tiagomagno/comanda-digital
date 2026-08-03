import { Router } from 'express';
import { AvaliacaoController } from '../controllers/avaliacao.controller';

const router = Router();
const avaliacaoController = new AvaliacaoController();

// /api/avaliacoes
router.post('/', (req, res) => avaliacaoController.criar(req, res));
router.get('/:estabelecimentoId', (req, res) => avaliacaoController.listarPorEstabelecimento(req, res));

export default router;
