import { Router } from 'express';
import { previewImportacao, executarImportacao, downloadTemplateCsv } from '../controllers/importar.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Preview (não salva)
router.post('/preview', authMiddleware as any, adminMiddleware as any, previewImportacao);

// Executar importação (salva no banco)
router.post('/executar', authMiddleware as any, adminMiddleware as any, executarImportacao);

// Download do template CSV
router.get('/template-csv', authMiddleware as any, adminMiddleware as any, downloadTemplateCsv);

export default router;
